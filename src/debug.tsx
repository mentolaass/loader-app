import React from "react";
import ReactDOM from "react-dom/client";
import TitlebarLayer from "@/layers/titlebar-layer.tsx";
import "./index.css"
import DebugPage from "@/pages/debug-page.tsx";

function disableMenuAndRefresh() {
    if (window.location.hostname !== 'tauri.localhost') {
        return
    }

    document.addEventListener('keydown', function (event) {
        if (
            event.key === 'F5' ||
            (event.ctrlKey && event.key === 'r') ||
            (event.metaKey && event.key === 'r')
        ) {
            event.preventDefault();
        }
    });

    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false;
    }, { capture: true })

    document.addEventListener('selectstart', e => {
        e.preventDefault();
        return false;
    }, { capture: true })
}

disableMenuAndRefresh();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <TitlebarLayer title="debugging" window="debug">
            <DebugPage />
        </TitlebarLayer>
    </React.StrictMode>,
);
