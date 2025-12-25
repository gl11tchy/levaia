use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub is_symlink: bool,
    pub size: u64,
}

#[derive(Serialize)]
pub struct FileInfo {
    pub size: u64,
    pub is_binary: bool,
    pub is_readonly: bool,
}

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err(format!("Directory does not exist: {}", path));
    }

    if !dir_path.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let mut entries = Vec::new();

    match fs::read_dir(dir_path) {
        Ok(dir_entries) => {
            for entry in dir_entries {
                if let Ok(entry) = entry {
                    let metadata = entry.metadata().ok();
                    let file_type = entry.file_type().ok();

                    let name = entry.file_name().to_string_lossy().to_string();

                    // Skip hidden files starting with '.'
                    // if name.starts_with('.') {
                    //     continue;
                    // }

                    let is_directory = file_type.as_ref().map(|ft| ft.is_dir()).unwrap_or(false);
                    let is_symlink = file_type.as_ref().map(|ft| ft.is_symlink()).unwrap_or(false);
                    let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);

                    entries.push(FileEntry {
                        name,
                        path: entry.path().to_string_lossy().to_string(),
                        is_directory,
                        is_symlink,
                        size,
                    });
                }
            }
        }
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    }

    // Sort: directories first, then alphabetically (case-insensitive)
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}

#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err(format!("File does not exist: {}", path));
    }

    if !file_path.is_file() {
        return Err(format!("Path is not a file: {}", path));
    }

    // Check file size
    let metadata = fs::metadata(&path).map_err(|e| format!("Failed to get file metadata: {}", e))?;
    let size = metadata.len();

    // Refuse files over 50MB
    if size > 50 * 1024 * 1024 {
        return Err("File is too large (>50MB)".to_string());
    }

    // Read file content
    match fs::read(&path) {
        Ok(bytes) => {
            // Check if file is binary (contains null bytes in first 8KB)
            let check_bytes = &bytes[..std::cmp::min(bytes.len(), 8192)];
            if check_bytes.contains(&0) {
                return Err("Binary file cannot be displayed".to_string());
            }

            // Try to decode as UTF-8
            match String::from_utf8(bytes) {
                Ok(content) => Ok(content),
                Err(_) => Err("File is not valid UTF-8 text".to_string()),
            }
        }
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[tauri::command]
pub fn write_file_content(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub fn create_file(path: String) -> Result<(), String> {
    let file_path = Path::new(&path);

    if file_path.exists() {
        return Err(format!("File already exists: {}", path));
    }

    // Ensure parent directory exists
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create parent directory: {}", e))?;
        }
    }

    fs::write(&path, "").map_err(|e| format!("Failed to create file: {}", e))
}

#[tauri::command]
pub fn create_directory(path: String) -> Result<(), String> {
    let dir_path = Path::new(&path);

    if dir_path.exists() {
        return Err(format!("Directory already exists: {}", path));
    }

    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
pub fn rename_item(old_path: String, new_path: String) -> Result<(), String> {
    let old = Path::new(&old_path);
    let new = Path::new(&new_path);

    if !old.exists() {
        return Err(format!("Path does not exist: {}", old_path));
    }

    if new.exists() {
        return Err(format!("Destination already exists: {}", new_path));
    }

    fs::rename(&old_path, &new_path).map_err(|e| format!("Failed to rename: {}", e))
}

#[tauri::command]
pub fn delete_item(path: String) -> Result<(), String> {
    let item_path = Path::new(&path);

    if !item_path.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    if item_path.is_dir() {
        fs::remove_dir_all(&path).map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(&path).map_err(|e| format!("Failed to delete file: {}", e))
    }
}

#[tauri::command]
pub fn get_home_directory() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine home directory".to_string())
}

#[tauri::command]
pub fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
pub fn get_file_info(path: String) -> Result<FileInfo, String> {
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err(format!("File does not exist: {}", path));
    }

    let metadata = fs::metadata(&path).map_err(|e| format!("Failed to get metadata: {}", e))?;

    let is_binary = if file_path.is_file() {
        // Check first 8KB for null bytes
        if let Ok(bytes) = fs::read(&path) {
            let check_bytes = &bytes[..std::cmp::min(bytes.len(), 8192)];
            check_bytes.contains(&0)
        } else {
            false
        }
    } else {
        false
    };

    Ok(FileInfo {
        size: metadata.len(),
        is_binary,
        is_readonly: metadata.permissions().readonly(),
    })
}
