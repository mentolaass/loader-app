import { provideProxyAPI } from "@/utils/config";
import { fetch } from '@tauri-apps/plugin-http'

export type ClientAsset = {
    path: string;
    checksum: string;
    size: number;
}

export type ClientAssets = {
    data: ClientAsset[]
}

export type JDK = {
    path: string;
    ver: string;
}

export type JRE = {
    path: string;
    ver: string;
}

export type ClientArgs = {
    content: string[];
    bootstrap: string;
}

export type ClientData = {
    raw_id: string;
    title: string;
    description: string;
    image_url: string;
    last_update_log: string;
    total_runs?: number;
    total_updates?: number;
}

export type SubscriptionData = {
    raw_id: string;
    active: boolean;
    expires: number;
}

export async function fetchClientAssets(session: string, raw_id: string): Promise<ClientAssets> {
    let PROXY_API = await provideProxyAPI();
    const response = await fetch(`${PROXY_API}/api/v1/client/assets`,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session}`
            },
            body: JSON.stringify({ raw_id: raw_id }),
            method: "POST",
            connectTimeout: 20
        });

    return response.json();
}

export async function buildClientArgs(
    session: string, 
    raw_id: string, 
    install_dir: string, 
    ram: number, 
    max_ram: number, 
    window_w: number, 
    window_h: number, 
    jdks: JDK[], jres: JRE[]): Promise<ClientArgs> {
    let PROXY_API = await provideProxyAPI();
    const response = await fetch(`${PROXY_API}/api/v1/client/build/args`,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session}`
            },
            body: JSON.stringify({ raw_id: raw_id, install_dir: install_dir, ram: ram, max_ram: max_ram, window_h: window_h, window_w: window_w, jdks: jdks, jres: jres }),
            method: "POST",
            connectTimeout: 20
        });

    return response.json();
}

export async function fetchClientInfos(session: string): Promise<ClientData[]> {
    let PROXY_API = await provideProxyAPI();
    const response = await fetch(`${PROXY_API}/api/v1/client/all`,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session}`
            },
            method: "POST",
            connectTimeout: 20
        });

    return response.json();
}

export async function fetchSubscriptionInfo(session: string, raw_id: string): Promise<SubscriptionData> {
    let PROXY_API = await provideProxyAPI();
    const response = await fetch(`${PROXY_API}/api/v1/subscription`,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session}`
            },
            body: JSON.stringify({ raw_id: raw_id }),
            method: "POST",
            connectTimeout: 20
        });

    return response.json();
}