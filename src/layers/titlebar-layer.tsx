import { Button } from "@/components/ui/button.tsx"
import { Maximize2, Minus, X } from "lucide-react";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";

function TitlebarLayer({ children }: { children: JSX.Element, title?: string }) {
    const [twindow, setTWindow] = useState<WebviewWindow>();

    async function load() {
        const w = await getCurrentWebviewWindow();
        setTWindow(w!);
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <>
            {
                window ?
                    (
                        <div className="font-inter min-h-screen min-w-screen">
                            <header data-tauri-drag-region={true} className={"h-[30px] bg-slate-900 flex items-center w-full justify-between"}>
                                <h3 className="pl-2 text-[15px] text-gray-500" />
                                
                                <div className={"flex items-center"}>
                                    <Button onClick={() => twindow!.minimize()} className={"rounded-none h-[30px] w-[30px]"} variant={"ghost"} size={"icon"}>
                                        <Minus />
                                    </Button>

                                    <Button onClick={async () => {
                                        await twindow!.isMaximized() ? twindow!.unmaximize() : twindow!.maximize();
                                    }} className={"rounded-none h-[30px] w-[30px] [&_svg]:size-3.5"} variant={"ghost"} size={"icon"}>
                                        <Maximize2 />
                                    </Button>

                                    <Button onClick={() => twindow!.close()} className={"rounded-none h-[30px] hover:bg-red-600 w-[30px]"} variant={"ghost"} size={"icon"}>
                                        <X />
                                    </Button>
                                </div>
                            </header>

                            {children}
                        </div>
                    )
                    : (
                        <></>
                    )
            }
        </>
    )
}

export default TitlebarLayer;