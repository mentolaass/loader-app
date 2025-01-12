import { UserData } from "@/services/auth-service.ts";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoaderSettings from "@/components/setting/loader-settings";
import GameSettings from "@/components/setting/game-settings";
import GameWindowSettings from "@/components/setting/game-window-settings";

function IndexSettingsPage({ currentUser }: { currentUser: UserData, session: string }) {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <ScrollArea className="h-[520px] w-full pr-5">
                <div className="flex flex-col gap-5 h-full">
                    <GameSettings currentUser={currentUser} />
                    <GameWindowSettings />
                    <LoaderSettings />
                </div>
            </ScrollArea>
        </div>
    )
}

export default IndexSettingsPage;