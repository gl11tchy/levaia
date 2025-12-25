use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

// ============================================================================
// Data Structures
// ============================================================================

#[derive(Serialize, Deserialize, Clone)]
pub struct GitFileStatus {
    pub path: String,
    pub status: String,
    pub staged: bool,
}

#[derive(Serialize, Deserialize)]
pub struct GitStatus {
    pub staged: Vec<GitFileStatus>,
    pub unstaged: Vec<GitFileStatus>,
    pub untracked: Vec<GitFileStatus>,
    pub has_conflicts: bool,
}

#[derive(Serialize, Deserialize)]
pub struct GitCommit {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
}

#[derive(Serialize, Deserialize)]
pub struct GitBranch {
    pub name: String,
    pub is_current: bool,
    pub is_remote: bool,
}

#[derive(Serialize, Deserialize)]
pub struct GitBranches {
    pub current: String,
    pub local: Vec<GitBranch>,
    pub remote: Vec<GitBranch>,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn run_git_command(root_path: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(root_path)
        .output()
        .map_err(|e| format!("Failed to execute git: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(if stderr.is_empty() {
            "Git command failed".to_string()
        } else {
            stderr.trim().to_string()
        })
    }
}

fn is_git_repo(root_path: &str) -> bool {
    Path::new(root_path).join(".git").exists()
}

// ============================================================================
// Commands
// ============================================================================

#[tauri::command]
pub fn get_git_branch(root_path: &str) -> Result<Option<String>, String> {
    let git_head = Path::new(root_path).join(".git/HEAD");

    if !git_head.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&git_head).map_err(|e| e.to_string())?;

    if let Some(branch) = content.strip_prefix("ref: refs/heads/") {
        Ok(Some(branch.trim().to_string()))
    } else {
        Ok(Some(content.trim().chars().take(7).collect()))
    }
}

#[tauri::command]
pub fn git_status(root_path: &str) -> Result<Option<GitStatus>, String> {
    if !is_git_repo(root_path) {
        return Ok(None);
    }

    let output = run_git_command(root_path, &["status", "--porcelain=v1"])?;

    let mut staged = Vec::new();
    let mut unstaged = Vec::new();
    let mut untracked = Vec::new();
    let mut has_conflicts = false;

    for line in output.lines() {
        if line.len() < 3 {
            continue;
        }

        let index_status = line.chars().next().unwrap_or(' ');
        let worktree_status = line.chars().nth(1).unwrap_or(' ');
        let path = line[3..].to_string();

        // Check for conflicts
        if index_status == 'U' || worktree_status == 'U' {
            has_conflicts = true;
        }

        // Untracked files
        if index_status == '?' {
            untracked.push(GitFileStatus {
                path,
                status: "?".to_string(),
                staged: false,
            });
            continue;
        }

        // Staged changes
        if index_status != ' ' && index_status != '?' {
            staged.push(GitFileStatus {
                path: path.clone(),
                status: index_status.to_string(),
                staged: true,
            });
        }

        // Unstaged changes
        if worktree_status != ' ' && worktree_status != '?' {
            unstaged.push(GitFileStatus {
                path,
                status: worktree_status.to_string(),
                staged: false,
            });
        }
    }

    Ok(Some(GitStatus {
        staged,
        unstaged,
        untracked,
        has_conflicts,
    }))
}

#[tauri::command]
pub fn git_branches(root_path: &str) -> Result<Option<GitBranches>, String> {
    if !is_git_repo(root_path) {
        return Ok(None);
    }

    let output = run_git_command(root_path, &["branch", "-a", "--no-color"])?;

    let mut current = String::new();
    let mut local = Vec::new();
    let mut remote = Vec::new();

    for line in output.lines() {
        let is_current = line.starts_with('*');
        let name = line.trim_start_matches('*').trim();

        // Skip HEAD pointer
        if name.contains("HEAD") {
            continue;
        }

        if name.starts_with("remotes/") {
            let remote_name = name.strip_prefix("remotes/").unwrap_or(name);
            remote.push(GitBranch {
                name: remote_name.to_string(),
                is_current: false,
                is_remote: true,
            });
        } else {
            if is_current {
                current = name.to_string();
            }
            local.push(GitBranch {
                name: name.to_string(),
                is_current,
                is_remote: false,
            });
        }
    }

    Ok(Some(GitBranches {
        current,
        local,
        remote,
    }))
}

