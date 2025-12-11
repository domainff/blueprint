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
                    element={<BlueprintDownloader appScript="https://script.google.com/macros/s/AKfycbwWrjH0Bj58O15MxKsUvynaQ966yIUhyjdEbssQjxsOzAAsdocsjueBX5RsrXB7YWqdtg/exec" />}
                />
                <Route
                    path="/algolookup"
                    element={<WeeklyAlgorithm appScript="https://script.google.com/macros/s/AKfycbzxIbcKoDgV5_Paao_m_NoAWSpemduHsPRPjwuqZPheq_8Ia15qlyGOT8I2Y8KRPU6GEg/exec" />}
                />
            </Routes>
        </HashRouter>
    </StrictMode>
);
