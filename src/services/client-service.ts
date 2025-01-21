import { toast } from "@/hooks/use-toast";
import { invoke } from "@tauri-apps/api/core";

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
    return await invoke("fetch_client_assets", { session: session, raw_id: raw_id })
        .catch((error) => toast({title: error, variant: "destructive"})) as ClientAssets;
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
        return await invoke("build_client_args", { session: session, raw_id: raw_id, install_dir: install_dir, ram: ram, max_ram: max_ram, window_h: window_h, window_w: window_w, jdks: jdks, jres: jres })
            .catch((error) => toast({title: error, variant: "destructive"})) as ClientArgs;
}

export async function fetchClientInfos(session: string): Promise<ClientData[]> {
    return await invoke("fetch_client_infos", { session: session })
        .catch((error) => toast({title: error, variant: "destructive"})) as ClientData[];
}

export async function fetchSubscriptionInfo(session: string, raw_id: string): Promise<SubscriptionData> {
    return await invoke("fetch_subscription_info", { session: session, raw_id: raw_id })
        .catch((error) => toast({title: error, variant: "destructive"})) as SubscriptionData;
}