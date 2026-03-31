// ONLY UPDATE THIS FILE WHEN CORRESPONDING FILE IN dynasty-ff REPO CHANGES

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { Player, Roster, User } from "../sleeper-api/sleeper-api";
import playersJson from "../data/players.json";
import playerValuesJson from "../data/player_values_013125.json";
import sleeperIdMapJson from '../data/sleeper_id_to_api.json';
import {
    BENCH,
    FLEX,
    QB,
    RB,
    SUPER_FLEX,
    SUPER_FLEX_SET,
    TE,
    WR,
} from "../consts/fantasy";
import {
    LEAGUE_ID,
} from "../consts/urlParams";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BuySellPlayerProps, verdictToEnum } from "../NewInfinite/NewInfinite";

const AZURE_API_URL = 'https://domainffapi.azurewebsites.net/api/';

export type LeagueSettings = {
    numberOfTeams: number;
    isSuperFlex: boolean;
    pointsPerReception: number;
    tightEndPremium: number;
    taxiSpots: number;
    quarterbackSlots: number;
    runningBackSlots: number;
    wideReceiverSlots: number;
    tightEndSlots: number;
    flexSlots: number;
    benchSlots: number;
};

export type RosterPlayer = {
    id: number;
    playerId: number;
    playerSleeperBotId: string;
    playerName: string;
    position: string;
    rosterPosition: string;
    isStarter: boolean;
    assetCategory: string;
    sortOrder: number;
    insulationScore: number;
    productionScore: number;
    situationalScore: number;
    compositePositionRank: string;
    teamAbbreviation: string;
    valueChangeIndicator: number;
};

type Blueprint = {
    id: number;
    blueprintType: string;
    platform: string;
    leagueId: string;
    rosterId: number;
    ownerUserId: string;
    teamName: string;
    season: number;
    isRedraft: boolean;
    leagueSettings: LeagueSettings;
    valueArchetype: string;
    rosterArchetype: string;
    productionSharePercentage: number;
    productionShareLeagueRank: number;
    valueSharePercentage: number;
    valueShareLeagueRank: number;
    rosterPlayers: Array<RosterPlayer>;
    outlooks: Array<{
        id: number;
        yearNumber: number;
        outlook: string;
    }>;
    positionalGrades: Array<{
        id: number;
        position: string;
        grade: number;
        valueSharePercentage: number;
        insulationScoreGrade: number;
        productionScoreGrade: number;
        situationalScoreGrade: number;
    }>;
    draftPicks: Array<{
        id: number;
        season: number;
        round: number;
        pickNumber: number;
    }>;
    tradeStrategies: Array<TradeStrategy>;
    topPriorities: Array<{
        id: number;
        sortOrder: number;
        text: string;
        iconKey: string;
    }>;
    idealTradePartners: Array<{
        id: number;
        teamName: string;
        partnerRosterId: number;
        sortOrder: number;
    }>;
    infiniteFeatures: InfiniteFeatures;
    premiumFeatures: PremiumFeatures;
    createdUtc: string;
    rookieDraftFeatures: RookieDraftFeatures | null;
    overallGrade: number;
};

type PremiumFeatures = {
    id: number;
    averageStarterAgeQb: number;
    averageStarterAgeRb: number;
    averageStarterAgeWr: number;
    averageStarterAgeTe: number;
    blueprintPercentile: number;
    archetypeBuildPercentage: number;
    valueProportionQb: number;
    valueProportionRb: number;
    valueProportionWr: number;
    valueProportionTe: number;
    valueProportionDc: number;
    draftStrategies: Array<{
        id: number;
        season: string;
        firstRoundPickCount: number;
        secondRoundPickCount: number;
        strategyType: string;
        recommendationText: string;
        sortOrder: number;
    }>;
    rosterMakeup: Array<{
        id: number;
        category: string;
        percentage: number;
        sortOrder: number;
    }>;
    powerRankings: Array<{
        teamName: string;
        rank: number;
        isCurrentTeam: boolean;
        rosterId: number;
    }>;
};

