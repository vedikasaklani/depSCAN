import { useState, useEffect, useCallback } from "react";
import { X, GitCommit, Link2, Search, GitBranch, Shield, FileCode2, Package } from "lucide-react";
import { startScan } from "../api/api.js";
import "./NewScanModal.css";

const MOCK_REPOS = [
    { id: 1, name: "frontend-app", full_name: "acme/frontend-app", language: "TypeScript", updated_at: "2 days ago", private: false },
    { id: 2, name: "api-gateway", full_name: "acme/api-gateway", language: "Go", updated_at: "5 days ago", private: true },
    { id: 3, name: "auth-service", full_name: "acme/auth-service", language: "Python", updated_at: "1 week ago", private: true },
    { id: 4, name: "data-pipeline", full_name: "acme/data-pipeline", language: "Python", updated_at: "2 weeks ago", private: false },
    { id: 5, name: "infra-terraform", full_name: "acme/infra-terraform", language: "HCL", updated_at: "3 weeks ago", private: true },
    { id: 6, name: "mobile-client", full_name: "acme/mobile-client", language: "Kotlin", updated_at: "1 month ago", private: false },
];

const HTTP_GIT_URL = /^https?:\/\/[\w.-]+\.[a-z]{2,}(\/[\w.\-~]+){2,}(\.git)?\/?$/i;
const SCP_GIT_URL = /^git@[\w.-]+:[\w.\-~]+\/[\w.\-~]+(\.git)?$/i;

function isValidGitUrl(url) {
    const trimmed = url.trim();
    return HTTP_GIT_URL.test(trimmed) || SCP_GIT_URL.test(trimmed);
}

export default function NewScanModal({ onClose, onSubmit }) {
    const [tab, setTab] = useState("github");
    const [repoQuery, setRepoQuery] = useState("");
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [publicUrl, setPublicUrl] = useState("");
    const [projectName, setProjectName] = useState("");

    const [urlError, setUrlError] = useState("");
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [submitError, setSubmitError] = useState("");
    const [result, setResult] = useState(null);
    const [submittedRepoUrl, setSubmittedRepoUrl] = useState("");

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

        const repoUrl = tab === "github"
            ? `https://github.com/${selectedRepo.full_name}`
            : publicUrl.trim();

        if (tab === "url" && !isValidGitUrl(repoUrl)) {
            setUrlError("That doesn't look like a valid Git repository URL — try something like https://github.com/org/repo");
            return;
        }

        setUrlError("");
        setSubmitError("");
        setStatus("submitting");
        try {
            const name = projectName.trim();
            const response = await startScan(name, repoUrl);
            setSubmittedRepoUrl(repoUrl);
            setResult(response ?? {});
            setStatus("success");
            onSubmit?.({ ...response, projectName: name, repoUrl });
        } catch (err) {
            setSubmitError(err.message || "Scan failed. Please try again.");
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
                                    Scan started
                                </p>
                                {[
                                    ["Project", projectName.trim()],
                                    ["Repository", submittedRepoUrl],
                                    ["Scan ID", result.id ?? result.scan_id],
                                    ["Status", result.status],
                                ]
                                    .filter(([, value]) => value !== undefined && value !== null && value !== "")
                                    .map(([label, value]) => (
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