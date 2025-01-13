#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use bootstrap::{run_client, client_is_running};
use config::{get_product_name, get_proxy_api, bootstrap};
use hash::get_sha256;
use hwid::get_hwid;
use java::{get_installed_jdks, get_installed_jres};
use registry::{
    get_debug, get_install_dir, get_language, get_ram, get_session, get_wh, get_ww, write_debug,
    write_install_dir, write_language, write_ram, write_session, write_wh, write_ww,
};
use utils::{
    create_recursive_dirs, file_is_exists_and_checksum, get_current_file_sha256, get_file_sha256,
    get_total_ram, re_run_app_with_remove,
};

mod bootstrap;
mod config;
mod hash;
mod hwid;
mod registry;
mod utils;
mod java;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            bootstrap(app);

            Ok(())
        })
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            write_session,
            get_session,
            get_hwid,
            get_sha256,
            get_install_dir,
            write_install_dir,
            get_product_name,
            write_ram,
            get_ram,
            get_total_ram,
            write_debug,
            get_debug,
            write_language,
            get_language,
            get_current_file_sha256,
            re_run_app_with_remove,
            get_file_sha256,
            create_recursive_dirs,
            file_is_exists_and_checksum,
            get_wh,
            get_ww,
            write_wh,
            write_ww,
            client_is_running,
            run_client,
            get_proxy_api,
            get_installed_jdks,
            get_installed_jres
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
