import styles from './NewRookieDraft.module.css';
import {
    cornerstoneCategory,
    foundationalCategory,
    jagDevelopmentalCategory,
    jagInsuranceCategory,
    mainstayCategory,
    newRookieBg,
    newRookieCardMap,
    oneQb10TeamCliffMap,
    oneQb12TeamCliffMap,
    oneQb14TeamCliffMap,
    oneQb8TeamCliffMap,
    productiveVetCategory,
    replaceableCategory,
    serviceableCategory,
    sf10TeamCliffMap,
    sf12TeamCliffMap,
    sf14TeamCliffMap,
    sf8TeamCliffMap,
    shortTermLeagueWinnersCategory,
    shortTermProductionCategory,
    upsidePremierCategory,
    upsideShotCategory,
} from '../consts/images';
import {PlayerCard} from '../NewV1/NewV1';
import {
    PickProfile as Pick,
    useBlueprint,
    usePlayerData,
} from '../hooks/hooks';
import {Player} from '../sleeper-api/sleeper-api';
import { CircularProgress } from '@mui/material';

export enum ValueArchetype {
    None = 'NONE',
    EliteValue = 'ELITE VALUE',
    EnhancedValue = 'ENHANCED VALUE',
    StandardValue = 'STANDARD VALUE',
    FutureValue = 'FUTURE VALUE',
    AgingValue = 'AGING VALUE',
    OneYearReload = 'ONE YEAR RELOAD',
    HardRebuild = 'HARD REBUILD',
}

export enum RosterArchetype {
    None = 'NONE',
    WellRounded = 'WELL ROUNDED',
    WRFactory = 'WR FACTORY',
    RBHeavy = 'RB HEAVY',
    DualEliteQB = 'DUAL ELITE QB',
    EliteQBTE = 'ELITE QB/TE',
    PlayerDeficient = 'PLAYER DEFICIENT',
}

function convertStringToValueArchetype(str: string): ValueArchetype {
    switch (str) {
        case 'EliteValue':
            return ValueArchetype.EliteValue;
        case 'EnhancedValue':
            return ValueArchetype.EnhancedValue;
        case 'StandardValue':
            return ValueArchetype.StandardValue;
        case 'FutureValue':
            return ValueArchetype.FutureValue;
        case 'AgingValue':
            return ValueArchetype.AgingValue;
        case 'OneYearReload':
            return ValueArchetype.OneYearReload;
        case 'HardRebuild':
            return ValueArchetype.HardRebuild;
        default:
            return ValueArchetype.None;
    }
}

function convertStringToRosterArchetype(str: string): RosterArchetype {
    switch (str) {
        case 'WellRounded':
            return RosterArchetype.WellRounded;
        case 'WRFactory':
            return RosterArchetype.WRFactory;
        case 'RBHeavy':
            return RosterArchetype.RBHeavy;
        case 'DualEliteQB':
            return RosterArchetype.DualEliteQB;
        case 'EliteQBTE':
            return RosterArchetype.EliteQBTE;
        case 'PlayerDeficient':
            return RosterArchetype.PlayerDeficient;
        default:
            return RosterArchetype.None;
    }
}

export function WrappedNewRookieDraft({blueprintId}: {blueprintId: string}) {
    const {blueprint: rookieBlueprint} = useBlueprint(blueprintId);

    if (!rookieBlueprint) {
        return <CircularProgress />;
    }

    return (
        <NewRookieDraft
            teamName={rookieBlueprint?.teamName || ''}
            numTeams={
                rookieBlueprint?.leagueSettings
                    .numberOfTeams || 0
            }
            valueArchetype={convertStringToValueArchetype(
                rookieBlueprint?.valueArchetype || ''
            )}
            rosterArchetype={convertStringToRosterArchetype(
                rookieBlueprint?.rosterArchetype || ''
            )}
            myPicks={
                rookieBlueprint?.rookieDraftFeatures
                    ?.pickProfiles || []
            }
            strategyName={
                rookieBlueprint?.rookieDraftFeatures
                    ?.strategyName || ''
            }
            strategyStatement={
                rookieBlueprint?.rookieDraftFeatures
                    ?.strategyStatement || ''
            }
            isSuperFlex={
                rookieBlueprint?.leagueSettings
                    .isSuperFlex || true
            }
        />
    );
}

