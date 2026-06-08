import styles from './BlueprintDashboard.module.css';
import newInfiniteStyles from '../NewInfinite/NewInfinite.module.css';
import newRookieStyles from '../NewRookieDraft/NewRookieDraft.module.css';
import newV1Styles from '../NewV1/NewV1.module.css';
import premiumStyles from '../Premium/Premium.module.css';
import {expiredInfinitePromo, expiredMembershipPromo, flockDomainLogo, logoHorizontal} from '../consts/images';
import {Subscription, useBlueprintsForDomainUser, useDomainAppUser, useInfiniteSubscriptions, useTitle} from '../hooks/hooks';
import {Box, Button, CircularProgress, IconButton, Modal} from '@mui/material';
import {useEffect, useState, type CSSProperties} from 'react';
import DomainTextField from '../shared/DomainTextField';
import {WrappedNewInfinite} from '../NewInfinite/NewInfinite';
import {toPng} from 'html-to-image';
import { Close, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { WrappedNewRookieDraft } from '../NewRookieDraft/NewRookieDraft';
import { WrappedNewV1 } from '../NewV1/NewV1';
import { WrappedPremium } from '../Premium/Premium';
import BlueprintStatusTracker from './BlueprintStatusTracker/BlueprintStatusTracker';
import { useSearchParams } from 'react-router-dom';
import { MOCK_BLUEPRINTS, MOCK_USERNAME } from './__mockDashboardData';


export const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        // Check if window is defined (for server-side rendering compatibility)
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Set initial size
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Empty dependency array ensures this runs once on mount

    return screenSize;
};

enum PreviewType {
    None,
    Infinite,
    Rookie,
    Standard,
    Premium,
}

// Natural (unscaled) dimensions of each blueprint type. These match the
// fit-to-view constants used in the zoom calculation, and let the preview
// wrapper reserve a footprint equal to its scaled size so it can be centered
// in the modal. (Does not affect the download — that captures the inner
// blueprint element at its natural size, independent of this wrapper.)
const PREVIEW_DIMS: Partial<Record<PreviewType, {w: number; h: number}>> = {
    [PreviewType.Infinite]: {w: 1700, h: 2102},
    [PreviewType.Rookie]: {w: 1400, h: 1032},
    [PreviewType.Standard]: {w: 800, h: 1060},
    [PreviewType.Premium]: {w: 1900, h: 1045},
};

// Maps the API's blueprintType string to its display label, brand accent
// color, and the corresponding preview enum. Used by both the "By Type" and
// "By Team" groupings. Order here defines the order types are listed.
const TYPE_META: Record<
    string,
    {label: string; accent: string; preview: PreviewType}
> = {
    Standard: {label: 'Standard', accent: '#F47F20', preview: PreviewType.Standard},
    Premium: {label: 'Premium', accent: '#B139E2', preview: PreviewType.Premium},
    RookieDraft: {label: 'Rookie Draft', accent: '#00B1FF', preview: PreviewType.Rookie},
    Infinite: {label: 'Infinite', accent: '#1AE069', preview: PreviewType.Infinite},
};

type TeamBlueprint = {
    blueprintId: string;
    leagueId: string;
    teamName: string;
    blueprintType: string;
    typeLabel: string;
    accent: string;
    previewType: PreviewType;
    createdUtc: string;
    date: string;
};

type GroupMode = 'type' | 'team';

