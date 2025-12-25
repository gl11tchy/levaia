mod commands;

use tauri::{WebviewUrl, WebviewWindowBuilder};
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::filesystem::read_directory,
            commands::filesystem::read_file_content,
            commands::filesystem::write_file_content,
            commands::filesystem::create_file,
            commands::filesystem::create_directory,
            commands::filesystem::rename_item,
            commands::filesystem::delete_item,
            commands::filesystem::get_home_directory,
            commands::filesystem::file_exists,
            commands::filesystem::get_file_info,
            commands::pty::spawn_shell,
            commands::pty::write_to_pty,
            commands::pty::resize_pty,
            commands::pty::kill_pty,
            commands::git::get_git_branch,
            commands::git::git_status,
            commands::git::git_branches,
            commands::git::git_log,
            commands::git::git_stage,
            commands::git::git_stage_all,
            commands::git::git_unstage,
            commands::git::git_unstage_all,
            commands::git::git_discard_changes,
            commands::git::git_commit,
            commands::git::git_checkout,
            commands::git::git_create_branch,
        ])
        .setup(|app| {
            // Create main window programmatically
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Lite")
                .inner_size(1200.0, 800.0)
                .min_inner_size(800.0, 600.0)
                .resizable(true);

            // macOS: Use overlay titlebar for native traffic lights
            #[cfg(target_os = "macos")]
            let win_builder = win_builder
                .title_bar_style(TitleBarStyle::Overlay)
                .hidden_title(true);

            // Windows/Linux: No decorations (custom titlebar)
            #[cfg(not(target_os = "macos"))]
            let win_builder = win_builder.decorations(false);

            let _window = win_builder.build()?;
            // Set up platform-specific menu on macOS
            #[cfg(target_os = "macos")]
            {
                use tauri::menu::{MenuBuilder, SubmenuBuilder};

                let app_menu = SubmenuBuilder::new(app, "Lite")
                    .about(None)
                    .separator()
                    .quit()
                    .build()?;

                let edit_menu = SubmenuBuilder::new(app, "Edit")
                    .undo()
                    .redo()
                    .separator()
                    .cut()
                    .copy()
                    .paste()
                    .select_all()
                    .build()?;

                let menu = MenuBuilder::new(app)
                    .item(&app_menu)
                    .item(&edit_menu)
                    .build()?;

                app.set_menu(menu)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
