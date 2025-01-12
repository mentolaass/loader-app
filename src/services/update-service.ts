import {PROXY_API} from "@/utils/config.ts";
import { fetch } from '@tauri-apps/plugin-http'

export type ExeData = {
    sha256: string;
    download_url: string; // maybe host with start http:// or your api path in PROXY_API
}

export async function fetchUpdates(): Promise<ExeData> {
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