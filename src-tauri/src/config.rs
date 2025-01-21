use std::{
    collections::HashMap,
    sync::{LazyLock, RwLock},
};

use tauri::App;
use vmprotect::protected;

pub static VARIABLES: LazyLock<RwLock<HashMap<String, String>>> =
    LazyLock::new(|| RwLock::new(HashMap::new()));

fn init_product_name(app: &App) {
    let product_name = app
        .config()
        .product_name
        .clone()
        .unwrap_or("undefined".to_owned());
    let mut map = VARIABLES.write().unwrap();
    map.insert("product_name".to_owned(), product_name);
}

#[tauri::command]
pub fn get_product_name() -> String {
    let map = VARIABLES.read().unwrap();
    map.get("product_name")
        .cloned()
        .unwrap_or(String::from("MLoader"))
}

pub fn get_cert() -> String {
    protected!(cstr "undefined").to_string()
}

#[tauri::command]
pub fn get_proxy_api() -> String {
    protected!(cstr "http://localhost:8080").to_string()
}

pub fn bootstrap(app: &App) {
    init_product_name(app);
}
