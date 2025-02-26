// ONLY CHANGE THIS FILE WHEN CORRESPONDING FILES CHANGE IN THE dynasty-ff REPO

import {
    Autocomplete,
    Button,
    FormControl,
    SlotComponentProps,
    TextField,
    IconButton,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
} from "@mui/material";
import { QB, RB, WR, TE, FLEX, SUPER_FLEX, BENCH } from "../consts/fantasy";
import { useAdpData, useAllPlayers, usePlayerData } from "../hooks/hooks";
import {
    NumberInputInputSlotPropsOverrides,
    NumberInputOwnerState,
    NumberInputProps,
    Unstable_NumberInput,
} from "@mui/base/Unstable_NumberInput";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface NonSleeperInputProps {
    nonSleeperIds: string[];
    setNonSleeperIds: (ids: string[]) => void;
    teamName: string;
    setTeamName: (name: string) => void;
    nonSleeperRosterSettings: Map<string, number>;
    setNonSleeperRosterSettings: (settings: Map<string, number>) => void;
    ppr: number;
    setPpr: (ppr: number) => void;
    teBonus: number;
    setTeBonus: (teBonus: number) => void;
    numRosters: number;
    setNumRosters: (numRosters: number) => void;
    taxiSlots: number;
    setTaxiSlots: (taxiSlots: number) => void;
}

export default function NonSleeperInput({
    nonSleeperIds,
    setNonSleeperIds,
    teamName,
    setTeamName,
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
}: NonSleeperInputProps) {
    const allPlayers = useAllPlayers();
    const [player, setPlayer] = useState<string>("");
    const [playerAdded, setPlayerAdded] = useState(false);
    useEffect(() => {
        setPlayerAdded(nonSleeperIds.includes(player));
    }, [nonSleeperIds, player]);
    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <PlayerSearchInput player={player} setPlayer={setPlayer} />
                <Button
                    disabled={!player}
                    onClick={() => {
                        if (playerAdded) {
                            setNonSleeperIds(
                                nonSleeperIds.filter((id) => id !== player)
                            );
                        } else {
                            setNonSleeperIds([...nonSleeperIds, player]);
                        }
                    }}
                >
                    {playerAdded ? "Remove" : "Add"}
                </Button>
            </div>
            <TextField
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                label="Team Name"
            />
            <PlayerSelectComponent
                playerIds={allPlayers}
                selectedPlayerIds={nonSleeperIds}
                onChange={setNonSleeperIds}
                multiple={true}
                label="Non-Sleeper Roster"
                styles={{ minWidth: "200px", maxWidth: "80vw" }}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    {[QB, RB, WR, TE, FLEX, SUPER_FLEX, BENCH].map(
                        (position) => (
                            <StyledNumberInput
                                key={position}
                                value={nonSleeperRosterSettings.get(position)}
                                onChange={(_, value) => {
                                    const newMap = new Map(
                                        nonSleeperRosterSettings
                                    );
                                    newMap.set(position, value || 0);
                                    setNonSleeperRosterSettings(newMap);
                                }}
                                label={position}
                                min={0}
                                max={100}
                            />
                        )
                    )}
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    <StyledNumberInput
                        value={ppr}
                        onChange={(_, value) => {
                            setPpr(value || 0);
                        }}
                        label="PPR"
                        step={0.5}
                        min={0}
                        max={10}
                    />
                    <StyledNumberInput
                        value={teBonus}
                        onChange={(_, value) => {
                            setTeBonus(value || 0);
                        }}
                        label="TE Bonus"
                        step={0.5}
                        min={0}
                        max={10}
                    />
                    <StyledNumberInput
                        value={numRosters}
                        onChange={(_, value) => {
                            setNumRosters(value || 0);
                        }}
                        label="League Size"
                        step={1}
                        min={2}
                        max={100}
                    />
                    <StyledNumberInput
                        value={taxiSlots}
                        onChange={(_, value) => {
                            setTaxiSlots(value || 0);
                        }}
                        label="Taxi Slots"
                        step={1}
                        min={0}
                        max={10}
                    />
                </div>
            </div>
        </>
    );
}

