use ssh2::Channel;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

// Import SSH_SESSIONS from ssh module to reuse existing connections
use super::ssh::SSH_SESSIONS;

// Global SSH PTY channel storage
lazy_static::lazy_static! {
    static ref SSH_PTY_CHANNELS: Arc<Mutex<HashMap<String, Channel>>> = Arc::new(Mutex::new(HashMap::new()));
    static ref SSH_PTY_WRITERS: Arc<Mutex<HashMap<String, std::sync::mpsc::Sender<Vec<u8>>>>> = Arc::new(Mutex::new(HashMap::new()));
}

#[tauri::command]
pub fn ssh_spawn_shell(
    app: AppHandle,
    session_id: String,
    pty_id: String,
) -> Result<(), String> {
    // Check if PTY already exists
    {
        let channels = SSH_PTY_CHANNELS.lock().unwrap();
        if channels.contains_key(&pty_id) {
            return Err("SSH PTY already exists with this ID".to_string());
        }
    }

    // Get the existing SSH session and create a channel on it
    let channel = {
        let sessions = SSH_SESSIONS.lock().unwrap();
        let ssh_session = sessions.get(&session_id)
            .ok_or_else(|| format!("SSH session not found: {}", session_id))?;

        // Set session to non-blocking for async reads
        ssh_session.session.set_blocking(false);

        // Open a new channel on the existing session
        let mut channel = ssh_session.session.channel_session()
            .map_err(|e| format!("Failed to open channel: {}", e))?;

        // Request PTY
        channel.request_pty("xterm-256color", None, Some((80, 24, 0, 0)))
            .map_err(|e| format!("Failed to request PTY: {}", e))?;

        // Start shell
        channel.shell()
            .map_err(|e| format!("Failed to start shell: {}", e))?;

        channel
    };

    // Create write channel
    let (tx, rx) = std::sync::mpsc::channel::<Vec<u8>>();

    // Store writer sender
    {
        let mut writers = SSH_PTY_WRITERS.lock().unwrap();
        writers.insert(pty_id.clone(), tx);
    }

    // Store channel
    {
        let mut channels = SSH_PTY_CHANNELS.lock().unwrap();
        channels.insert(pty_id.clone(), channel);
    }

    // Spawn combined reader/writer thread
    let pty_id_clone = pty_id.clone();
    thread::spawn(move || {
        let mut buffer = [0u8; 4096];

        loop {
            // Check for data to write
            match rx.try_recv() {
                Ok(data) => {
                    let mut channels = SSH_PTY_CHANNELS.lock().unwrap();
                    if let Some(channel) = channels.get_mut(&pty_id_clone) {
                        let _ = channel.write_all(&data);
                        let _ = channel.flush();
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
                let mut channels = SSH_PTY_CHANNELS.lock().unwrap();
                if let Some(channel) = channels.get_mut(&pty_id_clone) {
                    match channel.read(&mut buffer) {
                        Ok(0) => Some(Err("EOF")),
                        Ok(n) => Some(Ok(buffer[..n].to_vec())),
                        Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => None,
                        Err(_) => Some(Err("Read error")),
                    }
                } else {
                    Some(Err("Channel gone"))
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
                let channels = SSH_PTY_CHANNELS.lock().unwrap();
                if let Some(channel) = channels.get(&pty_id_clone) {
                    if channel.eof() {
                        drop(channels);
                        let _ = app.emit(&format!("pty-exit-{}", pty_id_clone), ());
                        break;
                    }
                }
            }
        }

        // Clean up
        {
            let mut channels = SSH_PTY_CHANNELS.lock().unwrap();
            channels.remove(&pty_id_clone);
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
    let mut channels = SSH_PTY_CHANNELS.lock().unwrap();

    if let Some(channel) = channels.get_mut(&pty_id) {
        channel.request_pty_size(cols, rows, None, None)
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

    // Then remove channel
    {
        let mut channels = SSH_PTY_CHANNELS.lock().unwrap();
        channels.remove(&pty_id);
    }

    Ok(())
}