#[tauri::command]
pub fn git_log(root_path: &str, limit: Option<u32>) -> Result<Vec<GitCommit>, String> {
    if !is_git_repo(root_path) {
        return Ok(Vec::new());
    }

    let limit_str = limit.unwrap_or(50).to_string();
    let format = "%h|%s|%an|%ar";

    let output = run_git_command(
        root_path,
        &["log", &format!("--format={}", format), "-n", &limit_str],
    )?;

    let commits = output
        .lines()
        .filter_map(|line| {
            let parts: Vec<&str> = line.splitn(4, '|').collect();
            if parts.len() >= 4 {
                Some(GitCommit {
                    hash: parts[0].to_string(),
                    message: parts[1].to_string(),
                    author: parts[2].to_string(),
                    date: parts[3].to_string(),
                })
            } else {
                None
            }
        })
        .collect();

    Ok(commits)
}

#[tauri::command]
pub fn git_stage(root_path: &str, paths: Vec<String>) -> Result<(), String> {
    if paths.is_empty() {
        return Ok(());
    }

    let mut args = vec!["add", "--"];
    let path_refs: Vec<&str> = paths.iter().map(|s| s.as_str()).collect();
    args.extend(path_refs);

    run_git_command(root_path, &args)?;
    Ok(())
}

#[tauri::command]
pub fn git_stage_all(root_path: &str) -> Result<(), String> {
    run_git_command(root_path, &["add", "-A"])?;
    Ok(())
}

#[tauri::command]
pub fn git_unstage(root_path: &str, paths: Vec<String>) -> Result<(), String> {
    if paths.is_empty() {
        return Ok(());
    }

    let mut args = vec!["restore", "--staged", "--"];
    let path_refs: Vec<&str> = paths.iter().map(|s| s.as_str()).collect();
    args.extend(path_refs);

    run_git_command(root_path, &args)?;
    Ok(())
}

#[tauri::command]
pub fn git_unstage_all(root_path: &str) -> Result<(), String> {
    run_git_command(root_path, &["restore", "--staged", "."])?;
    Ok(())
}

#[tauri::command]
pub fn git_discard_changes(root_path: &str, paths: Vec<String>) -> Result<(), String> {
    if paths.is_empty() {
        return Ok(());
    }

    let mut args = vec!["restore", "--"];
    let path_refs: Vec<&str> = paths.iter().map(|s| s.as_str()).collect();
    args.extend(path_refs);

    run_git_command(root_path, &args)?;
    Ok(())
}

#[tauri::command]
pub fn git_commit(root_path: &str, message: &str) -> Result<String, String> {
    if message.trim().is_empty() {
        return Err("Commit message cannot be empty".to_string());
    }

    run_git_command(root_path, &["commit", "-m", message])?;

    // Get the commit hash
    let hash = run_git_command(root_path, &["rev-parse", "--short", "HEAD"])?;
    Ok(hash.trim().to_string())
}

#[tauri::command]
pub fn git_checkout(root_path: &str, branch: &str) -> Result<(), String> {
    // Handle remote branches by creating local tracking branch
    let branch_name = if branch.starts_with("origin/") {
        branch.strip_prefix("origin/").unwrap_or(branch)
    } else {
        branch
    };

    run_git_command(root_path, &["checkout", branch_name])?;
    Ok(())
}

#[tauri::command]
pub fn git_create_branch(root_path: &str, branch: &str, checkout: bool) -> Result<(), String> {
    if branch.trim().is_empty() {
        return Err("Branch name cannot be empty".to_string());
    }

    if checkout {
        run_git_command(root_path, &["checkout", "-b", branch])?;
    } else {
        run_git_command(root_path, &["branch", branch])?;
    }

    Ok(())
}
