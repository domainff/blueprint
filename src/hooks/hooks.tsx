// ONLY UPDATE THIS FILE WHEN CORRESPONDING FILE IN dynasty-ff REPO CHANGES

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Player, Roster, User } from "../sleeper-api/sleeper-api";
import playersJson from "../data/players.json";
import playerValuesJson from "../data/player_values_013125.json";
import {
    BENCH,
    FLEX,
    PPR,
    QB,
    RB,
    SUPER_FLEX,
    SUPER_FLEX_SET,
    TAXI_SLOTS,
    TE,
    TE_BONUS,
    WR,
} from "../consts/fantasy";
import {
    LEAGUE_ID,
    LEAGUE_SIZE,
    NON_SLEEPER_IDS,
    TEAM_NAME,
} from "../consts/urlParams";
import { useSearchParams } from "react-router-dom";
export interface PlayerData {
    [key: string]: Player;
}

export function usePlayerData() {
    const [playerData, setPlayerData] = useState<PlayerData>();

    const preprocess = (pd: PlayerData) => {
        for (const playerId in pd) {
            const player = pd[playerId];
            if (
                !SUPER_FLEX_SET.has(player.position) ||
                player.last_name === "Invalid" ||
                player.first_name === "Duplicate"
            ) {
                delete pd[playerId];
            }
        }
        return pd;
    };

    useEffect(() => {
        setPlayerData(preprocess(playersJson as unknown as PlayerData));
    }, []);

    return playerData;
}

export function useAllPlayers() {
    const playerData = usePlayerData();
    const [allPlayers, setAllPlayers] = useState<string[]>([]);
    const [allPlayersSorted, setAllPlayersSorted] = useState<string[]>([]);
    const { sortByAdp } = useAdpData();
    useEffect(() => {
        if (!playerData) return;
        const players: string[] = [];
        for (const playerId in playerData) {
            players.push(playerId);
        }
        setAllPlayers(players);
    }, [playerData]);

    useEffect(() => {
        if (!playerData || !allPlayers) return;
        setAllPlayersSorted(
            allPlayers
                .map((p) => playerData[p])
                .sort(sortByAdp)
                .map((p) => p.player_id)
        );
    }, [allPlayers, playerData]);

    return allPlayersSorted;
}

type adpDatum = {
    player_name: string;
    Position: string;
};

export type PlayerValue = {
    Player: string;
    Value: number;
    Position: string;
    oneQbBonus: number;
    sfBonus: number;
    teValue?: number;
};

export function useAdpData() {
    const [adpData, setAdpData] = useState<adpDatum[]>([]);

    useEffect(() => {
        setAdpData(
            (playerValuesJson as unknown as PlayerValue[]).map(
                (p: PlayerValue) => {
                    return {
                        player_name: p.Player,
                        Position: p.Position,
                    };
                }
            )
        );
    }, [playerValuesJson]);

    const getAdp = (playerName: string): number => {
        const playerNickname = checkForNickname(playerName);
        let adp = adpData.findIndex(
            (a) =>
                a.player_name.replace(/\W/g, "").toLowerCase() ===
                playerName.replace(/\W/g, "").toLowerCase()
        );
        if (adp >= 0) {
            return adp + 1;
        }
        adp = adpData.findIndex(
            (a) =>
                a.player_name.replace(/\W/g, "").toLowerCase() ===
                playerNickname.replace(/\W/g, "").toLowerCase()
        );
        if (adp >= 0) {
            return adp + 1;
        }
        return Infinity;
    };
    const getPositionalAdp = (playerName: string) => {
        const playerNickname = checkForNickname(playerName);
        const idx = getAdp(playerName) - 1;
        if (idx >= adpData.length) return Infinity;

        let adp = adpData
            .filter((player) => player.Position === adpData[idx].Position)
            .findIndex(
                (a) =>
                    a.player_name.replace(/\W/g, "").toLowerCase() ===
                    playerName.replace(/\W/g, "").toLowerCase()
            );
        if (adp >= 0) {
            return adp + 1;
        }
        adp = adpData
            .filter((player) => player.Position === adpData[idx].Position)
            .findIndex(
                (a) =>
                    a.player_name.replace(/\W/g, "").toLowerCase() ===
                    playerNickname.replace(/\W/g, "").toLowerCase()
            );
        if (adp >= 0) {
            return adp + 1;
        }
        return Infinity;
    };
    const sortByAdp = (a: Player, b: Player): number =>
        sortNamesByAdp(
            `${a.first_name} ${a.last_name}`,
            `${b.first_name} ${b.last_name}`
        );
    const sortNamesByAdp = (a: string, b: string): number =>
        getAdp(a) - getAdp(b);

    return { adpData, getAdp, sortByAdp, getPositionalAdp, sortNamesByAdp };
}

