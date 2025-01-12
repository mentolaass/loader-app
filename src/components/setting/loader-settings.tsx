import { Folder, Languages } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Card, CardContent, CardHeader } from "../ui/card";
import useTranslation from "@/hooks/use-translation";
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

function LoaderSettings() {
    const { value, setLanguage, getString } = useTranslation();
    const [installDir, setInstallDir] = useState<string>("C:\\");

    async function installDirSelectDialog() {
        const folder = await open({
            multiple: false,
            directory: true
        });

        if (folder) {
            await invoke("write_install_dir", { dir: folder });
            setInstallDir(folder);
        }
    };

    useEffect(() => {
        async function load() {
            let dir: string = await invoke("get_install_dir");
            if (dir === "undefined") {
                dir = `C:\\${await invoke("get_product_name")}`;
                await invoke("write_install_dir", { "dir": dir })
            }
            setInstallDir(dir);
        }

        load();
    }, []);

    return (
        <div className="mb-auto flex gap-5 animate-from-down">
            <Card className="border-none w-full rounded-3xl bg-slate-900">
                <CardHeader className="select-none">
                    {getString("settings-title-loader")}
                </CardHeader>
                <CardContent className="text-gray-400">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <Folder width={18} height={18} />
                            <h3 className="mr-auto select-none">{getString("settings-loader-install-dir")}</h3>
                            <div>
                                <Button onClick={installDirSelectDialog} className="border-none h-[40px] rounded-3xl" variant="outline">
                                    {installDir}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Languages width={18} height={18} />
                            <h3 className="mr-auto select-none">{getString("settings-loader-language")}</h3>
                            <div>
                                <Select onValueChange={async (v) => {
                                    await setLanguage(v);
                                }} value={value}>
                                    <SelectTrigger className="bg-slate-950 rounded-3xl hover:bg-secondary transition-colors border-none h-[40px] w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="font-inter border-none rounded-3xl text-gray-400">
                                        <SelectItem className="h-[40px] rounded-3xl" value="ru">Русский</SelectItem>
                                        <SelectItem className="h-[40px] rounded-3xl" value="en">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoaderSettings;