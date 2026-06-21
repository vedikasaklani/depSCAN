import { useNavigate } from "react-router-dom";

function severityRank(scan) {
  if (scan.critical > 0) return "critical";
  if (scan.high > 0) return "high";
  if (scan.medium > 0) return "medium";
  if (scan.low > 0) return "low";
  return "clean";
}

function StatusChip({ progress }) {
  const tone = progress === "Complete" ? "low"
    : progress === "In Progress" ? "medium"
      : progress === "Error" ? "critical"
        : "idle";
  return (
    <span className={`status-chip status-chip-${tone}`}>
      <span className="status-dot" />
      {(progress ?? "unknown").toUpperCase()}
    </span>
  );
}

function VulnTable({ selectedProject, projectScans }) {
  const navigate = useNavigate();

  return (
    <div id="vuln-log-panel">
      <div className="vuln-log-bar">
        <span className="vuln-log-prompt">
          <span className="vuln-log-prompt-sigil">scan_history.log</span>
          <span className="blinking-cursor">_</span>
        </span>
        <span className="vuln-log-live">
          <span className="live-dot" />
          {projectScans.length} {projectScans.length === 1 ? "ENTRY" : "ENTRIES"}
        </span>
      </div>

      <table id="vuln-table">
        <thead>
          <tr>
            <th className="col-id">ID</th>
            <th>Timestamp</th>
            <th>Components</th>
            <th>Crit</th>
            <th>High</th>
            <th>Med</th>
            <th>Low</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {projectScans.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: "1.5em" }}>
                No scans yet — run one to populate the log.
              </td>
            </tr>
          )}
          {projectScans.map((scan, i) => (
            <tr key={scan.id} data-severity={severityRank(scan)}>
              <td className="col-id mono-cell">0x{(i + 1).toString(16).padStart(2, "0").toUpperCase()}</td>
              <td className="mono-cell">
                {new Date(scan.date).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="mono-cell">{scan.components}</td>
              <td className="mono-cell" style={{ color: "var(--critical)" }}>{scan.critical}</td>
              <td className="mono-cell" style={{ color: "var(--high)" }}>{scan.high}</td>
              <td className="mono-cell" style={{ color: "var(--medium)" }}>{scan.medium}</td>
              <td className="mono-cell" style={{ color: "var(--low)" }}>{scan.low}</td>
              <td><StatusChip progress={scan.progress} /></td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/projects/${selectedProject.name}/scans/${scan.id}`)}
                >
                  [ view ]
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VulnTable;