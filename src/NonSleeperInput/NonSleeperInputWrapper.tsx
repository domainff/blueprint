import { useState } from "react";
import { useNonSleeper } from "../hooks/hooks";
import { Roster } from "../sleeper-api/sleeper-api";
import NonSleeperInput from "./NonSleeperInput";
import { Button } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import styles from "./NonSleeperInputWrapper.module.css";
export default function NonSleeperInputWrapper() {
    const { innerWidth: width } = window;
    const [_roster, setRoster] = useState<Roster>();
    const {
        nonSleeperIds,
        setNonSleeperIds,
        nonSleeperRosterSettings,
        setNonSleeperRosterSettings,
        ppr,
        setPpr,
        teBonus,
        setTeBonus,
        numRosters,
        setNumRosters,
        taxiSlots,
        setTaxiSlots,
        teamName,
        setTeamName,
    } = useNonSleeper(undefined, undefined, setRoster);

    function trimmedUrlParams() {
        const url = window.location.href;
        const nonsleeperPath = "nonsleeper?";
        const index = url.indexOf(nonsleeperPath);
        if (index === -1) {
            console.error("nonsleeper path not found");
            return url;
        }
        return url.substring(index + nonsleeperPath.length);
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "center",
            }}
        >
            <NonSleeperInput
                nonSleeperIds={nonSleeperIds}
                setNonSleeperIds={setNonSleeperIds}
                teamName={teamName}
                setTeamName={setTeamName}
                nonSleeperRosterSettings={nonSleeperRosterSettings}
                setNonSleeperRosterSettings={setNonSleeperRosterSettings}
                ppr={ppr}
                setPpr={setPpr}
                teBonus={teBonus}
                setTeBonus={setTeBonus}
                numRosters={numRosters}
                setNumRosters={setNumRosters}
                taxiSlots={taxiSlots}
                setTaxiSlots={setTaxiSlots}
            />
            <div className={styles.confirmationMessage}>
                Please confirm this is the accurate team to review and is up to
                date and make any changes necessary. To submit the team for the
                FIRST iteration of the infinite blueprint, click the button
                below saying "Copy league settings and roster," and paste it and
                respond to the message on the flock site. For later updates,
                reply to the email with the pasted link as the contents. Thank
                you!
            </div>
            <div
                className={styles.leagueSettingsAndRoster}
                style={{
                    maxWidth: `${width - 50}px`,
                }}
            >
                {trimmedUrlParams()}
            </div>
            <Button
                variant="outlined"
                onClick={() => {
                    navigator.clipboard.writeText(trimmedUrlParams());
                }}
                startIcon={<ContentCopyIcon />}
            >
                Copy League Settings and Roster
            </Button>
        </div>
    );
}
