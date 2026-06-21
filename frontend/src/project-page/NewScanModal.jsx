import { useState, useEffect, useCallback } from "react";
import { X, GitCommit, Link2, Search, GitBranch, Shield, FileCode2, Package } from "lucide-react";
import { uploadSBOM } from "../api/api.js";
import "./NewScanModal.css";

const MOCK_REPOS = [
    { id: 1, name: "frontend-app", full_name: "acme/frontend-app", language: "TypeScript", updated_at: "2 days ago", private: false },
    { id: 2, name: "api-gateway", full_name: "acme/api-gateway", language: "Go", updated_at: "5 days ago", private: true },
    { id: 3, name: "auth-service", full_name: "acme/auth-service", language: "Python", updated_at: "1 week ago", private: true },
    { id: 4, name: "data-pipeline", full_name: "acme/data-pipeline", language: "Python", updated_at: "2 weeks ago", private: false },
    { id: 5, name: "infra-terraform", full_name: "acme/infra-terraform", language: "HCL", updated_at: "3 weeks ago", private: true },
    { id: 6, name: "mobile-client", full_name: "acme/mobile-client", language: "Kotlin", updated_at: "1 month ago", private: false },
];

// Accepts https://github.com/org/repo(.git), https://gitlab.com/org/repo, etc,
// and the git@host:org/repo.git scp-style form.
const HTTP_GIT_URL = /^https?:\/\/[\w.-]+\.[a-z]{2,}(\/[\w.\-~]+){2,}(\.git)?\/?$/i;
const SCP_GIT_URL = /^git@[\w.-]+:[\w.\-~]+\/[\w.\-~]+(\.git)?$/i;

function isValidGitUrl(url) {
    const trimmed = url.trim();
    return HTTP_GIT_URL.test(trimmed) || SCP_GIT_URL.test(trimmed);
}

// We can't clone/parse a repo from the browser, so this builds a minimal
// CycloneDX-shaped request carrying the scan metadata. Real component/
// dependency extraction has to happen server-side once it sees `source`.
function buildScanPayload({ projectName, source, branch, scanType }) {
    return {
        bomFormat: "CycloneDX",
        specVersion: "1.4",
        metadata: {
            timestamp: new Date().toISOString(),
            component: { name: projectName },
            properties: [
                { name: "source", value: source },
                { name: "branch", value: branch },
                { name: "scanType", value: scanType },
            ],
        },
        components: [],
        dependencies: [],
    };
}