export function useNonSleeper(
    rosters?: Roster[],
    specifiedUser?: User,
    setRoster?: (roster: Roster) => void
) {
    const [leagueId] = useLeagueIdFromUrl();
    const [searchParams, setSearchParams] = useSearchParams();
    const [nonSleeperIds, setNonSleeperIds] = useState<string[]>(
        (searchParams.get(NON_SLEEPER_IDS) || "").split("-")
    );
    const [nonSleeperRosterSettings, setNonSleeperRosterSettings] = useState(
        new Map([
            [QB, +(searchParams.get(QB) || 1)],
            [RB, +(searchParams.get(RB) || 2)],
            [WR, +(searchParams.get(WR) || 3)],
            [TE, +(searchParams.get(TE) || 1)],
            [FLEX, +(searchParams.get(FLEX) || 2)],
            [SUPER_FLEX, +(searchParams.get(SUPER_FLEX) || 1)],
            [BENCH, +(searchParams.get(BENCH) || 6)],
        ])
    );
    const [ppr, setPpr] = useState(+(searchParams.get(PPR) || 1));
    const [teBonus, setTeBonus] = useState(+(searchParams.get(TE_BONUS) || 1));
    const [numRosters, setNumRosters] = useState(
        +(searchParams.get(LEAGUE_SIZE) ?? rosters?.length ?? 12)
    );
    const [taxiSlots, setTaxiSlots] = useState(
        +(searchParams.get(TAXI_SLOTS) || 0)
    );
    const [teamName, setTeamName] = useState(
        searchParams.get(TEAM_NAME) ||
            specifiedUser?.metadata?.team_name ||
            specifiedUser?.display_name ||
            ""
    );

    useEffect(() => {
        if (!leagueId) return;
        setTeamName(
            specifiedUser?.metadata?.team_name ||
                specifiedUser?.display_name ||
                ""
        );
    }, [specifiedUser, leagueId]);

    useEffect(() => {
        if (leagueId) {
            setSearchParams((searchParams) => {
                searchParams.delete(TEAM_NAME);
                return searchParams;
            });
        } else {
            setSearchParams((searchParams) => {
                searchParams.set(TEAM_NAME, teamName);
                return searchParams;
            });
        }
    }, [teamName, leagueId]);

    useEffect(() => {
        setNumRosters(
            +(searchParams.get(LEAGUE_SIZE) ?? rosters?.length ?? 12)
        );
    }, [rosters]);

    useEffect(() => {
        if (leagueId) {
            setSearchParams((searchParams) => {
                searchParams.delete(LEAGUE_SIZE);
                return searchParams;
            });
        } else {
            setSearchParams((searchParams) => {
                searchParams.set(LEAGUE_SIZE, "" + numRosters);
                return searchParams;
            });
        }
    }, [numRosters, leagueId]);

    useEffect(() => {
        if (leagueId) {
            setSearchParams((searchParams) => {
                searchParams.delete(PPR);
                searchParams.delete(TE_BONUS);
                searchParams.delete(TAXI_SLOTS);
                return searchParams;
            });
        } else {
            setSearchParams((searchParams) => {
                searchParams.set(PPR, "" + ppr);
                searchParams.set(TE_BONUS, "" + teBonus);
                searchParams.set(TAXI_SLOTS, "" + taxiSlots);
                return searchParams;
            });
        }
    }, [ppr, teBonus, taxiSlots, leagueId]);

    useEffect(() => {
        if (leagueId) {
            setSearchParams((searchParams) => {
                searchParams.delete(QB);
                searchParams.delete(RB);
                searchParams.delete(WR);
                searchParams.delete(TE);
                searchParams.delete(FLEX);
                searchParams.delete(SUPER_FLEX);
                searchParams.delete(BENCH);
                return searchParams;
            });
        } else {
            setSearchParams((searchParams) => {
                searchParams.set(QB, "" + nonSleeperRosterSettings.get(QB));
                searchParams.set(RB, "" + nonSleeperRosterSettings.get(RB));
                searchParams.set(WR, "" + nonSleeperRosterSettings.get(WR));
                searchParams.set(TE, "" + nonSleeperRosterSettings.get(TE));
                searchParams.set(FLEX, "" + nonSleeperRosterSettings.get(FLEX));
                searchParams.set(
                    SUPER_FLEX,
                    "" + nonSleeperRosterSettings.get(SUPER_FLEX)
                );
                searchParams.set(
                    BENCH,
                    "" + nonSleeperRosterSettings.get(BENCH)
                );
                return searchParams;
            });
        }
    }, [nonSleeperRosterSettings, leagueId]);

    useEffect(() => {
        if (!setRoster) return;

        setRoster({
            players: nonSleeperIds,
        } as Roster);
    }, [nonSleeperIds, setRoster]);

    useEffect(() => {
        if (leagueId) {
            setSearchParams((searchParams) => {
                searchParams.delete(NON_SLEEPER_IDS);
                return searchParams;
            });
        } else {
            setSearchParams((searchParams) => {
                searchParams.set(
                    NON_SLEEPER_IDS,
                    nonSleeperIds.filter((id) => !!id).join("-")
                );
                return searchParams;
            });
        }
    }, [nonSleeperIds, leagueId]);

    return {
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
        setSearchParams,
    };
}

