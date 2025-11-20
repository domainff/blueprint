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
                    element={<BlueprintDownloader appScript="https://script.google.com/macros/s/AKfycbzKhmdAO3GodBGGB1iYd6GFAWmuJJDC9T9yM03-XOlMBe8qygPxGmHr5nif9HHsekO-CQ/exec" />}
                />
                <Route
                    path="/algolookup"
                    element={<WeeklyAlgorithm appScript="https://script.google.com/macros/s/AKfycbx6K5xXHhCdmGv-fYzsG4B_Jc72zZlC3EHMlBv8hQceNO5dIE3Ahxhq-f6x678TOJG7Dg/exec" />}
                />
            </Routes>
        </HashRouter>
    </StrictMode>
);