export type TradeStrategy = {
    moveType: number | string;
    sortOrder: number;
    assetsOut: Array<{
        draftPickNumber: number | null;
        draftPickRound: number | null;
        draftPickSeason: number | null;
        isDraftPick: boolean;
        playerId: number | null;
        sortOrder: number;
    }>;
    targetGroups: Array<{
        sortOrder: number;
        assetsIn: Array<{
            draftPickNumber: number | null;
            draftPickRound: number | null;
            draftPickSeason: number | null;
            isDraftPick: boolean;
            playerId: number | null;
            sortOrder: number;
        }>;
    }>;
    priorityDescription?: string;
};

type InfiniteFeatures = {
    id: number;
    month: number;
    year: number;
    generatedDate: string;
    rosterValueTier: string;
    recommendedTradeActivity: string;
    buysPercentage: number;
    sellsPercentage: number;
    holdsPercentage: number;
    risers: Array<{
        id: number;
        playerId: number;
        playerSleeperBotId: number;
        playerName: string;
        position: string;
        teamAbbreviation: string;
        riseMagnitude: number;
    }>;
    fallers: Array<{
        id: number;
        playerId: number;
        playerSleeperBotId: number;
        playerName: string;
        position: string;
        teamAbbreviation: string;
        fallMagnitude: number;
    }>;
    buySellRecommendations: Array<{
        id: number;
        playerId: number;
        playerSleeperBotId: number;
        playerName: string;
        position: string;
        teamAbbreviation: string;
        recommendationType: string;
    }>;
    positionalAgeData: Array<{
        id: number;
        position: string;
        averageAge: number;
        month: number;
        year: number;
    }>;
};

export function useBlueprint(blueprintId: string) {
    const [blueprint, setBlueprint] = useState<Blueprint>();
    const authToken = localStorage.getItem('authToken');
    const {data} = useQuery({
        queryKey: ['blueprint', blueprintId],
        queryFn: async () => {
            const options = {
                method: 'GET',
                url: `${AZURE_API_URL}Blueprints/${blueprintId}`,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            };
            const res = await axios.request(options);
            return res.data as Blueprint;
        },
        retry: false,
        enabled: !!blueprintId,
    });
    useEffect(() => {
        if (!data) return;
        setBlueprint(data);
    }, [data]);

    return {blueprint, setBlueprint};
}

export function useNewInfiniteBuysSells(blueprint: Blueprint | undefined) {
    const [buys, setBuys] = useState<BuySellPlayerProps[]>([]);
    const [sells, setSells] = useState<BuySellPlayerProps[]>([]);

    useEffect(() => {
        if (!blueprint) return;
        const buySellRecommendations =
            blueprint.infiniteFeatures.buySellRecommendations;
        const buys = buySellRecommendations
            .filter(rec => rec.recommendationType.includes('Buy'))
            .map(rec => ({
                playerRowProps: {
                    position: rec.position,
                    playerName: rec.playerName,
                    playerTeam: rec.teamAbbreviation,
                    sleeperId: '' + rec.playerSleeperBotId,
                },
                buySell: verdictToEnum(rec.recommendationType),
            }));
        const sells = buySellRecommendations
            .filter(rec => rec.recommendationType.includes('Sell'))
            .map(rec => ({
                playerRowProps: {
                    position: rec.position,
                    playerName: rec.playerName,
                    playerTeam: rec.teamAbbreviation,
                    sleeperId: '' + rec.playerSleeperBotId,
                },
                buySell: verdictToEnum(rec.recommendationType),
            }));
        setBuys(buys);
        setSells(sells);
    }, [blueprint]);

    return {
        buys,
        sells,
    };
}

export function useParamFromUrl(
    param: string,
    defaultValue?: string
): [string, Dispatch<SetStateAction<string>>] {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlValue = searchParams.get(param) ?? defaultValue ?? '';

    const [value, setValue] = useState(urlValue);

    // URL → state
    useEffect(() => {
        if (value !== urlValue) {
            setValue(urlValue);
        }
    }, [urlValue]);

    // state → URL
    useEffect(() => {
        if (value === urlValue || value === '') return;

        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set(param, value);
            return next;
        });
    }, [value]);

    return [value, setValue];
}

export type BlueprintMetadata = {
    blueprintId: string;
    blueprintType: string;
    platform: string;
    ownerUserId: string;
    rosterId: number;
    teamName: string;
    createdUtc: string;
    deliveryStatus: string;
};

