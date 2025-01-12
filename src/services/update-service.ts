import { provideProxyAPI } from '@/utils/config';
import { fetch } from '@tauri-apps/plugin-http'

export type ExeData = {
    sha256: string;
    download_url: string; // maybe host with start http:// or your api path in PROXY_API
}

export async function fetchUpdates(): Promise<ExeData> {
    let PROXY_API = await provideProxyAPI();
    const response = await fetch(`${PROXY_API}/api/v1/loader/updates`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "GET",
            connectTimeout: 20
        });

    return response.json();
}