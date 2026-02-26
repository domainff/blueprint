import { useEffect, useState } from "react";
import { useNonSleeper } from "../hooks/hooks";
import { Roster } from "../sleeper-api/sleeper-api";
import NonSleeperInput from "./NonSleeperInput";
import { Box, Button, Modal } from "@mui/material";
import styles from "./NonSleeperInputWrapper.module.css";
import axios from "axios";
import { flockDomainLogo } from "../consts/images";
import DomainTextField from "../shared/DomainTextField";
import { useScreenSize } from "../BlueprintDashboard/BlueprintDashboard";
import { Download } from "@mui/icons-material";
import { BENCH, FLEX, QB, RB, SUPER_FLEX, TE, WR } from "../consts/fantasy";

type NonSleeperTeam = {
    appUserGuid: string;
    platform: string;
    teamName: string;
    season: number;
    leagueSettings: {
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
    players: Array<{sleeperBotId: number}>;
    draftPicks: Array<{season: number, round: number, slot: number}>
};

export default function NonSleeperInputWrapper() {
    const {width} = useScreenSize();
    const isMobile = width < 600;
    const [isLoggedIn, setIsLoggedIn] = useState(
        sessionStorage.getItem('flockAuthToken') !== null
    );
    const [loginModalOpen, setLoginModalOpen] = useState(!isLoggedIn);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginFlockUsername, setLoginFlockUsername] = useState('');
    const [loginSleeperUsername, setLoginSleeperUsername] = useState('');
    const [loginDiscordUsername, setLoginDiscordUsername] = useState('');
    const [loginError, setLoginError] = useState('');
    const [domainUserNotFound, setDomainUserNotFound] = useState(false);
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
        draftPicks,
        setDraftPicks,
        platform,
        setPlatform,
    } = useNonSleeper(undefined, undefined, setRoster);
    const [nonSleeperTeam, setNonSleeperTeam] = useState<NonSleeperTeam>();
    useEffect(() => {
        setNonSleeperTeam({
            appUserGuid: sessionStorage.getItem('domainUserId')!,
            platform: platform,
            teamName: teamName,
            season: 2026,
            leagueSettings: {
                numberOfTeams: numRosters,
                isSuperFlex: nonSleeperRosterSettings.get(SUPER_FLEX)! > 0,
                pointsPerReception: ppr,
                tightEndPremium: teBonus,
                taxiSpots: taxiSlots,
                quarterbackSlots: nonSleeperRosterSettings.get(QB)!,
                runningBackSlots: nonSleeperRosterSettings.get(RB)!,
                wideReceiverSlots: nonSleeperRosterSettings.get(WR)!,
                tightEndSlots: nonSleeperRosterSettings.get(TE)!,
                flexSlots: nonSleeperRosterSettings.get(FLEX)!,
                benchSlots: nonSleeperRosterSettings.get(BENCH)!
            },
            players: nonSleeperIds.map((id) => ({sleeperBotId: parseInt(id)})),
            draftPicks: draftPicks
        });
    }, [nonSleeperIds, nonSleeperRosterSettings, ppr, teBonus, numRosters, taxiSlots, teamName, draftPicks, platform]);

    useEffect(() => {
        if (!isLoggedIn) {
            setLoginModalOpen(true);
        }
    }, [isLoggedIn]);

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
                    sessionStorage.setItem('flockAuthToken', res.data.token);
                    sessionStorage.setItem('flockEmail', res.data.flockEmail);
                    sessionStorage.setItem(
                        'flockUsername',
                        res.data.flockUsername
                    );
                    sessionStorage.setItem(
                        'domainUserId',
                        res.data.domainUserId
                    );
                    setIsLoggedIn(true);
                    setLoginModalOpen(false);
                    setLoginError('');
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

    function logout() {
        sessionStorage.removeItem('flockAuthToken');
        sessionStorage.removeItem('flockEmail');
        sessionStorage.removeItem('flockUsername');
        sessionStorage.removeItem('domainUserId');
        setIsLoggedIn(false);
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
            <Button
                variant="outlined"
                onClick={logout}
            >
                    Logout
                </Button>
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
                draftPicks={draftPicks}
                setDraftPicks={setDraftPicks}
                platform={platform}
                setPlatform={setPlatform}
            />
            {/* <div className={styles.confirmationMessage}>
                Please confirm this is the accurate team to review and is up to
                date and make any changes necessary. To submit the team for the
                FIRST iteration of the infinite blueprint, click the button
                below saying "Copy league settings and roster," and paste it and
                respond to the message on the flock site. For later updates,
                reply to the email with the pasted link as the contents. Thank
                you!
            </div> */}
            <Button
                variant="outlined"
                onClick={() => {
                    const nonSleeperTeamJson = JSON.stringify(nonSleeperTeam, null, 2);
                    const blob = new Blob([nonSleeperTeamJson], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${teamName || 'nonsleeper'}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                }}
                startIcon={<Download />}
            >
                Download JSON
            </Button>
        </div>
    );
}
