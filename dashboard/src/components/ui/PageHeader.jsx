import { Link } from "react-router-dom";
import "./PageHeader.css";

const PageHeader = ({ eyebrow, breadcrumb, title, titleAccent, description, action, status }) => {
    return (
        <div className="page-header">
            {breadcrumb ? (
                <nav className="page-header-breadcrumb" aria-label="Ruta">
                    {breadcrumb.map((crumb, i) => (
                        <span key={crumb.label} className="page-header-crumb">
                            {i > 0 && <span className="page-header-crumb-sep">/</span>}
                            {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                        </span>
                    ))}
                </nav>
            ) : (
                eyebrow && (
                    <span className="page-header-eyebrow">
                        <span className="page-header-eyebrow-dot" aria-hidden="true" />
                        {eyebrow}
                    </span>
                )
            )}
            <div className="page-header-row">
                <div className="page-header-main">
                    <h1 className="page-header-title">
                        {title}
                        {titleAccent && (
                            <>
                                <span className="page-header-title-sep" aria-hidden="true">
                                    {" "}
                                    //{" "}
                                </span>
                                {titleAccent}
                            </>
                        )}
                    </h1>
                    {description && <p className="page-header-description">{description}</p>}
                </div>
                {(action || status) && (
                    <div className="page-header-action">
                        {status && <span className="page-header-status">{status}</span>}
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
