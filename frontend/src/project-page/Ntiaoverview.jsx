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

function NtiaCard({ score, scoreLevel = "empty", scoreColor, summary, children }) {
  return (
    <div className="card" id="ntia-score">
      <div className="ntia-header">
        <p className="ntia-title-bar">NTIA Score</p>
        <p className="ntia-sub">{summary}</p>
        <div
          className={`ntia-score-badge severity-${scoreLevel}`}
          style={scoreColor ? { "--ntia-score-fill": scoreColor } : undefined}
        >
          {score == null ? "—" : `${score}%`}
        </div>
      </div>
      <div className="ntia-content">{children}</div>
    </div>
  );
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
      <NtiaCard summary="No scan selected">
        <p className="ntia-placeholder">No compliance data to display yet.</p>
      </NtiaCard>
    );
  }

  if (loading) {
    return (
      <NtiaCard summary="Checking minimum elements">
        <p className="ntia-placeholder">Loading compliance details…</p>
      </NtiaCard>
    );
  }

  if (error || !compliance) {
    return (
      <NtiaCard summary="Compliance unavailable">
        <p className="ntia-placeholder ntia-placeholder-error">
          {error || "Unable to load compliance details."}
        </p>
      </NtiaCard>
    );
  }

  const { projectMeta, components } = compliance;
  const checks = buildNtiaChecks(projectMeta, components);
  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const score = projectMeta.compliancePercentage;
  const scoreLevel = score >= 80 ? "low"
    : score >= 60 ? "medium"
      : score >= 40 ? "high"
        : "critical";
  const scoreColor = scoreLevel === "low" ? "var(--low)"
    : scoreLevel === "medium" ? "var(--medium)"
      : scoreLevel === "high" ? "var(--high)"
        : "var(--critical)";

  return (
    <NtiaCard score={score} scoreLevel={scoreLevel} scoreColor={scoreColor} summary={`${passed} / ${total} minimum elements passing`}>
      <ul className="ntia-checklist">
        {checks.map((check) => (
          <li key={check.label} className={`ntia-check-row ${check.passed ? "is-passed" : "is-failed"}`}>
            <span className="ntia-check-label">{check.label}</span>
            <span className="ntia-check-icon">
              {check.passed ? <CheckIcon /> : <CrossIcon />}
            </span>
          </li>
        ))}
      </ul>
    </NtiaCard>
  );
}

export default NtiaOverview;
