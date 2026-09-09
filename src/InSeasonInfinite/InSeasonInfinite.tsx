// Customer-facing In-Season Infinite blueprint. The canvas is 1:1 with the Figma
// frame (6134 x 3795, file BP 2026 → "2026 in-season infinite"), so every number
// below is a Figma frame coordinate. Static chrome is baked into the background
// PNG; the DYNAMIC group's layers are reproduced here.
//
// VENDORED from the DomainFantasyFootball repo
// (client/src/pages/blueprint-module/preview/InSeasonInfinitePreview.tsx). The
// Domain module is the source of truth for the visual: only the imports below
// and `sleeperHeadshot` differ, so re-copy this file when that one changes rather
// than editing coordinates here. The `{blueprintId}` wrapper the dashboard mounts
// lives in WrappedInSeasonInfinite.tsx.
import type { CSSProperties, ReactNode } from "react";
import s from "./InSeasonInfinite.module.css";
import inSeasonInfiniteBkg from "../assets/inSeasonInfinite/inSeasonInfiniteBkg.png";
import { nflLogo, nflSilhouette, teamLogos } from "../consts/images";
import * as A from "./inSeasonInfiniteAssets";

// Same as the Domain module's previewShared.sleeperHeadshot: a player with no
// Sleeper id gets the NFL shield, a Sleeper id that fails to load gets Sleeper's
// default silhouette (see HEADSHOT_FALLBACK / onError below).
function sleeperHeadshot(sleeperBotId: number | null): string {
  if (!sleeperBotId) return nflSilhouette;
  return `https://sleepercdn.com/content/nfl/players/${sleeperBotId}.jpg`;
}

// ─── Props ──────────────────────────────────────────────────────────────────

export type Outlook = "Contending" | "Wait & See" | "Rebuilding";
export type LineupSlot = "QB" | "RB" | "WR" | "TE" | "FL" | "SF";
export type NflPosition = "QB" | "RB" | "WR" | "TE";
export type EosValue = "Riser" | "Neutral" | "Faller";
export type Verdict = "Buy" | "Soft-Buy" | "Hard-Buy" | "Hold" | "Sell" | "Soft-Sell" | "Hard-Sell";
export type Light = "green" | "yellow" | "red";
export type Tone = "good" | "mid" | "bad";
export type Trend = "up" | "down";

export interface LineupRow {
  slot: LineupSlot;
  /** NFL position; drives the ROS rank color. */
  position: NflPosition;
  playerName: string;
  playerSleeperBotId: number | null;
  teamAbbreviation: string | null;
  // Null = not available yet (missing dataset / calculator not wired) → rendered as "—".
  /** +3 / 0 / -1 style market movement. */
  marketDelta: number | null;
  /** e.g. "QB2" */
  rosRank: string | null;
  rosTrend: Trend | null;
  /** Null omits the word (and its arrow) entirely. */
  eosValue: EosValue | null;
  verdict: Verdict | null;
  matchup: Light | null;
  offense: Light | null;
  vegas: Light | null;
}

export interface OddsPanel {
  percent: number | null;
  tone: Tone;
  fromWeek: number | null;
  fromPct: number | null;
  fromTone: Tone;
  toWeek: number | null;
  toPct: number | null;
  week: number;
  winPct: number | null;
  losePct: number | null;
  /** Overrides the percent-derived needle angle (-90 = LOW, +90 = HIGH). */
  needleAngleDeg?: number;
}

export interface PowerRankRow {
  rank: number;
  teamName: string;
  totalPf: number;
  totalPfTone: Tone;
  rosProjection: number | null;
  rosRank: number | null;
  rosDelta: number | null;
  playoffsPct: number | null;
  playoffsDelta: number | null;
  championshipPct: number | null;
  championshipDelta: number | null;
  isUserTeam?: boolean;
}

export interface ChartSeries {
  position: NflPosition;
  values: (number | null)[];
}

export interface ChartData {
  xLabels: string[];
  yMin: number;
  yMax: number;
  yStep: number;
  series: ChartSeries[];
}

export interface InSeasonInfinitePreviewProps {
  teamName: string;
  outlook: Outlook;
  season: number;
  week: number;
  wins: number;
  losses: number;
  lineup: LineupRow[];
  playoffs: OddsPanel;
  championship: OddsPanel;
  totalPf: number;
  leagueRank: number;
  rosProjection: number | null;
  rosProjectionRank: number | null;
  powerRanks: PowerRankRow[];
  /**
   * Legacy position-value chart. The final design fills the verdict panel with copy and no
   * longer reserves a slot for it, so leave this unset: drawing it would overlay the paragraphs.
   */
  chart?: ChartData;
}

// ─── Design tokens ──────────────────────────────────────────────────────────

const F = {
  prohibition: "'Prohibition', 'Impact', 'Arial Narrow', sans-serif",
  erbaum: "'Erbaum', 'Arial', sans-serif",
  acCond: "'Acumin Pro Condensed', 'Arial Narrow', sans-serif",
  acXCond: "'Acumin Pro ExtraCondensed ISI', 'Acumin Pro ExtraCondensed', 'Arial Narrow', sans-serif",
};

