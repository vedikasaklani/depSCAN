import { useNavigate } from "react-router-dom";
function VulnTable({ selectedProject, projectScans = [] }) {
  const navigate = useNavigate();
  return (
    <table id="vuln-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Components</th>
          <th>Critical</th>
          <th>High</th>
          <th>Medium</th>
          <th>Low</th>
          <th>Progress</th>
          <th>View</th>
        </tr>
      </thead>
      <tbody>
        {projectScans.length === 0 && (
          <tr>
            <td colSpan={8} style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: "1.5em" }}>
              No scans yet
            </td>
          </tr>
        )}
        {projectScans.map(scan => (
          <tr key={scan.id}>
            <td>{scan.date}</td>
            <td>{scan.components}</td>
            <td style={{ color: "var(--critical)" }}>{scan.critical}</td>
            <td style={{ color: "var(--high)"     }}>{scan.high}</td>
            <td style={{ color: "var(--medium)"   }}>{scan.medium}</td>
            <td style={{ color: "var(--low)"      }}>{scan.low}</td>
            <td style={{
              color: scan.progress === "Complete"    ? "var(--low)"      :
                     scan.progress === "In Progress" ? "var(--medium)"   :
                     scan.progress === "Error"       ? "var(--critical)" : "var(--textlight)"
            }}>
              {scan.progress}
            </td>
            <td>
              <button
                className="view-btn"
                onClick={() => navigate(`/projects/${selectedProject.id}/scans/${scan.id}`)}
              >
                View →
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default VulnTable;