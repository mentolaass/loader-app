use crate::config::get_product_name;
use crate::hash::get_sha256;
use core::arch::asm;
use std::ffi::{c_void, CStr, OsString};
use std::iter::once;
use std::mem::zeroed;
use std::os::windows::ffi::OsStrExt;
use std::ptr::null_mut;
use sysinfo::System;
use vmprotect::protected;
use windows::Win32::Foundation::HANDLE;
use windows::Win32::Storage::FileSystem::{FILE_FLAGS_AND_ATTRIBUTES, FILE_SHARE_WRITE};
use windows::{
    core::PCWSTR,
    Win32::{
        Graphics::Gdi::{EnumDisplayDevicesW, DISPLAY_DEVICEW},
        Storage::FileSystem::{CreateFileW, FILE_SHARE_READ, OPEN_EXISTING},
        UI::WindowsAndMessaging::EDD_GET_DEVICE_INTERFACE_NAME,
    },
};

#[tauri::command]
pub fn get_hwid() -> String {
    protected!(ultra "get_hwid"; {
        let mut sys = System::new_all();
        sys.refresh_all();

        //let volume_serial = get_sys_volume_serial();
        let memory_gb = sys.total_memory() / 1024 / 1024 / 1024;
        let cpu_id = get_cpu_id();
        let gpu_name = get_gpu_name();

        //get_sha256(String::from(format!(
        //    "{}-{}-{}-{}",
        //    =memory_gb, cpu_id, gpu_name
        //)))

        let mut data = String::from(format!(
            "{}{}{}",
            memory_gb, cpu_id, gpu_name));

        unsafe {
            get_sha256(shuffle(data.as_bytes_mut()))
        }
    })
}

fn shuffle(bytes: &mut [u8]) -> String {
    let product = get_product_name();
    let product_r = product.as_bytes();
    let buf_len = bytes.len();
    let mut response = vec![0_u8; buf_len];
    for i in 0..buf_len {
        response[i] = (bytes[i] ^ product_r[i % product_r.len()]) as u8;
    }
    String::from_utf8(response.to_vec()).unwrap()
}

fn get_cpu_id() -> String {
    let mut buffer = [0u8; 48];
    let mut offset = 0;

    for i in 0x80000002u32..=0x80000004u32 {
        unsafe {
            asm!(
                "cpuid",
                "mov [rdi], eax",
                "mov [rdi + 4], ebx",
                "mov [rdi + 8], ecx",
                "mov [rdi + 12], edx",
                in("eax") i,
                in("rdi") buffer.as_mut_ptr().add(offset),
                out("ecx") _,
                out("edx") _,
            );
        }
        offset += 16;
    }

    String::from(String::from_utf8_lossy(&buffer).into_owned().trim())
}

fn get_gpu_name() -> String {
    let mut display_device = DISPLAY_DEVICEW {
        cb: size_of::<DISPLAY_DEVICEW>() as u32,
        ..Default::default()
    };

    let result =
        unsafe { EnumDisplayDevicesW(None, 0, &mut display_device, EDD_GET_DEVICE_INTERFACE_NAME) };

    if result.as_bool() {
        return get_device_string(&display_device);
    }

    String::from("undefined")
}

fn get_sys_volume_serial() -> String {
    let volume_module = unsafe {
        let lpfilename = PCWSTR(
            OsString::from("\\\\.\\PhysicalDrive0")
                .encode_wide()
                .chain(once(0))
                .collect::<Vec<u16>>()
                .as_ptr(),
        );
        CreateFileW(
            lpfilename,
            0,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            Some(null_mut()),
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            Some(HANDLE(null_mut())),
        )
    };
    match volume_module {
        Ok(handle) => {
            if !handle.is_invalid() {
                // TODO (getting really volume serial)
            }
        }
        Err(e) => {
            println!("{e:?}")
        }
    }

    String::from("undefined")
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
