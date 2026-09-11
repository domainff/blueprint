import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import NonSleeperInputWrapper from "./NonSleeperInput/NonSleeperInputWrapper.tsx";
import UserIdFinder from "./UserIdFinder/UserIdFinder.tsx";
import BlueprintDownloader from "./BlueprintDownloader/BlueprintDownloader.tsx";
import WeeklyAlgorithm from "./WeeklyAlgorithm/WeeklyAlgorithm.tsx";
import BlueprintDashboard from "./BlueprintDashboard/BlueprintDashboard.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BodyBackgroundController from "./BodyBackgroundController.tsx";
import InfiniteSpotChecker from "./InfiniteSpotChecker/InfiniteSpotChecker.tsx";

const queryClient = new QueryClient();

// The dashboard now lives at the site root. Old links still point at
// #/dashboard, so send those to "/" and keep any query string (e.g. ?mock=1).
function LegacyDashboardRedirect() {
    const { search } = useLocation();
    return <Navigate to={{ pathname: "/", search }} replace />;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <HashRouter basename="/">
                <BodyBackgroundController />
                <Routes>
                    <Route path="/" element={<BlueprintDashboard />} />
                    <Route path="/findteamid" element={<App />} />
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
                        element={<BlueprintDownloader appScript="https://script.google.com/macros/s/AKfycbzGfQJdlBAy5XGWnaG7vaiJdX1B3HbtqgftTp7c-H-qDo-dIoi0697ro33QecxGINxYoQ/exec" />}
                    />
                    <Route
                        path="/algolookup"
                        element={<WeeklyAlgorithm appScript="https://script.google.com/macros/s/AKfycbwoq07qR7Kcls00TpR2omOFi1EmKkzu7CSrlcJp0iLNby6G3qPUMC5_G9FxJYWPPHm39A/exec" />}
                    />
                    <Route
                        path="/dashboard"
                        element={<LegacyDashboardRedirect />}
                    />
                    <Route
                        path="/infinitespotchecker"
                        element={<InfiniteSpotChecker />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
        </HashRouter>
        </QueryClientProvider>
    </StrictMode>
);
