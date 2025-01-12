import { ClientData } from "@/services/client-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.tsx";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function LoaderClient({ client, callback }: { client: ClientData, callback: (client: ClientData) => void }) {
    const [isRunning, setIsRunning] = useState<boolean>(false);

    useEffect(() => {
        async function load() {
            const v: boolean = await invoke("client_is_running", { id: client.raw_id })
            setIsRunning(v);
        }

        load();
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        async function updater() {
            const v: boolean = await invoke("client_is_running", { id: client.raw_id });
            setIsRunning(v);
        }
        intervalId = setInterval(updater, 1000);
        return () => clearInterval(intervalId);
    }, []);
    
    return (
        <div onClick={() => { if (!isRunning) { callback(client) }  }} className={"w-full h-[250px] rounded-3xl bg-cover bg-no-repeat bg-center animate-in-scale transition-all group " + (isRunning ? "" : "cursor-pointer hover:scale-95")} style={{ backgroundImage: `url(${client.image_url})` }}>
            <Card className={"select-none flex-col flex border-none rounded-3xl h-full w-full bg-slate-900 transition-all bg-opacity-50 " + (isRunning ? "bg-opacity-80" : "group-hover:bg-opacity-80")}>
                <CardHeader>
                    <CardTitle>
                        <div className="flex bg-slate-950 bg-opacity-50 backdrop-blur-3xl items-center text-wrap p-3 justify-center rounded-3xl">
                            <h3 className="break-all">{client.title}</h3>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center h-full justify-center">
                    {
                        !isRunning ? (<div className="flex items-center justify-center bg-opacity-50 backdrop-blur-3xl w-[40px] h-[40px] bg-slate-950 group-hover:animate-arrow-in opacity-0 rounded-3xl">
                            <Play className="w-[20-px] h-[20px]" />
                        </div>) : <></>
                    }
                </CardContent>
            </Card>
        </div>
    )
}

export default LoaderClient;