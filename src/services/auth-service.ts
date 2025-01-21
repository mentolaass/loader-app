// fetch session => commit session => fetch user
// you can also write your own methods of session validation without hwid by returning at fetch session -> commited: true
// the session token is stored in the registry, under HKCU\SOFTWARE\%loader name%.

import { toast } from "@/hooks/use-toast";
import { invoke } from "@tauri-apps/api/core";

export type Session = {
    token: string;
    commited: boolean;
}

export type UserData = {
    id: number;
    login: string;
    timestamp: number;
}

export async function fetchSession(login: string, password: string): Promise<Session> {
    return await invoke("fetch_session", { login: login, password: password })
        .catch((error) => toast({title: error, variant: "destructive"})) as Session;
}

export async function commitSession(token: string): Promise<Session> {
    return await invoke("commit_session", { token: token })
        .catch((error) => toast({title: error, variant: "destructive"})) as Session;
}

export async function fetchUserData(token: string): Promise<UserData> {
    return await invoke("fetch_user_data", { session: token })
        .catch((error) => toast({title: error, variant: "destructive"})) as UserData;
}