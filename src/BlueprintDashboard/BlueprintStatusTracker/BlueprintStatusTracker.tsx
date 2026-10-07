import {useEffect, useMemo, useState, type CSSProperties} from 'react';
import type {BlueprintMetadata} from '../../hooks/hooks';
import styles from './BlueprintStatusTracker.module.css';
import {Cart, Chat, ChevronDown, ClipboardCheck, Clock, Help, Hourglass, LogOut, Pencil, Send, Ticket} from '../icons';

type Props = {
    blueprints: BlueprintMetadata[];
    /** "Team — League" when two teams share a name, else the team name. */
    labelFor: (bp: BlueprintMetadata) => string;
    onLogout: () => void;
};

// The four delivery steps, in order. deliveryStatus values the API sends:
// (empty/other) → Submitted, "Queued", "InProgress", "Published" → Sent.
const STEPS = [
    {key: 'Submitted', label: 'Submitted', color: '#E8263A', Icon: ClipboardCheck, line: "We've got your order. It'll join the queue shortly."},
    {key: 'Queued', label: 'Queued', color: '#FF4200', Icon: Hourglass, line: "You're in line. Current wait time is 7–10 days."},
    {key: 'InProgress', label: 'In progress', color: '#00B1FF', Icon: Pencil, line: 'Your blueprint is being built now.'},
    {key: 'Published', label: 'Sent', color: '#1AE069', Icon: Send, line: "Your blueprint is finished and delivered. Open it from your team's blueprints."},
] as const;

const stepIndex = (status?: string) => {
    const i = STEPS.findIndex(s => s.key === status);
    return i < 0 ? 0 : i;
};

/**
 * Where a blueprint is in delivery: pick the blueprint, see its step on the
 * four-step track, the wait time, and the actions (buy, ticket, community, log out).
 */
export default function BlueprintStatusTracker({blueprints, labelFor, onLogout}: Props) {
    const [selectedId, setSelectedId] = useState<string>('');
    useEffect(() => {
        if (blueprints.length > 0 && !blueprints.some(b => '' + b.blueprintId === selectedId)) {
            setSelectedId('' + blueprints[0].blueprintId);
        }
    }, [blueprints, selectedId]);
    const selected = useMemo(() => blueprints.find(b => '' + b.blueprintId === selectedId), [blueprints, selectedId]);
    const idx = stepIndex(selected?.deliveryStatus);
    const step = STEPS[idx];
    const StepIcon = step.Icon;

    return (
        <div className={styles.tracker}>
            <div className={styles.head}>
                <h2 className={styles.title}>Status tracker</h2>
                <span className={styles.ey}>Blueprint</span>
            </div>

            <label className={styles.ey} htmlFor="tracker-team">Team</label>
            <div className={styles.selectWrap}>
                <select id="tracker-team" className={styles.select} value={selectedId} onChange={e => setSelectedId(e.target.value)} disabled={blueprints.length === 0}>
                    {blueprints.length === 0 && <option value="">No blueprints yet</option>}
                    {blueprints.map(bp => (
                        <option key={bp.blueprintId} value={'' + bp.blueprintId}>{labelFor(bp)}</option>
                    ))}
                </select>
                <ChevronDown className={styles.selectChevron} />
            </div>

            {selected && (
                <div className={styles.card} style={{['--sc' as string]: step.color} as CSSProperties}>
                    <div className={styles.statusRow}>
                        <span className={styles.iconTile}><StepIcon /></span>
                        <div className={styles.statusText}>
                            <span className={styles.ey}>Current status</span>
                            <span className={styles.statusWord}>{step.label}</span>
                        </div>
                        <div className={styles.stepCount}>
                            <span className={styles.ey}>Step</span>
                            <span className={styles.stepNum}>{idx + 1}<span className={styles.stepOf}> / 4</span></span>
                        </div>
                    </div>
                    <p className={styles.line}>{step.line}</p>
                    <div className={styles.stepwrap}>
                        <span className={styles.track} />
                        <span className={styles.fill} style={{width: `${25 * idx}%`}} />
                        <ol className={styles.stepper} aria-label={`Blueprint progress, step ${idx + 1} of 4`}>
                            {STEPS.map((s, i) => {
                                const Icon = s.Icon;
                                const state = i < idx ? styles.done : i === idx ? styles.cur : '';
                                return (
                                    <li key={s.key} className={state} style={{['--sc' as string]: s.color} as CSSProperties} aria-current={i === idx ? 'step' : undefined}>
                                        <span className={styles.nd}><Icon /></span>
                                        {s.label}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                    <div className={styles.updated}>Updated {formatUpdatedDate(selected.updatedUtc)}</div>
                </div>
            )}

            <div className={styles.waitCard}>
                <span className={styles.waitIcon}><Clock /></span>
                <div>
                    <span className={styles.ey}>Current wait time</span>
                    <span className={styles.waitValue}>7–10 days</span>
                </div>
            </div>

            <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.btnHot}`} href="https://bit.ly/domainbp" target="_blank" rel="noreferrer"><Cart />Buy a blueprint</a>
                <div className={styles.twoUp}>
                    <a className={styles.btn} href="https://discord.gg/6hcUy6Hrcu" target="_blank" rel="noreferrer"><Ticket />Submit a ticket</a>
                    <a className={styles.btn} href="https://discord.gg/wfCHv9gjmd" target="_blank" rel="noreferrer"><Chat />Community</a>
                </div>
                <button type="button" className={styles.btn} onClick={onLogout}><LogOut />Log out</button>
                <a className={styles.help} href="https://discord.gg/hCPWDGn9Yb" target="_blank" rel="noreferrer"><Help />Need help? Ask on Discord</a>
            </div>
        </div>
    );
}

const formatUpdatedDate = (isoString?: string): string => {
    if (!isoString) return 'unknown';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    }).replace(', ', ' · ');
};
