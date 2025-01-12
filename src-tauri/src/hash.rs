use hex;
use sha2::{Digest, Sha256};
use vmprotect::protected;

#[tauri::command]
pub fn get_sha256(data: String) -> String {
    protected!(virtualize "get_sha256"; {
        let mut instance = Sha256::new();
        instance.update(data);
        hex::encode(instance.finalize())
    })
}
