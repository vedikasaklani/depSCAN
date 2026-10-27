import "./ProjectPage.css";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ChartContainer from "./ChartContainer.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import VulnTable from "./VulnTable.jsx";
import StatsBar from "./StatsBar.jsx";
import NewScanModal from "./NewScanModal.jsx";
import NtiaOverview from "./Ntiaoverview.jsx";
import ProjectSidebar from "./ProjectSidebar.jsx";
import { fetchAllScans, fetchComponents, fetchVulns, fetchProjectHistory } from "../api/api.js";
async function normalizeScans(history, projectId) {

    return Promise.all(
        history.map(async (scan) => {
            console.log("SCAN OBJECT", scan);
            console.log("SBOM ID", scan.sbom_id);
            const [components, vulns] = await Promise.all([
                fetchComponents(scan.sbom_id),
                fetchVulns(scan.sbom_id),
            ]);

            const severityCounts = {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
            };

            // map component purl/name -> ecosystem
            const compByPurl = new Map();
            const compByName = new Map();
            components.forEach(c => {
                const eco = c.ecosystem || c.ecosystem || "unknown";
                if (c.purl) compByPurl.set(c.purl, eco);
                if (c.name) compByName.set(c.name, eco);
            });

            // ecosystems aggregation: { ecosystem: { critical, high, medium, low, none, components } }
            const ecosystems = {};

            // initialize ecosystems from components
            components.forEach(c => {
                const eco = c.ecosystem || c.ecosystem || "unknown";
                if (!ecosystems[eco]) ecosystems[eco] = { critical: 0, high: 0, medium: 0, low: 0, none: 0, components: 0 };
                ecosystems[eco].components++;
            });

            // count vulnerabilities per ecosystem
            vulns.forEach(v => {
                const sev = (v.severity || "").toUpperCase();
                let eco = null;
                if (v.purl && compByPurl.has(v.purl)) eco = compByPurl.get(v.purl);
                else if (v.component_name && compByName.has(v.component_name)) eco = compByName.get(v.component_name);
                else eco = "unknown";

                if (!ecosystems[eco]) ecosystems[eco] = { critical: 0, high: 0, medium: 0, low: 0, none: 0, components: 0 };

                switch (sev) {
                    case "CRITICAL":
                        ecosystems[eco].critical++;
                        severityCounts.critical++;
                        break;
                    case "HIGH":
                        ecosystems[eco].high++;
                        severityCounts.high++;
                        break;
                    case "MEDIUM":
                        ecosystems[eco].medium++;
                        severityCounts.medium++;
                        break;
                    case "LOW":
                    default:
                        ecosystems[eco].low++;
                        severityCounts.low++;
                        break;
                }
            });

            // compute 'none' (components with no vulns) per ecosystem
            // build map of component purl/name -> vuln count
            const vulnCountsByComp = new Map();
            vulns.forEach(v => {
                const key = v.purl || v.component_name || JSON.stringify({ id: v.id });
                vulnCountsByComp.set(key, (vulnCountsByComp.get(key) || 0) + 1);
            });

            components.forEach(c => {
                const key = c.purl || c.name;
                const eco = c.ecosystem || c.ecosystem || "unknown";
                if (!ecosystems[eco]) ecosystems[eco] = { critical: 0, high: 0, medium: 0, low: 0, none: 0, components: 0 };
                if (!vulnCountsByComp.get(key)) ecosystems[eco].none++;
            });

            // convert ecosystems object into array suitable for chart
            const ecosystemsArray = Object.keys(ecosystems).map(k => ({
                ecosystem: k,
                critical: ecosystems[k].critical,
                high: ecosystems[k].high,
                medium: ecosystems[k].medium,
                low: ecosystems[k].low,
                none: ecosystems[k].none,
                components: ecosystems[k].components,
            }));

            return {
                id: scan.sbom_id,
                projectId,

                date: scan.uploaded_at,
                components: components.length,

                critical: severityCounts.critical,
                high: severityCounts.high,
                medium: severityCounts.medium,
                low: severityCounts.low,

                progress: "Complete",

                ecosystems: ecosystemsArray
            };
        })
    );
}

