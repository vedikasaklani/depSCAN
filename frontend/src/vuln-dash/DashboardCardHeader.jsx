export default function DashboardCardHeader({ title, children }) {
    return (
        <div className="dashboard-card-header">
            <h2>{title}</h2>
            <div className="dashboard-card-header-content">{children}</div>
            <div className="dashboard-card-header-divider" aria-hidden="true" />
        </div>
    );
}