const checkForNickname = (playerName: string) => {
    switch (playerName) {
        case "Tank Dell":
            return "Nathaniel Dell";
        case "Nathaniel Dell":
            return "Tank Dell";
        case "Chig Okonkwo":
            return "Chigoziem Okonkwo";
        case "Chigoziem Okonkwo":
            return "Chig Okonkwo";
        case "Hollywood Brown":
            return "Marquise Brown";
        case "Marquise Brown":
            return "Hollywood Brown";
        case "Tyrone Tracy":
            return "Tyrone Tracy Jr";
        case "Tyrone Tracy Jr":
            return "Tyrone Tracy";
        case "Kenneth Walker":
            return "Kenneth Walker III";
        case "Kenneth Walker III":
            return "Kenneth Walker";
        case "Michael Penix":
            return "Michael Penix Jr.";
        case "Michael Penix Jr.":
            return "Michael Penix";
        case "Marvin Harrison":
            return "Marvin Harrison Jr.";
        case "Marvin Harrison Jr.":
            return "Marvin Harrison";
        case "Brian Thomas":
            return "Brian Thomas Jr.";
        case "Brian Thomas Jr.":
            return "Brian Thomas";
        default:
            return playerName;
    }
};

export function useLeagueIdFromUrl(): [
    string,
    Dispatch<SetStateAction<string>>
] {
    const [searchParams, setSearchParams] = useSearchParams();
    const [leagueId, setLeagueId] = useState("");

    useEffect(() => {
        const leagueIdFromUrl = searchParams.get(LEAGUE_ID);
        if (!leagueIdFromUrl) return;

        setLeagueId(leagueIdFromUrl);
    }, [searchParams]);

    useEffect(() => {
        if (leagueId === searchParams.get(LEAGUE_ID) || !leagueId) return;

        setSearchParams((searchParams) => {
            searchParams.set(LEAGUE_ID, leagueId);
            return searchParams;
        });
    }, [leagueId, searchParams, setSearchParams]);

    return [leagueId, setLeagueId];
}
