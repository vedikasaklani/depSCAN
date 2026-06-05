function StatsBar({ previousScan, latestScan, projectScans = [] }) {
  const getDelta = (field) => {
    if (!latestScan || !previousScan) return null;
    return latestScan[field] - previousScan[field];
  };

  const Delta = ({ value }) => {
    if (value === null) return null;
    if (value === 0)
      return <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75em" }}>— no change</span>;
    const positive = value > 0;
    return (
      <span style={{
        color: positive ? "var(--critical)" : "var(--low)",
        fontSize: "0.75em",
        marginTop: "0.25em",
        display: "block",
      }}>
        {positive ? `▲ +${value}` : `▼ ${value}`}
      </span>
    );
  };

  return (
    <div id="stats-bar" className="card">
      <div className="stat-card">
        <p className="stat-label">Total Scans</p>
        <p className="stat-value">{projectScans.length}</p>
      </div>
      <div className="stat-card change-stat">
        <p className="stat-label">Latest Critical</p>
        <div className="change-stat-container">
          <p className="stat-value" style={{ color: "var(--critical)" }}>
            {latestScan ? latestScan.critical : 0}
          </p>
          <Delta value={getDelta("critical")} />
        </div>
      </div>
      <div className="stat-card change-stat">
        <p className="stat-label">Components</p>
        <div className="change-stat-container">
          <p className="stat-value">{latestScan ? latestScan.components : 0}</p>
          <Delta value={getDelta("components")} />
        </div>
      </div>
      <div className="stat-card">
        <p className="stat-label">Last Scanned</p>
        <p className="stat-value">
          {latestScan ? String(latestScan.date).substring(0, 6) : "Never"}
        </p>
      </div>
    </div>
  );
}

export default StatsBar;