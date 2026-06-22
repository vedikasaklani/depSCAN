import { useCallback, useEffect, useState } from "react";
import { GitBranch, Link, Upload, X } from "lucide-react";
import { scanRepository, uploadSBOM } from "../api/api.js";
import "./NewScanModal.css";

function getProjectName(sbom) {
    return sbom?.metadata?.component?.name || sbom?.name || sbom?.project || "";
}

export default function NewScanModal({ onClose, onSubmit }) {
    const [mode, setMode] = useState("repo");
    const [repoUrl, setRepoUrl] = useState("https://github.com/psf/requests");
    const [projectName, setProjectName] = useState("Requests");
    const [sbomText, setSbomText] = useState("");
    const [fileName, setFileName] = useState("");
    const [inputError, setInputError] = useState("");
    const [status, setStatus] = useState("idle");
    const [submitError, setSubmitError] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const clearErrors = () => {
        if (inputError) setInputError("");
        if (status === "error") {
            setStatus("idle");
            setSubmitError("");
        }
    };

    const handleTextChange = (e) => {
        setSbomText(e.target.value);
        clearErrors();
    };

    const handleRepoUrlChange = (e) => {
        setRepoUrl(e.target.value);
        clearErrors();
    };

    const handleProjectNameChange = (e) => {
        setProjectName(e.target.value);
        clearErrors();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setFileName(file.name);
            setSbomText(await file.text());
            setInputError("");
            setStatus("idle");
            setSubmitError("");
        } catch {
            setInputError("Unable to read that file.");
        }
    };

    const handleRepoSubmit = async () => {
        const cleanProjectName = projectName.trim();
        const cleanRepoUrl = repoUrl.trim();

        if (!cleanRepoUrl) {
            setInputError("Repository URL is required.");
            return;
        }

        if (!cleanProjectName) {
            setInputError("Project name is required.");
            return;
        }

        if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(cleanRepoUrl.replace(/\.git$/, ""))) {
            setInputError("Use a public GitHub URL like https://github.com/psf/requests.");
            return;
        }

        setInputError("");
        setSubmitError("");
        setStatus("submitting");
        try {
            const response = await scanRepository({
                projectName: cleanProjectName,
                repoUrl: cleanRepoUrl,
            });
            setResult(response);
            setStatus("success");
            onSubmit?.({ ...response, projectName: response.project || cleanProjectName });
        } catch (err) {
            setSubmitError(err.message || "Scan failed. Please try again.");
            setStatus("error");
        }
    };

    const handleSbomSubmit = async () => {
        if (!sbomText.trim()) return;

        let payload;
        try {
            payload = JSON.parse(sbomText);
        } catch {
            setInputError("SBOM must be valid JSON.");
            return;
        }

        const projectName = getProjectName(payload);
        if (!projectName) {
            setInputError("SBOM must include metadata.component.name, name, or project.");
            return;
        }

        setInputError("");
        setSubmitError("");
        setStatus("submitting");
        try {
            const response = await uploadSBOM(payload);
            setResult(response);
            setStatus("success");
            onSubmit?.({ ...response, projectName: response.project || projectName });
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
                                    {result.scan_id ? "Repository scan complete" : "SBOM uploaded"}
                                </p>
                                {[
                                    ["Status", result.status],
                                    ["Scan ID", result.scan_id],
                                    ["SBOM ID", result.sbom_id || result.id],
                                    ["Project", result.project],
                                    ["Repository", result.repo_url],
                                    ["Components Stored", result.components_stored],
                                    ["Dependencies Stored", result.dependencies_stored],
                                    ["Uploaded At", result.uploaded_at ? new Date(result.uploaded_at).toLocaleString() : "-"],
                                ].filter(([, value]) => value !== undefined && value !== null && value !== "").map(([label, value]) => (
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
                                        <strong style={{ textAlign: "right", wordBreak: "break-all" }}>{String(value ?? "-")}</strong>
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
                        <div className="modal-tabs" role="tablist" aria-label="Project source">
                            <button
                                className={`modal-tab ${mode === "repo" ? "active" : ""}`}
                                type="button"
                                onClick={() => {
                                    setMode("repo");
                                    clearErrors();
                                }}
                            >
                                <GitBranch size={15} />
                                GitHub Repo
                            </button>
                            <button
                                className={`modal-tab ${mode === "sbom" ? "active" : ""}`}
                                type="button"
                                onClick={() => {
                                    setMode("sbom");
                                    clearErrors();
                                }}
                            >
                                <Upload size={15} />
                                SBOM JSON
                            </button>
                        </div>
                        <div className="modal-body">
                            {mode === "repo" ? (
                                <>
                                    <div className="field-group">
                                        <label className="field-label">Repository URL</label>
                                        <div className="input-with-icon">
                                            <Link size={15} />
                                            <input
                                                className="field-input"
                                                type="url"
                                                placeholder="https://github.com/org/repo"
                                                value={repoUrl}
                                                onChange={handleRepoUrlChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label className="field-label">Project Name</label>
                                        <input
                                            className="field-input"
                                            type="text"
                                            placeholder="e.g. Requests"
                                            value={projectName}
                                            onChange={handleProjectNameChange}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="field-group">
                                        <label className="field-label">SBOM JSON File</label>
                                        <input
                                            className="field-input"
                                            type="file"
                                            accept=".json,application/json"
                                            onChange={handleFileChange}
                                        />
                                        {fileName && (
                                            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82em", marginTop: "0.5em" }}>
                                                {fileName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="field-group">
                                        <label className="field-label">Paste SBOM JSON</label>
                                        <textarea
                                            className="field-input"
                                            style={{ minHeight: "180px", resize: "vertical", lineHeight: 1.5 }}
                                            value={sbomText}
                                            onChange={handleTextChange}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="field-group">
                                {inputError && (
                                    <p style={{ color: "var(--critical)", fontSize: "0.82em", marginTop: "0.5em" }}>
                                        {inputError}
                                    </p>
                                )}
                                {status === "error" && (
                                    <p style={{ color: "var(--critical)", fontSize: "0.82em", marginTop: "0.5em" }}>
                                        {submitError}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={onClose} disabled={status === "submitting"}>Cancel</button>
                            <button
                                className="btn-submit"
                                onClick={mode === "repo" ? handleRepoSubmit : handleSbomSubmit}
                                disabled={
                                    status === "submitting" ||
                                    (mode === "repo" ? !repoUrl.trim() || !projectName.trim() : !sbomText.trim())
                                }
                            >
                                {status === "submitting" ? (mode === "repo" ? "Scanning..." : "Uploading...") : (mode === "repo" ? "Run Scan" : "Upload SBOM")}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
