import { useState, useEffect } from "react";
import { fetchCompliance } from "../api/api.js";
import { CheckIcon, CrossIcon } from "./StatusIcons.jsx";

function isExactVersion(version) {
  return (
    typeof version === "string" &&
    version.trim().length > 0 &&
    !/[\^~\*>=xX]/.test(version)
  );
}

function getSupplierName(component) {
  if (typeof component?.supplier === "string") return component.supplier;
  return component?.supplier?.name;
}

export function buildNtiaChecks(meta, components) {
  const hasSupplier = (component) =>
    Boolean(getSupplierName(component)?.trim()) ||
    getSupplierName(component) === "NOASSERTION";

  return [
    {
      label: "Timestamp present",
      passed:
        Boolean(meta.timestamp) &&
        /(?:Z|[+-]\d{2}:\d{2})$/.test(meta.timestamp),
    },
    { label: "Author declared", passed: Boolean(meta.author?.trim()) },
    {
      label: "All components have supplier",
      passed: components.every(hasSupplier),
    },
    {
      label: "All components named",
      passed: components.every((c) => Boolean(c.name?.trim())),
    },
    {
      label: "All versions pinned",
      passed: components.every((c) => isExactVersion(c.version)),
    },
    {
      label: "All PURLs present",
      passed: components.every((c) => Boolean(c.purl?.trim())),
    },
    {
      label: "Dependency graph exists",
      passed: meta.totalDependencies > 0,
    },
    { label: "Machine-readable format", passed: true },
  ];
}

function NtiaOverview({ sbomId }) {
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sbomId) {
      setCompliance(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchCompliance(sbomId)
      .then((data) => setCompliance(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sbomId]);

  if (!sbomId) {
    return (
      <div className="card" id="ntia-score">
        <p className="stat-label">NTIA Score</p>
        <p className="ntia-sub" style={{ marginTop: "0.4em" }}>
          No scan selected
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card" id="ntia-score">
        <p className="stat-label">NTIA Score</p>
        <p className="ntia-sub" style={{ marginTop: "0.4em" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (error || !compliance) {
    return (
      <div className="card" id="ntia-score">
        <p className="stat-label">NTIA Score</p>
        <p
          className="ntia-sub"
          style={{ marginTop: "0.4em", color: "var(--critical)" }}
        >
          {error || "Unavailable"}
        </p>
      </div>
    );
  }

  const { projectMeta, components } = compliance;
  const checks = buildNtiaChecks(projectMeta, components);
  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const scoreColor =
    projectMeta.compliancePercentage >= 80 ? "var(--low)" : "var(--critical)";

  return (
    <div className="card" id="ntia-score">
      <div className="ntia-header">
        <p className="stat-label">NTIA Score</p>
        <p className="ntia-score-value" style={{ color: scoreColor }}>
          {projectMeta.compliancePercentage}%
        </p>
      </div>
      <p className="ntia-sub">
        {passed} / {total} minimum elements passing
      </p>
      <ul className="ntia-checklist">
        {checks.map((check) => (
          <li key={check.label} className="ntia-check-row">
            <span className="ntia-check-label">{check.label}</span>
            <span className="ntia-check-icon">
              {check.passed ? <CheckIcon /> : <CrossIcon />}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NtiaOverview;