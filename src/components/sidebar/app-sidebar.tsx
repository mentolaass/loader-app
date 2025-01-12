import {Button} from "@/components/ui/button.tsx";
import {LayoutDashboard, LogOut, Settings} from "lucide-react";
import {Dispatch, SetStateAction} from "react";
import {invoke} from "@tauri-apps/api/core";
import {useNavigate} from "react-router";

export type Page = {
    icon: any;
    id: string;
}

export const Pages: Page[] = [
    {
        "icon": LayoutDashboard,
        "id": "dashboard"
    },
    {
        "icon": Settings,
        "id": "settings"
    },
]

function AppSidebar({ currentPage, setCurrentPage }: { currentPage: string, setCurrentPage: Dispatch<SetStateAction<string>> }) {
    const navigate = useNavigate();

    async function logOut() {
        await invoke("write_session", { session: "undefined" });
        navigate("/");
    }

    return (
        <div className="bg-slate-900 w-[80px]" style={{ height: "calc(100vh - 30px)" }}>
            <div className="flex flex-col space-y-2 py-5 w-full h-full items-center">
                <div className="flex-col flex space-y-2 mb-auto">
                    {
                        Pages.map((page) => (
                            <Button onClick={() => setCurrentPage(page.id)} key={page.id} disabled={page.id === currentPage} variant={"ghost"} className={"w-[50px] h-[50px] [&_svg]:size-5 rounded-3xl"}>
                                <page.icon />
                            </Button>
                        ))
                    }
                </div>

                <Button onClick={logOut} variant="ghost" className="w-[50px] h-[50px] [&_svg]:size-5 rounded-3xl">
                    <LogOut />
                </Button>
            </div>
        </div>
    )
}

export default AppSidebar;