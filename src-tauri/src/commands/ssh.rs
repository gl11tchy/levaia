use serde::Deserialize;
use ssh2::Session;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::Path;
use std::sync::{Arc, Mutex};

// Reuse FileEntry from filesystem module
use super::filesystem::FileEntry;

// Global SSH session storage (public so ssh_pty can reuse sessions)
lazy_static::lazy_static! {
    pub static ref SSH_SESSIONS: Arc<Mutex<HashMap<String, SshSession>>> = Arc::new(Mutex::new(HashMap::new()));
}

pub struct SshSession {
    pub session: Session,
    #[allow(dead_code)]
    pub host: String,
    #[allow(dead_code)]
    pub user: String,
}

// Expand ~ to home directory in paths
fn expand_tilde(path: &str) -> String {
    if path.starts_with("~/") {
        if let Some(home) = std::env::var_os("HOME") {
            return path.replacen("~", &home.to_string_lossy(), 1);
        }
    }
    path.to_string()
}

#[derive(Deserialize)]
pub struct SshAuthParams {
    pub auth_type: String, // "password" or "key"
    pub password: Option<String>,
    pub key_path: Option<String>,
    pub key_passphrase: Option<String>,
}

#[tauri::command]
pub fn ssh_connect(
    id: String,
    host: String,
    port: u16,
    user: String,
    auth: SshAuthParams,
) -> Result<(), String> {
    // Check if already connected
    {
        let sessions = SSH_SESSIONS.lock().unwrap();
        if sessions.contains_key(&id) {
            return Err("Session already exists with this ID".to_string());
        }
    }

    // Connect to SSH server
    let addr = format!("{}:{}", host, port);
    let tcp = TcpStream::connect(&addr)
        .map_err(|e| format!("Failed to connect to {}: {}", addr, e))?;

    let mut session = Session::new()
        .map_err(|e| format!("Failed to create SSH session: {}", e))?;

    session.set_tcp_stream(tcp);
    session.handshake()
        .map_err(|e| format!("SSH handshake failed: {}", e))?;

    // Authenticate
    match auth.auth_type.as_str() {
        "password" => {
            let password = auth.password.ok_or("Password required for password auth")?;
            session.userauth_password(&user, &password)
                .map_err(|e| format!("Password authentication failed: {}", e))?;
        }
        "key" => {
            let key_path = auth.key_path.ok_or("Key path required for key auth")?;
            let key_path = expand_tilde(&key_path);
            let key_path = Path::new(&key_path);
            let passphrase = auth.key_passphrase.as_deref();
            session.userauth_pubkey_file(&user, None, key_path, passphrase)
                .map_err(|e| format!("Key authentication failed: {}", e))?;
        }
        _ => return Err(format!("Unknown auth type: {}", auth.auth_type)),
    }

    if !session.authenticated() {
        return Err("Authentication failed".to_string());
    }

    // Store session
    let mut sessions = SSH_SESSIONS.lock().unwrap();
    sessions.insert(id, SshSession {
        session,
        host,
        user,
    });

    Ok(())
}

#[tauri::command]
pub fn ssh_disconnect(id: String) -> Result<(), String> {
    let mut sessions = SSH_SESSIONS.lock().unwrap();

    if sessions.remove(&id).is_some() {
        Ok(())
    } else {
        Err(format!("SSH session not found: {}", id))
    }
}

#[tauri::command]
pub fn ssh_is_connected(id: String) -> bool {
    let sessions = SSH_SESSIONS.lock().unwrap();
    sessions.contains_key(&id)
}

#[tauri::command]
pub fn ssh_list_directory(id: String, path: String) -> Result<Vec<FileEntry>, String> {
    let sessions = SSH_SESSIONS.lock().unwrap();
    let ssh_session = sessions.get(&id)
        .ok_or_else(|| format!("SSH session not found: {}", id))?;

    let sftp = ssh_session.session.sftp()
        .map_err(|e| format!("Failed to open SFTP channel: {}", e))?;

    let entries = sftp.readdir(Path::new(&path))
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    let mut result: Vec<FileEntry> = entries
        .into_iter()
        .map(|(path_buf, stat)| {
            let name = path_buf.file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();
            let full_path = path_buf.to_string_lossy().to_string();
            let is_directory = stat.is_dir();
            let is_symlink = stat.file_type().is_symlink();
            let size = stat.size.unwrap_or(0);

            FileEntry {
                name,
                path: full_path,
                is_directory,
                is_symlink,
                size,
            }
        })
        .collect();

    // Sort: directories first, then alphabetically
    result.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(result)
}