const C = {
  green: "#1ae069",
  red: "#db2335",
  yellow: "#eaba10",
  blue: "#00b1ff",
  navy: "#003049",
  white: "#ffffff",
};

const POS_COLOR: Record<NflPosition, string> = { QB: C.red, RB: C.blue, WR: C.green, TE: C.yellow };
const TONE_COLOR: Record<Tone, string> = { good: C.green, mid: C.yellow, bad: C.red };
// "DD Green/Yellow/Red Gradient" styles: the pill stroke is the opaque gradient,
// the fill the same gradient at 10%.
const TONE_PILL: Record<Tone, { stroke: string; fill: string }> = {
  good: { stroke: "linear-gradient(180deg, #1ae069 0%, #0e7a39 100%)", fill: "linear-gradient(180deg, rgba(26,224,105,0.1) 0%, rgba(14,122,57,0.1) 100%)" },
  mid: { stroke: "linear-gradient(180deg, #eaba10 0%, #846909 100%)", fill: "linear-gradient(180deg, rgba(234,186,16,0.1) 0%, rgba(132,105,9,0.1) 100%)" },
  bad: { stroke: "linear-gradient(180deg, #db2335 0%, #75131c 100%)", fill: "linear-gradient(180deg, rgba(219,35,53,0.1) 0%, rgba(117,19,28,0.1) 100%)" },
};
const INACTIVE_PILL = { stroke: "linear-gradient(180deg, #cdcdcd 0%, #5b5b5b 100%)", fill: "linear-gradient(180deg, rgba(205,205,205,0.1) 0%, rgba(91,91,91,0.1) 100%)" };
const LIGHT_SVG: Record<Light, string> = { green: A.dotGreen, yellow: A.dotYellow, red: A.dotRed };
const SLOT_PILL: Record<LineupSlot, CSSProperties> = {
  QB: { borderColor: C.red, background: "rgba(219,35,53,0.25)" },
  RB: { borderColor: C.blue, background: "rgba(0,177,255,0.25)" },
  WR: { borderColor: C.green, background: "rgba(26,224,105,0.25)" },
  TE: { borderColor: C.yellow, background: "rgba(234,186,16,0.25)" },
  FL: { borderColor: C.white, background: "linear-gradient(90deg, rgba(0,177,255,0.4) 0%, rgba(26,224,105,0.4) 51.45%, rgba(234,186,16,0.4) 99.81%)" },
  SF: { borderColor: C.white, background: "linear-gradient(90deg, rgba(227,24,55,0.4) 0%, rgba(0,177,255,0.4) 37.52%, rgba(26,224,105,0.4) 63.47%, rgba(234,186,16,0.4) 99.81%)" },
};
const EOS_STYLE: Record<EosValue, { gradient: string; shadow: string }> = {
  Riser: { gradient: "linear-gradient(180deg, #00d4ff 0%, #004fc5 100%)", shadow: "rgba(0,177,255,0.5)" },
  Faller: { gradient: "linear-gradient(180deg, #ff0000 0%, #850000 100%)", shadow: "#ff0019" },
  Neutral: { gradient: "linear-gradient(180deg, #fff200 0%, #c56300 100%)", shadow: "rgba(251,121,0,0.5)" },
};
const VERDICT_TONE: Record<Verdict, Tone> = {
  Buy: "good", "Soft-Buy": "good", "Hard-Buy": "good", Hold: "mid", Sell: "bad", "Soft-Sell": "bad", "Hard-Sell": "bad",
};
// Gold/silver/bronze name cells: metallic horizontal gradient as an opaque stroke
// and a 10% fill.
const TOP3_CELL: Record<number, { stroke: string; fill: string; trophy: string }> = {
  1: { trophy: A.prTrophyGold,
    stroke: "linear-gradient(90deg, #ffaa00 0%, #ffe790 16.35%, #ffaa00 39.42%, #ffeba4 56.73%, #c27b1e 76.44%, #eaba10 100%)",
    fill: "linear-gradient(90deg, rgba(255,170,0,0.1) 0%, rgba(255,231,144,0.1) 16.35%, rgba(255,170,0,0.1) 39.42%, rgba(255,235,164,0.1) 56.73%, rgba(194,123,30,0.1) 76.44%, rgba(234,186,16,0.1) 100%)" },
  2: { trophy: A.prTrophySilver,
    stroke: "linear-gradient(90deg, #8a8a8a 0%, #fcfcfc 19.71%, #8a8a8a 36.06%, #ffffff 56.25%, #525252 81.73%, #ffffff 99.52%)",
    fill: "linear-gradient(90deg, rgba(138,138,138,0.1) 0%, rgba(252,252,252,0.1) 19.71%, rgba(138,138,138,0.1) 36.06%, rgba(255,255,255,0.1) 56.25%, rgba(82,82,82,0.1) 81.73%, rgba(255,255,255,0.1) 99.52%)" },
  3: { trophy: A.prTrophyBronze,
    stroke: "linear-gradient(270deg, #c27b1e 0%, #ffe6c5 15.87%, #c27b1e 37.5%, #fdc537 59.62%, #7b4d12 80.29%, #c27b1e 99.52%)",
    fill: "linear-gradient(270deg, rgba(194,123,30,0.1) 0%, rgba(255,230,197,0.1) 15.87%, rgba(194,123,30,0.1) 37.5%, rgba(253,197,55,0.1) 59.62%, rgba(123,77,18,0.1) 80.29%, rgba(194,123,30,0.1) 99.52%)" },
};
const HEADSHOT_FALLBACK = "https://sleepercdn.com/images/v2/icons/player_default.webp";

