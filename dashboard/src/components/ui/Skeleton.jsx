import "./Skeleton.css";

const Skeleton = ({ variant = "rect", width, height, className = "", style = {} }) => {
    return <div className={`skeleton skeleton-${variant} ${className}`} style={{ width, height, ...style }} />;
};

export default Skeleton;