#[tauri::command]
pub fn ssh_read_file(id: String, path: String) -> Result<String, String> {
    let sessions = SSH_SESSIONS.lock().unwrap();
    let ssh_session = sessions.get(&id)
        .ok_or_else(|| format!("SSH session not found: {}", id))?;

    let sftp = ssh_session.session.sftp()
        .map_err(|e| format!("Failed to open SFTP channel: {}", e))?;

    // Get file stats first to check size
    let stat = sftp.stat(Path::new(&path))
        .map_err(|e| format!("Failed to stat file: {}", e))?;

    let size = stat.size.unwrap_or(0);
    if size > 50 * 1024 * 1024 {
        return Err("File is too large (>50MB)".to_string());
    }

    let mut file = sftp.open(Path::new(&path))
        .map_err(|e| format!("Failed to open file: {}", e))?;

    let mut contents = Vec::new();
    file.read_to_end(&mut contents)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    // Check if binary
    let check_bytes = &contents[..std::cmp::min(contents.len(), 8192)];
    if check_bytes.contains(&0) {
        return Err("Binary file cannot be displayed".to_string());
    }

    String::from_utf8(contents)
        .map_err(|_| "File is not valid UTF-8 text".to_string())
}

#[tauri::command]
pub fn ssh_write_file(id: String, path: String, content: String) -> Result<(), String> {
    let sessions = SSH_SESSIONS.lock().unwrap();
    let ssh_session = sessions.get(&id)
        .ok_or_else(|| format!("SSH session not found: {}", id))?;

    let sftp = ssh_session.session.sftp()
        .map_err(|e| format!("Failed to open SFTP channel: {}", e))?;

    let mut file = sftp.create(Path::new(&path))
        .map_err(|e| format!("Failed to create/open file for writing: {}", e))?;

    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn ssh_delete(id: String, path: String) -> Result<(), String> {
    let sessions = SSH_SESSIONS.lock().unwrap();
    let ssh_session = sessions.get(&id)
        .ok_or_else(|| format!("SSH session not found: {}", id))?;

    let sftp = ssh_session.session.sftp()
        .map_err(|e| format!("Failed to open SFTP channel: {}", e))?;

    // Check if it's a directory or file
    let stat = sftp.stat(Path::new(&path))
        .map_err(|e| format!("Failed to stat path: {}", e))?;

    if stat.is_dir() {
        sftp.rmdir(Path::new(&path))
            .map_err(|e| format!("Failed to remove directory: {}", e))
    } else {
        sftp.unlink(Path::new(&path))
            .map_err(|e| format!("Failed to delete file: {}", e))
    }
}

#[tauri::command]
pub fn ssh_rename(id: String, old_path: String, new_path: String) -> Result<(), String> {
    let sessions = SSH_SESSIONS.lock().unwrap();
    let ssh_session = sessions.get(&id)
        .ok_or_else(|| format!("SSH session not found: {}", id))?;

    let sftp = ssh_session.session.sftp()
        .map_err(|e| format!("Failed to open SFTP channel: {}", e))?;

    sftp.rename(Path::new(&old_path), Path::new(&new_path), None)
        .map_err(|e| format!("Failed to rename: {}", e))
}

#[tauri::command]
pub fn ssh_create_dir(id: String, path: String) -> Result<(), String> {
    let sessions = SSH_SESSIONS.lock().unwrap();
    let ssh_session = sessions.get(&id)
        .ok_or_else(|| format!("SSH session not found: {}", id))?;

    let sftp = ssh_session.session.sftp()
        .map_err(|e| format!("Failed to open SFTP channel: {}", e))?;

    // Create with default permissions (0755)
    sftp.mkdir(Path::new(&path), 0o755)
        .map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
pub fn ssh_create_file(id: String, path: String) -> Result<(), String> {
    ssh_write_file(id, path, String::new())
}

#[tauri::command]
pub fn ssh_get_home_dir(id: String) -> Result<String, String> {
    let sessions = SSH_SESSIONS.lock().unwrap();
    let ssh_session = sessions.get(&id)
        .ok_or_else(|| format!("SSH session not found: {}", id))?;

    // Execute command to get home directory
    let mut channel = ssh_session.session.channel_session()
        .map_err(|e| format!("Failed to open channel: {}", e))?;

    channel.exec("echo $HOME")
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    let mut output = String::new();
    channel.read_to_string(&mut output)
        .map_err(|e| format!("Failed to read output: {}", e))?;

    channel.wait_close()
        .map_err(|e| format!("Failed to close channel: {}", e))?;

    Ok(output.trim().to_string())
}
