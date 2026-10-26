import { House, Menu } from "lucide-react";
import "./ProjectSidebar.css";

export default function ProjectSidebar({
    projects = [],
    activeProjectId,
    open,
    onToggle,
    onSelectProject,
    showHome = false,
    onHomeClick,
    leaving = false,
}) {
    return (
        <aside
            className={`project-sidebar${open ? " is-open" : " is-collapsed"}${leaving ? " is-leaving" : ""}`}
            onClick={event => event.stopPropagation()}
        >
            <div className="project-sidebar-top">
                <span className="project-sidebar-title">Projects</span>
                <button
                    type="button"
                    className="project-sidebar-toggle"
                    onClick={onToggle}
                    aria-controls="project-list"
                    aria-expanded={open}
                    aria-label={open ? "Collapse projects sidebar" : "Open projects sidebar"}
                    title={open ? "Collapse projects sidebar" : "Open projects sidebar"}
                >
                    <Menu size={24} />
                </button>
            </div>
            {showHome && (
                <div className="project-sidebar-home-row">
                    <button type="button" className="project-sidebar-home" onClick={onHomeClick}>
                        <House size={19} aria-hidden="true" />
                        <span>Home</span>
                    </button>
                </div>
            )}
            <ul id="project-list" aria-label="Projects">
                {projects.map(project => (
                    <li
                        key={project.id}
                        onClick={() => onSelectProject?.(project)}
                        className={String(activeProjectId) === String(project.id) ? "active-project" : "idle-project"}
                    >
                        {project.name}
                    </li>
                ))}
            </ul>
            <div className="project-sidebar-bottom">
                <div className="profile-circle" role="img" aria-label="User profile">
                    <svg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="var(--app-text)" />
                        <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="var(--app-text)" />
                    </svg>
                </div>
            </div>
        </aside>
    );
}
