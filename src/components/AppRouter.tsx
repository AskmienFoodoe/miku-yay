import { BrowserRouter } from "react-router-dom";
import React, { useContext } from "react";
import TopMenu from "./TopMenu";
import { Route } from "react-router";
import App from "./App";
import SonolusConverter from "./SonolusConverter";
import LocalStorageContext from "../contexts/LocalStorageContext";

export default function AppRouter() {

    const context = useContext(LocalStorageContext)

    return (
        <BrowserRouter>
        <div style={{width: '100vw', height: '150px', overflow: 'hidden', backgroundImage: 'url("/critical-data.png")', backgroundSize: 'auto 150px'}} />
        <div style={{backgroundImage: context.kokoro === 'true' ? 'url("/kokoro.png")' : '', backgroundRepeat: 'no-repeat', backgroundSize: '130vw'}}>
          <TopMenu />
          <Route path="/" exact component={App} />
          <Route path="/sonolus-converter" component={SonolusConverter} />
        </div>
      </BrowserRouter>
    )
}