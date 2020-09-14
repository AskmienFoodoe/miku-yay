import { BrowserRouter } from "react-router-dom";
import React from "react";
import TopMenu from "./TopMenu";
import { Route } from "react-router";
import SonolusConverter from "./SonolusConverter";

export default function AppRouter() {
    return (
        <BrowserRouter>
        <div style={{width: '100vw', height: '150px', overflow: 'hidden', backgroundImage: 'url("/critical-data.png")', backgroundSize: 'auto 150px'}} />
          <TopMenu />
          <Route path="/" exact component={SonolusConverter} />
      </BrowserRouter>
    )
}