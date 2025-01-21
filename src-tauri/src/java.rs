use winreg::{
    enums::{HKEY_LOCAL_MACHINE, KEY_READ},
    RegKey,
};

#[derive(serde::Serialize)]
pub struct Java {
    path: String,
    ver: String,
}

#[tauri::command]
pub fn get_installed_jres() -> Vec<Java> {
    find_by(String::from("Java Runtime Environment"))
}

#[tauri::command]
pub fn get_installed_jdks() -> Vec<Java> {
    find_by(String::from("JDK"))
}

fn find_by(key: String) -> Vec<Java> {
    let reg_key = RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey_with_flags(format!("SOFTWARE\\JavaSoft\\{}", key), KEY_READ);
    let mut vec = Vec::new();

    match reg_key {
        Ok(rk) => {
            let subkeys = rk.enum_keys().map(|x| x.unwrap());
            for subkey in subkeys {
                let opened_subkey = rk.open_subkey(subkey.clone());

                match opened_subkey {
                    Ok(os) => {
                        vec.push(Java {
                            ver: subkey,
                            path: os.get_value("JavaHome").unwrap(),
                        });
                    }
                    Err(e) => println!("{e:?}"),
                }
            }
        }
        Err(e) => println!("{e:?}"),
    }

    vec
}
