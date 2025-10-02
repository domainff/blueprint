import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter, Route, Routes } from "react-router-dom";
import NonSleeperInputWrapper from "./NonSleeperInput/NonSleeperInputWrapper.tsx";
import UserIdFinder from "./UserIdFinder/UserIdFinder.tsx";
import BlueprintDownloader from "./BlueprintDownloader/BlueprintDownloader.tsx";
import WeeklyAlgorithm from "./WeeklyAlgorithm/WeeklyAlgorithm.tsx";

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
                    element={<BlueprintDownloader appScript="https://script.google.com/macros/s/AKfycbxB5GU8x-rtGMUxwRuFczPwrxKZKYbuX4K9CaEvVcxNDR1gYPLify5ZwkXecvz3HKEqQA/exec" />}
                />
                <Route
                    path="/algolookup"
                    element={<WeeklyAlgorithm appScript="https://script.google.com/macros/s/AKfycbzz4uKoTHGrl3I_9dCDLNFZomjErVKl8dnkUQdN0KfBEY63gfqqqnveuowZmaaebtq1jA/exec" />}
                />
            </Routes>
        </HashRouter>
    </StrictMode>
);
