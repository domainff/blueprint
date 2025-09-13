import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter, Route, Routes } from "react-router-dom";
import NonSleeperInputWrapper from "./NonSleeperInput/NonSleeperInputWrapper.tsx";
import UserIdFinder from "./UserIdFinder/UserIdFinder.tsx";
import BlueprintDownloader from "./BlueprintDownloader/BlueprintDownloader.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <HashRouter basename="/">
            <Routes>
                <Route path="/" element={<App />} />
                <Route
                    path="/nonsleeper"
                    element={<NonSleeperInputWrapper />}
                />
                <Route
                    path="/useridfinder"
                    element={<UserIdFinder />}
                />
                <Route
                    path="/bplookup"
                    element={<BlueprintDownloader appScript="https://script.google.com/macros/s/AKfycbzKWz3CFltD9XtNN_1GCfyPGyovZ4Q6xgwRP_Cfzugdr7nxTzi67j8pj-p08pG5z42Itw/exec" />}
                />
                <Route
                    path="/algolookup"
                    element={<BlueprintDownloader appScript="https://script.google.com/macros/s/AKfycbxUS2AS-xu-Ge1WDndl79hpuS9Zptt-pAfPiOT6TKdqjb8yTRmK-6hHA4kj3hKLcnf44A/exec" />}
                />
            </Routes>
        </HashRouter>
    </StrictMode>
);
