import Skeleton from "./ui/Skeleton";

export default function RouteFallback() {
    return (
        <div className="container section" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Skeleton height="32px" width="40%" />
            <Skeleton height="16px" width="70%" />
            <Skeleton height="220px" />
        </div>
    );
}