type NewRookieDraftProps = {
    teamName: string;
    numTeams: number;
    valueArchetype: ValueArchetype;
    rosterArchetype: RosterArchetype;
    myPicks: Pick[];
    strategyName: string;
    strategyStatement: string;
    isSuperFlex: boolean;
};

function getFontSize(teamName: string) {
    if (teamName.length >= 24) return '35px';
    if (teamName.length >= 20) return '40px';
    return '50px';
}

export default function NewRookieDraft({
    teamName,
    numTeams,
    valueArchetype,
    rosterArchetype,
    myPicks,
    strategyName,
    strategyStatement,
    isSuperFlex,
}: NewRookieDraftProps) {
    const playerData = usePlayerData();
    if (!playerData) return <></>;

    function getCliffMap() {
        if (isSuperFlex) {
            switch (numTeams) {
                case 8:
                    return sf8TeamCliffMap;
                case 10:
                    return sf10TeamCliffMap;
                case 12:
                    return sf12TeamCliffMap;
                case 14:
                    return sf14TeamCliffMap;
            }
        } else {
            switch (numTeams) {
                case 8:
                    return oneQb8TeamCliffMap;
                case 10:
                    return oneQb10TeamCliffMap;
                case 12:
                    return oneQb12TeamCliffMap;
                case 14:
                    return oneQb14TeamCliffMap;
            }
        }
        return '';
    }

    function getPickProfileTop(idx: number) {
        switch (idx) {
            case 0:
                return '197px';
            case 1:
                return '350px';
            case 2:
                return '503px';
            case 3:
                return '656px';
        }
        return '';
    }

    return (
        <div className={styles.fullBlueprint}>
            <div
                className={styles.teamName}
                style={{fontSize: getFontSize(teamName)}}
            >
                {teamName}
            </div>
            <div className={styles.valueArchetype}>{valueArchetype}</div>
            <div className={styles.rosterArchetype}>{rosterArchetype}</div>
            <div className={styles.pickTitles}>
                {myPicks.slice(0, 4).map((pick, idx) => (
                    <div key={idx} className={styles.pickTitle}>
                        {`Pick ${pick.round}.${
                            pick.pickNumber < 10 ? '0' : ''
                        }${pick.pickNumber}`}
                    </div>
                ))}
            </div>
            {myPicks.slice(0, 4).map((pick, idx) => (
                <div 
                    key={pick.id} 
                    className={styles.pickProfiles} 
                    style={{top: getPickProfileTop(idx)}}
                >
                    <PickProfile key={pick.id} pick={pick} />
                </div>
            ))}
            <div className={styles.targetCards}>
                {myPicks.slice(0, 4).map((pick) => (
                    <div key={pick.id} className={styles.targetCardRow}>
                        {pick.targets.map((target) =>
                            newRookieCardMap.has(target.playerName) ? (
                                <img
                                    key={target.id}
                                    src={
                                        newRookieCardMap.get(target.playerName)!
                                    }
                                    className={styles.targetCard}
                                />
                            ) : (
                                <div key={target.id} className={styles.targetCard}>
                                    {target.playerName} is missing rookie card
                                </div>
                            )
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.autoAcceptRejectColumn}>
                {myPicks.slice(0, 4).map((pick) => (
                    <AutoAcceptReject
                        key={pick.id}
                        autoAcceptPlayer={
                            playerData[pick.autoAcceptPlayerSleeperId]
                        }
                        autoRejectPlayer={
                            playerData[pick.autoRejectPlayerSleeperId]
                        }
                    />
                ))}
            </div>
            <div className={styles.rookieDraftStrategySection}>
                <RookieDraftStrategy
                    strategyName={strategyName}
                    strategyStatement={strategyStatement}
                />
            </div>
            <img src={getCliffMap()} className={styles.cliffMap} />
            <img src={newRookieBg} className={styles.backgroundImg} />
        </div>
    );
}

function AutoAcceptReject({
    autoAcceptPlayer,
    autoRejectPlayer,
}: {
    autoAcceptPlayer: Player;
    autoRejectPlayer: Player;
}) {
    return (
        <div className={styles.autoAcceptReject}>
            <PlayerCard
                player={autoAcceptPlayer}
                getStartingPosition={() => autoAcceptPlayer.position}
                hideAdp
            />
            <PlayerCard
                player={autoRejectPlayer}
                getStartingPosition={() => autoRejectPlayer.position}
                hideAdp
            />
        </div>
    );
}

type PickProfileProps = {
    pick: Pick;
};

function PickProfile({pick}: PickProfileProps) {
    function getPlayerCategoryImg() {
        switch (pick.projectedPlayerCategory) {
            case 'Cornerstone':
                return cornerstoneCategory;
            case 'Foundational':
                return foundationalCategory;
            case 'JAGDevelopmental':
                return jagDevelopmentalCategory;
            case 'JAGInsurance':
                return jagInsuranceCategory;
            case 'Mainstay':
                return mainstayCategory;
            case 'ProductiveVet':
                return productiveVetCategory;
            case 'Replaceable':
                return replaceableCategory;
            case 'Serviceable':
                return serviceableCategory;
            case 'ShortTermLeagueWinners':
                return shortTermLeagueWinnersCategory;
            case 'ShortTermProduction':
                return shortTermProductionCategory;
            case 'UpsidePremier':
                return upsidePremierCategory;
            case 'UpsideShot':
                return upsideShotCategory;
        }
        return '';
    }

    function getColorFromMarketValue() {
        switch (pick.marketValue.toUpperCase()) {
            case 'UNDERVALUED':
                return '#1AE069';
            case 'CORRECTLYVALUED':
                return '#EABA10';
            case 'OVERVALUED':
                return '#DB2335';
        }
        return '';
    }
    function getMarketValueDisplay() {
        switch (pick.marketValue.toUpperCase()) {
            case 'CORRECTLYVALUED':
                return 'CORRECTLY VALUED';
            default:
                return pick.marketValue.toUpperCase();
        }
    }
    function getRankSuffix() {
        const abs = Math.abs(pick.historicalRank);
        const lastTwo = abs % 100;
        const lastOne = abs % 10;

        if (lastTwo >= 11 && lastTwo <= 13) return 'th';

        switch (lastOne) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    }
    function getColorFromTier() {
        switch (pick.tier) {
            case 1:
                return '#CD00FF';
            case 2:
                return '#00B1FF';
            case 3:
                return '#1AE069';
            case 4:
                return '#EABA10';
            case 5:
                return '#FF4200';
            case 6:
                return '#DB2335';
            default:
                return '#D9D9D9';
        }
    }

    return (
        <div className={styles.pickProfile}>
            <div>
                Tier:{' '}
                <span
                    className={styles.tier}
                    style={{color: getColorFromTier()}}
                >
                    {pick.tier}
                </span>
            </div>
            <div>
                Bakery Z-Score:{' '}
                <span className={styles.zScore}>{pick.bakeryZScore}</span>
            </div>
            <div>
                Proj. Player Category:{' '}
                {getPlayerCategoryImg() ? (
                    <img
                        src={getPlayerCategoryImg()}
                        className={styles.playerCategory}
                    />
                ) : (
                    pick.projectedPlayerCategory
                )}
            </div>
            <div>
                Historical Rank{' '}
                <span className={styles.lastTenClasses}>(Last 10 Classes)</span>
                :{' '}
                <span className={styles.rank}>
                    {pick.historicalRank}
                    {getRankSuffix()}
                </span>
            </div>
            <div>
                Market Value:{' '}
                <span
                    className={styles.marketValue}
                    style={{color: getColorFromMarketValue()}}
                >
                    {getMarketValueDisplay()}
                </span>
            </div>
        </div>
    );
}

function RookieDraftStrategy({
    strategyName,
    strategyStatement,
}: {
    strategyName: string;
    strategyStatement: string;
}) {
    return (
        <div className={styles.rookieDraftStrategy}>
            <div className={styles.rookieDraftStrategyTitle}>
                {strategyName}
            </div>
            <div className={styles.rookieDraftStrategyText}>
                {strategyStatement}
            </div>
        </div>
    );
}
