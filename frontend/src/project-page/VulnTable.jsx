import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DataTableCard from "../components/DataTableCard.jsx";

const PAGE_SIZE = 4;

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
      {progress ?? "Unknown"}
    </span>
  );
}

function VulnTable({ selectedProject, projectScans, onViewScan }) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [selectedProject?.id, projectScans.length]);

  const pageCount = Math.max(1, Math.ceil(projectScans.length / PAGE_SIZE));
  const pageScans = projectScans.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const firstVisible = projectScans.length ? page * PAGE_SIZE + 1 : 0;
  const lastVisible = Math.min((page + 1) * PAGE_SIZE, projectScans.length);

  return (
    <DataTableCard
      id="vuln-log-panel"
      title="Scan history"
      headerClassName="vuln-log-bar"
      titleClassName="vuln-log-title"
      tableId="vuln-table"
      meta={(
        <span className="vuln-log-live">
          <span className="live-dot" />
          {projectScans.length} {projectScans.length === 1 ? "entry" : "entries"}
        </span>
      )}
      footer={(
        <div className="table-pagination" aria-label="Scan history pages">
          <span className="table-pagination-range" aria-live="polite">
            {projectScans.length ? `Showing ${firstVisible}–${lastVisible} of ${projectScans.length}` : "No scans"}
          </span>
          <div className="table-pagination-controls">
            <button
              type="button"
              className="table-page-btn"
              aria-label="Previous four scans"
              onClick={() => setPage(current => Math.max(0, current - 1))}
              disabled={page === 0}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="table-pagination-page">{page + 1} / {pageCount}</span>
            <button
              type="button"
              className="table-page-btn"
              aria-label="Next four scans"
              onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))}
              disabled={page >= pageCount - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    >
        <thead>
          <tr>
            <th className="col-id">ID</th>
            <th>Timestamp</th>
            <th>Components</th>
            <th>Critical</th>
            <th>High</th>
            <th>Medium</th>
            <th>Low</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {projectScans.length === 0 && (
            <tr className="app-data-table-empty">
              <td colSpan={9}>
                No scans yet. Run a scan to see its history here.
              </td>
            </tr>
          )}
          {pageScans.map((scan, i) => (
            <tr key={scan.id} data-severity={severityRank(scan)}>
              <td className="col-id">{String(page * PAGE_SIZE + i + 1).padStart(2, "0")}</td>
              <td>
                {new Date(scan.date).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td>{scan.components}</td>
              <td className="severity-count" style={{ color: "var(--critical)" }}>{scan.critical}</td>
              <td className="severity-count" style={{ color: "var(--high)" }}>{scan.high}</td>
              <td className="severity-count" style={{ color: "var(--medium)" }}>{scan.medium}</td>
              <td className="severity-count" style={{ color: "var(--low)" }}>{scan.low}</td>
              <td><StatusChip progress={scan.progress} /></td>
              <td>
                <button
                  className="view-btn"
                  onClick={event => {
                    event.stopPropagation();
                    onViewScan(scan, selectedProject);
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
    </DataTableCard>
  );
}

export default VulnTable;