export function useBlueprintsForDomainUser() {
    const [blueprints, setBlueprints] = useState<Array<BlueprintMetadata>>([]);
    const authToken = localStorage.getItem('flockAuthToken');
    const {data, error, isLoading} = useQuery({
        queryKey: ['blueprints'],
        queryFn: async () => {
            const options = {
                method: 'GET',
                url: `${AZURE_API_URL}Blueprints/mine`,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            };
            const res = await axios.request(options);
            return res.data as Array<BlueprintMetadata>;
        },
        retry: false,
        enabled: !!authToken,
    });
    useEffect(() => {
        if (!data) return;
        setBlueprints(data);
    }, [data]);
    return {blueprints, error, isLoading};
}

export function useTitle(title: string) {
    useEffect(() => {
        const oldTitle = document.title;
        document.title = title;
        return () => {
            document.title = oldTitle;
        };
    }, [title]);
}


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
    const [nonSleeperIds, setNonSleeperIds] = useState<string[]>([]);
    const [draftPicks, setDraftPicks] = useState<{season: number, round: number, slot: number}[]>([]);
    const [platform, setPlatform] = useState("");
    const [nonSleeperRosterSettings, setNonSleeperRosterSettings] = useState(
        new Map([
            [QB, +(1)],
            [RB, +(2)],
            [WR, +(3)],
            [TE, +(1)],
            [FLEX, +(2)],
            [SUPER_FLEX, +(1)],
            [BENCH, +(6)],
        ])
    );
    const [ppr, setPpr] = useState(1);
    const [teBonus, setTeBonus] = useState(1);
    const [numRosters, setNumRosters] = useState(
        12
    );
    const [taxiSlots, setTaxiSlots] = useState(
        0
    );
    const [teamName, setTeamName] = useState("");

    useEffect(() => {
        if (!leagueId) return;
        setTeamName(
            specifiedUser?.metadata?.team_name ||
                specifiedUser?.display_name ||
                ""
        );
    }, [specifiedUser, leagueId]);

    // useEffect(() => {
    //     if (leagueId) {
    //         setSearchParams((searchParams) => {
    //             searchParams.delete(TEAM_NAME);
    //             return searchParams;
    //         });
    //     } else {
    //         setSearchParams((searchParams) => {
    //             searchParams.set(TEAM_NAME, teamName);
    //             return searchParams;
    //         });
    //     }
    // }, [teamName, leagueId]);

    useEffect(() => {
        setNumRosters(
            +(rosters?.length ?? 12)
        );
    }, [rosters]);

    // useEffect(() => {
    //     if (leagueId) {
    //         setSearchParams((searchParams) => {
    //             searchParams.delete(LEAGUE_SIZE);
    //             return searchParams;
    //         });
    //     } else {
    //         setSearchParams((searchParams) => {
    //             searchParams.set(LEAGUE_SIZE, "" + numRosters);
    //             return searchParams;
    //         });
    //     }
    // }, [numRosters, leagueId]);

    // useEffect(() => {
    //     if (leagueId) {
    //         setSearchParams((searchParams) => {
    //             searchParams.delete(PPR);
    //             searchParams.delete(TE_BONUS);
    //             searchParams.delete(TAXI_SLOTS);
    //             return searchParams;
    //         });
    //     } else {
    //         setSearchParams((searchParams) => {
    //             searchParams.set(PPR, "" + ppr);
    //             searchParams.set(TE_BONUS, "" + teBonus);
    //             searchParams.set(TAXI_SLOTS, "" + taxiSlots);
    //             return searchParams;
    //         });
    //     }
    // }, [ppr, teBonus, taxiSlots, leagueId]);

    // useEffect(() => {
    //     if (leagueId) {
    //         setSearchParams((searchParams) => {
    //             searchParams.delete(QB);
    //             searchParams.delete(RB);
    //             searchParams.delete(WR);
    //             searchParams.delete(TE);
    //             searchParams.delete(FLEX);
    //             searchParams.delete(SUPER_FLEX);
    //             searchParams.delete(BENCH);
    //             return searchParams;
    //         });
    //     } else {
    //         setSearchParams((searchParams) => {
    //             searchParams.set(QB, "" + nonSleeperRosterSettings.get(QB));
    //             searchParams.set(RB, "" + nonSleeperRosterSettings.get(RB));
    //             searchParams.set(WR, "" + nonSleeperRosterSettings.get(WR));
    //             searchParams.set(TE, "" + nonSleeperRosterSettings.get(TE));
    //             searchParams.set(FLEX, "" + nonSleeperRosterSettings.get(FLEX));
    //             searchParams.set(
    //                 SUPER_FLEX,
    //                 "" + nonSleeperRosterSettings.get(SUPER_FLEX)
    //             );
    //             searchParams.set(
    //                 BENCH,
    //                 "" + nonSleeperRosterSettings.get(BENCH)
    //             );
    //             return searchParams;
    //         });
    //     }
    // }, [nonSleeperRosterSettings, leagueId]);

    useEffect(() => {
        if (!setRoster) return;

        setRoster({
            players: nonSleeperIds,
        } as Roster);
    }, [nonSleeperIds, setRoster]);

    // useEffect(() => {
    //     if (leagueId) {
    //         setSearchParams((searchParams) => {
    //             searchParams.delete(NON_SLEEPER_IDS);
    //             return searchParams;
    //         });
    //     } else {
    //         setSearchParams((searchParams) => {
    //             searchParams.set(
    //                 NON_SLEEPER_IDS,
    //                 nonSleeperIds.filter((id) => !!id).join("-")
    //             );
    //             return searchParams;
    //         });
    //     }
    // }, [nonSleeperIds, leagueId]);

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
        draftPicks,
        setDraftPicks,
        platform,
        setPlatform,
        // setSearchParams,
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

