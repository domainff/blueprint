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
                    element={<BlueprintDownloader appScript="https://script.google.com/macros/s/AKfycbwjFVq58wYnI--hYWfdufYOyDbpnS7neNDIcCt94fKsH4oG_7CmmGutcKYz35b-gicS/exec" />}
                />
                <Route
                    path="/algolookup"
                    element={<WeeklyAlgorithm appScript="https://script.google.com/macros/s/AKfycbwsfCSquE9LMk3jFIFKhw8XMM3wY8VIudmDDqfTkw-hacGFWwxEWmkU1V1D5ANwcbsRUg/exec" />}
                />
            </Routes>
        </HashRouter>
    </StrictMode>
);
