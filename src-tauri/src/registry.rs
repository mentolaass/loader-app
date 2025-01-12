use std::io;
use tauri::command;
use winreg::enums::*;
use winreg::RegKey;
use winreg::HKEY;

use crate::config::get_product_name;

#[command]
pub fn write_debug(debug: bool) {
    write_value_bool("DEBUG", debug);
}

#[command]
pub fn get_debug() -> bool {
    get_value_bool("DEBUG", false)
}

#[command]
pub fn write_ww(value: u64) {
    write_value_int("WINDOWW", value);
}

#[command]
pub fn get_ww() -> u64 {
    get_value_int("WINDOWW", 1024)
}

#[command]
pub fn write_wh(value: u64) {
    write_value_int("WINDOWH", value);
}

#[command]
pub fn get_wh() -> u64 {
    get_value_int("WINDOWH", 1024)
}

#[command]
pub fn write_ram(value: u64) {
    write_value_int("RAM", value);
}

#[command]
pub fn get_ram() -> u64 {
    get_value_int("RAM", 1024)
}

#[command]
pub fn write_language(code: String) {
    write_value("LANGUAGE", &code);
}

#[command]
pub fn get_language() -> String {
    get_value("LANGUAGE", "en").unwrap_or("en".to_string())
}

#[command]
pub fn write_install_dir(dir: String) {
    write_value("INSTALL_DIR", &dir);
}

#[command]
pub fn get_install_dir() -> String {
    get_value("INSTALL_DIR", "undefined").unwrap_or("undefined".to_string())
}

#[command]
pub fn write_session(session: String) {
    write_value("SESSION", &session);
}

#[command]
pub fn get_session() -> String {
    get_value("SESSION", "undefined").unwrap_or("undefined".to_string())
}

fn write_value(value_name: &str, value: &str) {
    let product_name = get_product_name();
    let _ = set_value(
        HKEY_CURRENT_USER,
        &format!("SOFTWARE\\{}", product_name),
        value_name,
        value,
    );
}

fn get_value(value_name: &str, default: &str) -> io::Result<String> {
    let product_name = get_product_name();
    get_value_inner(
        HKEY_CURRENT_USER,
        &format!("SOFTWARE\\{}", product_name),
        value_name,
    )
    .or_else(|_| Ok(default.to_string()))
}

fn write_value_int(value_name: &str, value: u64) {
    let product_name = get_product_name();
    let _ = set_value_int(
        HKEY_CURRENT_USER,
        &format!("SOFTWARE\\{}", product_name),
        value_name,
        &value,
    );
}

fn get_value_int(value_name: &str, default: u64) -> u64 {
    let product_name = get_product_name();
    get_value_int_inner(
        HKEY_CURRENT_USER,
        &format!("SOFTWARE\\{}", product_name),
        value_name,
    )
    .unwrap_or(default)
}

fn write_value_bool(value_name: &str, value: bool) {
    let product_name = get_product_name();
    let _ = set_value_bool(
        HKEY_CURRENT_USER,
        &format!("SOFTWARE\\{}", product_name),
        value_name,
        value,
    );
}

fn get_value_bool(value_name: &str, default: bool) -> bool {
    let product_name = get_product_name();
    get_value_bool_inner(
        HKEY_CURRENT_USER,
        &format!("SOFTWARE\\{}", product_name),
        value_name,
    )
    .unwrap_or(default)
}

fn set_value(hive: HKEY, subkey: &str, value_name: &str, value: &str) -> io::Result<()> {
    let reg_key = RegKey::predef(hive).create_subkey(subkey)?;
    reg_key.0.set_value(value_name, &value)?;
    Ok(())
}

fn get_value_inner(hive: HKEY, subkey: &str, value_name: &str) -> io::Result<String> {
    let reg_key = RegKey::predef(hive).open_subkey_with_flags(subkey, KEY_READ)?;
    reg_key.get_value(value_name)
}

fn set_value_int(hive: HKEY, subkey: &str, value_name: &str, value: &u64) -> io::Result<()> {
    let reg_key = RegKey::predef(hive).create_subkey(subkey)?;
    reg_key.0.set_value(value_name, value)?;
    Ok(())
}

fn get_value_int_inner(hive: HKEY, subkey: &str, value_name: &str) -> io::Result<u64> {
    let reg_key = RegKey::predef(hive).open_subkey_with_flags(subkey, KEY_READ)?;
    reg_key.get_value(value_name)
}

fn set_value_bool(hive: HKEY, subkey: &str, value_name: &str, value: bool) -> io::Result<()> {
    let reg_key = RegKey::predef(hive).create_subkey(subkey)?;
    let value = if value { 1u64 } else { 0u64 };
    reg_key.0.set_value(value_name, &value)?;
    Ok(())
}

fn get_value_bool_inner(hive: HKEY, subkey: &str, value_name: &str) -> io::Result<bool> {
    let reg_key = RegKey::predef(hive).open_subkey_with_flags(subkey, KEY_READ)?;
    let value: u64 = reg_key.get_value(value_name)?;
    Ok(value == 1)
}
