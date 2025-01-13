import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import IndexPage from "./pages/index-page.tsx";
import TitlebarLayer from "@/layers/titlebar-layer.tsx";
import "./index.css"
import BackgroundLayer from "@/layers/background-layer.tsx";
import LoginPage from "@/pages/login-page.tsx";

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
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element=
          {
            <TitlebarLayer>
              <LoginPage />
            </TitlebarLayer>
          }
        />
        <Route path={"/loader"} element=
          {
            <BackgroundLayer>
              <TitlebarLayer>
                <IndexPage />
              </TitlebarLayer>
            </BackgroundLayer>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
