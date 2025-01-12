use crate::hash::get_sha256;
use raw_cpuid::CpuId;
use std::{ffi::OsStr, os::windows::ffi::OsStrExt, ptr::null_mut};
use sysinfo::{Disks, System};
use windows::Win32::Foundation::HANDLE;
use windows::{
    core::PCWSTR,
    Win32::{
        Foundation::CloseHandle,
        Graphics::Gdi::{EnumDisplayDevicesW, DISPLAY_DEVICEW},
        Storage::FileSystem::{
            CreateFileW, GetFileInformationByHandle, BY_HANDLE_FILE_INFORMATION,
            FILE_FLAG_BACKUP_SEMANTICS, FILE_SHARE_READ, OPEN_EXISTING,
        },
        UI::WindowsAndMessaging::EDD_GET_DEVICE_INTERFACE_NAME,
    },
};

#[tauri::command]
pub fn get_hwid() -> String {
    let mut sys = System::new_all();
    let cpuid = CpuId::new();
    sys.refresh_all();

    let volume_serial = calculate_volume_serial();
    let memory_mb = sys.total_memory() / 1024 / 1024 / 1024;
    let cpu_serial = cpuid.get_processor_serial().unwrap().serial_all();
    let gpu_info = get_gpu_info();

    get_sha256(String::from(format!(
        "{}-{}-{}-{}",
        volume_serial, memory_mb, cpu_serial, gpu_info
    )))
}

fn get_gpu_info() -> String {
    let mut display_device = DISPLAY_DEVICEW {
        cb: std::mem::size_of::<DISPLAY_DEVICEW>() as u32,
        ..Default::default()
    };

    let result =
        unsafe { EnumDisplayDevicesW(None, 0, &mut display_device, EDD_GET_DEVICE_INTERFACE_NAME) };

    if result.as_bool() {
        return get_device_string(&display_device);
    }

    String::from("undefined")
}

fn calculate_volume_serial() -> u64 {
    let mut serial: u64 = 0;
    let disks = Disks::new_with_refreshed_list();
    for disk in &disks {
        let name = disk
            .mount_point()
            .as_os_str()
            .to_str()
            .unwrap_or("undefined");
        if name.eq("undefined") {
            continue;
        }
        let volume_module = unsafe {
            let lpfilename = PCWSTR(str_to_utf16_ptr(name));
            CreateFileW(
                lpfilename,
                1 | 2,
                FILE_SHARE_READ,
                Some(null_mut()),
                OPEN_EXISTING,
                FILE_FLAG_BACKUP_SEMANTICS,
                Some(HANDLE(null_mut())),
            )
        };
        match volume_module {
            Ok(value) => {
                if !value.is_invalid() {
                    let mut fi = BY_HANDLE_FILE_INFORMATION::default();
                    let success = unsafe { GetFileInformationByHandle(value, &mut fi) };
                    if success.is_ok() {
                        serial += fi.dwVolumeSerialNumber as u64;
                    }
                    unsafe {
                        let _ = CloseHandle(value);
                    };
                }
            }
            Err(e) => {
                println!("{e:?}")
            }
        }
    }

    serial
}

fn str_to_utf16_ptr(s: &str) -> *const u16 {
    let wide: Vec<u16> = OsStr::new(s).encode_wide().chain(Some(0)).collect();
    wide.as_ptr()
}

fn get_device_string(display_device: &DISPLAY_DEVICEW) -> String {
    let device_string = &display_device.DeviceString;
    let device_str = device_string
        .iter()
        .map(|&byte| byte as u8)
        .take_while(|&byte| byte != 0)
        .collect::<Vec<u8>>();
    String::from_utf8_lossy(&device_str).to_string()
}
