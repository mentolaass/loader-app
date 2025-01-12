import { fetch } from '@tauri-apps/plugin-http'

import { provideProxyAPI } from "@/utils/config.ts";

// fetch session => commit session => fetch user
// you can also write your own methods of session validation without hwid by returning at fetch session -> commited: true
// the session token is stored in the registry, under HKCU\SOFTWARE\%loader name%.

export type Session = {
    token: string;
    commited: boolean;
}

export type UserData = {
    id: number;
    login: string;
    timestamp: number;
}

// creation a new session
export async function fetchSession(login: string, hash: string): Promise<Session> {
    let PROXY_API = await provideProxyAPI();
    const response = await fetch(`${PROXY_API}/api/v1/auth/session/fetch`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ login, hash }),
            method: "POST",
            connectTimeout: 20
        });

    return response.json();
}

// commiting session with validate unique user by hwid
export async function commitSession(token: string, hwid: string): Promise<Session> {
    let PROXY_API = await provideProxyAPI();
    const response = await fetch(`${PROXY_API}/api/v1/auth/session/commit`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ hwid, token }),
            method: "POST",
            connectTimeout: 20
        });

    return response.json();
}

// getting data on user
export async function fetchUserData(token: string): Promise<UserData> {
    let PROXY_API = await provideProxyAPI();
    const response = await fetch(`${PROXY_API}/api/v1/auth/user/fetch`, {
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
        },
        method: "POST",
        connectTimeout: 20
    });

    return response.json();
}