function Projectpage() {
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarExpandOnEntry = location.state?.sidebarExpandOnEntry === true;
    const [uniqueProjects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showNewScan, setShowNewScan] = useState(false);
    const [projectSidebarOpen, setProjectSidebarOpen] = useState(!sidebarExpandOnEntry);
    const [homeEntryTransition, setHomeEntryTransition] = useState(sidebarExpandOnEntry);
    const [projectScans, setProjectScans] = useState([]);
    const [projectWipePhase, setProjectWipePhase] = useState(null);
    const [scanRouteTransition, setScanRouteTransition] = useState(false);
    const [pendingProject, setPendingProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!sidebarExpandOnEntry) return;
        const frame = requestAnimationFrame(() => setProjectSidebarOpen(true));
        navigate(location.pathname, { replace: true, state: null });
        return () => cancelAnimationFrame(frame);
    }, []);
    useEffect(() => {
        fetchAllScans()
            .then((scans) => {
                const uniqueProjects = [
                    ...new Map(
                        scans
                            .filter(scan => scan.project)
                            .map(scan => [
                                scan.project,
                                {
                                    name: scan.project,
                                    id: scan.sbom_id
                                }
                            ])
                    ).values()
                ];

                setProjects(uniqueProjects);

                if (uniqueProjects.length > 0) {
                    setSelectedProject(uniqueProjects[0]);
                }
            })
            .catch((err) => setError(err.message));
    }, []);
    useEffect(() => {
        if (!selectedProject) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        setProjectScans([]);

        fetchProjectHistory(selectedProject.name)
            .then(async (history) => {
                const scans = await normalizeScans(
                    history,
                    selectedProject.id
                );

                if (!cancelled) {
                    setProjectScans(scans);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (!cancelled) {
                    setError(err.message);
                    setLoading(false);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setProjectWipePhase(current => current === "loading" ? "reveal" : current);
                }
            });

        return () => { cancelled = true; };
    }, [selectedProject]);

    const handleProjectSelect = (project) => {
        if (projectWipePhase || selectedProject?.id === project.id) return;
        setPendingProject(project);
        setProjectWipePhase("cover");
    };

    const handleViewScan = (scan, project) => {
        if (scanRouteTransition) return;
        setScanRouteTransition(true);
        window.setTimeout(() => {
            navigate(`/projects/${encodeURIComponent(project.name)}/scans/${scan.id}`, {
                state: { scanEntryTransition: true },
            });
        }, 220);
    };

    const handleProjectWipeEnd = (event) => {
        if (event.target !== event.currentTarget) return;
        if (projectWipePhase === "cover" && pendingProject) {
            setSelectedProject(pendingProject);
            setProjectWipePhase("loading");
        } else if (projectWipePhase === "reveal") {
            setProjectWipePhase(null);
            setPendingProject(null);
        }
    };

    const sortedScans = [...projectScans].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestScan = sortedScans[0];
    const previousScan = sortedScans[1];

    const handleScanSubmit = async (scanConfig) => {
        try {
            // The scan was already executed and uploaded by NewScanModal's startScan()
            // Just refresh the project history to show the new scan
            const history = await fetchProjectHistory(
                selectedProject.name
            );
            const scans = await normalizeScans(
                history,
                selectedProject.id
            );

            setProjectScans(scans);
        } catch (err) {
            console.error("Failed to refresh scans:", err.message);
        }
    };

    return (
        <div
            id="parent-container"
            className={`${projectSidebarOpen ? "" : "project-sidebar-collapsed"}${homeEntryTransition ? " project-home-entry" : ""}${scanRouteTransition ? " project-scan-exiting" : ""}`}
        >
            <div className={`project-container${projectSidebarOpen ? "" : " sidebar-collapsed"}`}>
                <ProjectSidebar
                    projects={uniqueProjects}
                    activeProjectId={selectedProject?.id}
                    open={projectSidebarOpen}
                    onToggle={() => setProjectSidebarOpen(open => !open)}
                    onSelectProject={handleProjectSelect}
                />

                <div
                    id="content"
                    className={projectWipePhase === "reveal" ? "project-content-enter" : ""}
                    onClick={() => {
                        if (projectSidebarOpen) setProjectSidebarOpen(false);
                    }}
                >
                    <div id="header-content">
                        <p id="project-name">{selectedProject?.name}</p>
                        <button id="add-btn" onClick={() => setShowNewScan(true)}>
                            <Plus color="var(--textlight)" size={15} />
                            <p>New Project</p>
                        </button>
                    </div>

                    {loading && (
                        <p style={{ gridColumn: " 1 / -1", justifySelf: "center", marginTop: "1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.82em", padding: "1em" }}>
                            Loading scans...
                        </p>
                    )}
                    {error && (
                        <p style={{ gridColumn: "1/-1", color: "var(--critical)", fontSize: "0.82em", padding: "1em" }}>
                            {error}
                        </p>
                    )}

                    <ChartContainer projectScans={projectScans} latestScan={latestScan} />
                    <VulnTable selectedProject={selectedProject} projectScans={projectScans} onViewScan={handleViewScan} />
                    <StatsBar
                        selectedProject={selectedProject}
                        previousScan={previousScan}
                        latestScan={latestScan}
                        projectScans={projectScans}
                    />
                    <NtiaOverview sbomId={latestScan?.id} />
                </div>
            </div>

            {showNewScan && (
                <NewScanModal
                    onClose={() => setShowNewScan(false)}
                    onSubmit={handleScanSubmit}
                />
            )}

            {projectWipePhase && (
                <div
                    className={`project-switch-wipe is-${projectWipePhase}`}
                    aria-hidden="true"
                    onAnimationEnd={handleProjectWipeEnd}
                />
            )}
            {homeEntryTransition && (
                <div
                    className="project-switch-wipe is-reveal"
                    style={{ "--project-sidebar-width": "56px" }}
                    aria-hidden="true"
                    onAnimationEnd={event => {
                        if (event.target === event.currentTarget) setHomeEntryTransition(false);
                    }}
                />
            )}
            {scanRouteTransition && <div className="project-route-wipe is-cover-up" aria-hidden="true" />}
        </div>
    );
}

export default Projectpage;