export type RookieDraftFeatures = {
    id: number;
    strategyName: string;
    strategyStatement: string;
    pickProfiles: Array<PickProfile>;
};

export type PickProfile = {
    id: number;
    round: number;
    pickNumber: number;
    overallPick: number;
    sortOrder: number;
    tier: number;
    bakeryZScore: number | null;
    projectedPlayerCategory: string;
    historicalRank: number;
    marketValue: string;
    domainVerdict: string;
    autoAcceptPlayerName: string;
    autoRejectPlayerName: string;
    autoAcceptPlayerSleeperId: number;
    autoRejectPlayerSleeperId: number;
    targets: Array<{
        id: number;
        playerName: string;
        position: string;
        sortOrder: number;
        playerId: number | null;
    }>;
    cliffMap: Array<{
        id: number;
        round: number;
        pickNumber: number;
        overallPick: number;
        tier: number;
        playerName: string;
        position: string;
    }>;
};

// Maps from sleeper ID to API ID
export interface SleeperIdMap {
    [key: string]: number;
}
export function useSleeperIdMap() {
    const [sleeperIdMap] = useState<SleeperIdMap>(sleeperIdMapJson);

    const getApiIdFromSleeperId = useCallback(
        (sleeperId: string) => {
            return sleeperIdMap[sleeperId];
        },
        [sleeperIdMap]
    );

    const getSleeperIdFromApiId = useCallback(
        (apiId: number) => {
            for (const sleeperId in sleeperIdMap) {
                if (sleeperIdMap[sleeperId] === apiId) {
                    return sleeperId;
                }
            }
            return null;
        },
        [sleeperIdMap]
    );

    return {sleeperIdMap, getApiIdFromSleeperId, getSleeperIdFromApiId};
}

export type DomainTrueRank = {
    playerId: number;
    playerSleeperId: number;
    playerName: string;
    nflPosition: string;
    teamAbbreviation: string;
    insulationScore: number;
    productionScore: number;
    situationalScore: number;
    dynastyAssetCategory: string;
    compositePosRank: string;
};

export type PowerRank = {
    teamId?: number;
    teamName: string;
    teamTotalDomainValue?: number;
    overallRank: number;
};

export type ThreeFactorGrades = {
    qbInsulationScoreGrade: number;
    rbInsulationScoreGrade: number;
    wrInsulationScoreGrade: number;
    teInsulationScoreGrade: number;
    qbProductionScoreGrade: number;
    rbProductionScoreGrade: number;
    wrProductionScoreGrade: number;
    teProductionScoreGrade: number;
    qbSituationalScoreGrade: number;
    rbSituationalScoreGrade: number;
    wrSituationalScoreGrade: number;
    teSituationalScoreGrade: number;
};