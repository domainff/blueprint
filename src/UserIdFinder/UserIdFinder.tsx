import { Button, TextField } from "@mui/material";
import styles from "./UserIdFinder.module.css";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserIdFinder() {
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        navigator.clipboard.writeText(userId);
    }, [userId]);

    async function getUser(username: string) {
        const response = await axios.get(
            `https://api.sleeper.app/v1/user/${username}`
        );
        return response.data;
    }

    async function findUserId() {
        if (!username) return;
        const user = await getUser(username);
        const userId = user.user_id;
        setUserId(userId);
    }

    return (
        <div className={styles.container}>
            <TextField
                label="Sleeper Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                    if (
                        e.key === "Enter" &&
                        username !== ""
                    ) {
                        findUserId();
                    }
                }}
            />
            <div className={styles.buttons}>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setUserId("");
                        setUsername("");
                    }}
                    disabled={
                        userId === "" && username === ""
                    }
                >
                    Clear
                </Button>
                <Button
                    disabled={username === ""}
                    variant="outlined"
                    onClick={findUserId}
                >
                    Submit
                </Button>
            </div>
            {!!userId && (
                    <div>
                        Your user ID is{" "}
                        <span className={styles.foundTeamId}>{userId}</span>,{" "}
                        and has been copied to your clipboard.
                    </div>
            )}
        </div>
    );
}