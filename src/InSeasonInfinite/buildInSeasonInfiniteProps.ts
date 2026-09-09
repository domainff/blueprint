// VENDORED from the DomainFantasyFootball repo
// (client/src/pages/blueprint-module/preview/buildInSeasonInfinitePreviewProps.ts).
// Differences from the source: types come from ../hooks/hooks instead of types/api,
// and the module page's unsaved-outlook override (PreviewLiveState) is gone — the
// customer site only ever renders the stored blueprint. Keep the mapping logic
// identical and re-copy when the source changes.
import type {
  Blueprint,
  InSeasonInfiniteFeatures,
  InSeasonInfiniteLineupSlot,
  InSeasonInfiniteOddsPoint,
  InSeasonInfinitePowerRank,
} from "../hooks/hooks";
import type {
  EosValue,
  InSeasonInfinitePreviewProps,
  Light,
  LineupRow,
  LineupSlot,
  NflPosition,
  OddsPanel,
  Outlook,
  PowerRankRow,
  Tone,
  Trend,
  Verdict,
} from "./InSeasonInfinite";

// Maps the InSeasonInfiniteFeatures DTO onto the blueprint's props. Every value the
// backend can leave null (odds, ROS projections, verdicts, lights) maps to null and
// the blueprint renders "—" / skips the element. Tone thresholds are UI-only until
// product defines them. The championship dial is the one exception to "percent drives
// everything": its needle slot and colour follow the team's league rank (see below).

// The stored enum keeps "Reload" (shared with the dynasty two-year outlook); in-season it reads "Wait & See".
const OUTLOOK: Record<string, Outlook> = { Contend: "Contending", Reload: "Wait & See", Rebuild: "Rebuilding" };
const SLOT: Record<string, LineupSlot> = {
  QB: "QB", RB: "RB", WR: "WR", TE: "TE",
  FLEX: "FL", REC_FLEX: "FL", WRRB_FLEX: "FL", SUPER_FLEX: "SF",
};
const VERDICT: Record<string, Verdict> = {
  HardBuy: "Hard-Buy", Buy: "Buy", SoftBuy: "Soft-Buy", Hold: "Hold", SoftSell: "Soft-Sell", Sell: "Sell", HardSell: "Hard-Sell",
};
const LIGHT: Record<string, Light> = { Green: "green", Yellow: "yellow", Red: "red" };
const TREND: Record<string, Trend | null> = { Up: "up", Down: "down", Flat: null };
const EOS: Record<string, EosValue> = { Riser: "Riser", Neutral: "Neutral", Faller: "Faller" };
const NFL_POSITIONS: NflPosition[] = ["QB", "RB", "WR", "TE"];

function nflPosition(position: string, slot: LineupSlot): NflPosition {
  if ((NFL_POSITIONS as string[]).includes(position)) return position as NflPosition;
  // A lineup slot is one of the four positions unless it's a flex.
  return slot === "FL" || slot === "SF" ? "WR" : slot;
}

/** ≥60 good, ≥40 mid, else bad. Null (no odds yet) reads as neutral. */
export function percentTone(pct: number | null): Tone {
  if (pct == null) return "mid";
  return pct >= 60 ? "good" : pct >= 40 ? "mid" : "bad";
}

/** Top third of the league good, middle third mid, bottom third bad. */
export function rankTone(rank: number, leagueSize: number): Tone {
  if (leagueSize <= 0) return "mid";
  const third = leagueSize / 3;
  return rank <= third ? "good" : rank <= 2 * third ? "mid" : "bad";
}

/** Competition rank (ties share the better rank) of the current team's championship odds
 *  among the league's power ranks, or null when there's no current-team row or it has no odds. */
export function championshipRank(powerRanks: InSeasonInfinitePowerRank[]): number | null {
  const mine = powerRanks.find((r) => r.isCurrentTeam)?.championshipOddsPct;
  if (mine == null) return null;
  return 1 + powerRanks.filter((r) => r.championshipOddsPct != null && r.championshipOddsPct > mine).length;
}

/** Needle angle for slot `rank` of `leagueSize` equal bands across the LOW→HIGH arc: rank 1 sits
 *  centred in the rightmost (green) band, rank `leagueSize` centred in the leftmost (red) one. */
export function rankNeedleAngle(rank: number, leagueSize: number): number {
  if (leagueSize <= 0) return -90;
  const slot = Math.min(Math.max(rank, 1), leagueSize);
  return -90 + ((leagueSize - slot + 0.5) / leagueSize) * 180;
}

const round = (v: number | null): number | null => (v == null ? null : Math.round(v));

function lineupRow(s: InSeasonInfiniteLineupSlot): LineupRow {
  const slot = SLOT[s.slot] ?? "FL";
  const position = nflPosition(s.position, slot);
  return {
    slot,
    position,
    playerName: s.playerName,
    playerSleeperBotId: s.playerSleeperBotId,
    teamAbbreviation: s.teamAbbreviation,
    marketDelta: s.marketDelta,
    rosRank: s.rosPositionRank != null ? `${position}${s.rosPositionRank}` : null,
    rosTrend: s.rosTrend ? TREND[s.rosTrend] ?? null : null,
    eosValue: s.eosValue ? EOS[s.eosValue] ?? null : null,
    verdict: s.verdict ? VERDICT[s.verdict] ?? null : null,
    matchup: s.matchupLight ? LIGHT[s.matchupLight] ?? null : null,
    offense: s.offenseLight ? LIGHT[s.offenseLight] ?? null : null,
    vegas: s.vegasLight ? LIGHT[s.vegasLight] ?? null : null,
  };
}

