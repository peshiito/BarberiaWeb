import Skeleton from "./Skeleton";
import "./BarberCardSkeleton.css";

export default function BarberCardSkeleton() {
    return (
        <div className="barber-card-skeleton card" aria-hidden="true">
            <Skeleton className="barber-card-skeleton-image" radius="0" />
            <div className="barber-card-skeleton-body">
                <Skeleton height="18px" width="55%" />
                <Skeleton height="13px" width="90%" style={{ marginTop: "10px" }} />
                <Skeleton height="13px" width="70%" style={{ marginTop: "6px" }} />
            </div>
        </div>
    );
}
