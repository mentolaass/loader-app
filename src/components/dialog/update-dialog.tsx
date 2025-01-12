import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import Spinner from "@/components/ui/spinner.tsx";
import {useState, useEffect} from "react";
import useTranslation from "@/hooks/use-translation.tsx";
import {invoke} from "@tauri-apps/api/core";
import {ExeData, fetchUpdates} from "@/services/update-service.ts";
import { download } from '@tauri-apps/plugin-upload';
import {randomChars} from "@/utils/utils.ts";
import { provideProxyAPI } from "@/utils/config";

function UpdateDialog({ onClose }: { onClose: () => void }) {
    const { getString } = useTranslation();
    const [currentState, setCurrentState] = useState<string>("updater-checking");
    const [isOpen, setIsOpen] = useState<boolean>(true);

    async function tryUpdate() {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
            const currentHash: string = await invoke("get_current_file_sha256");
            const exeData: ExeData = await fetchUpdates();
            if (exeData.sha256 !== currentHash) {
                setCurrentState("updater-process");
                const pathToDownload: string = `./${randomChars(10)}.exe`;
                let PROXY_API = await provideProxyAPI();
                await download(
                    exeData.download_url.startsWith("http") ? exeData.download_url : `${PROXY_API}${exeData.download_url}`,
                    pathToDownload
                );
                let status: boolean = await invoke("re_run_app_with_remove", { path: pathToDownload });
                if (!status) {
                    throw new Error();
                }
            } else {
                setCurrentState("updater-latest");
            }
        } catch {
            setCurrentState("updater-failed");
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsOpen(false);
        onClose();
    }

    useEffect(() => {
        tryUpdate();
    }, []);

    return (
        <Dialog modal={true} open={isOpen}>
            <DialogContent className="select-none outline-none gap-5 bg-slate-800 bg-opacity-50 backdrop-blur-md border-none w-[300px] flex flex-row items-center font-inter">
                <DialogHeader className="mr-auto">
                    <DialogTitle />
                     { getString(currentState) }
                </DialogHeader>
                <div>
                    <Spinner />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateDialog;