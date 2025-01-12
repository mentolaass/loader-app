use std::{path::Path, env};

fn main() {
    let dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    println!(
        "cargo:rustc-link-search=native={}",
        Path::new(&dir).display()
    );
    let target = env::var("TARGET").unwrap();
    if target == "x86_64-apple-darwin" {
        println!("cargo:rustc-link-lib=dylib=VMProtectSDK");
    } else if target.starts_with("x86_64-") {
        println!("cargo:rustc-link-lib=dylib=VMProtectSDK64");
    } else if target.starts_with("i686-") {
        println!("cargo:rustc-link-lib=dylib=VMProtectSDK32")
    } else {
        panic!("Unsupported target: {}", target)
    }

    let mut windows = tauri_build::WindowsAttributes::new();
    windows = windows.app_manifest(
        r#"
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <dependency>
    <dependentAssembly>
      <assemblyIdentity
        type="win32"
        name="Microsoft.Windows.Common-Controls"
        version="6.0.0.0"
        processorArchitecture="*"
        publicKeyToken="6595b64144ccf1df"
        language="*"
      />
    </dependentAssembly>
  </dependency>
  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
        <requestedPrivileges>
            <requestedExecutionLevel level="requireAdministrator" uiAccess="false" />
        </requestedPrivileges>
    </security>
  </trustInfo>
</assembly>
"#,
    );
    tauri_build::try_build(tauri_build::Attributes::new().windows_attributes(windows))
        .expect("failed to run build script");
}
