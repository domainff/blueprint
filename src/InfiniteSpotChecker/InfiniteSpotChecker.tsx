import { useSearchParams } from "react-router-dom";
import { WrappedNewInfinite } from "../NewInfinite/NewInfinite";

export default function InfiniteSpotChecker() {
    const [searchParams] = useSearchParams();
    const blueprintId = searchParams.get('blueprintId');
    if (!blueprintId) return null;
    return (
        <WrappedNewInfinite blueprintId={blueprintId} />
    );
}