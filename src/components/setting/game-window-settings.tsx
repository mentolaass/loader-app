import { invoke } from "@tauri-apps/api/core";
import { Card, CardHeader, CardContent } from "../ui/card";
import { AppWindow, ArrowRightLeft, ArrowUpDown, X } from "lucide-react";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import useTranslation from "@/hooks/use-translation";

function GameWindowSettings() {
    const [width, setWidth] = useState<number>(1024);
    const [height, setHeight] = useState<number>(1024);
    const { getString } = useTranslation();

    async function setup() {
        let ww: number = await invoke("get_ww");
        let wh: number = await invoke("get_wh");
        setWidth(ww);
        setHeight(wh);
    }

    useEffect(() => {
        setup();
    }, []);

    return (
        <div className="flex flex-row gap-5">
            <Card className="border-none w-full select-none animate-from-up rounded-3xl bg-slate-900">
                <CardHeader>
                    <div className="flex">
                        {getString("settings-title-window-game")}
                    </div>
                </CardHeader>
                <CardContent className="text-gray-400">
                    <div className="flex flex-row gap-5 items-center">
                        <AppWindow width={18} height={18} />
                        <h3 className="mr-auto select-none">{getString("settings-window-game-size")}</h3>
                        <div className="flex gap-1 items-center w-[400px]">
                            <Input type="number" value={width} onChange={async (e) => {
                                const v = Number(e.currentTarget.value);
                                await invoke("write_ww", { value: v })
                                setWidth(v);
                            }} autoComplete="off" className="h-[40px] bg-slate-950 border-none rounded-3xl" icon={<ArrowRightLeft width={20} height={20} />} placeholder={getString("settings-window-game-size-width")}></Input>
                            <X width={18} height={18} />
                            <Input type="number" value={height} onChange={async (e) => {
                                const v = Number(e.currentTarget.value);
                                await invoke("write_wh", { value: v })
                                setHeight(v);
                            }} autoComplete="off" className="h-[40px] bg-slate-950 border-none rounded-3xl" icon={<ArrowUpDown width={20} height={20} />} placeholder={getString("settings-window-game-size-height")}></Input>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default GameWindowSettings;