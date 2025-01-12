use std::{
    env,
    fs::{self, File},
    io::Read,
    os::windows::process::CommandExt,
    path::Path,
    process::{exit, Command},
};

use sha2::{Digest, Sha256};
use sysinfo::System;

#[tauri::command]
pub fn get_total_ram() -> u64 {
    let mut sys = System::new_all();
    sys.refresh_all();
    sys.total_memory()
}

#[tauri::command]
pub fn create_recursive_dirs(path: &str) {
    let _ = fs::create_dir_all(path);
}

#[tauri::command]
pub fn file_is_exists_and_checksum(path: &str, checksum: &str) -> bool {
    if Path::new(path).exists() {
        get_file_sha256(path).eq(checksum)
    } else {
        false
    }
}

#[tauri::command]
pub fn get_current_file_sha256() -> String {
    get_file_sha256(
        env::current_exe()
            .unwrap()
            .as_path()
            .to_str()
            .unwrap_or("undefined"),
    )
}

#[tauri::command]
pub fn get_file_sha256(path: &str) -> String {
    let this_file = File::open(path);

    match this_file {
        Ok(mut value) => {
            let mut hasher = Sha256::new();
            let mut buffer = [0u8; 8192];
            loop {
                let bytes_read = value.read(&mut buffer);
                match bytes_read {
                    Ok(bytes) => {
                        if bytes == 0 {
                            break;
                        }
                        hasher.update(&buffer[..bytes]);
                    }
                    Err(e) => println!("{e:?}"),
                }
            }
            let hash = hasher.finalize();
            format!("{:x}", hash)
        }
        Err(_) => "undefined".to_string(),
    }
}

#[tauri::command]
pub fn re_run_app_with_remove(path: &str) -> bool {
    let current_exe = env::current_exe();

    match current_exe {
        Ok(exe) => {
            let status = Command::new(path).args(env::args().skip(1)).spawn();

            match status {
                Ok(_) => {
                    let _ = Command::new("cmd")
                        .args(&[
                            "/C",
                            "ping",
                            "127.0.0.1",
                            "-n",
                            "5",
                            ">",
                            "nul",
                            "&&",
                            "del",
                            &exe.to_string_lossy(),
                        ])
                        .creation_flags(0x08000000) // CREATE_NO_WINDOW
                        .spawn();
                }
                Err(e) => {
                    println!("{e:?}");
                    return false;
                }
            }
        }
        Err(e) => {
            println!("{e:?}");
            return false;
        }
    }

    exit(0);
}
