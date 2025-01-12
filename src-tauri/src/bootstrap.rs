use std::process::{Command, Stdio};
use tauri::Emitter;
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    process::Command as AsyncCommand,
    time::{sleep, Duration},
};

use std::collections::VecDeque;
use std::sync::{LazyLock, RwLock};

pub static RUNNING: LazyLock<RwLock<VecDeque<String>>> =
    LazyLock::new(|| RwLock::new(VecDeque::new()));

#[tauri::command]
pub async fn run_client(
    id: &str,
    path: &str,
    debug: bool,
    args: Vec<&str>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let clonedid = clone_id(id);

    if debug {
        let mut child = AsyncCommand::new(path)
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start process: {}", e))?;

        let window = tauri::WebviewWindowBuilder::new(
            &app_handle,
            "debug",
            tauri::WebviewUrl::App("debug.html".into()),
        )
        .inner_size(800.0, 600.0)
        .min_inner_size(700.0, 500.0)
        .title("Debug Window")
        .resizable(true)
        .fullscreen(false)
        .transparent(true)
        .decorations(false)
        .shadow(false)
        .build()
        .map_err(|e| format!("Failed to create window: {}", e))?;

        let mut stdout_reader = BufReader::new(child.stdout.take().unwrap()).lines();
        let mut stderr_reader = BufReader::new(child.stderr.take().unwrap()).lines();

        let wc = window.clone();
        tokio::spawn(async move {
            loop {
                tokio::select! {
                    result = stdout_reader.next_line() => {
                        match result {
                            Ok(Some(line)) => {
                                if wc.emit("client_output", line).is_err() {
                                    break;
                                }
                            }
                            Ok(None) => break,
                            Err(_) => break,
                        }
                    }

                    result = stderr_reader.next_line() => {
                        match result {
                            Ok(Some(line)) => {
                                if wc.emit("client_output", format!("%is_error%{}", line)).is_err() {
                                    break;
                                }
                            }
                            Ok(None) => break,
                            Err(_) => break,
                        }
                    }
                }
            }
        });

        tokio::spawn(async move {
            let mut attempts = 0;
            const MAX_ATTEMPTS: u32 = 1000;
            const RETRY_DELAY: Duration = Duration::from_millis(500);

            if !child.id().is_none() {
                loop {
                    if let Some(_) =
                        unsafe { tasklist::find_process_name_by_id(child.id().unwrap()) }
                    {
                        client_running(clonedid.clone());
                        loop {
                            let _ = window.emit(
                                "client_data",
                                format!(
                                    "%is_data%{}-{}",
                                    unsafe {
                                        tasklist::get_proc_memory_info(child.id().unwrap())
                                            .get_pagefile_usage()
                                    },
                                    unsafe { tasklist::get_proc_time(child.id().unwrap()).0 }
                                ),
                            );

                            sleep(Duration::from_secs(1)).await;

                            if unsafe { tasklist::find_process_name_by_id(child.id().unwrap()) }
                                .is_none()
                            {
                                let _ = window.emit("client_data", "die");
                                client_stopping(clonedid.clone());
                                break;
                            }
                        }
                        break;
                    } else {
                        attempts += 1;
                        if attempts >= MAX_ATTEMPTS {
                            client_stopping(clonedid.clone());
                            eprintln!("Process not started with {} attempts", MAX_ATTEMPTS);
                            break;
                        }
                        sleep(RETRY_DELAY).await;
                    }
                }
            }
        });
    } else {
        let _ = Command::new(path)
            .args(&args)
            .spawn()
            .map_err(|e| format!("Failed to start process: {}", e))?;
    }

    Ok(())
}

fn clone_id(id: &str) -> String {
    id.to_string()
}

#[tauri::command]
pub fn client_is_running(id: String) -> bool {
    match RUNNING.read() {
        Ok(guard) => guard.contains(&id),
        Err(_) => {
            eprintln!("Failed to read RUNNING state");
            false
        }
    }
}

pub fn client_stopping(rawid: String) {
    if let Ok(mut guard) = RUNNING.write() {
        guard.retain(|x| x != &rawid);
    } else {
        eprintln!("Failed to acquire write lock for RUNNING state");
    }
}

pub fn client_running(rawid: String) {
    if let Ok(mut guard) = RUNNING.write() {
        guard.push_back(rawid);
    } else {
        eprintln!("Failed to acquire write lock for RUNNING state");
    }
}
