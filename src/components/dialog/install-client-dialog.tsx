import { buildClientArgs, ClientArgs, ClientAssets, ClientData, fetchClientAssets, fetchSubscriptionInfo, SubscriptionData } from "@/services/client-service";
import { Dialog, DialogHeader, DialogDescription, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Captions, CirclePlay, Frown, Play, RefreshCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import Spinner from "@/components/ui/spinner.tsx";
import { createDirectoriesAsync, normalizePath, rawDateFromMillis } from "@/utils/utils";
import parse from 'html-react-parser';
import useTranslation from "@/hooks/use-translation";
import { invoke } from "@tauri-apps/api/core";
import { download } from '@tauri-apps/plugin-upload';
import { toast } from "@/hooks/use-toast";
import { Progress } from "../ui/progress";
import { TooltipProvider, Tooltip } from "../ui/tooltip";
import UiField from "../field/ui-field";
import { provideProxyAPI } from "@/utils/config";

function InstallClientDialog({ isOpen, onOpenChange, client, session }: { isOpen: boolean, onOpenChange: (v: boolean) => void, client: ClientData, session: string }) {
    const { getString } = useTranslation();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [currentState, setCurrentState] = useState<string>("");
    const [currentProcess, setCurrentProcess] = useState<number>(0);
    const [currentMaxProcess, setCurrentMaxProcess] = useState<number>(0);
    const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | undefined>(undefined);

    async function load() {
        setIsProcessing(true);
        try {
            let PROXY_API = await provideProxyAPI();
            const assets: ClientAssets = await fetchClientAssets(session, client.raw_id);
            let downloaded = 0;
            let checked = 0;
            let errors = 0;
            const ignores: string[] = [];
            let installDir: string = await invoke("get_install_dir");
            installDir = `${installDir}/${client.raw_id}/`

            setCurrentMaxProcess(assets.data.length);
            setCurrentState(getString("client_checking_files"));
            for (const asset of assets.data) {
                const exists = await invoke("file_is_exists_and_checksum", { path: `${installDir}${asset.path}`, checksum: asset.checksum });
                if (exists) ignores.push(asset.checksum);
                checked += 1;
                if (checked % 2 == 0)
                    setCurrentProcess(checked);
            }

            setCurrentMaxProcess(assets.data.length - ignores.length);
            setCurrentState(getString("client_downloading_files"));
            for (const asset of assets.data) {
                if (ignores.filter((a) => a === asset.checksum).length == 0) {
                    await createDirectoriesAsync(`${installDir}${asset.path}`);
                    try {
                        await download(
                            `${PROXY_API}/api/v1/client/${client.raw_id}/${asset.path}`,
                            `${installDir}${asset.path}`);
                    } catch (e) {
                        console.log(`${installDir}${asset.path} failed`);
                        errors += 1;
                    }
                    downloaded += 1;
                    if (downloaded % 2 == 0)
                        setCurrentProcess(downloaded);
                }
            }
            setCurrentState(getString("client_running"));
            const args: ClientArgs = await buildClientArgs(
                session, client.raw_id, normalizePath(installDir),
                await invoke("get_ram"), Number(await invoke("get_total_ram")) / 1024 / 1024,
                await invoke("get_ww"), await invoke("get_wh"));
            const debug: boolean = await invoke("get_debug");
            invoke("run_client", { id: client.raw_id, path: args.bootstrap, debug: debug, args: [...args.content, ...[`--${client.raw_id}`]] });
            onOpenChange(false);
        } catch (e) {
            toast({
                title: "Unhandled Exception",
                //@ts-ignore
                description: e.message,
                variant: "destructive"
            })
        }
        setIsProcessing(false);
    }

    async function update() {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
            setSubscriptionData(await fetchSubscriptionInfo(session, client.raw_id));
        } catch { }
        setIsLoading(false);
    }

    useEffect(() => {
        update();
    }, []);

    return (
        <Dialog modal={true} open={isOpen} onOpenChange={(e) => { if (!isProcessing) onOpenChange(e) }}>
            <DialogContent className={"select-none outline-none gap-5 bg-slate-800 bg-opacity-50 backdrop-blur-md flex flex-col items-center font-inter " + (isLoading ? "w-fit" : "w-[750px] max-w-[750px] h-[550px]")}>
                {
                    isLoading && !subscriptionData ? <><Spinner /></>
                        : (
                            <TooltipProvider>
                                <div className="flex gap-5 w-full h-full">
                                    <DialogHeader className="flex h-full flex-col gap-1">
                                        <DialogTitle>
                                            {client.title}
                                        </DialogTitle>
                                        <DialogDescription className="h-full mb-auto">
                                            <div className="flex flex-col gap-5">
                                                <ScrollArea className="w-[220px] h-fit max-h-[150px] text-[14px] text-gray-500 pr-5">
                                                    {client.description}
                                                </ScrollArea>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <UiField
                                                        tooltip={getString("client-total-updates")}
                                                        icon={<RefreshCcw width={15} height={15} />}
                                                        value={client.total_updates} />
                                                    <UiField
                                                        tooltip={getString("client-total-runs")}
                                                        icon={<CirclePlay width={15} height={15} />}
                                                        value={client.total_runs} />
                                                </div>
                                                <Tooltip delayDuration={100}>
                                                    <UiField
                                                        tooltip={getString("client-subscription")}
                                                        icon={<Captions width={15} height={15} />}
                                                        value={subscriptionData?.active ?
                                                            rawDateFromMillis(subscriptionData.expires)
                                                            : getString("subscription-no-active")} />
                                                </Tooltip>
                                            </div>
                                        </DialogDescription>
                                        <DialogFooter >
                                            <div className="flex flex-col gap-3 w-full">
                                                {
                                                    isProcessing ? (
                                                        <div className="text-[12px] gap-1 px-5 flex flex-col items-center justify-center w-full text-gray-500">
                                                            <h3>{currentState}</h3>
                                                            <Progress max={100} value={(currentProcess / currentMaxProcess) * 100} />
                                                        </div>
                                                    ) : <></>
                                                }
                                                <div className="flex flex-row w-full items-center gap-3">
                                                    <Button disabled={isProcessing} onClick={() => onOpenChange(false)} variant={"outline"} className="text-white w-full border-none rounded-3xl group">
                                                        <X />
                                                        {getString("client-dialog-close")}
                                                    </Button>
                                                    <Button onClick={() => load()} disabled={!subscriptionData?.active || isProcessing} className="text-white w-full rounded-3xl group">
                                                        <Play className="group-hover:animate-pulse" />
                                                        {getString("client-dialog-run")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogFooter>
                                    </DialogHeader>
                                    {
                                        client.last_update_log && client.last_update_log.length > 0 ?
                                            (
                                                <div className="flex flex-col gap-1 bg-slate-950 rounded-3xl p-5 text-[15px]">
                                                    <h3>{getString("client-dialog-latest-update")}</h3>
                                                    <ScrollArea className="w-fit text-[13px] text-gray-500 pr-5 h-full">
                                                        {parse(client.last_update_log)}
                                                    </ScrollArea>
                                                </div>
                                            ) : (<div className="w-full h-full flex text-gray-400 items-center gap-3 justify-center flex-col">
                                                <Frown width={40} height={40} />
                                                <h3 className="select-none">{getString("client-dialog-no-updates")}</h3>
                                            </div>)
                                    }
                                </div>
                            </TooltipProvider>
                        )
                }
            </DialogContent>
        </Dialog>
    )
}

export default InstallClientDialog;