/** The "WK 7: 52% → WK 8: 75%" strip: the two most recent points before the current week
 *  (or the last prior point → the current one when only one prior point exists). */
function history(points: InSeasonInfiniteOddsPoint[], currentWeek: number, pick: (p: InSeasonInfiniteOddsPoint) => number) {
  const sorted = [...points].sort((a, b) => a.weekNumber - b.weekNumber);
  const prior = sorted.filter((p) => p.weekNumber < currentWeek);
  const current = sorted.find((p) => p.weekNumber === currentWeek);
  let from: InSeasonInfiniteOddsPoint | undefined;
  let to: InSeasonInfiniteOddsPoint | undefined;
  if (prior.length >= 2) [from, to] = prior.slice(-2);
  else if (prior.length === 1 && current) [from, to] = [prior[0], current];
  return {
    fromWeek: from?.weekNumber ?? null,
    fromPct: from ? Math.round(pick(from)) : null,
    toWeek: to?.weekNumber ?? null,
    toPct: to ? Math.round(pick(to)) : null,
  };
}

function oddsPanel(
  f: InSeasonInfiniteFeatures,
  percent: number | null,
  winPct: number | null,
  losePct: number | null,
  pick: (p: InSeasonInfiniteOddsPoint) => number,
): OddsPanel {
  const h = history(f.oddsHistory, f.weekNumber, pick);
  return {
    percent: round(percent),
    tone: percentTone(percent),
    ...h,
    fromTone: percentTone(h.fromPct),
    week: f.weekNumber,
    winPct: round(winPct),
    losePct: round(losePct),
  };
}

function powerRankRow(r: InSeasonInfinitePowerRank, leagueSize: number): PowerRankRow {
  return {
    rank: r.rank,
    teamName: r.teamName,
    totalPf: Math.round(r.totalPointsFor),
    totalPfTone: rankTone(r.rank, leagueSize),
    rosProjection: round(r.rosProjection),
    rosRank: r.rosProjectionRank,
    rosDelta: round(r.rosProjectionDelta),
    playoffsPct: round(r.playoffOddsPct),
    playoffsDelta: round(r.playoffOddsDelta),
    championshipPct: round(r.championshipOddsPct),
    championshipDelta: round(r.championshipOddsDelta),
    isUserTeam: r.isCurrentTeam,
  };
}

export function buildInSeasonInfiniteProps(bp: Blueprint): InSeasonInfinitePreviewProps {
  const f = bp.inSeasonInfiniteFeatures;
  if (!f) {
    // Only reachable if the dashboard's dispatch is bypassed; render an empty canvas.
    return {
      teamName: bp.teamName,
      outlook: "Contending",
      season: bp.season,
      week: 0,
      wins: 0,
      losses: 0,
      lineup: [],
      playoffs: { percent: null, tone: "mid", fromWeek: null, fromPct: null, fromTone: "mid", toWeek: null, toPct: null, week: 0, winPct: null, losePct: null },
      championship: { percent: null, tone: "mid", fromWeek: null, fromPct: null, fromTone: "mid", toWeek: null, toPct: null, week: 0, winPct: null, losePct: null },
      totalPf: 0,
      leagueRank: 0,
      rosProjection: null,
      rosProjectionRank: null,
      powerRanks: [],
    };
  }

  const outlook = OUTLOOK[f.outlook] ?? "Contending";
  const leagueSize = f.powerRanks.length || bp.leagueSettings.numberOfTeams;

  // Championship odds are positioned by league rank, not raw percent: 22% reads as mediocre on
  // a 0–100 arc but is excellent when it's 2nd of 12 (Cole, Sep 9 2026). The big number stays
  // the real percent; the needle's slot and the number's colour follow the rank. Playoff odds
  // stay percent-based, and so does the history strip (it only stores percents per week).
  const championship = oddsPanel(f, f.championshipOddsPct, f.championshipOddsIfWinPct, f.championshipOddsIfLosePct, (p) => p.championshipOddsPct);
  const champRank = championship.percent == null ? null : championshipRank(f.powerRanks);
  if (champRank != null) {
    championship.needleAngleDeg = rankNeedleAngle(champRank, leagueSize);
    championship.tone = rankTone(champRank, leagueSize);
  }

  return {
    teamName: bp.teamName,
    outlook,
    season: f.season,
    week: f.weekNumber,
    wins: f.wins,
    losses: f.losses,
    lineup: [...f.lineupSlots].sort((a, b) => a.sortOrder - b.sortOrder).map(lineupRow),
    playoffs: oddsPanel(f, f.playoffOddsPct, f.playoffOddsIfWinPct, f.playoffOddsIfLosePct, (p) => p.playoffOddsPct),
    championship,
    totalPf: Math.round(f.totalPointsFor),
    leagueRank: f.pointsForLeagueRank,
    rosProjection: round(f.rosProjection),
    rosProjectionRank: f.rosProjectionLeagueRank,
    powerRanks: [...f.powerRanks].sort((a, b) => a.rank - b.rank).map((r) => powerRankRow(r, leagueSize)),
    // chart: intentionally unset — the final design fills the verdict panel with copy and has no chart slot.
  };
}
