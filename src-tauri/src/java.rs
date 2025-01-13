use winreg::{enums::{HKEY_LOCAL_MACHINE, KEY_READ}, RegKey};

#[derive(serde::Serialize)]
pub struct JAVA {
    path: String,
    ver: String
}

#[tauri::command]
pub fn get_installed_jres() -> Vec<JAVA> {
    find_by(String::from("Java Runtime Environment"))
}

#[tauri::command]
pub fn get_installed_jdks() -> Vec<JAVA> {
    find_by(String::from("JDK"))
}

fn find_by(key: String) -> Vec<JAVA> {
    let reg_key = RegKey::predef(HKEY_LOCAL_MACHINE).open_subkey_with_flags(format!("SOFTWARE\\JavaSoft\\{}", key), KEY_READ);
    let mut vec = Vec::new();

    match reg_key {
        Ok(rk) => {
            let subkeys = rk.enum_keys().map(|x| x.unwrap());
            for subkey in subkeys {
                let opened_subkey = rk.open_subkey(subkey.clone());
                
                match opened_subkey {
                    Ok(os) => {
                        vec.push(JAVA {
                            ver: subkey,
                            path: os.get_value("JavaHome").unwrap()
                        });
                    },
                    Err(e) => println!("{e:?}")
                }
            }
        },
        Err(e) => println!("{e:?}")
    }

    vec
}