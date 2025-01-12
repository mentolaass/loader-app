import AppSidebar from "@/components/sidebar/app-sidebar.tsx";
import {useEffect, useState} from "react";
import {Frown} from "lucide-react";
import {useLocation, useNavigate} from "react-router";
import {fetchUserData, UserData} from "@/services/auth-service.ts";
import Spinner from "@/components/ui/spinner.tsx";
import IndexSettingsPage from "@/pages/sub-page/index-settings-page.tsx";
import IndexDashboardPage from "@/pages/sub-page/index-dashboard-page.tsx";
import { Toaster } from "@/components/ui/toaster";
import InstallClientDialog from "@/components/dialog/install-client-dialog";
import { ClientData } from "@/services/client-service";

type PageContent = {
    id: string;
    content: (({ currentUser, session, callback }: { currentUser: UserData, session: string, callback?: (client: ClientData) => void }) => JSX.Element) | undefined;
};

const pagesContents: PageContent[] = [
    {
        "id": "dashboard",
        "content": IndexDashboardPage
    },
    {
        "id": "settings",
        "content": IndexSettingsPage
    }
];

function IndexPage() {
    const [currentPage, setCurrentPage] = useState<string>("dashboard");
    const [currentPageContent, setCurrentPageContent] = useState<PageContent | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<UserData | undefined>(undefined);
    const [currentClient, setCurrentClient] = useState<ClientData | undefined>(undefined);
    const [clientIsOpen, setClientIsOpen] = useState<boolean>(false);
    const {state} = useLocation();
    const navigate = useNavigate();
    const {session} = state;

    function callbackClient(client: ClientData) {
        setCurrentClient(client);
    }

    async function fetchUser(): Promise<void> {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
            if (session === "undefined") {
                navigate("/");
                return;
            }
            const user = await fetchUserData(session);
            setCurrentUser(user);
        } catch { }
        setIsLoading(false);
    }

    useEffect(() => {
        setCurrentPageContent(pagesContents.filter((pageContent) => pageContent.id === currentPage)[0])
    }, [currentPage]);

    useEffect(() => {
        fetchUser();
    }, [])

    useEffect(() => {
        if (currentClient) {
            setClientIsOpen(true);
        }
    }, [currentClient]);

    return (
        <>
            <div className="flex">
                <AppSidebar setCurrentPage={setCurrentPage} currentPage={currentPage} />

                <div className="rounded-tl-xl bg-slate-950 w-full">
                    {
                        isLoading || !currentUser
                        ?
                        <div className="w-full h-full flex items-center text-gray-400 gap-3 justify-center">
                            <Spinner />
                        </div>
                        :
                        (!currentPageContent?.content || !currentUser
                            ?
                            <div className="w-full h-full flex text-gray-400 items-center gap-3 justify-center flex-col">
                                <Frown width={40} height={40} />
                                <h3 className="select-none">page is undefined</h3>
                            </div>
                            :
                            <div className="p-5 h-full w-full">
                                <currentPageContent.content callback={callbackClient} session={session} currentUser={currentUser} />
                            </div>)
                    }
                </div>

                <Toaster />
            </div>

            {
                currentClient ? 
                    <InstallClientDialog onOpenChange={(e) => { setClientIsOpen(e); setCurrentClient(undefined); }} isOpen={clientIsOpen} session={session} client={currentClient!} />
                : <></>
            }
        </>
    )
}

export default IndexPage;