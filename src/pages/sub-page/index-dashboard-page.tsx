import LoaderClient from "@/components/client/loader-client.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import { toast } from "@/hooks/use-toast";
import { UserData } from "@/services/auth-service";
import { ClientData, fetchClientInfos } from "@/services/client-service";
import { useEffect, useState } from "react";

function IndexDashboardPage({ callback, session }: { callback?: (client: ClientData) => void, currentUser: UserData, session: string }) {
    const [clientInfos, setClientInfos] = useState<ClientData[]>([]);

    async function updateClientInfos() {
        try {
            const response = await fetchClientInfos(session);
            if (Array.isArray(response)) setClientInfos(response);
            else throw new Error("Fail of get client infos")
        } catch (e) {
            toast({
                title: "Exception",
                //@ts-ignore
                description: e.message,
                variant: "destructive"
            })
        }
    }

    useEffect(() => {
        updateClientInfos()
    }, []);

    return (
        <>
            <ScrollArea className="h-[630px]">
                <div className="grid grid-cols-3 gap-5 pr-5">
                    {
                        clientInfos.map((client) => (
                            <LoaderClient key={client.raw_id} callback={callback!} client={client} />
                        ))
                    }
                </div>
            </ScrollArea>
        </>
    )
}

export default IndexDashboardPage;