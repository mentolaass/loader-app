import { invoke } from "@tauri-apps/api/core";

export async function provideProxyAPI(): Promise<string> {
    let api: string = await invoke("get_proxy_api");
    return api;
}