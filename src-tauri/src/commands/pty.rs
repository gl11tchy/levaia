use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

// Global PTY storage
lazy_static::lazy_static! {
    static ref PTY_INSTANCES: Arc<Mutex<HashMap<String, PtyInstance>>> = Arc::new(Mutex::new(HashMap::new()));
}

struct PtyInstance {
    writer: Box<dyn Write + Send>,
    #[allow(dead_code)]
    child: Box<dyn portable_pty::Child + Send + Sync>,
    master: Box<dyn portable_pty::MasterPty + Send>,
}

/// Spawns a platform-appropriate shell attached to a new PTY and begins emitting its output.
///
/// Creates a new PTY, launches the shell process attached to the PTY, stores the PTY instance under `id`, and starts a background thread that emits `pty-data-<id>` events for output and `pty-exit-<id>` when the process exits. If a PTY instance already exists for `id`, the function returns immediately without replacing the existing instance.
///
/// # Returns
///
/// `Ok(())` on success; `Err(String)` with a formatted error message on failure.
///
/// # Examples
///
/// ```no_run
/// // let app: tauri::AppHandle = /* obtain AppHandle */ ;
/// // spawn_shell(app, "terminal-1".into()).unwrap();
/// ```
#[tauri::command]
pub fn spawn_shell(app: AppHandle, id: String) -> Result<(), String> {
    use std::collections::hash_map::Entry;

    let pty_system = native_pty_system();

    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    // Determine shell based on OS
    #[cfg(target_os = "windows")]
    let shell = "powershell.exe";

    #[cfg(not(target_os = "windows"))]
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string());

    #[allow(unused_mut)]
    let mut cmd = CommandBuilder::new(&shell);

    // Set up environment
    #[cfg(not(target_os = "windows"))]
    {
        cmd.env("TERM", "xterm-256color");
    }

    let child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to get writer: {}", e))?;

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to get reader: {}", e))?;

    // Store PTY instance using atomic check-and-insert to prevent TOCTOU race
    {
        let mut instances = PTY_INSTANCES.lock().unwrap();
        match instances.entry(id.clone()) {
            Entry::Occupied(_) => {
                // PTY already exists (handles React StrictMode double-mount)
                // Resources from this attempt will be dropped automatically
                return Ok(());
            }
            Entry::Vacant(entry) => {
                entry.insert(PtyInstance {
                    writer,
                    child,
                    master: pair.master,
                });
            }
        }
    }

    // Spawn reader thread
    let id_clone = id.clone();
    thread::spawn(move || {
        let mut buffer = [0u8; 4096];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => {
                    // EOF - terminal closed
                    let _ = app.emit(&format!("pty-exit-{}", id_clone), ());
                    break;
                }
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buffer[..n]).to_string();
                    let _ = app.emit(&format!("pty-data-{}", id_clone), data);
                }
                Err(_) => {
                    let _ = app.emit(&format!("pty-exit-{}", id_clone), ());
                    break;
                }
            }
        }

        // Clean up
        let mut instances = PTY_INSTANCES.lock().unwrap();
        instances.remove(&id_clone);
    });

    Ok(())
}

#[tauri::command]
pub fn write_to_pty(id: String, data: String) -> Result<(), String> {
    let mut instances = PTY_INSTANCES.lock().unwrap();

    if let Some(instance) = instances.get_mut(&id) {
        instance
            .writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Failed to write to PTY: {}", e))?;
        instance
            .writer
            .flush()
            .map_err(|e| format!("Failed to flush PTY: {}", e))?;
        Ok(())
    } else {
        Err(format!("PTY instance not found: {}", id))
    }
}

#[tauri::command]
pub fn resize_pty(id: String, rows: u16, cols: u16) -> Result<(), String> {
    let instances = PTY_INSTANCES.lock().unwrap();

    if let Some(instance) = instances.get(&id) {
        instance
            .master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to resize PTY: {}", e))
    } else {
        Err(format!("PTY instance not found: {}", id))
    }
}

/// Terminates and removes the PTY instance identified by `id`.
///
/// Attempts to kill the child process for the PTY and remove its entry from the global PTY map.
///
/// # Returns
///
/// `Ok(())` on success; `Err(String)` with "PTY instance not found: <id>" if no matching instance exists.
///
/// # Examples
///
/// ```
/// let _ = kill_pty("my-pty".into());
/// ```
#[tauri::command]
pub fn kill_pty(id: String) -> Result<(), String> {
    let mut instances = PTY_INSTANCES.lock().unwrap();

    if let Some(mut instance) = instances.remove(&id) {
        // Explicitly kill the child process to prevent orphaned processes
        let _ = instance.child.kill();
        Ok(())
    } else {
        Err(format!("PTY instance not found: {}", id))
    }
}