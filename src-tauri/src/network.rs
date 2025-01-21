use serde::{Deserialize, Serialize};
use crate::{cert::validate_cert, config::get_proxy_api, hwid::get_hwid};

#[derive(Serialize, Deserialize)]
pub struct Session {
    token: String,
    commited: bool,
}

#[derive(Serialize, Deserialize)]
pub struct UserData {
    id: u32,
    login: String,
    timestamp: u64,
}

#[derive(Serialize, Deserialize)]
pub struct ExeData {
    sha256: String,
    download_url: String,
}

#[derive(Serialize, Deserialize)]
pub struct ClientAsset {
    path: String,
    checksum: String,
    size: u64,
}

#[derive(Serialize, Deserialize)]
pub struct ClientAssets {
    data: Vec<ClientAsset>,
}

#[derive(Serialize, Deserialize)]
pub struct JDK {
    path: String,
    ver: String,
}

#[derive(Serialize, Deserialize)]
pub struct JRE {
    path: String,
    ver: String,
}

#[derive(Serialize, Deserialize)]
pub struct ClientArgs {
    content: Vec<String>,
    bootstrap: String,
}

#[derive(Serialize, Deserialize)]
pub struct ClientData {
    raw_id: String,
    title: String,
    description: String,
    image_url: String,
    last_update_log: String,
    total_runs: Option<u64>,
    total_updates: Option<u64>,
}

#[derive(Serialize, Deserialize)]
pub struct SubscriptionData {
    raw_id: String,
    active: bool,
    expires: u64,
}

#[tauri::command]
pub async fn fetch_session(login: &str, password: &str) -> Result<Session, String> {
    if validate_cert() {
        let client = reqwest::Client::new();
        let response = client.post(format!("{}/api/v1/auth/session/fetch", get_proxy_api()))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "login": login,
                "password": password
            }))
            .send()
            .await
            .map_err(|_| String::from("fail while request"))?;
    
        let session: Session = response.json().await.map_err(|_| String::from("fail while request"))?;
        Ok(session)
    } else {
        Err(String::from("invalid cert"))
    }
}

#[tauri::command]
pub async fn commit_session(token: &str) -> Result<Session, String> {
    if validate_cert() {
        let client = reqwest::Client::new();
        let response = client.post(format!("{}/api/v1/auth/session/commit", get_proxy_api()))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "token": token,
                "hwid": get_hwid()
            }))
            .send()
            .await
            .map_err(|_| String::from("fail while request"))?;
    
        let session: Session = response.json().await.map_err(|_| String::from("fail while request"))?;
        Ok(session)    
    } else {
        Err(String::from("invalid cert"))
    }
}

#[tauri::command]
pub async fn fetch_user_data(session: &str) -> Result<UserData, String> {
    if validate_cert() {
        let client = reqwest::Client::new();
        let response = client.post(format!("{}/api/v1/auth/user/fetch", get_proxy_api()))
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", session))
            .send()
            .await
            .map_err(|_| String::from("fail while request"))?;

        let user_data: UserData = response.json().await.map_err(|_| String::from("fail while request"))?;
        return Ok(user_data);
    } else {
        Err(String::from("invalid cert"))
    }
}

#[tauri::command]
pub async fn fetch_updates() -> Result<ExeData, String> {
    if validate_cert() {
        let client = reqwest::Client::new();
        let proxy_api = get_proxy_api();
        let response = client.get(&format!("{}/api/v1/loader/updates", proxy_api))
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|_| String::from("fail while request"))?;
        let exe_data: ExeData = response.json().await.map_err(|_| String::from("fail while request"))?;
        Ok(exe_data)
    } else {
        Err(String::from("invalid cert"))
    }
}

#[tauri::command]
pub async fn fetch_client_assets(session: String, raw_id: String) -> Result<ClientAssets, String> {
    if validate_cert() {
        let client = reqwest::Client::new();
        let proxy_api = get_proxy_api();
        let response = client.post(&format!("{}/api/v1/client/assets", proxy_api))
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", session))
            .json(&serde_json::json!({ "raw_id": raw_id }))
            .send()
            .await
            .map_err(|_| String::from("fail while request"))?;

        let client_assets: ClientAssets = response.json().await.map_err(|_| String::from("fail while request"))?;
        Ok(client_assets)
    } else {
        Err(String::from("invalid cert"))
    }
}

#[tauri::command]
pub async fn build_client_args(
    session: String,
    raw_id: String,
    install_dir: String,
    ram: u64,
    max_ram: u64,
    window_w: u64,
    window_h: u64,
    jdks: Vec<JDK>,
    jres: Vec<JRE>,
) -> Result<ClientArgs, String> {
    if validate_cert() {
        let client = reqwest::Client::new();
        let proxy_api = get_proxy_api();
        let response = client.post(&format!("{}/api/v1/client/build/args", proxy_api))
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", session))
            .json(&serde_json::json!({
                "raw_id": raw_id,
                "install_dir": install_dir,
                "ram": ram,
                "max_ram": max_ram,
                "window_w": window_w,
                "window_h": window_h,
                "jdks": jdks,
                "jres": jres
            }))
            .send()
            .await
            .map_err(|_| String::from("fail while request"))?;

        let client_args: ClientArgs = response.json().await.map_err(|_| String::from("fail while request"))?;
        Ok(client_args)
    } else {
        Err(String::from("invalid cert"))
    }
}

#[tauri::command]
pub async fn fetch_client_infos(session: String) -> Result<Vec<ClientData>, String> {
    if validate_cert() {
        let client = reqwest::Client::new();
        let proxy_api = get_proxy_api();
        let response = client.post(&format!("{}/api/v1/client/all", proxy_api))
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", session))
            .send()
            .await
            .map_err(|_| String::from("fail while request"))?;

        let client_infos: Vec<ClientData> = response.json().await.map_err(|_| String::from("fail while request"))?;
        Ok(client_infos)
    } else {
        Err(String::from("invalid cert"))
    }
}

#[tauri::command]
pub async fn fetch_subscription_info(session: String, raw_id: String) -> Result<SubscriptionData, String> {
    if validate_cert() {
        let client = reqwest::Client::new();
        let proxy_api = get_proxy_api();
        let response = client.post(&format!("{}/api/v1/subscription", proxy_api))
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", session))
            .json(&serde_json::json!({ "raw_id": raw_id }))
            .send()
            .await
            .map_err(|_| String::from("fail while request"))?;

        let subscription_data: SubscriptionData = response.json().await.map_err(|_| String::from("fail while request"))?;
        Ok(subscription_data)
    } else {
        Err(String::from("invalid cert"))
    }
}