import {useCallback, useEffect, useMemo, useState} from 'react';
import {useQueries} from '@tanstack/react-query';
import {getLeague} from '../sleeper-api/sleeper-api';
import type {BlueprintMetadata} from '../hooks/hooks';

// ---- "New" blueprints -------------------------------------------------------
// The API has no per-customer "seen" flag yet, so the browser remembers what the
// customer has opened. A blueprint is NEW while it is recent and has not been
// previewed on this device. When the API grows a seen flag, swap this for it.

const SEEN_KEY = 'bp:seenBlueprintIds';
const NEW_WINDOW_DAYS = 21;

function readSeen(): Set<string> {
    try {
        const raw = localStorage.getItem(SEEN_KEY);
        return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
        return new Set();
    }
}

/** createdUtc is stored without a zone marker; treat it as UTC like isInThePast does. */
export const createdDate = (bp: Pick<BlueprintMetadata, 'createdUtc'>) =>
    new Date(bp.createdUtc.endsWith('Z') ? bp.createdUtc : bp.createdUtc + 'Z');

export function useNewBlueprints(blueprints: BlueprintMetadata[]) {
    const [seen, setSeen] = useState<Set<string>>(() => readSeen());

    const markSeen = useCallback((blueprintId: string) => {
        setSeen(prev => {
            if (prev.has(blueprintId)) return prev;
            const next = new Set(prev);
            next.add(blueprintId);
            try {
                localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(next)));
            } catch {
                /* private mode: just don't remember */
            }
            return next;
        });
    }, []);

    const newIds = useMemo(() => {
        const cutoff = Date.now() - NEW_WINDOW_DAYS * 24 * 3600 * 1000;
        return new Set(
            blueprints
                .filter(
                    bp =>
                        bp.deliveryStatus === 'Published' &&
                        !seen.has('' + bp.blueprintId) &&
                        createdDate(bp).getTime() >= cutoff
                )
                .map(bp => '' + bp.blueprintId)
        );
    }, [blueprints, seen]);

    return {newIds, markSeen};
}

// ---- League names -----------------------------------------------------------
// The blueprint list carries only the Sleeper league id. The league's name and
// format come from Sleeper's public API, one call per league, cached in the
// browser so a return visit paints instantly.

const LEAGUE_KEY = 'bp:leagueNames';

export type LeagueInfo = {name: string; teams: number | null; superflex: boolean};

function readLeagueCache(): Record<string, LeagueInfo> {
    try {
        return JSON.parse(localStorage.getItem(LEAGUE_KEY) ?? '{}') as Record<string, LeagueInfo>;
    } catch {
        return {};
    }
}

/** DEV-ONLY: names for the mock leagues (`?mock=1`), so the demo reads like the real thing. */
export const MOCK_LEAGUE_NAMES: Record<string, LeagueInfo> = {
    '1124000000000000111': {name: 'Dynasty Degens', teams: 12, superflex: false},
    '1124000000000000222': {name: 'Sunday Sickos', teams: 10, superflex: true},
    '1124000000000000333': {name: 'Big Ten Dynasty', teams: 12, superflex: false},
    '1124000000000000444': {name: 'Perennial League', teams: 12, superflex: true},
    '1124000000000008021': {name: 'Flock Friends & Family', teams: 12, superflex: false},
    '1124000000000003495': {name: 'Office League', teams: 10, superflex: false},
};

export function useLeagueNames(leagueIds: string[], enabled: boolean, mock = false) {
    const [cache, setCache] = useState<Record<string, LeagueInfo>>(() => (mock ? MOCK_LEAGUE_NAMES : readLeagueCache()));
    const missing = useMemo(() => leagueIds.filter(id => id && !cache[id]), [leagueIds, cache]);

    const results = useQueries({
        queries: missing.map(id => ({
            queryKey: ['sleeperLeague', id],
            queryFn: () => getLeague(id),
            enabled,
            staleTime: Infinity,
            retry: false,
        })),
    });

    useEffect(() => {
        const found: Record<string, LeagueInfo> = {};
        results.forEach((r, i) => {
            if (r.data && !cache[missing[i]]) {
                const league = r.data;
                const positions = league.roster_positions ?? [];
                found[missing[i]] = {
                    name: league.name,
                    teams: league.settings?.num_teams ?? null,
                    superflex: positions.includes('SUPER_FLEX'),
                };
            }
        });
        if (Object.keys(found).length === 0) return;
        setCache(prev => {
            const next = {...prev, ...found};
            try {
                localStorage.setItem(LEAGUE_KEY, JSON.stringify(next));
            } catch {
                /* ignore */
            }
            return next;
        });
    }, [results, missing, cache]);

    return cache;
}

/** "Dynasty Degens · 12 team SF", or a short fallback from the league id while the name loads. */
export function leagueLabel(leagueId: string, info?: LeagueInfo): string {
    if (!info) return `League …${leagueId.slice(-4)}`;
    const bits = [info.name];
    if (info.teams) bits.push(`${info.teams} team${info.superflex ? ' SF' : ''}`);
    return bits.join(' · ');
}
