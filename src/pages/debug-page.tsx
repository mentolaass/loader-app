import UiField from "@/components/field/ui-field";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import useTranslation from "@/hooks/use-translation";
import { parseUTCTimeToSeconds, randomNumber, rawDateFromMillis } from "@/utils/utils";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Copy, MemoryStick, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type Log = {
    id: number;
    source: string;
    timestamp: number;
    error: boolean;
}

function DebugPage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [RAM, setRAM] = useState<string>("0");
    const [runtime, setRuntime] = useState<string>("0");
    const { getString } = useTranslation();

    useEffect(() => {
        let unlisten_co: () => void;
        let unlisten_cd: () => void;

        async function load() {
            try {
                unlisten_co = await listen("client_output", (event) => {
                    const timestamp = new Date().getTime();
                    const content = `${event.payload}`;
                    const error = content.includes("%is_error%");
                    const newLog = {
                        id: randomNumber(0, timestamp),
                        source: content.replace("%is_error%", ""),
                        timestamp: timestamp,
                        error: error,
                    };
                    
                    setLogs((prevLogs) => [...prevLogs, newLog]);
                });
    
                unlisten_cd = await listen("client_data", (event) => {
                    const content = `${event.payload}`;
                    if (content.includes("%is_data%")) {
                        const matches = content.match(/%is_data%(\d+)-(UTC \d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2})/);
                        const values = matches ? matches : [];
                        setRuntime(parseUTCTimeToSeconds(values[2]));
                        setRAM(((parseInt(values[1], 10) / 1024) / 1024).toFixed(0));
                    } else if (content === "die") {
                        setRuntime("died");
                        setRAM("died");
                        getCurrentWebviewWindow().close();
                    }
                });
            } catch (e) {

            }
        }

        load();

        return () => {
            if (unlisten_co) {
                unlisten_co();
            }

            if (unlisten_cd) {
                unlisten_cd();
            }
        };
    }, []);

    return (
        <TooltipProvider>
            <div className="w-screen h-screen">
                <div className="bg-slate-950 w-full h-full p-5 gap-5 flex-row flex">
                    <div className="w-full h-full">
                        <ScrollArea ref={scrollRef} className="w-full h-[calc(100%-30px)]">
                            <div className="pr-5 w-full h-full flex flex-col gap-5">
                                {
                                    logs.map((log) => (
                                        <div key={log.id.toString()} className="select-none flex flex-col w-full justify-start rounded-3xl min-h-[30px] p-5 bg-slate-900">
                                            {
                                                log.error ? <h3 className="text-[16px] text-red-500">{getString("debug_client_error")}</h3> : <></>
                                            }
                                            <h3 className="break-all text-[14px]">{log.source}</h3>
                                            <h3 className="break-all text-[14px] text-gray-400">{rawDateFromMillis(log.timestamp)}</h3>
                                        </div>
                                    ))
                                }
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="rounded-3xl bg-slate-900 p-5 flex flex-col gap-5 h-fit w-[300px]">
                        <h3 className="select-none text-nowrap">{getString("debug_proccess_info")}</h3>
                        <div className="flex flex-row flex-wrap gap-3 w-full">
                            <UiField tooltip={getString("debug_process_ram")} value={`${RAM}MB`} icon={<MemoryStick width={15} height={15} />} />
                            <UiField tooltip={getString("debug_process_runtime")} value={runtime} icon={<Timer width={15} height={15} />} />
                        </div>
                        <h3 className="select-none text-nowrap">{getString("debug_manage_process")}</h3>
                        <div className="flex flex-row flex-wrap gap-3 w-full">
                            <Button variant="outline" className="border-none [&_svg]:size-5 rounded-3xl">
                                <Copy />
                                {getString("debug_process_copy_logs")}
                            </Button>
                        </div>
                    </div>
                </div>

                <Toaster />
            </div>
        </TooltipProvider>
    )
}

export default DebugPage;