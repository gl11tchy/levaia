use ssh2::{Channel, Session};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

// Global SSH PTY storage (separate from SFTP sessions for clarity)
lazy_static::lazy_static! {
    static ref SSH_PTY_SESSIONS: Arc<Mutex<HashMap<String, SshPtySession>>> = Arc::new(Mutex::new(HashMap::new()));
}

struct SshPtySession {
    channel: Channel,
    #[allow(dead_code)]
    session: Session, // Keep session alive
}

lazy_static::lazy_static! {
    static ref SSH_PTY_WRITERS: Arc<Mutex<HashMap<String, std::sync::mpsc::Sender<Vec<u8>>>>> = Arc::new(Mutex::new(HashMap::new()));
}

#[tauri::command]
pub fn ssh_spawn_shell(
    app: AppHandle,
    pty_id: String,
    host: String,
    port: u16,
    user: String,
    auth_type: String,
    password: Option<String>,
    key_path: Option<String>,
    key_passphrase: Option<String>,
) -> Result<(), String> {
    // Check if already exists
    {
        let sessions = SSH_PTY_SESSIONS.lock().unwrap();
        if sessions.contains_key(&pty_id) {
            return Err("SSH PTY session already exists with this ID".to_string());
        }
    }

    // Connect
    let addr = format!("{}:{}", host, port);
    let tcp = TcpStream::connect(&addr)
        .map_err(|e| format!("Failed to connect to {}: {}", addr, e))?;

    let mut session = Session::new()
        .map_err(|e| format!("Failed to create SSH session: {}", e))?;

    session.set_tcp_stream(tcp);
    session.handshake()
        .map_err(|e| format!("SSH handshake failed: {}", e))?;

    // Authenticate
    match auth_type.as_str() {
        "password" => {
            let pw = password.ok_or("Password required")?;
            session.userauth_password(&user, &pw)
                .map_err(|e| format!("Password auth failed: {}", e))?;
        }
        "key" => {
            let kp = key_path.ok_or("Key path required")?;
            let passphrase = key_passphrase.as_deref();
            session.userauth_pubkey_file(&user, None, Path::new(&kp), passphrase)
                .map_err(|e| format!("Key auth failed: {}", e))?;
        }
        _ => return Err(format!("Unknown auth type: {}", auth_type)),
    }

    if !session.authenticated() {
        return Err("Authentication failed".to_string());
    }

    // Open channel
    let mut channel = session.channel_session()
        .map_err(|e| format!("Failed to open channel: {}", e))?;

    // Request PTY
    channel.request_pty("xterm-256color", None, Some((80, 24, 0, 0)))
        .map_err(|e| format!("Failed to request PTY: {}", e))?;

    // Start shell
    channel.shell()
        .map_err(|e| format!("Failed to start shell: {}", e))?;

    // Set non-blocking for reading
    session.set_blocking(false);

    // Create write channel
    let (tx, rx) = std::sync::mpsc::channel::<Vec<u8>>();

    // Store writer sender
    {
        let mut writers = SSH_PTY_WRITERS.lock().unwrap();
        writers.insert(pty_id.clone(), tx);
    }

    // Store session
    {
        let mut sessions = SSH_PTY_SESSIONS.lock().unwrap();
        sessions.insert(pty_id.clone(), SshPtySession {
            channel,
            session,
        });
    }

    // Spawn combined reader/writer thread
    let pty_id_clone = pty_id.clone();
    thread::spawn(move || {
        let mut buffer = [0u8; 4096];

        loop {
            // Check for data to write
            match rx.try_recv() {
                Ok(data) => {
                    let mut sessions = SSH_PTY_SESSIONS.lock().unwrap();
                    if let Some(pty_session) = sessions.get_mut(&pty_id_clone) {
                        let _ = pty_session.channel.write_all(&data);
                        let _ = pty_session.channel.flush();
                    }
                }
                Err(std::sync::mpsc::TryRecvError::Disconnected) => {
                    // Writer closed, exit
                    break;
                }
                Err(std::sync::mpsc::TryRecvError::Empty) => {
                    // No data to write, continue to read
                }
            }

            // Try to read from channel
            let read_result = {
                let mut sessions = SSH_PTY_SESSIONS.lock().unwrap();
                if let Some(pty_session) = sessions.get_mut(&pty_id_clone) {
                    match pty_session.channel.read(&mut buffer) {
                        Ok(0) => Some(Err("EOF")),
                        Ok(n) => Some(Ok(buffer[..n].to_vec())),
                        Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => None,
                        Err(_) => Some(Err("Read error")),
                    }
                } else {
                    Some(Err("Session gone"))
                }
            };

            match read_result {
                Some(Ok(data)) => {
                    let text = String::from_utf8_lossy(&data).to_string();
                    let _ = app.emit(&format!("pty-data-{}", pty_id_clone), text);
                }
                Some(Err(_)) => {
                    let _ = app.emit(&format!("pty-exit-{}", pty_id_clone), ());
                    break;
                }
                None => {
                    // No data available, small sleep to prevent busy loop
                    thread::sleep(std::time::Duration::from_millis(10));
                }
            }

            // Check if channel is closed
            {
                let sessions = SSH_PTY_SESSIONS.lock().unwrap();
                if let Some(pty_session) = sessions.get(&pty_id_clone) {
                    if pty_session.channel.eof() {
                        drop(sessions);
                        let _ = app.emit(&format!("pty-exit-{}", pty_id_clone), ());
                        break;
                    }
                }
            }
        }

        // Clean up
        {
            let mut sessions = SSH_PTY_SESSIONS.lock().unwrap();
            sessions.remove(&pty_id_clone);
        }
        {
            let mut writers = SSH_PTY_WRITERS.lock().unwrap();
            writers.remove(&pty_id_clone);
        }
    });

    Ok(())
}

#[tauri::command]
pub fn ssh_write_to_shell(pty_id: String, data: String) -> Result<(), String> {
    let writers = SSH_PTY_WRITERS.lock().unwrap();

    if let Some(tx) = writers.get(&pty_id) {
        tx.send(data.into_bytes())
            .map_err(|e| format!("Failed to send data: {}", e))
    } else {
        Err(format!("SSH PTY not found: {}", pty_id))
    }
}

#[tauri::command]
pub fn ssh_resize_shell(pty_id: String, rows: u32, cols: u32) -> Result<(), String> {
    let mut sessions = SSH_PTY_SESSIONS.lock().unwrap();

    if let Some(pty_session) = sessions.get_mut(&pty_id) {
        pty_session.channel.request_pty_size(cols, rows, None, None)
            .map_err(|e| format!("Failed to resize: {}", e))
    } else {
        Err(format!("SSH PTY not found: {}", pty_id))
    }
}

#[tauri::command]
pub fn ssh_kill_shell(pty_id: String) -> Result<(), String> {
    // Remove writer first to signal thread to stop
    {
        let mut writers = SSH_PTY_WRITERS.lock().unwrap();
        writers.remove(&pty_id);
    }

    // Then remove session
    {
        let mut sessions = SSH_PTY_SESSIONS.lock().unwrap();
        if sessions.remove(&pty_id).is_some() {
            Ok(())
        } else {
            // Already removed by thread, that's fine
            Ok(())
        }
    }
}