export default function BlueprintDashboard() {
    useTitle('Blueprint Dashboard');
    // DEV-ONLY: `?mock=1` previews the logged-in home page with sample data.
    const [searchParams] = useSearchParams();
    const isMock = searchParams.get('mock') === '1';
    const {width, height} = useScreenSize();
    const isMobile = width < 768;
    const [isLoggedIn, setIsLoggedIn] = useState(
        isMock || localStorage.getItem('flockAuthToken') !== null
    );
    const [loginModalOpen, setLoginModalOpen] = useState(!isMock && !isLoggedIn);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginFlockUsername, setLoginFlockUsername] = useState('');
    const [loginSleeperUsername, setLoginSleeperUsername] = useState('');
    const [loginDiscordUsername, setLoginDiscordUsername] = useState('');
    const [loginError, setLoginError] = useState('');
    const [domainUserNotFound, setDomainUserNotFound] = useState(false);
    const {
        blueprints: fetchedBlueprints,
        error: blueprintsError,
        isLoading: blueprintsLoading,
    } = useBlueprintsForDomainUser();
    const blueprints = isMock ? MOCK_BLUEPRINTS : fetchedBlueprints;
    const {subscriptions} = useInfiniteSubscriptions();
    const {appUser} = useDomainAppUser();
    const [expiredSubscriptions, setExpiredSubscriptions] = useState<Subscription[]>([]);
    const [showExpiredPopup, setShowExpiredPopup] = useState(false);
    const [showMembershipExpiredPopup, setShowMembershipExpiredPopup] = useState(false);

    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [downloadBlueprintId, setDownloadBlueprintId] = useState('');
    const [downloadBlueprintName, setDownloadBlueprintName] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [previewType, setPreviewType] = useState(PreviewType.None);
    const [username, setUsername] = useState(
        isMock ? MOCK_USERNAME : localStorage.getItem('flockUsername')
    );
    const [groupMode, setGroupMode] = useState<GroupMode>('type');
    // The "By Team" view is keyed by leagueId, not teamName: users who name
    // every team after their username would otherwise collapse into one group.
    const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
    const statusTrackerFlag = true;
    // Caps the preview modal width so portrait blueprints aren't lost in dead
    // space; the zoom calc below clamps to the same value so nothing overflows.
    const PREVIEW_MODAL_MAX_WIDTH = 1100;
    const toolbarIconSx = {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
        },
    } as const;

    useEffect(() => {
        if (!subscriptions) return;
        const expiredSubscriptions = subscriptions.filter(
            sub => isInThePast(sub.expiresUtc) && !sub.expirationAcknowledged
        );
        setExpiredSubscriptions(expiredSubscriptions);
        if (expiredSubscriptions.length > 0) {
            setShowExpiredPopup(true);
        }
    }, [subscriptions]);
    useEffect(() => {
        if (!appUser) return;
        if (isInThePast(appUser.flockRenewalDate)) {
            setShowMembershipExpiredPopup(true);
        }
    }, [appUser]);

    useEffect(() => {
        if (!blueprintsError) return;
        if (blueprintsError.message === 'Request failed with status code 401') {
            logout();
        }
    }, [blueprintsError]);

    useEffect(() => {
        if (!isLoggedIn) {
            setLoginModalOpen(true);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        setUsername(localStorage.getItem('flockUsername'));
    }, [localStorage.getItem('flockUsername')]);

    useEffect(() => {
        const displayWidth = isMaximized
            ? width
            : Math.min(width * 0.9, PREVIEW_MODAL_MAX_WIDTH);
        const displayHeight = height * (isMaximized ? 1 : 0.9) - 85;
        if (previewType === PreviewType.Infinite) {
            setZoomLevel(Math.min(displayHeight / 2102, displayWidth / 1700));
        }
        if (previewType === PreviewType.Rookie) {
            setZoomLevel(Math.min(displayHeight / 1032, displayWidth / 1400));
        }
        if (previewType === PreviewType.Standard) {
            setZoomLevel(Math.min(displayHeight / 1060, displayWidth / 800));
        }
        if (previewType === PreviewType.Premium) {
            setZoomLevel(Math.min(displayHeight / 1045, displayWidth / 1900));
        }
    }, [width, isMaximized, height, previewType]);

    const bps: Array<{name: string; date: string; blueprintId: string}> =
        blueprints
            .filter(
                (bp) =>
                    bp.blueprintType === 'Standard' 
                    && bp.deliveryStatus === 'Published'
            )
            .map(blueprint => ({
                name: blueprint.teamName,
                date: new Date(blueprint.createdUtc).toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    }
                ),
                blueprintId: '' + blueprint.blueprintId,
            }));
    const rookieBps: Array<{name: string; date: string; blueprintId: string}> = 
        blueprints
            .filter(
                (bp) =>
                    bp.blueprintType === 'RookieDraft' 
                    && bp.deliveryStatus === 'Published'
            )
            .map(blueprint => ({
                name: blueprint.teamName,
                date: new Date(blueprint.createdUtc).toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    }
                ),
                blueprintId: '' + blueprint.blueprintId,
            }));
    const premiumBps: Array<{name: string; date: string; blueprintId: string}> = 
        blueprints
            .filter(
                (bp) =>
                    bp.blueprintType === 'Premium'
                    && bp.deliveryStatus === 'Published'
            )
            .map(blueprint => ({
                name: blueprint.teamName,
                date: new Date(blueprint.createdUtc).toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    }
                ),
                blueprintId: '' + blueprint.blueprintId,
            }));
    const infinites: Array<{name: string; date: string; blueprintId: string}> =
        blueprints
            .filter(bp => bp.blueprintType === 'Infinite' && bp.deliveryStatus === 'Published')
            .map(blueprint => ({
                name: blueprint.teamName,
                date: new Date(blueprint.createdUtc).toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    }
                ),
                blueprintId: '' + blueprint.blueprintId,
            }));

    function isInThePast(utcDateString: string): boolean {
        const date = new Date(utcDateString + 'Z'); // Append 'Z' to ensure it's parsed as UTC
        const now = new Date();
        return date < now;
    }

    async function acknowledgeExpiredSubscriptions() {
        const authToken = localStorage.getItem('flockAuthToken');
        const options = {
            method: 'POST',
            url: 'https://domainffapi.azurewebsites.net/api/InfiniteSubscriptions/acknowledge-expired',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        };
        await axios.request(options);
    }

    async function submitLogin() {
        setIsLoggingIn(true);
        const options = {
            method: 'POST',
            url: 'https://domainffapi.azurewebsites.net/api/Auth/flock',
            headers: {'Content-Type': 'application/json'},
            data: {flockEmailAddress: loginEmail, secretOrOtp: loginPassword},
        };
        axios
            .request(options)
            .then(res => {
                if (res.data.success) {
                    localStorage.setItem('flockAuthToken', res.data.token);
                    localStorage.setItem('flockEmail', res.data.flockEmail);
                    localStorage.setItem(
                        'flockUsername',
                        res.data.flockUsername
                    );
                    localStorage.setItem(
                        'domainUserId',
                        res.data.domainUserId
                    );
                    setIsLoggedIn(true);
                    setLoginModalOpen(false);
                    setLoginError('');
                    setDomainUserNotFound(false);
                } else {
                    setLoginError(`${res.data.code}: ${res.data.message}`);
                }
            })
            .catch(err => {
                if (err.response.data.code === 'DomainUserNotFound') {
                    setDomainUserNotFound(true);
                    return;
                }
                setLoginError(
                    `${err.response.data.code}: ${err.response.data.message}`
                );
                console.log(err);
            })
            .finally(() => {
                setIsLoggingIn(false);
                setLoginPassword('');
            });
    }

    const zoomIn = () => setZoomLevel(prev => prev * 1.1);
        // setZoomIndex(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
    const zoomOut = () => setZoomLevel(prev => prev / 1.1); //() => setZoomIndex(prev => Math.max(prev - 1, 0));

    function logout() {
        localStorage.removeItem('flockAuthToken');
        localStorage.removeItem('flockEmail');
        localStorage.removeItem('flockUsername');
        setIsLoggedIn(false);
    }

    const downloadInfiniteBlueprint = async () => {
        setIsDownloading(true);
        const element = document.getElementsByClassName(
            newInfiniteStyles.fullBlueprint
        )[0] as HTMLElement;

        await new Promise(resolve => setTimeout(resolve, 3000));

        const svgElement = element.querySelector('circle');
        if (svgElement) {
            element.querySelectorAll('.MuiMarkElement-series-QB').forEach(el => {
                (el as SVGCircleElement).setAttribute('fill', '#FF0019');
            });
            element.querySelectorAll('.MuiMarkElement-series-RB').forEach(el => {
                (el as SVGCircleElement).setAttribute('fill', '#00B1FF');
            });
            element.querySelectorAll('.MuiMarkElement-series-WR').forEach(el => {
                (el as SVGCircleElement).setAttribute('fill', '#1AE069');
            });
            element.querySelectorAll('.MuiMarkElement-series-TE').forEach(el => {
                (el as SVGCircleElement).setAttribute('fill', '#FFCD00');
            });
        }

        let dataUrl = '';
        const minDataLength = 5000000;
        let i = 0;
        const maxAttempts = 50;

        while (dataUrl.length < minDataLength && i < maxAttempts) {
            dataUrl = await toPng(element, {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                cacheBust: true,
                fetchRequestInit: {
                    mode: 'cors',
                    cache: 'reload',
                },
            });
            i += 1;
        }

        // const dataUrl = await toPng(element, {
        //     backgroundColor: 'rgba(0, 0, 0, 0)',
        //     cacheBust: true,
        //     fetchRequestInit: {
        //         mode: 'cors',
        //         cache: 'reload'
        //     },
        // });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${downloadBlueprintName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloading(false);
    };

    const downloadRookieBlueprint = async () => {
        setIsDownloading(true);
        const element = document.getElementsByClassName(
            newRookieStyles.fullBlueprint
        )[0] as HTMLElement;

        await new Promise(resolve => setTimeout(resolve, 3000));

        let dataUrl = '';
        const minDataLength = 2000000;
        let i = 0;
        const maxAttempts = 50;

        while (dataUrl.length < minDataLength && i < maxAttempts) {
            dataUrl = await toPng(element, {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                cacheBust: true,
                fetchRequestInit: {
                    mode: 'cors',
                    cache: 'reload',
                },
            });
            i += 1;
        }

        // const dataUrl = await toPng(element, {
        //     backgroundColor: 'rgba(0, 0, 0, 0)',
        //     cacheBust: true,
        //     fetchRequestInit: {
        //         mode: 'cors',
        //         cache: 'reload'
        //     },
        // });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${downloadBlueprintName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloading(false);
    };

    const downloadStandardBlueprint = async () => {
        setIsDownloading(true);
        const element = document.getElementsByClassName(
            newV1Styles.fullBlueprint
        )[0] as HTMLElement;

        await new Promise(resolve => setTimeout(resolve, 3000));

        let dataUrl = '';
        const minDataLength = isMobile ? 2000000 : 1200000;
        let i = 0;
        const maxAttempts = 50;

        while (dataUrl.length < minDataLength && i < maxAttempts) {
            dataUrl = await toPng(element, {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                cacheBust: true,
                fetchRequestInit: {
                    mode: 'cors',
                    cache: 'reload',
                },
            });
            i += 1;
        }

        // const dataUrl = await toPng(element, {
        //     backgroundColor: 'rgba(0, 0, 0, 0)',
        //     cacheBust: true,
        //     fetchRequestInit: {
        //         mode: 'cors',
        //         cache: 'reload'
        //     },
        // });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${downloadBlueprintName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloading(false);
    };

    const downloadPremiumBlueprint = async () => {
        setIsDownloading(true);
        const element = document.getElementsByClassName(
            premiumStyles.fullBlueprint
        )[0] as HTMLElement;

        await new Promise(resolve => setTimeout(resolve, 3000));

        let dataUrl = '';
        const minDataLength = isMobile ? 5000000 : 3000000;
        let i = 0;
        const maxAttempts = 50;

        while (dataUrl.length < minDataLength && i < maxAttempts) {
            dataUrl = await toPng(element, {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                cacheBust: true,
                fetchRequestInit: {
                    mode: 'cors',
                    cache: 'reload',
                },
            });
            i += 1;
        }

        // const dataUrl = await toPng(element, {
        //     backgroundColor: 'rgba(0, 0, 0, 0)',
        //     cacheBust: true,
        //     fetchRequestInit: {
        //         mode: 'cors',
        //         cache: 'reload'
        //     },
        // });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${downloadBlueprintName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloading(false);
    };

    const blueprintSections = [
        {key: 'standard', title: 'My Blueprints', accent: '#F47F20', items: bps, preview: PreviewType.Standard, showHelp: false},
        {key: 'premium', title: 'My Premium Blueprints', accent: '#B139E2', items: premiumBps, preview: PreviewType.Premium, showHelp: false},
        {key: 'rookie', title: 'My Rookie Blueprints', accent: '#00B1FF', items: rookieBps, preview: PreviewType.Rookie, showHelp: false},
        {key: 'infinite', title: 'My Infinite Blueprints', accent: '#1AE069', items: infinites, preview: PreviewType.Infinite, showHelp: true},
    ];
    const totalBlueprints =
        bps.length + premiumBps.length + rookieBps.length + infinites.length;
    const statCards = [
        {label: 'Total', value: totalBlueprints, accent: '#FFFFFF'},
        {label: 'Standard', value: bps.length, accent: '#F47F20'},
        {label: 'Premium', value: premiumBps.length, accent: '#B139E2'},
        {label: 'Rookie', value: rookieBps.length, accent: '#00B1FF'},
        {label: 'Infinite', value: infinites.length, accent: '#1AE069'},
    ];

    // ----- "By Team" grouping -----
    // Flatten all published blueprints into a uniform shape, then group by
    // leagueId with each league's blueprints sorted newest-first.
    const publishedItems: TeamBlueprint[] = blueprints
        .filter(
            bp =>
                bp.deliveryStatus === 'Published' &&
                TYPE_META[bp.blueprintType] !== undefined
        )
        .map(bp => {
            const meta = TYPE_META[bp.blueprintType];
            return {
                blueprintId: '' + bp.blueprintId,
                leagueId: bp.leagueId,
                teamName: bp.teamName,
                blueprintType: bp.blueprintType,
                typeLabel: meta.label,
                accent: meta.accent,
                previewType: meta.preview,
                createdUtc: bp.createdUtc,
                date: new Date(bp.createdUtc).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                }),
            };
        });

    const teamGroups: Array<{
        leagueId: string;
        teamName: string;
        items: TeamBlueprint[];
    }> = (() => {
        const byLeague = new Map<string, TeamBlueprint[]>();
        publishedItems.forEach(item => {
            const list = byLeague.get(item.leagueId) ?? [];
            list.push(item);
            byLeague.set(item.leagueId, list);
        });
        const groups = Array.from(byLeague.entries()).map(([leagueId, items]) => {
            const sorted = [...items].sort(
                (a, b) =>
                    new Date(b.createdUtc).getTime() -
                    new Date(a.createdUtc).getTime()
            );
            return {
                leagueId,
                // All blueprints in a league belong to the same team; label the
                // group with the most recent blueprint's team name.
                teamName: sorted[0].teamName,
                items: sorted,
            };
        });
        // Most recently active team first.
        groups.sort(
            (a, b) =>
                new Date(b.items[0].createdUtc).getTime() -
                new Date(a.items[0].createdUtc).getTime()
        );
        return groups;
    })();

    // Team names shared by more than one league get a subtitle so the otherwise
    // identical cards can be told apart.
    const duplicatedTeamNames = (() => {
        const counts = new Map<string, number>();
        teamGroups.forEach(g =>
            counts.set(g.teamName, (counts.get(g.teamName) ?? 0) + 1)
        );
        return new Set(
            Array.from(counts.entries())
                .filter(([, n]) => n > 1)
                .map(([name]) => name)
        );
    })();

    const leagueLabel = (leagueId: string) => `League …${leagueId.slice(-4)}`;

    const selectedGroup = selectedLeagueId
        ? teamGroups.find(t => t.leagueId === selectedLeagueId) ?? null
        : null;
    const selectedTeamItems: TeamBlueprint[] = selectedGroup?.items ?? [];

    // One chip per blueprint type present on a team (in TYPE_META order).
    const teamTypeChips = (items: TeamBlueprint[]) => {
        const counts = new Map<string, number>();
        items.forEach(it =>
            counts.set(it.blueprintType, (counts.get(it.blueprintType) ?? 0) + 1)
        );
        return Object.keys(TYPE_META)
            .filter(type => counts.has(type))
            .map(type => ({
                type,
                label: TYPE_META[type].label,
                accent: TYPE_META[type].accent,
                count: counts.get(type) ?? 0,
            }));
    };

    const openPreview = (item: TeamBlueprint) => {
        setDownloadBlueprintId(item.blueprintId);
        setDownloadBlueprintName(item.teamName);
        setPreviewType(item.previewType);
        setDownloadModalOpen(true);
    };

    return (
        <div>
            <Modal
                open={showExpiredPopup}
                onClose={() => {
                    acknowledgeExpiredSubscriptions();
                    setShowExpiredPopup(false);
                }}
            >
                <Box className={styles.expiredModal}>
                    <div className={styles.expiredModalHeader}>
                        <div style={{flex: 1}} />
                        <img src={expiredInfinitePromo} className={styles.expiredInfinitePromo} />
                        <IconButton 
                            style={{flex: 1}}
                            onClick={() => {
                                acknowledgeExpiredSubscriptions();
                                setShowExpiredPopup(false);
                            }}
                        >
                            <Close />
                        </IconButton>
                    </div>
                    <div className={styles.expiredModalText}>
                        {'Oh no. Your infinite blueprint has expired for the following team(s):'}
                    </div>
                    <div className={styles.expiredModalTeams}>
                        {expiredSubscriptions.map(subscription => (
                            <div className={styles.expiredModalTeam}>
                                → {subscription.teamName}
                            </div>
                        ))}
                    </div>
                    <div className={styles.expiredModalText}>
                        {'You can renew your infinite blueprint(s) for this year here:'}
                    </div>
                    <button
                        className={styles.continueSubscriptionButton}
                        onClick={() => {
                            window.open('https://bit.ly/domainbp', '_blank', 'noopener,noreferrer');
                        }}
                    >
                        {'>> CONTINUE MY SUBSCRIPTION <<'}
                    </button>
                    <div className={styles.expiredModalText}>
                        {'After you renew, message Nathan or Avery on Discord and get some free stuff!'}
                    </div>
                </Box>
            </Modal>
            <Modal
                open={showMembershipExpiredPopup}
                onClose={() => {
                    setShowMembershipExpiredPopup(false);
                }}
            >
                <Box className={styles.expiredMembershipModal}>
                    <div className={styles.expiredModalHeader}>
                        <div style={{flex: 1}} />
                        <img src={expiredMembershipPromo} className={styles.expiredInfinitePromo} />
                        <IconButton 
                            style={{flex: 1}}
                            onClick={() => {
                                setShowMembershipExpiredPopup(false);
                            }}
                        >
                            <Close />
                        </IconButton>
                    </div>
                    <div className={styles.expiredModalText}>
                        {'Oh no. Your domain membership has expired! We would love to have you back. '
                            + 'To access your infinite blueprint, renew your subscription here:'}
                    </div>
                    <button
                        className={styles.continueSubscriptionButtonGreen}
                        onClick={() => {
                            window.open('https://domain.football/domainrenew', '_blank', 'noopener,noreferrer');
                        }}
                    >
                        {'>> CONTINUE MY SUBSCRIPTION <<'}
                    </button>
                    <div className={styles.expiredModalText}>
                        {'After you renew, message Nathan or Avery on Discord and get some free stuff!'}
                    </div>
                </Box>
            </Modal>
            <Modal
                open={loginModalOpen}
                onClose={() => {}} // prevent close on unless you login.
            >
                <Box className={styles.loginModal} sx={{maxWidth: '75%'}}>
                    <img src={flockDomainLogo} className={styles.loginLogo} />
                    <div className={styles.loginTitle}>
                        BLUEPRINT DASHBOARD LOGIN
                    </div>
                    <div className={styles.loginDescription}>
                        Login using the same email and password used on the
                        Flock Fantasy website
                    </div>
                    <div>
                        <div className={styles.inputLabel}>Email Address</div>
                        <DomainTextField
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            onKeyUp={e =>
                                e.key === 'Enter' &&
                                loginEmail.trim() &&
                                loginPassword.trim() &&
                                submitLogin()
                            }
                            backgroundColor={'rgba(217, 217, 217, 0.20)'}
                            hideOutline={true}
                            inputWidth={
                                isMobile ? `${width * 0.65}px` : '360px'
                            }
                        />
                    </div>
                    <div>
                        <div className={styles.inputLabel}>Password</div>
                        <DomainTextField
                            type={'password'}
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            onKeyUp={e =>
                                e.key === 'Enter' &&
                                loginEmail.trim() &&
                                loginPassword.trim() &&
                                submitLogin()
                            }
                            backgroundColor={'rgba(217, 217, 217, 0.20)'}
                            hideOutline={true}
                            inputWidth={
                                isMobile ? `${width * 0.65}px` : '360px'
                            }
                        />
                    </div>
                    {domainUserNotFound && (
                        <>
                            <div>
                                <div className={styles.inputLabel}>
                                    Flock Username
                                </div>
                                <DomainTextField
                                    value={loginFlockUsername}
                                    onChange={e =>
                                        setLoginFlockUsername(e.target.value)
                                    }
                                    onKeyUp={e =>
                                        e.key === 'Enter' &&
                                        loginEmail.trim() &&
                                        loginPassword.trim() &&
                                        submitLogin()
                                    }
                                    backgroundColor={
                                        'rgba(217, 217, 217, 0.20)'
                                    }
                                    hideOutline={true}
                                    inputWidth={
                                        isMobile ? `${width * 0.65}px` : '360px'
                                    }
                                />
                            </div>
                            <div>
                                <div className={styles.inputLabel}>
                                    Sleeper Username
                                </div>
                                <DomainTextField
                                    value={loginSleeperUsername}
                                    onChange={e =>
                                        setLoginSleeperUsername(e.target.value)
                                    }
                                    onKeyUp={e =>
                                        e.key === 'Enter' &&
                                        loginEmail.trim() &&
                                        loginPassword.trim() &&
                                        submitLogin()
                                    }
                                    backgroundColor={
                                        'rgba(217, 217, 217, 0.20)'
                                    }
                                    hideOutline={true}
                                    inputWidth={
                                        isMobile ? `${width * 0.65}px` : '360px'
                                    }
                                />
                            </div>
                            <div>
                                <div className={styles.inputLabel}>
                                    Discord Username
                                </div>
                                <DomainTextField
                                    value={loginDiscordUsername}
                                    onChange={e =>
                                        setLoginDiscordUsername(e.target.value)
                                    }
                                    onKeyUp={e =>
                                        e.key === 'Enter' &&
                                        loginEmail.trim() &&
                                        loginPassword.trim() &&
                                        submitLogin()
                                    }
                                    backgroundColor={
                                        'rgba(217, 217, 217, 0.20)'
                                    }
                                    hideOutline={true}
                                    inputWidth={
                                        isMobile ? `${width * 0.65}px` : '360px'
                                    }
                                />
                            </div>
                        </>
                    )}
                    <div className={styles.needHelp}>
                        <a href={'https://discord.gg/hCPWDGn9Yb'}  target="_blank">Need Help?</a>
                    </div>
                    {loginError && (
                        <div className={styles.loginError}>{loginError}</div>
                    )}
                    <Button
                        sx={{
                            fontFamily: 'Acumin Pro Condensed',
                            color: '#04121C',
                            fontWeight: '700',
                            background:
                                'linear-gradient(180deg, #EA9A19 0%, #FF4200 100%)',
                            '&:disabled': {
                                background: 'gray',
                            },
                            width: '120px',
                            borderRadius: '10px',
                        }}
                        variant="contained"
                        onClick={() => {
                            submitLogin();
                        }}
                        disabled={!loginEmail.trim() || !loginPassword.trim()}
                        loading={isLoggingIn}
                    >
                        SIGN IN
                    </Button>
                </Box>
            </Modal>
            <Modal
                open={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
            >
                <Box
                    className={styles.downloadModal}
                    sx={{
                        width: isMaximized ? '100%' : null,
                        height: isMaximized ? '100%' : null,
                        maxWidth: isMaximized
                            ? 'none'
                            : `${PREVIEW_MODAL_MAX_WIDTH}px`,
                    }}
                >
                    <div className={styles.downloadModalHeader}>
                        <Button
                            variant="contained"
                            disableElevation
                            style={{
                                height: '40px',
                            }}
                            sx={{
                                background:
                                    'linear-gradient(180deg, #EA9A19 0%, #FF4200 100%)',
                                color: '#04121C',
                                borderRadius: '8px',
                                padding: '6px 18px 4px',
                                '&:hover': {
                                    background:
                                        'linear-gradient(180deg, #f4ad3d 0%, #ff5a26 100%)',
                                },
                                fontFamily: 'Acumin Pro',
                                fontWeight: '1000',
                                fontSize: '18px',
                                flexShrink: 0,
                            }}
                            onClick={() => {
                                switch (previewType) {
                                    case PreviewType.Infinite:
                                        downloadInfiniteBlueprint();
                                        break;
                                    case PreviewType.Rookie:
                                        downloadRookieBlueprint();
                                        break;
                                    case PreviewType.Standard:
                                        downloadStandardBlueprint();
                                        break;
                                    case PreviewType.Premium:
                                        downloadPremiumBlueprint();
                                        break;
                                }
                            }}
                            loading={isDownloading}
                            endIcon={isMobile ? null : <DownloadIcon />}
                        >
                            {isMobile ? <DownloadIcon /> : 'DOWNLOAD'}
                        </Button>
                        {!isMobile && downloadBlueprintName && (
                            <div className={styles.downloadModalTitle}>
                                {downloadBlueprintName}
                            </div>
                        )}
                        <div className={styles.toolbarControls}>
                            <IconButton
                                size="small"
                                sx={toolbarIconSx}
                                TouchRippleProps={{style: {color: 'white'}}}
                                onClick={() => zoomOut()}
                            >
                                <ZoomOutIcon sx={{color: 'white'}} />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={toolbarIconSx}
                                TouchRippleProps={{style: {color: 'white'}}}
                                onClick={() => zoomIn()}
                            >
                                <ZoomInIcon sx={{color: 'white'}} />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={toolbarIconSx}
                                TouchRippleProps={{style: {color: 'white'}}}
                                onClick={() => setIsMaximized(!isMaximized)}
                            >
                                {isMaximized ? (
                                    <CloseFullscreenIcon sx={{color: 'white'}} />
                                ) : (
                                    <OpenInFullIcon sx={{color: 'white'}} />
                                )}
                            </IconButton>
                            <span className={styles.toolbarDivider} />
                            <IconButton
                                size="small"
                                sx={toolbarIconSx}
                                TouchRippleProps={{style: {color: 'white'}}}
                                onClick={() => setDownloadModalOpen(false)}
                            >
                                <Close sx={{color: 'white'}} />
                            </IconButton>
                        </div>
                    </div>
                    <div
                        className={styles.zoomWrapper}
                        style={{
                            width: PREVIEW_DIMS[previewType]
                                ? `${PREVIEW_DIMS[previewType]!.w * zoomLevel}px`
                                : undefined,
                            height: PREVIEW_DIMS[previewType]
                                ? `${PREVIEW_DIMS[previewType]!.h * zoomLevel}px`
                                : undefined,
                        }}
                    >
                        <div
                            className={styles.zoomScaler}
                            style={{transform: `scale(${zoomLevel})`}}
                        >
                            {previewType === PreviewType.Infinite && (
                                <WrappedNewInfinite blueprintId={downloadBlueprintId} />
                            )}
                            {previewType === PreviewType.Rookie && (
                                <WrappedNewRookieDraft blueprintId={downloadBlueprintId} />
                            )}
                            {previewType === PreviewType.Standard && (
                                <WrappedNewV1 blueprintId={downloadBlueprintId} />
                            )}
                            {previewType === PreviewType.Premium && (
                                <WrappedPremium blueprintId={downloadBlueprintId} />
                            )}
                        </div>
                    </div>
                </Box>
            </Modal>
            {isLoggedIn && (
                <div className={styles.page}>
                    <header className={styles.topbar}>
                        <img src={logoHorizontal} className={styles.logo} />
                        <div className={styles.topbarTitle}>
                            BLUEPRINT DASHBOARD
                        </div>
                        <Button
                            variant="text"
                            style={{
                                padding: '8px 16px 5px 16px',
                                height: '42px',
                            }}
                            sx={{
                                backgroundColor: '#474E51',
                                color: 'white',
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: '#676b6dff',
                                },
                                fontFamily: 'Acumin Pro',
                                fontWeight: '1000',
                                fontSize: '18px',
                                flexShrink: 0,
                            }}
                            onClick={() => {
                                logout();
                            }}
                        >
                            Log Out
                        </Button>
                    </header>

                    <section className={styles.hero}>
                        <div className={styles.heroText}>
                            <div className={styles.welcome}>
                                Welcome back,{' '}
                                <span className={styles.username}>
                                    {username}
                                </span>
                            </div>
                            <div className={styles.description}>
                                Track your blueprints, review all of your
                                blueprints in one place, open a support ticket,
                                and more!
                            </div>
                        </div>
                        <div className={styles.statRow}>
                            {statCards.map(stat => (
                                <div
                                    key={stat.label}
                                    className={styles.statCard}
                                    style={{
                                        ['--accent' as string]: stat.accent,
                                    } as CSSProperties}
                                >
                                    <div className={styles.statValue}>
                                        {stat.value}
                                    </div>
                                    <div className={styles.statLabel}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className={styles.layout}>
                        <main className={styles.main}>
                            <div className={styles.viewBar}>
                                <span className={styles.viewBarLabel}>
                                    Group by
                                </span>
                                <div className={styles.viewToggle}>
                                    <button
                                        className={`${styles.viewToggleBtn} ${
                                            groupMode === 'type'
                                                ? styles.viewToggleBtnActive
                                                : ''
                                        }`}
                                        onClick={() => {
                                            setGroupMode('type');
                                            setSelectedLeagueId(null);
                                        }}
                                    >
                                        Type
                                    </button>
                                    <button
                                        className={`${styles.viewToggleBtn} ${
                                            groupMode === 'team'
                                                ? styles.viewToggleBtnActive
                                                : ''
                                        }`}
                                        onClick={() => {
                                            setGroupMode('team');
                                            setSelectedLeagueId(null);
                                        }}
                                    >
                                        Team
                                    </button>
                                </div>
                            </div>

                            {groupMode === 'type' &&
                                blueprintSections.map(sec => (
                                    <section
                                        key={sec.key}
                                        className={styles.section}
                                        style={{
                                            ['--accent' as string]: sec.accent,
                                        } as CSSProperties}
                                    >
                                        <div className={styles.sectionHead}>
                                            <span className={styles.sectionTitle}>
                                                {sec.title}
                                            </span>
                                            <span className={styles.countPill}>
                                                {sec.items.length}
                                            </span>
                                            <span className={styles.sectionRule} />
                                            {sec.showHelp && (
                                                <div className={styles.needHelp}>
                                                    <a
                                                        href={
                                                            'https://discord.gg/hCPWDGn9Yb'
                                                        }
                                                        target="_blank"
                                                    >
                                                        Need Help?
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.cardGrid}>
                                            {blueprintsLoading &&
                                                sec.items.length === 0 && (
                                                    <CircularProgress
                                                        sx={{color: sec.accent}}
                                                    />
                                                )}
                                            {!blueprintsLoading &&
                                                sec.items.length === 0 && (
                                                    <div
                                                        className={
                                                            styles.emptyState
                                                        }
                                                    >
                                                        No blueprints here yet.
                                                    </div>
                                                )}
                                            {sec.items.map(bp => (
                                                <BlueprintItem
                                                    key={bp.blueprintId}
                                                    name={bp.name}
                                                    date={bp.date}
                                                    accentColor={sec.accent}
                                                    onPreview={() => {
                                                        setDownloadBlueprintId(
                                                            bp.blueprintId
                                                        );
                                                        setDownloadBlueprintName(
                                                            bp.name
                                                        );
                                                        setPreviewType(
                                                            sec.preview
                                                        );
                                                        setDownloadModalOpen(
                                                            true
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ))}

                            {groupMode === 'team' && selectedLeagueId === null && (
                                <div className={styles.teamGrid}>
                                    {blueprintsLoading &&
                                        teamGroups.length === 0 && (
                                            <CircularProgress
                                                sx={{color: '#F47F20'}}
                                            />
                                        )}
                                    {!blueprintsLoading &&
                                        teamGroups.length === 0 && (
                                            <div className={styles.emptyState}>
                                                No blueprints yet.
                                            </div>
                                        )}
                                    {teamGroups.map(team => (
                                        <button
                                            key={team.leagueId}
                                            className={styles.teamCell}
                                            onClick={() =>
                                                setSelectedLeagueId(
                                                    team.leagueId
                                                )
                                            }
                                        >
                                            <div className={styles.teamCellTop}>
                                                <span
                                                    className={
                                                        styles.teamCellName
                                                    }
                                                >
                                                    {team.teamName}
                                                </span>
                                                <span
                                                    className={
                                                        styles.teamCellCount
                                                    }
                                                >
                                                    {team.items.length}
                                                </span>
                                            </div>
                                            {duplicatedTeamNames.has(
                                                team.teamName
                                            ) && (
                                                <span
                                                    className={
                                                        styles.teamCellSubtitle
                                                    }
                                                >
                                                    {leagueLabel(team.leagueId)}
                                                </span>
                                            )}
                                            <div className={styles.teamCellChips}>
                                                {teamTypeChips(team.items).map(
                                                    chip => (
                                                        <span
                                                            key={chip.type}
                                                            className={
                                                                styles.typeChip
                                                            }
                                                            style={{
                                                                ['--chip' as string]:
                                                                    chip.accent,
                                                            } as CSSProperties}
                                                        >
                                                            {chip.label}
                                                            {chip.count > 1
                                                                ? ` ×${chip.count}`
                                                                : ''}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {groupMode === 'team' && selectedGroup !== null && (
                                <section className={styles.section}>
                                    <div className={styles.teamDetailHead}>
                                        <button
                                            className={styles.backButton}
                                            onClick={() => setSelectedLeagueId(null)}
                                        >
                                            ← All Teams
                                        </button>
                                        <span className={styles.teamDetailTitle}>
                                            {selectedGroup.teamName}
                                        </span>
                                        {duplicatedTeamNames.has(
                                            selectedGroup.teamName
                                        ) && (
                                            <span
                                                className={
                                                    styles.teamDetailSubtitle
                                                }
                                            >
                                                {leagueLabel(
                                                    selectedGroup.leagueId
                                                )}
                                            </span>
                                        )}
                                        <span className={styles.teamDetailCount}>
                                            {selectedTeamItems.length}{' '}
                                            {selectedTeamItems.length === 1
                                                ? 'blueprint'
                                                : 'blueprints'}
                                        </span>
                                    </div>
                                    <div className={styles.cardGrid}>
                                        {selectedTeamItems.map(item => (
                                            <BlueprintItem
                                                key={item.blueprintId}
                                                name={item.typeLabel}
                                                date={item.date}
                                                accentColor={item.accent}
                                                onPreview={() =>
                                                    openPreview(item)
                                                }
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </main>
                        <aside className={styles.sidebar}>
                            {statusTrackerFlag && (
                                <BlueprintStatusTracker
                                    blueprints={blueprints}
                                    isMobile={isMobile}
                                />
                            )}
                        </aside>
                    </div>
                </div>
            )}
        </div>
    );
}

type BlueprintItemProps = {
    name: string;
    date: string;
    accentColor: string;
    onPreview: () => void;
};

function BlueprintItem({
    name,
    date,
    accentColor,
    onPreview,
}: BlueprintItemProps) {
    return (
        <div
            className={styles.card}
            style={{['--accent' as string]: accentColor} as CSSProperties}
        >
            <div className={styles.cardAccent} />
            <div className={styles.cardTop}>
                <div className={styles.shieldWrap}>
                    <DomainShield color={accentColor} />
                </div>
                <div className={styles.cardMeta}>
                    <div className={styles.cardName}>{name}</div>
                    <div className={styles.cardDate}>{date}</div>
                </div>
            </div>
            <Button
                variant="text"
                fullWidth
                style={{
                    padding: '8px 14px 5px 14px',
                    height: '40px',
                }}
                sx={{
                    backgroundColor: '#0F1A1F',
                    color: 'white',
                    borderRadius: '8px',
                    border: '1px solid #2E4349',
                    '&:hover': {
                        backgroundColor: accentColor,
                        color: '#04121C',
                        borderColor: accentColor,
                    },
                    fontFamily: 'Acumin Pro',
                    fontWeight: '1000',
                    fontSize: '16px',
                }}
                onClick={onPreview}
            >
                PREVIEW
            </Button>
        </div>
    );
}

const DomainShield = ({color = '#F47F20'}: {color?: string}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="66"
        height="100"
        viewBox="0 0 66 100"
        fill="none"
        className={styles.domainShield}
    >
        <path
            d="M55.7908 12.8465V22.2225C55.7908 22.5132 55.6055 22.7772 55.3281 22.8692L10.4561 38.3265C10.0161 38.4772 9.55347 38.1492 9.55347 37.6799V27.7345C9.55347 27.4439 9.73747 27.1799 10.0228 27.0879L16.8735 24.8252C17.3135 24.6839 17.7695 25.0039 17.7695 25.4732L17.7908 29.8625C17.7975 30.3319 18.2535 30.6585 18.6935 30.5092L24.9615 28.4105C25.2388 28.3185 25.4228 28.0625 25.4228 27.7705L25.4588 22.4639C25.4588 22.1719 25.6441 21.9092 25.9215 21.8172L36.3561 18.3519C36.7975 18.2025 37.2535 18.5305 37.2535 18.9999V23.3745C37.2535 23.8439 37.7148 24.1719 38.1561 24.0292L44.2241 22.0092C44.5015 21.9159 44.6935 21.6532 44.6935 21.3612V16.2185C44.6935 15.9265 44.8788 15.6705 45.1561 15.5705L54.8801 12.1999C55.3281 12.0425 55.7908 12.3705 55.7908 12.8465Z"
            fill={color}
        />
        <path
            d="M55.7908 27.3795V30.5315C55.7908 30.8301 55.6055 31.0861 55.3281 31.1848L10.4561 46.6355C10.0161 46.7848 9.55347 46.4581 9.55347 45.9888V42.3181C9.55347 42.0195 9.73747 41.7555 10.0228 41.6635L17.7975 39.1235L25.4228 36.5701L37.2535 32.6368L44.6935 30.1675L54.8868 26.7248C55.3361 26.5821 55.7908 26.9101 55.7908 27.3795Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M55.7908 27.3795V30.5315C55.7908 30.8301 55.6055 31.0861 55.3281 31.1848L10.4561 46.6355C10.0161 46.7848 9.55347 46.4581 9.55347 45.9888V42.3181C9.55347 42.0195 9.73747 41.7555 10.0228 41.6635L17.7975 39.1235L25.4228 36.5701L37.2535 32.6368L44.6935 30.1675L54.8868 26.7248C55.3361 26.5821 55.7908 26.9101 55.7908 27.3795Z"
            fill={color}
        />
        <path
            d="M55.7908 12.8465V22.2225C55.7908 22.5132 55.6055 22.7772 55.3281 22.8692L10.4561 38.3265C10.0161 38.4772 9.55347 38.1492 9.55347 37.6799V27.7345C9.55347 27.4439 9.73747 27.1799 10.0228 27.0879L16.8735 24.8252C17.3135 24.6839 17.7695 25.0039 17.7695 25.4732L17.7908 29.8625C17.7975 30.3319 18.2535 30.6585 18.6935 30.5092L24.9615 28.4105C25.2388 28.3185 25.4228 28.0625 25.4228 27.7705L25.4588 22.4639C25.4588 22.1719 25.6441 21.9092 25.9215 21.8172L36.3561 18.3519C36.7975 18.2025 37.2535 18.5305 37.2535 18.9999V23.3745C37.2535 23.8439 37.7148 24.1719 38.1561 24.0292L44.2241 22.0092C44.5015 21.9159 44.6935 21.6532 44.6935 21.3612V16.2185C44.6935 15.9265 44.8788 15.6705 45.1561 15.5705L54.8801 12.1999C55.3281 12.0425 55.7908 12.3705 55.7908 12.8465Z"
            fill={color}
        />
        <path
            d="M9.55319 37.6799V27.7345C9.55319 27.4439 9.73853 27.1799 10.0225 27.0879L16.8732 24.8252C17.3145 24.6839 17.7692 25.0039 17.7692 25.4732L17.7905 29.8625C17.7972 30.3319 18.2532 30.6585 18.6945 30.5092L24.9612 28.4105C25.2385 28.3185 25.4239 28.0625 25.4239 27.7705L25.4585 22.4639C25.4585 22.1719 25.6439 21.9092 25.9212 21.8172L36.3572 18.3519C36.7972 18.2025 37.2532 18.5305 37.2532 18.9999V23.3745C37.2532 23.8439 37.7159 24.1719 38.1572 24.0292L44.2239 22.0092C44.5012 21.9159 44.6932 21.6532 44.6932 21.3612V16.2185C44.6932 15.9265 44.8785 15.6705 45.1559 15.5705L54.8799 12.1999C55.3279 12.0425 55.7905 12.3705 55.7905 12.8465V22.2225C55.7905 22.5132 55.6065 22.7772 55.3279 22.8692L10.4572 38.3265C10.0159 38.4772 9.55319 38.1492 9.55319 37.6799Z"
            fill={color}
        />
        <path
            d="M9.55319 45.9884V42.3178C9.55319 42.0191 9.73853 41.7564 10.0225 41.6631L17.7972 39.1244L25.4239 36.5698L37.2532 32.6364L44.6932 30.1684L54.8879 26.7244C55.3359 26.5831 55.7905 26.9098 55.7905 27.3791V30.5311C55.7905 30.8298 55.6065 31.0858 55.3279 31.1858L10.4572 46.6351C10.0159 46.7858 9.55319 46.4578 9.55319 45.9884Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M61.944 72.8773C61.944 73.1187 61.9373 73.532 61.9373 73.9093C61.9293 74.492 61.6453 75.04 61.168 75.3813C60.8987 75.5733 60.6133 75.7867 60.408 75.936L34.9693 94.9573C34.6 95.228 33.9453 95.6827 33.4333 96.0387C32.9773 96.3587 32.38 96.3587 31.9253 96.0467C31.4053 95.6827 30.7507 95.228 30.388 94.9573L4.872 75.964C4.64533 75.8013 4.25333 75.4733 3.92667 75.196C3.54933 74.876 3.336 74.4133 3.32934 73.9227V24.996C3.32934 24.6547 3.32933 24.0653 3.336 23.5173C3.34266 22.7906 3.79867 22.144 4.48133 21.8947C4.97867 21.7107 5.53467 21.5107 5.91867 21.376L31.5053 12.612L31.52 12.6053H31.5333L57 4.28932L59.916 3.37199C60.9413 3.04398 61.9867 3.80532 62.0013 4.87999C62.0147 6.07465 62.0227 7.41199 62.0227 7.93066L61.944 72.8773ZM65.2587 4.85065C65.2307 2.17599 63.04 -1.52588e-05 60.3653 -1.52588e-05C59.8667 -1.52588e-05 59.3693 0.0786591 58.892 0.226662L55.948 1.15865L30.5453 9.45332C30.4813 9.47466 30.4093 9.49599 30.3453 9.51732L4.82267 18.26C4.424 18.4026 3.84133 18.608 3.31467 18.8013C1.35067 19.5187 0.0280014 21.3973 0.00666809 23.488C0.00666809 24.0427 0 24.648 0 24.996V73.9373C0.0133333 75.396 0.654669 76.768 1.764 77.708C2.42534 78.2693 2.70934 78.4893 2.86667 78.6107L28.3827 97.604C28.7093 97.8387 29.2573 98.2293 30.012 98.756C30.7947 99.2893 31.6973 99.5667 32.636 99.5667C33.5827 99.5667 34.4853 99.2893 35.2613 98.7493C36.0147 98.2293 36.5627 97.8387 36.8973 97.5893L62.3427 78.5747C62.5267 78.4333 62.8053 78.2333 63.0533 78.056C64.3693 77.1093 65.1667 75.5733 65.188 73.944C65.1947 73.5453 65.1947 73.1333 65.1947 72.884L65.2733 7.94532C65.28 7.41865 65.2667 6.05332 65.2587 4.85065Z"
            fill={color}
        />
        <path
            d="M9.55319 37.6799V27.7345C9.55319 27.4439 9.73853 27.1799 10.0225 27.0879L16.8732 24.8252C17.3145 24.6839 17.7692 25.0039 17.7692 25.4732L17.7905 29.8625C17.7972 30.3319 18.2532 30.6585 18.6945 30.5092L24.9612 28.4105C25.2385 28.3185 25.4239 28.0625 25.4239 27.7705L25.4585 22.4639C25.4585 22.1719 25.6439 21.9092 25.9212 21.8172L36.3572 18.3519C36.7972 18.2025 37.2532 18.5305 37.2532 18.9999V23.3745C37.2532 23.8439 37.7159 24.1719 38.1572 24.0292L44.2239 22.0092C44.5012 21.9159 44.6932 21.6532 44.6932 21.3612V16.2185C44.6932 15.9265 44.8785 15.6705 45.1559 15.5705L54.8799 12.1999C55.3279 12.0425 55.7905 12.3705 55.7905 12.8465V22.2225C55.7905 22.5132 55.6065 22.7772 55.3279 22.8692L10.4572 38.3265C10.0159 38.4772 9.55319 38.1492 9.55319 37.6799Z"
            fill={color}
        />
        <path
            d="M9.55319 45.9884V42.3178C9.55319 42.0191 9.73853 41.7564 10.0225 41.6631L17.7972 39.1244L25.4239 36.5698L37.2532 32.6364L44.6932 30.1684L54.8879 26.7244C55.3359 26.5831 55.7905 26.9098 55.7905 27.3791V30.5311C55.7905 30.8298 55.6065 31.0858 55.3279 31.1858L10.4572 46.6351C10.0159 46.7858 9.55319 46.4578 9.55319 45.9884Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M55.7908 27.3795V30.5315C55.7908 30.8301 55.6055 31.0861 55.3281 31.1848L10.4561 46.6355C10.0161 46.7848 9.55347 46.4581 9.55347 45.9888V42.3181C9.55347 42.0195 9.73747 41.7555 10.0228 41.6635L17.7975 39.1235L25.4228 36.5701L37.2535 32.6368L44.6935 30.1675L54.8868 26.7248C55.3361 26.5821 55.7908 26.9101 55.7908 27.3795Z"
            fill={color}
        />
        <path
            d="M55.7908 12.8465V22.2225C55.7908 22.5132 55.6055 22.7772 55.3281 22.8692L10.4561 38.3265C10.0161 38.4772 9.55347 38.1492 9.55347 37.6799V27.7345C9.55347 27.4439 9.73747 27.1799 10.0228 27.0879L16.8735 24.8252C17.3135 24.6839 17.7695 25.0039 17.7695 25.4732L17.7908 29.8625C17.7975 30.3319 18.2535 30.6585 18.6935 30.5092L24.9615 28.4105C25.2388 28.3185 25.4228 28.0625 25.4228 27.7705L25.4588 22.4639C25.4588 22.1719 25.6441 21.9092 25.9215 21.8172L36.3561 18.3519C36.7975 18.2025 37.2535 18.5305 37.2535 18.9999V23.3745C37.2535 23.8439 37.7148 24.1719 38.1561 24.0292L44.2241 22.0092C44.5015 21.9159 44.6935 21.6532 44.6935 21.3612V16.2185C44.6935 15.9265 44.8788 15.6705 45.1561 15.5705L54.8801 12.1999C55.3281 12.0425 55.7908 12.3705 55.7908 12.8465Z"
            fill={color}
        />
        <path
            d="M32.6437 42.1256H32.6371V41.8696H32.6437V42.1256Z"
            fill={color}
        />
        <path
            d="M32.6378 41.9655V42.1268L32.6405 42.1242V41.9655H32.6378Z"
            fill={color}
        />
        <path
            d="M32.6437 42.0256H32.6371V41.8695H32.6437V42.0256Z"
            fill={color}
        />
        <path
            d="M32.6405 88.3354L32.6385 88.3334L32.6405 88.3354Z"
            fill={color}
        />
    </svg>
);
