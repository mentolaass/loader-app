import { Button } from "@/components/ui/button.tsx"
import { Minus, X } from "lucide-react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";

function TitlebarLayer({ children, window }: { children: JSX.Element, window: string, title?: string }) {
    const [twindow, setTWindow] = useState<WebviewWindow>();

    async function load() {
        const w = await WebviewWindow.getByLabel(window);
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

                                    <Button onClick={() => twindow!.close()} className={"rounded-none h-[30px] w-[30px]"} variant={"ghost"} size={"icon"}>
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