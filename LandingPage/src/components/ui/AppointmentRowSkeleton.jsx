import Skeleton from "./Skeleton";
import "./AppointmentRowSkeleton.css";

export default function AppointmentRowSkeleton() {
    return (
        <div className="appointment-row-skeleton card" aria-hidden="true">
            <div>
                <Skeleton height="16px" width="160px" />
                <Skeleton height="12px" width="120px" style={{ marginTop: "10px" }} />
            </div>
            <Skeleton height="24px" width="90px" radius="var(--radius-full)" />
        </div>
    );
}
