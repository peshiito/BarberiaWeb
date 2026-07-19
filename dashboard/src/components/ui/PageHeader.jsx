import "./PageHeader.css";

const PageHeader = ({ eyebrow, title, description, action }) => {
    return (
        <div className="page-header">
            <div>
                {eyebrow && <span className="page-header-eyebrow">{eyebrow}</span>}
                <h1 className="page-header-title">{title}</h1>
                {description && <p className="page-header-description">{description}</p>}
            </div>
            {action && <div className="page-header-action">{action}</div>}
        </div>
    );
};

export default PageHeader;
