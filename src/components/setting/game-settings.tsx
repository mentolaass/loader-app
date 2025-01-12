import { rawDateFromMillis } from "@/utils/utils";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { invoke } from "@tauri-apps/api/core";
import { MemoryStick, BugPlay, User, Calendar, Hash } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { UserData } from "@/services/auth-service";
import useTranslation from "@/hooks/use-translation";
import { useEffect, useState } from "react";

function GameSettings({ currentUser }: { currentUser: UserData }) {
    const { getString } = useTranslation();
    const [countRam, setCountRam] = useState<number>(1024);
    const [countMaxRam, setCountMaxRam] = useState<number>(1024);
    const [debug, setDebug] = useState<boolean>(false);

    async function setup() {
        let ram: number = await invoke("get_ram");
        let total_ram: number = Number(await invoke("get_total_ram")) / 1024 / 1024;
        let debug: boolean = await invoke("get_debug");
        setCountRam(ram);
        setCountMaxRam(total_ram / 2)
        setDebug(debug);
    }

    useEffect(() => {
        setup();
    }, []);

    return (
        <div className="flex flex-row gap-5">
            <Card className="border-none w-full animate-from-left rounded-3xl bg-slate-900">
                <CardHeader className="select-none">
                    {getString("settings-title-game")}
                </CardHeader>
                <CardContent className="text-gray-400">
                    <div className="flex flex-col gap-5">
                        <div className="flex gap-3">
                            <div className="flex gap-3 items-center">
                                <MemoryStick width={18} height={18} />
                                <h3 className="select-none">{getString("settings-game-ram")}</h3>
                            </div>
                            <Slider onValueChange={async (v) => {
                                await invoke("write_ram", { value: Number(v[0].toFixed(0)) })
                                setCountRam(Number(v[0].toFixed(0)));
                            }} min={512} max={countMaxRam} value={[countRam]} />
                            <h3 className="select-none">{countRam}</h3>
                        </div>

                        <div className="flex items-center">
                            <div className="flex gap-3 items-center mr-auto">
                                <BugPlay width={18} height={18} />
                                <h3 className="select-none">{getString("settings-game-debug")}</h3>
                            </div>
                            <Switch onCheckedChange={async (v) => {
                                await invoke("write_debug", { debug: v })
                                setDebug(v);
                            }} checked={debug} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none w-full select-none animate-from-right rounded-3xl bg-slate-900">
                <CardHeader>
                    <div className="flex">
                        {getString("settings-title-account")}
                        <div className="text-gray-400 flex gap-1 items-center ml-auto">
                            <Hash width={14} height={14} />
                            <h3>{currentUser.id}</h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="text-gray-400">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <User width={18} height={18} />
                            <h3>{currentUser.login}</h3>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar width={18} height={18} />
                            <h3>{rawDateFromMillis(currentUser.timestamp)}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default GameSettings;