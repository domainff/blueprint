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
                    element={<BlueprintDownloader appScript="https://script.google.com/macros/s/AKfycbzHkASvDFLlc7btLWA-ELnHASrbWZsjx9o725BS_YnsCU_P_TOAwiF6Ah1xTpdEDA9c_w/exec" />}
                />
                <Route
                    path="/algolookup"
                    element={<WeeklyAlgorithm appScript="https://script.google.com/macros/s/AKfycbwXBbf2cnfyTgWWW8Cwdy2HJa75vZ5yf_w59gc_hfyWwI2AygJ8ABcVXn5ENgSw25SQ/exec" />}
                />
            </Routes>
        </HashRouter>
    </StrictMode>
);