// ─── Primitives ─────────────────────────────────────────────────────────────

interface TxtProps {
  x: number;
  y: number;
  w?: number;
  h?: number;
  align?: "left" | "center" | "right";
  font: string;
  size: number;
  weight?: number;
  color?: string;
  tracking?: number;
  italic?: boolean;
  upper?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** A Figma text box: absolutely positioned, glyphs vertically centered in the box. */
function Txt({ x, y, w, h, align = "center", font, size, weight = 400, color = C.white, tracking, italic, upper, className, style, children }: TxtProps) {
  // Browsers add letter-spacing after the last glyph as well; Figma's box ends at
  // the glyph. Widening the line by one tracking unit cancels the drift for
  // centered/right-aligned text (left-aligned text is unaffected).
  const trailing = tracking && align !== "left" ? { marginRight: -tracking } : undefined;
  return (
    <div
      className={`${s.t} ${className ?? ""}`}
      style={{
        left: x, top: y, width: w, height: h, textAlign: align,
        fontFamily: font, fontSize: size, fontWeight: weight, color, letterSpacing: tracking,
        fontStyle: italic ? "italic" : undefined, textTransform: upper ? "uppercase" : undefined,
        ...style,
      }}
    >
      <p style={trailing}>{children}</p>
    </div>
  );
}

/** Box from a center point (Figma nodes exported with -translate-x/y-1/2). */
function cbox(cx: number, cy: number, w: number, h: number) {
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

interface PillProps {
  /** Figma node box (before stroke). */
  x: number; y: number; w: number; h: number;
  radius: number | string;
  strokeWidth: number;
  /** Figma stroke alignment. CENTER strokes extend strokeWidth/2 outside the node box. */
  strokeAlign?: "CENTER" | "INSIDE";
  /** Any CSS <image> or color — gradient strokes are the norm in this design. */
  stroke: string;
  fill?: string;
  shadow?: string;
  opacity?: number;
}

/** A Figma rectangle with (possibly gradient) stroke and fill. The ring is the
 *  stroke gradient masked to the padding area, which is the only way to get a
 *  gradient border together with border-radius. */
function Pill({ x, y, w, h, radius, strokeWidth: sw, strokeAlign = "INSIDE", stroke, fill, shadow, opacity }: PillProps) {
  const grow = strokeAlign === "CENTER" ? sw / 2 : 0;
  const r = typeof radius === "number" ? radius + grow : radius;
  const mask = "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";
  return (
    <div className={s.abs} style={{ left: x - grow, top: y - grow, width: w + 2 * grow, height: h + 2 * grow, borderRadius: r, opacity }}>
      {(fill || shadow) && <div className={s.abs} style={{ inset: 0, borderRadius: r, background: fill, boxShadow: shadow }} />}
      <div className={s.abs} style={{
        inset: 0, borderRadius: r, padding: sw, boxSizing: "border-box", background: stroke,
        WebkitMask: mask, WebkitMaskComposite: "xor", mask, maskComposite: "exclude",
      }} />
    </div>
  );
}

/** Figma's dashed 1.325px white divider (dash 3.53, gap 8.83). `y` is the line center. */
function DashedLine({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <svg className={s.abs} style={{ left: x, top: y - 1, width: w, height: 2 }} viewBox={`0 0 ${w} 2`}>
      <line x1={0} y1={1} x2={w} y2={1} stroke="#fff" strokeWidth={1.325} strokeDasharray="3.53 8.83" />
    </svg>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

const OUTLOOKS: Outlook[] = ["Contending", "Wait & See", "Rebuilding"];
const PILL_LEFT = [2114, 2668.12, 3222.24];

function OutlookPill({ left, label, active }: { left: number; label: string; active: boolean }) {
  const pill = active ? TONE_PILL.good : INACTIVE_PILL;
  return (
    <>
      <Pill x={left} y={118} w={519.757} h={93.642} radius={101.32} strokeWidth={4.967} strokeAlign="CENTER"
        stroke={pill.stroke} fill={pill.fill} shadow={active ? `0 0 15px 0 ${C.green}` : undefined} opacity={active ? 1 : 0.48} />
      <Txt {...cbox(left + 259.88, 166.54, 426.974, 55.842)} font={F.acCond} size={85.973} weight={600} tracking={2.5792} upper
        color={active ? C.green : "#dfdfdf"} style={{ opacity: active ? 1 : 0.48 }}>
        {label}
      </Txt>
    </>
  );
}

function Tally({ wins, losses }: { wins: number; losses: number }) {
  const bar: CSSProperties = { top: 69.27, width: 26, height: 123 };
  return (
    <>
      {Array.from({ length: wins }, (_, i) => (
        <div key={`w${i}`} className={s.abs} style={{ ...bar, left: 4538 - 47 * i, background: "linear-gradient(180deg, #1ae069 0%, #0e7a39 100%)" }} />
      ))}
      {Array.from({ length: losses }, (_, i) => (
        <div key={`l${i}`} className={s.abs} style={{ ...bar, left: 5259 + 47.4 * i, background: "linear-gradient(180deg, #db2335 0%, #75131c 100%)" }} />
      ))}
      <Txt {...cbox(4648, 127.77, 164, 129)} font={F.prohibition} size={150.995} upper>{wins}</Txt>
      <Txt {...cbox(5177, 127.77, 164, 129)} font={F.prohibition} size={150.995} upper>{losses}</Txt>
      <img className={s.img} src={A.trophy} alt="" style={{ left: 4735.4, top: 58.8, width: 103.1, height: 133.6 }} />
      <img className={s.img} src={A.lossX} alt="" style={{ left: 4971.6, top: 56.9, width: 119, height: 133.6 }} />
      <div className={s.abs} style={{ left: 4907 - 1.442, top: 36.27, width: 2.884, height: 175, background: C.white }} />
    </>
  );
}

function Header(p: Pick<InSeasonInfinitePreviewProps, "teamName" | "outlook" | "season" | "week" | "wins" | "losses">) {
  return (
    <>
      <Txt x={0} y={78.2} w={1870.3} h={115} font={F.prohibition} size={97.373} tracking={6.8161}>{p.teamName}</Txt>
      <Txt x={769.8} y={341.9} w={2117.5} h={115} align="right" font={F.erbaum} size={93} tracking={25.11}>
        {`${p.season} | WEEK ${p.week}`}
      </Txt>
      {OUTLOOKS.map((o, i) => (
        <OutlookPill key={o} left={PILL_LEFT[i]} label={o.toUpperCase()} active={p.outlook === o} />
      ))}
      <Tally wins={p.wins} losses={p.losses} />
    </>
  );
}

// ─── Starting lineup ────────────────────────────────────────────────────────

// Rows in the mock sit 173.37px apart; the baked-in-DOM dividers 173px apart. The baked
// panel outline fits exactly DESIGNED_ROWS rows at that pitch, so a league with more
// starters keeps every row at its designed size and gives up gap instead: the pitch
// shrinks until the last row ends where the tenth would have. Below MIN_PITCH the rows
// would touch, so past that the whole group is squashed vertically as a last resort.
const ROW_PITCH = 173.37;
const DIVIDER_PITCH = 173;
const FIRST_ROW_TOP = 616.3;
const ROW_HEIGHT = 112.3;
const DESIGNED_ROWS = 10;
const MIN_PITCH = 120;

/** Vertical distance between consecutive row tops for a lineup of `count` rows. */
export function lineupRowPitch(count: number): number {
  if (count <= DESIGNED_ROWS) return ROW_PITCH;
  return Math.max(MIN_PITCH, ((DESIGNED_ROWS - 1) * ROW_PITCH) / (count - 1));
}

const INACTIVE_TEXT = "#dfdfdf";

/** A traffic light; null (no data for this player) draws an empty ring instead. */
function Light({ x, y, light }: { x: number; y: number; light: Light | null }) {
  if (!light) {
    return (
      <div className={s.abs} style={{
        left: x + 11.5, top: y - 1, width: 66.57, height: 66.57, borderRadius: "50%",
        border: "4px solid rgba(255,255,255,0.3)", boxSizing: "border-box",
      }} />
    );
  }
  return (
    <>
      <img className={s.img} src={LIGHT_SVG[light]} alt="" style={{ left: x - 1.57, top: y, width: 74.6, height: 74.47 }} />
      <img className={s.img} src={A.dotGlow} alt="" style={{ left: x + 11.5, top: y - 1, width: 66.57, height: 66.57 }} />
    </>
  );
}

function LineupRowView({ row, dy }: { row: LineupRow; dy: number }) {
  const m = row.marketDelta;
  const mTone: Tone = m == null ? "mid" : m > 0 ? "good" : m < 0 ? "bad" : "mid";
  const mText = m == null ? "—" : m > 0 ? `+ ${m}` : m < 0 ? `- ${Math.abs(m)}` : "=";
  const mColor = m == null ? INACTIVE_TEXT : TONE_COLOR[mTone];
  const vTone: Tone | null = row.verdict ? VERDICT_TONE[row.verdict] : null;
  const vPill = vTone ? TONE_PILL[vTone] : INACTIVE_PILL;
  const eos = row.eosValue ? EOS_STYLE[row.eosValue] : null;
  const isGradientSlot = row.slot === "FL" || row.slot === "SF";
  return (
    <>
      {/* Player pill */}
      <Pill x={140.5} y={616.3 + dy} w={890} h={112.3} radius={124.511} strokeWidth={5.975} strokeAlign="CENTER"
        stroke={SLOT_PILL[row.slot].borderColor as string} fill={SLOT_PILL[row.slot].background as string} />
      <img
        className={s.img}
        src={sleeperHeadshot(row.playerSleeperBotId)}
        onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = HEADSHOT_FALLBACK; }}
        alt=""
        style={{ left: 311, top: 616.5 + dy, width: 149.7, height: 108.6, objectFit: "cover", borderRadius: 12 }}
      />
      {isGradientSlot ? (
        <img className={s.img} src={row.slot === "FL" ? A.posFlex : A.posSuperFlex} alt="" style={{ left: 138, top: 614 + dy, width: 117.2, height: 116.9 }} />
      ) : (
        <div className={s.abs} style={{ left: 138, top: 614 + dy, width: 117.2, height: 116.9, borderRadius: "50%", background: POS_COLOR[row.slot as NflPosition] }} />
      )}
      <Txt x={138} y={625 + dy} w={117.2} h={94.9} font={F.prohibition} size={54.772} color={C.navy} upper>{row.slot}</Txt>
      <Txt x={496.9} y={616.3 + dy} w={442.9} h={113.5} align="left" font={F.acXCond} size={79.672} weight={600} upper>{row.playerName}</Txt>
      <img className={s.img} src={teamLogos.get(row.teamAbbreviation ?? "") ?? nflLogo} alt="" style={{ left: 231.3, top: 625.2 + dy, width: 93.9, height: 93.9, objectFit: "contain" }} />

      {/* Market */}
      <Pill x={1107.2} y={631.1 + dy} w={182.8} h={83.5} radius={18.677} strokeWidth={4.109} strokeAlign="INSIDE" stroke={mColor} />
      <img className={s.img} src={A.marketBadge} alt="" style={{ left: 1134.2, top: 643.5 + dy, width: 38.6, height: 58.9, objectFit: "cover" }} />
      <Txt x={1183.2} y={643.6 + dy} w={79.1} h={58.4} align={mText === "=" || mText === "—" ? "center" : "left"} font={F.acCond} size={64.733} weight={600} color={mColor} upper>
        {mText}
      </Txt>

      {/* ROS projection */}
      {row.rosTrend && (
        <Txt x={1353.8} y={642.9 + dy} w={27.6} h={58.8} font={F.acCond} size={38.918} weight={900} color={row.rosTrend === "up" ? C.green : C.red} upper style={{ lineHeight: 1.068 }}>
          {row.rosTrend === "up" ? "↑" : "↓"}
        </Txt>
      )}
      <Txt x={1394.9} y={642.9 + dy} h={58.8} align="left" font={F.erbaum} size={54.077} weight={700} tracking={3.7854} color={row.rosRank ? POS_COLOR[row.position] : INACTIVE_TEXT} upper>
        {row.rosRank ?? "—"}
      </Txt>

      {/* EOS value (deferred feature — omitted entirely when null) */}
      {eos && row.eosValue && (
        <>
          <Txt {...cbox(1793.46, 672.5 + dy, 275, 61)} font={F.prohibition} size={79.66} italic tracking={2.3898} upper className={s.gradientText}
            color="transparent" style={{ backgroundImage: eos.gradient, WebkitTextStroke: `0.5px ${C.white}`, filter: `drop-shadow(0 0 5px ${eos.shadow})` }}>
            {row.eosValue}
          </Txt>
          <Txt {...cbox(1979.5, 672.5 + dy, 27, 37)} font={F.acCond} size={50} weight={600} upper>→</Txt>
        </>
      )}

      {/* Verdict */}
      <Pill x={2039} y={633 + dy} w={334.911} h={78.882} radius={108.004} strokeWidth={5.294} strokeAlign="CENTER"
        stroke={vPill.stroke} fill={vPill.fill} />
      <Txt {...cbox(2206.46, 673.89 + dy, 275.125, 47.039)} font={F.acCond} size={59.662} weight={600} tracking={1.7899} color={vTone ? TONE_COLOR[vTone] : INACTIVE_TEXT} upper>
        {row.verdict ?? "—"}
      </Txt>

      {/* M / O / V */}
      <Light x={2493.77} y={636 + dy} light={row.matchup} />
      <Light x={2623} y={636 + dy} light={row.offense} />
      <Light x={2753.85} y={636 + dy} light={row.vegas} />
    </>
  );
}

function Lineup({ rows }: { rows: LineupRow[] }) {
  const count = rows.length;
  const pitch = lineupRowPitch(count);
  const compressed = count > DESIGNED_ROWS;
  // At the designed pitch the dividers keep the mock's own spacing; when compressed they
  // sit centred in the (smaller) gap between consecutive rows.
  const dividerY = (i: number) =>
    compressed ? FIRST_ROW_TOP + i * pitch + (pitch + ROW_HEIGHT) / 2 : 759 + i * DIVIDER_PITCH;
  const designedSpan = (DESIGNED_ROWS - 1) * ROW_PITCH + ROW_HEIGHT;
  const span = (count - 1) * pitch + ROW_HEIGHT;
  const squash = span > designedSpan + 0.5 ? designedSpan / span : 1;

  const body = (
    <>
      {rows.map((row, i) => <LineupRowView key={i} row={row} dy={i * pitch} />)}
      {rows.slice(0, -1).map((_, i) => <DashedLine key={i} x={76.7} y={dividerY(i)} w={2844} />)}
    </>
  );
  if (squash === 1) return body;
  return (
    <div className={s.abs} style={{ inset: 0, transform: `scaleY(${squash})`, transformOrigin: `0 ${FIRST_ROW_TOP}px` }}>
      {body}
    </div>
  );
}

// ─── Odds gauges + PF boxes ─────────────────────────────────────────────────

// Needle pivots on the gauge arc's center (arc radius 339); its own center sits
// 271.4 from the pivot so the tip just clears the arc's outer edge.
function Needle({ cx, cy, angleDeg }: { cx: number; cy: number; angleDeg: number }) {
  const r = 271.4, w = 19.431, h = 151.017;
  return (
    <div className={s.abs} style={{
      left: cx - w / 2, top: cy - r - h / 2, width: w, height: h, background: "#d9d9d9",
      transformOrigin: `${w / 2}px ${r + h / 2}px`, transform: `rotate(${angleDeg}deg)`,
    }} />
  );
}

/** One odds panel. Championship is the playoffs panel translated by (1022, -0.97). */
function OddsPanelView({ p, dx, dy }: { p: OddsPanel; dx: number; dy: number }) {
  // No odds yet → needle parked at LOW and every number reads "—".
  const angle = p.needleAngleDeg ?? (p.percent == null ? -90 : -90 + (p.percent / 100) * 180);
  const hasHistory = p.fromWeek != null && p.fromPct != null && p.toWeek != null && p.toPct != null;
  const toTone: Tone = hasHistory && p.toPct! >= p.fromPct! ? "good" : "bad";
  const xcond = { font: F.acXCond, size: 65.495, weight: 500 };
  return (
    <>
      <Needle cx={4568 + dx} cy={683 + dy} angleDeg={angle} />
      <Txt {...cbox(4565.2 + dx, 605.19 + dy, 270.745, 104.93)} font={F.acXCond} size={157.991} weight={600} color={p.percent == null ? INACTIVE_TEXT : TONE_COLOR[p.tone]} upper>
        {p.percent == null ? "—" : `${p.percent}%`}
      </Txt>
      <Txt {...cbox(4568.43 + dx, 978.46 + dy, 661.45, 50.286)} {...xcond} style={{ whiteSpace: "pre" }}>
        {hasHistory ? (
          <>
            {`WK ${p.fromWeek}: `}
            <span style={{ color: TONE_COLOR[p.fromTone] }}>{p.fromPct}%</span>
            {`   →  WK ${p.toWeek}: `}
            <span style={{ color: TONE_COLOR[toTone] }}>{toTone === "good" ? "↑" : "↓"} {p.toPct}%</span>
          </>
        ) : "—"}
      </Txt>
      <Txt {...cbox(4251.73 + dx, 1087.52 + dy, 163.428, 50.286)} {...xcond} tracking={3.2747}>WK {p.week}:</Txt>
      <Txt {...cbox(4517.18 + dx, 1089.45 + dy, 243.692, 46.418)} {...xcond} color={C.green}>{p.winPct == null ? "WIN —" : `WIN ↑ ${p.winPct}%`}</Txt>
      <Txt {...cbox(4844.03 + dx, 1089.45 + dy, 243.692, 46.418)} {...xcond} color={C.red}>{p.losePct == null ? "LOSE —" : `LOSE ↓${p.losePct}%`}</Txt>
      <img className={s.img} src={A.trophy} alt="" style={{ left: 4352.7 + dx, top: 1067.2 + dy, width: 36.2, height: 44.4 }} />
      <img className={s.img} src={A.lossX} alt="" style={{ left: 4669.2 + dx, top: 1070.2 + dy, width: 38.6, height: 41 }} />
    </>
  );
}

function PfBoxes(p: Pick<InSeasonInfinitePreviewProps, "totalPf" | "leagueRank" | "rosProjection" | "rosProjectionRank">) {
  const big: CSSProperties = { fontFamily: F.erbaum, fontWeight: 500, fontSize: 146.875, textTransform: "uppercase", textAlign: "center" };
  return (
    <>
      <p className={s.p} style={{ ...big, left: 4348.86 - 398.591 / 2, top: 1349.33, width: 398.591, height: 92.811, color: C.green }}>{p.totalPf}</p>
      <p className={s.p} style={{ ...big, left: 4807.1 - 418.48 / 2, top: 1353.47, width: 418.48, height: 88.668, color: C.green }}>#{p.leagueRank}</p>
      <p className={s.p} style={{ ...big, left: 5169, top: 1347, width: 484, height: 89, color: C.yellow, textAlign: "left" }}>{p.rosProjection == null ? "—" : p.rosProjection.toLocaleString("en-US")}</p>
      <p className={s.p} style={{ ...big, left: 5864.5 - 297 / 2, top: 1347, width: 297, height: 89, color: C.yellow }}>{p.rosProjectionRank == null ? "—" : `#${p.rosProjectionRank}`}</p>
    </>
  );
}

// ─── League power ranks ─────────────────────────────────────────────────────

// Row centers in the mock: 1978.35 + 148.7 * i (12 teams fill the panel). Rows are packed
// edge to edge, so a bigger league cannot give up gap the way the lineup does: past
// PR_DESIGNED_ROWS every row is shortened by `k` (heights, vertical offsets and type sizes
// only — every x anchor stays put so the columns keep lining up with the baked headers)
// and the first row's top edge stays where the mock puts it.
const PR_TOP = 1978.35;
const PR_PITCH = 148.7;
const PR_BAND_TOP = 73.3; // highlight band spans rc - 73.3 .. rc + 73.7
const PR_DESIGNED_ROWS = 12;

/** Vertical scale applied to every power-rank row so `count` rows fit the panel. */
export function powerRankScale(count: number): number {
  return count <= PR_DESIGNED_ROWS ? 1 : (PR_DESIGNED_ROWS - 1) / (count - 1);
}

/** Week-over-week change; nothing is drawn when there is no previous week. */
function Delta({ value, pct }: { value: number | null; pct?: boolean }) {
  if (value == null) return null;
  const tone: Tone = value > 0 ? "good" : value < 0 ? "bad" : "mid";
  const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  return <span style={{ color: TONE_COLOR[tone] }}> {arrow} {Math.abs(value)}{pct ? "%" : ""}</span>;
}

function PowerRankRowView({ row, rc, k, isLast }: { row: PowerRankRow; rc: number; k: number; isLast: boolean }) {
  const nameColor = row.isUserTeam ? C.green : row.rank === 1 ? "#ffaa00" : row.rank === 2 ? "#cfcfcf" : row.rank === 3 ? "#ca6b24" : C.white;
  const top3 = TOP3_CELL[row.rank];
  const cell = { font: F.acCond, size: 77 * k, weight: 500, upper: true };
  return (
    <>
      {row.isUserTeam && (
        <>
          <Pill x={3409} y={rc - PR_BAND_TOP * k} w={2647} h={147 * k} radius={0} strokeWidth={4} strokeAlign="INSIDE" stroke={TONE_PILL.good.stroke} fill={TONE_PILL.good.fill} />
          <svg className={s.abs} style={{ left: 3387.2, top: rc - 31.5 * k, width: 54.563 * k, height: 63.004 * k }} viewBox="0 0 54.563 63.004">
            <polygon points="0,0 54.563,31.502 0,63.004" fill="#00ff06" />
          </svg>
        </>
      )}
      {top3 && (
        <>
          <Pill x={3409} y={rc - 66.35 * k} w={825} h={125 * k} radius={`0 ${100 * k}px ${100 * k}px 0`} strokeWidth={4} strokeAlign="INSIDE" stroke={top3.stroke} fill={top3.fill} />
          <img className={s.img} src={top3.trophy} alt="" style={{ left: 3479.2, top: rc - 28.4 * k, width: 44.8 * k, height: 54.3 * k }} />
        </>
      )}
      <Txt x={3504} y={rc - 43.35 * k} w={618.879} h={86.703 * k} align="left" font={F.acXCond} size={67.728 * k} weight={row.isUserTeam ? 500 : 600} color={nameColor} upper>
        <span className={s.rank}>{row.rank}.</span>{row.teamName}
      </Txt>
      {/* The user's own row shows the PF number on the highlight band with no pill. */}
      {!row.isUserTeam && (
        <Pill x={4279} y={rc - 66.35 * k} w={285} h={125 * k} radius={24 * k} strokeWidth={4} strokeAlign="CENTER"
          stroke={TONE_PILL[row.totalPfTone].stroke} fill={TONE_PILL[row.totalPfTone].fill} />
      )}
      <Txt {...cbox(4421.73, rc - 3.85 * k, 232.251, 93 * k)} font={F.prohibition} size={86.87 * k} color={TONE_COLOR[row.totalPfTone]} upper>{row.totalPf}</Txt>
      <Txt {...cbox(4892.5, rc - 3.85 * k, 577, 93 * k)} {...cell}>
        {row.rosProjection == null ? "—" : row.rosProjection.toLocaleString("en-US")} | #{row.rosRank ?? "—"}<Delta value={row.rosDelta} />
      </Txt>
      <Txt {...cbox(5397.5, rc - 3.85 * k, 357, 93 * k)} {...cell}>
        <span style={{ fontWeight: 700 }}>{row.playoffsPct == null ? "—" : `${row.playoffsPct}%`}</span><Delta value={row.playoffsDelta} pct />
      </Txt>
      <Txt {...cbox(5834.5, rc - 3.85 * k, 357, 93 * k)} {...cell}>
        <span style={{ fontWeight: 700 }}>{row.championshipPct == null ? "—" : `${row.championshipPct}%`}</span><Delta value={row.championshipDelta} pct />
      </Txt>
      {!isLast && <DashedLine x={3412} y={rc + 74.4 * k} w={2644} />}
    </>
  );
}

function PowerRanks({ rows }: { rows: PowerRankRow[] }) {
  const k = powerRankScale(rows.length);
  const pitch = PR_PITCH * k;
  // Shorter rows sit higher so the first band's top edge stays where the mock has it.
  const first = PR_TOP - PR_BAND_TOP * (1 - k);
  return (
    <>
      {rows.map((row, i) => (
        <PowerRankRowView key={row.rank} row={row} rc={first + pitch * i} k={k} isLast={i === rows.length - 1} />
      ))}
    </>
  );
}

// ─── Verdict chart ──────────────────────────────────────────────────────────

// Plot extents from the mock's axis labels: first/last x label centers and the
// y label centers for yMin / yMax.
const CH = { x0: 2244.94, x1: 3164.73, yTop: 2632, yBottom: 3415.57 };

function VerdictChart({ chart }: { chart: ChartData }) {
  const n = chart.xLabels.length;
  const xAt = (i: number) => CH.x0 + (n > 1 ? (CH.x1 - CH.x0) * (i / (n - 1)) : 0);
  const yAt = (v: number) => CH.yBottom - ((v - chart.yMin) / (chart.yMax - chart.yMin)) * (CH.yBottom - CH.yTop);
  const yTicks: number[] = [];
  for (let v = chart.yMin; v <= chart.yMax + 1e-9; v += chart.yStep) yTicks.push(v);
  const axisLabel = { font: F.acXCond, size: 22.762, weight: 500 };
  const legendLabel = { font: F.prohibition, size: 22.762 };
  return (
    <>
      <div className={s.abs} style={{ left: 2131, top: 2538, width: 1083, height: 1089, border: "5.484px solid #fff", borderRadius: 36.212, boxSizing: "border-box" }} />
      <img className={s.img} src={A.chartAxes} alt="" style={{ left: 2207.2, top: 2636, width: 977.7, height: 833.6 }} />
      <img className={s.img} src={A.chartTicks} alt="" style={{ left: 2242.35, top: 3457.9, width: 923.931, height: 20.647 }} />
      {chart.xLabels.map((label, i) => (
        <Txt key={`x${i}`} {...cbox(xAt(i), 3506.76, 34.143, 18.914)} {...axisLabel}>{label}</Txt>
      ))}
      {yTicks.map((v) => (
        <Txt key={`y${v}`} {...cbox(2176.01, yAt(v), 34.143, 33.775)} {...axisLabel}>{v}</Txt>
      ))}
      <svg className={s.abs} style={{ left: 2131, top: 2538, width: 1083, height: 1089 }} viewBox="2131 2538 1083 1089">
        {chart.series.map((sr) => (
          <polyline
            key={sr.position}
            fill="none"
            stroke={POS_COLOR[sr.position]}
            strokeWidth={5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={sr.values.map((v, i) => (v == null ? null : `${xAt(i)},${yAt(v)}`)).filter(Boolean).join(" ")}
          />
        ))}
      </svg>
      <img className={s.img} src={A.chartLegendQb} alt="" style={{ left: 2560.3, top: 3558.2, width: 18.4, height: 24.3 }} />
      <Txt {...cbox(2617.28, 3570.26, 26.9, 32.4)} {...legendLabel} color={C.red}>QB</Txt>
      <img className={s.img} src={A.chartLegendRb} alt="" style={{ left: 2640.1, top: 3558.2, width: 18.4, height: 24.3 }} />
      <Txt {...cbox(2697.46, 3570.26, 27.9, 32.4)} {...legendLabel} color={C.blue}>RB</Txt>
      <img className={s.img} src={A.chartLegendWr} alt="" style={{ left: 2713.7, top: 3558.2, width: 18.4, height: 24.3 }} />
      <Txt {...cbox(2751.4, 3570.3, 30.1, 32.6)} {...legendLabel} color={C.green}>WR</Txt>
      <img className={s.img} src={A.chartLegendTe} alt="" style={{ left: 2786.1, top: 3558.2, width: 18.4, height: 24.3 }} />
      <Txt {...cbox(2840.24, 3570.26, 25.9, 32.4)} {...legendLabel} color={C.yellow}>TE</Txt>
    </>
  );
}

// ─── Composition ────────────────────────────────────────────────────────────

export default function InSeasonInfinitePreview(p: InSeasonInfinitePreviewProps) {
  return (
    <div className={`exportableClassInSeasonInfinite ${s.fullBlueprint}`}>
      <img src={inSeasonInfiniteBkg} className={s.backgroundImg} alt="" />
      <Header teamName={p.teamName} outlook={p.outlook} season={p.season} week={p.week} wins={p.wins} losses={p.losses} />
      <Lineup rows={p.lineup} />
      <OddsPanelView p={p.playoffs} dx={0} dy={0} />
      <OddsPanelView p={p.championship} dx={1022} dy={-0.97} />
      <PfBoxes totalPf={p.totalPf} leagueRank={p.leagueRank} rosProjection={p.rosProjection} rosProjectionRank={p.rosProjectionRank} />
      <PowerRanks rows={p.powerRanks} />
      {p.chart && <VerdictChart chart={p.chart} />}
    </div>
  );
}
