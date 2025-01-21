use std::net::TcpStream;

use openssl::{ssl::{SslConnector, SslMethod, SslVerifyMode}, x509::X509};
use tauri::Url;

use crate::config::{get_cert, get_proxy_api};

pub fn validate_cert() -> bool {
    let separated_proxy = parse_url(&get_proxy_api());
    if separated_proxy.2 != 443 || get_cert().eq("undefined") {
        return true;
    };
    let mut connector_builder = SslConnector::builder(SslMethod::tls()).unwrap();
    connector_builder.set_verify(SslVerifyMode::NONE);
    let connector = connector_builder.build();
    let stream =
        TcpStream::connect(format!("{}:{}", separated_proxy.1, separated_proxy.2)).unwrap();
    let mut tls_stream = connector.connect(&separated_proxy.1, stream).unwrap();
    let cert = tls_stream
        .ssl()
        .peer_certificate()
        .ok_or("undefined")
        .unwrap();
    let original_cert = X509::from_pem(String::from(get_cert().trim()).as_bytes());
    let _ = tls_stream.shutdown();
    let status = cert
        .public_key()
        .unwrap()
        .public_eq(&original_cert.unwrap().public_key().unwrap());
    status
}

fn parse_url(url_str: &str) -> (String, String, u16) {
    let url = Url::parse(url_str).map_err(|e| e.to_string()).unwrap();
    let protocol = url.scheme().to_string();
    let protocol = if protocol.is_empty() { "http".to_string() } else { protocol };
    let domain = url.host_str()
        .ok_or_else(|| "No domain found".to_string())
        .unwrap()
        .to_string();
    let port = url.port().unwrap_or_else(|| {
        match protocol.as_str() {
            "https" => 443,
            _ => 80,
        }
    });
    (protocol, domain, port)
}