export default function NewScanModal({ onClose, onSubmit }) {
    const [tab, setTab] = useState("github");
    const [repoQuery, setRepoQuery] = useState("");
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [publicUrl, setPublicUrl] = useState("");
    const [projectName, setProjectName] = useState("");
    const [branch, setBranch] = useState("main");
    const [scanType, setScanType] = useState("full");

    const [urlError, setUrlError] = useState("");
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [submitError, setSubmitError] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        if (selectedRepo && !projectName) setProjectName(selectedRepo.name);
    }, [selectedRepo]);

    const filteredRepos = MOCK_REPOS.filter(r =>
        r.name.toLowerCase().includes(repoQuery.toLowerCase())
    );

    const isValid = projectName.trim() &&
        (tab === "github" ? selectedRepo : publicUrl.trim());

    const handlePublicUrlChange = (e) => {
        setPublicUrl(e.target.value);
        if (urlError) setUrlError("");
        if (status === "error") { setStatus("idle"); setSubmitError(""); }
    };

    const handleSubmit = async () => {
        if (!isValid) return;

        if (tab === "github") {
            // GitHub OAuth flow isn't wired to a real API yet — still mock data.
            onSubmit?.({
                projectName: projectName.trim(),
                source: selectedRepo?.full_name,
                branch,
                scanType,
            });
            onClose();
            return;
        }

        // Public URL flow — validate, then actually hit the API.
        const source = publicUrl.trim();
        if (!isValidGitUrl(source)) {
            setUrlError("That doesn't look like a valid Git repository URL — try something like https://github.com/org/repo");
            return;
        }

        setUrlError("");
        setSubmitError("");
        setStatus("submitting");
        try {
            const payload = buildScanPayload({ projectName: projectName.trim(), source, branch, scanType });
            const response = await uploadSBOM(payload);
            setResult(response);
            setStatus("success");
            onSubmit?.({ ...response, projectName: projectName.trim(), source, branch, scanType });
        } catch (err) {
            setSubmitError(err.message || "Upload failed. Please try again.");
            setStatus("error");
        }
    };

    const stopProp = useCallback((e) => e.stopPropagation(), []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={stopProp} role="dialog" aria-modal="true" aria-labelledby="modal-title">

                <div className="modal-header">
                    <span className="modal-title" id="modal-title">New Project</span>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <X size={16} />
                    </button>
                </div>

                {status === "success" && result ? (
                    <>
                        <div className="modal-body">
                            <div className="field-group">
                                <p style={{ color: "var(--teal)", fontWeight: 600, marginBottom: "0.9em" }}>
                                    Scan submitted
                                </p>
                                {[
                                    ["Status", result.status],
                                    ["Scan ID", result.id],
                                    ["Project", result.project ?? projectName],
                                    ["Components Stored", result.components_stored],
                                    ["Dependencies Stored", result.dependencies_stored],
                                    ["Uploaded At", result.uploaded_at ? new Date(result.uploaded_at).toLocaleString() : "—"],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: "1em",
                                            padding: "0.5em 0",
                                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                                            fontSize: "0.9em",
                                        }}
                                    >
                                        <span style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                                        <strong style={{ textAlign: "right", wordBreak: "break-all" }}>{String(value)}</strong>
                                    </div>
                                ))}
                                {result.components_stored === 0 && (
                                    <p style={{ marginTop: "1em", fontSize: "0.82em", color: "rgba(255,255,255,0.4)" }}>
                                        No components were extracted yet, the backend hasn yet to analyze this source URL
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-submit" onClick={onClose}>Done</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-tabs">
                            <button
                                className={`modal-tab${tab === "github" ? " active" : ""}`}
                                onClick={() => setTab("github")}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
                                    <GitCommit size={13} /> GitHub Repo
                                </span>
                            </button>
                            <button
                                className={`modal-tab${tab === "url" ? " active" : ""}`}
                                onClick={() => setTab("url")}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
                                    <Link2 size={13} /> Public URL
                                </span>
                            </button>
                        </div>

                        <div className="modal-body">

                            {tab === "github" && (
                                <div className="field-group">
                                    <label className="field-label">Select Repository</label>
                                    <div className="repo-list">
                                        <div className="repo-search">
                                            <Search size={13} />
                                            <input
                                                className="repo-search-input"
                                                placeholder="Search repositories..."
                                                value={repoQuery}
                                                onChange={e => setRepoQuery(e.target.value)}
                                            />
                                        </div>
                                        {filteredRepos.map(repo => (
                                            <div
                                                key={repo.id}
                                                className={`repo-item${selectedRepo?.id === repo.id ? " selected" : ""}`}
                                                onClick={() => setSelectedRepo(repo)}
                                            >
                                                <span className="repo-icon"><GitCommit size={14} /></span>
                                                <div className="repo-info">
                                                    <div className="repo-name">{repo.full_name}</div>
                                                    <div className="repo-meta">{repo.updated_at} · {repo.private ? "Private" : "Public"}</div>
                                                </div>
                                                {repo.language && (
                                                    <span className="repo-lang">{repo.language}</span>
                                                )}
                                            </div>
                                        ))}
                                        {filteredRepos.length === 0 && (
                                            <div style={{ padding: "1.2em", textAlign: "center", fontSize: "0.82em", color: "rgba(255,255,255,0.25)" }}>
                                                No repositories found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {tab === "url" && (
                                <div className="field-group">
                                    <label className="field-label">Repository URL</label>
                                    <input
                                        className="field-input"
                                        placeholder="https://github.com/org/repo"
                                        value={publicUrl}
                                        onChange={handlePublicUrlChange}
                                    />
                                    {urlError && (
                                        <p style={{ color: "var(--critical)", fontSize: "0.82em", marginTop: "0.5em" }}>
                                            {urlError}
                                        </p>
                                    )}
                                    {status === "error" && (
                                        <p style={{ color: "var(--critical)", fontSize: "0.82em", marginTop: "0.5em" }}>
                                            {submitError}
                                        </p>
                                    )}
                                </div>
                            )}

                            <hr className="modal-divider" />

                            <div className="field-group">
                                <label className="field-label">Project Name</label>
                                <input
                                    className="field-input"
                                    placeholder="e.g. my-api"
                                    value={projectName}
                                    onChange={e => setProjectName(e.target.value)}
                                />
                            </div>

                            <div className="field-group">
                                <label className="field-label">Branch</label>
                                <input
                                    className="field-input"
                                    placeholder="main"
                                    value={branch}
                                    onChange={e => setBranch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={onClose} disabled={status === "submitting"}>Cancel</button>
                            <button className="btn-submit" onClick={handleSubmit} disabled={!isValid || status === "submitting"}>
                                {status === "submitting" ? "Scanning..." : "Run Scan"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}