function PlayerSearchInput({
    player,
    setPlayer,
}: {
    player: string;
    setPlayer: (player: string) => void;
}) {
    const allPlayers = useAllPlayers();
    const playerData = usePlayerData();
    const [inputValue, setInputValue] = useState("");

    if (!playerData) return <></>;
    return (
        <FormControl
            style={{ margin: "4px", minWidth: "200px", width: "fit-content" }}
        >
            <Autocomplete
                options={allPlayers}
                getOptionLabel={(option) => {
                    const p = playerData[option];
                    if (!p) return "";
                    return `${p.first_name} ${p.last_name}`;
                }}
                autoHighlight
                value={player}
                onChange={(_event, newInputValue, reason) => {
                    if (reason === "clear" || newInputValue === null) {
                        return;
                    }
                    setPlayer(newInputValue);
                }}
                inputValue={inputValue}
                onInputChange={(_event, value, _reason) => {
                    setInputValue(value);
                }}
                renderInput={(params) => (
                    <TextField {...params} label={"Search for Player"} />
                )}
            />
        </FormControl>
    );
}

function StyledNumberInput(props: NumberInputProps & { label?: string }) {
    return (
        <Unstable_NumberInput
            slots={{
                input: TextField,
                incrementButton: IconButton,
                decrementButton: IconButton,
            }}
            slotProps={{
                root: {
                    style: { display: "flex" },
                },
                input: {
                    style: { width: "70px" },
                    label: props.label,
                } as SlotComponentProps<
                    "input",
                    NumberInputInputSlotPropsOverrides,
                    NumberInputOwnerState
                >,
                incrementButton: {
                    children: <AddIcon />,
                    style: { order: "1" },
                },
                decrementButton: {
                    children: <RemoveIcon />,
                },
            }}
            {...props}
        />
    );
}

function PlayerSelectComponent(props: {
    playerIds: string[];
    selectedPlayerIds: string[];
    onChange: (newPlayerIds: string[]) => void;
    nonIdPlayerOptions?: string[];
    position?: string;
    label?: string;
    multiple?: boolean;
    maxSelections?: number;
    styles?: React.CSSProperties;
}) {
    const {
        playerIds,
        selectedPlayerIds,
        onChange,
        position,
        nonIdPlayerOptions,
        label,
        multiple,
        maxSelections,
        styles,
    } = props;
    const { sortByAdp } = useAdpData();
    const playerData = usePlayerData();
    const [allPlayerOptions, setAllPlayerOptions] = useState<string[]>([]);
    console.log("selectedPlayerIds", selectedPlayerIds);

    useEffect(() => {
        if (!playerData) return;
        const playerOpts = playerIds
            .map((playerId) => playerData[playerId])
            .filter((player) => !!player)
            .sort(sortByAdp)
            .map((p) => p.player_id);
        if (nonIdPlayerOptions) {
            playerOpts.push(...nonIdPlayerOptions);
        }
        setAllPlayerOptions(playerOpts);
    }, [playerIds, playerData, nonIdPlayerOptions]);
    if (!playerData || allPlayerOptions.length === 0) return <></>;

    return (
        <FormControl style={{ margin: "4px", minWidth: "100px", ...styles }}>
            <InputLabel>{label ?? position ?? "Player"}</InputLabel>
            <Select
                value={selectedPlayerIds}
                label={label ?? position ?? "Player"}
                onChange={(e: SelectChangeEvent<string[]>) => {
                    const {
                        target: { value },
                    } = e;
                    const newPlayerIds =
                        typeof value === "string" ? value.split(",") : value;
                    if (
                        multiple &&
                        maxSelections &&
                        newPlayerIds.length > maxSelections
                    ) {
                        return;
                    }
                    onChange(newPlayerIds);
                }}
                multiple={multiple ?? true}
            >
                {allPlayerOptions.map((option, idx) => {
                    const player = playerData[option];
                    const value = !player ? option : player.player_id;
                    const display = !player
                        ? option
                        : `${player.first_name} ${player.last_name}`;
                    return (
                        <MenuItem value={value} key={idx}>
                            {display}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
