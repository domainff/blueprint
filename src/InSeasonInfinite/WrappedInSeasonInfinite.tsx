import {useBlueprint} from '../hooks/hooks';
import InSeasonInfinite from './InSeasonInfinite';
import {buildInSeasonInfiniteProps} from './buildInSeasonInfiniteProps';

/**
 * Dashboard entry point for the in-season (weekly, 2026+) Infinite format, mirroring
 * WrappedNewInfinite / WrappedNewV1 / WrappedPremium: fetches the blueprint by id and
 * renders the canvas. Nothing renders until the blueprint arrives; the dashboard's
 * zoom wrapper already reserves the 6134x3795 footprint.
 *
 * Kept separate from InSeasonInfinite.tsx so that file stays a byte-for-byte copy of
 * the Domain module's preview component (see the header there).
 */
export function WrappedInSeasonInfinite({blueprintId}: {blueprintId: string}) {
    const {blueprint} = useBlueprint(blueprintId);
    if (!blueprint) return null;
    return <InSeasonInfinite {...buildInSeasonInfiniteProps(blueprint)} />;
}
