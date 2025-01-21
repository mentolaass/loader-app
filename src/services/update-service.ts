import { toast } from "@/hooks/use-toast";
import { invoke } from "@tauri-apps/api/core";

export type ExeData = {
    sha256: string;
    download_url: string; // maybe host with start http:// or your api path in PROXY_API
}

export async function fetchUpdates(): Promise<ExeData> {
    return await invoke("fetch_updates")
        .catch((error) => toast({title: error, variant: "destructive"})) as ExeData;
}