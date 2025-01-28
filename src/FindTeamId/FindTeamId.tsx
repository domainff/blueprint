import { useState } from "react";
import styles from "./FindTeamId.module.css";
import { Button, TextField } from "@mui/material";
import axios from "axios";

type User = {
    username: string;
    user_id: string;
    display_name: string;
    avatar: string;
    metadata: {
        team_name?: string;
    };
};

export default function FindTeamId() {
    const [teamId, setTeamId] = useState(-1);
    const [teamName, setTeamName] = useState("");
    const [leagueId, setLeagueId] = useState("");

    async function getAllUsers(leagueId: string): Promise<User[]> {
        const response = await axios.get(
            `https://api.sleeper.app/v1/league/${leagueId}/users`
        );
        return response.data;
    }
    async function findTeamId() {
        const users = await getAllUsers(leagueId);
        if (users.length === 0) {
            setTeamId(-1);
            alert(`No users found for league ID '${leagueId}'`);
            return;
        }
        const usernames = users.map(getDisplayName);
        const newTeamId = usernames.findIndex(
            (u) =>
                u
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]/g, "") ===
                teamName
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]/g, "")
        );
        if (newTeamId === -1) {
            setTeamId(-1);
            alert(
                `Team not found for '${teamName}'.\nAllowed names: ${usernames.reduce(
                    (prev, curr, idx) => `${prev}\n${idx}: '${curr}'`,
                    ""
                )}`
            );
            return;
        }
        setTeamId(newTeamId);
        navigator.clipboard.writeText(newTeamId.toString());
    }

    function getDisplayName(user?: User) {
        return `${user?.metadata?.team_name || user?.display_name}`;
    }

    return (
        <div className={styles.container}>
            <TextField
                label="League ID"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
            />
            <TextField
                label="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => {
                    if (
                        e.key === "Enter" &&
                        teamName !== "" &&
                        leagueId !== ""
                    ) {
                        findTeamId();
                    }
                }}
            />
            <div className={styles.buttons}>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setTeamId(-1);
                        setTeamName("");
                        setLeagueId("");
                    }}
                    disabled={
                        teamId === -1 && teamName === "" && leagueId === ""
                    }
                >
                    Clear
                </Button>
                <Button
                    disabled={teamName === "" || leagueId === ""}
                    variant="outlined"
                    onClick={findTeamId}
                >
                    Submit
                </Button>
            </div>
            {teamId > -1 && (
                <div>
                    <div>
                        Your team ID is{" "}
                        <span className={styles.foundTeamId}>{teamId}</span>,{" "}
                        and has been copied to your clipboard.
                    </div>
                </div>
            )}
        </div>
    );
}
