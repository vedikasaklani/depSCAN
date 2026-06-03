import "./vuln-dash.css";
import { useParams } from "react-router-dom";
import { mockScans, mockProjects } from "../project-page/data";
import { dashboardData } from "./dashboardData";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Vulnsection from "./vuln-section";
import SummaryCard from "./summarycard";
function VulnerabilityDashboard() {
    const { id } = useParams();
    const scan = mockScans.find(
        scan => scan.id === Number(id)
    );
    const report = dashboardData[id];
    if (!scan || !report) {
        return <h2>Report not found</h2>;
    }
    const {security, vulnerabilities } = report;
    const project = mockProjects.find(
        p => p.id === scan.projectId
    );
    const navigate=useNavigate();
    return (
        <div className="vuln-dashboard">
            <div className="icon" onClick={()=> navigate("/projects")}>
                <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="var(--textlight)"><path d="M156-114v-487l324-242.77L804-601v487H566.15v-293.69h-172.3V-114H156Z"/></svg>
            </div>
            <header className="dashboard-header">
                <div style={{display:"flex", flexDirection:"column", gap:"0.6em", width:"60%"}}>
                    <h1 style={{fontFamily:"Anta"}}>Vulnerability Dashboard</h1>
                    <span style={{display:"flex",  gap:"1em"}}>
                        <div>Project: <span style={{fontFamily:"Anta", fontWeight:"normal", color:"white", letterSpacing:"0.1em"}}>{project?.name}</span> </div>
                        <div>Scanned on: <span style={{fontFamily:"Anta", fontWeight:"normal", color:"white", letterSpacing:"0.1em"}}>{scan.date}</span></div>
                    </span>
                </div>
                    <div className="security-card">
                    <button className="download-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="0 -960 960 960" width="24px" fill="var(--teal)"><path d="M612.58-367.51q54.5-54.59 54.5-132.58 0-77.99-54.59-132.49-54.59-54.5-132.58-54.5-77.99 0-132.49 54.59-54.5 54.59-54.5 132.58 0 77.99 54.59 132.49 54.59 54.5 132.58 54.5 77.99 0 132.49-54.59ZM402-422.12q-32-32.12-32-78T402.12-578q32.12-32 78-32T558-577.88q32 32.12 32 78T557.88-422q-32.12 32-78 32T402-422.12Zm-197.38 147.5Q81.16-359.23 25.54-500q55.62-140.77 179.02-225.38Q327.97-810 479.95-810q151.97 0 275.43 84.62Q878.84-640.77 934.46-500q-55.62 140.77-179.02 225.38Q632.03-190 480.05-190q-151.97 0-275.43-84.62ZM480-500Zm211.87 163.42Q788.74-397.16 840-500q-51.26-102.84-148.13-163.42Q595-724 480-724t-211.87 60.58Q171.26-602.84 120-500q51.26 102.84 148.13 163.42Q365-276 480-276t211.87-60.58Z"/></svg>
                        <p>NTIA Score</p></button>
                    <button className="download-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="var(--teal)"><path d="M479-322.46 268.23-533.23l61.16-60.38L436-487v-325h86v325l106.61-106.61 61.16 60.38L479-322.46ZM246.31-148q-41.03 0-69.67-28.64T148-246.31v-108.46h86v108.46q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h467.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-108.46h86v108.46q0 41.31-28.64 69.81T713.69-148H246.31Z"/></svg>
                        <p>Cyclone.DX</p>
                    </button>
                    <button className="download-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="var(--teal)"><path d="M479-322.46 268.23-533.23l61.16-60.38L436-487v-325h86v325l106.61-106.61 61.16 60.38L479-322.46ZM246.31-148q-41.03 0-69.67-28.64T148-246.31v-108.46h86v108.46q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h467.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-108.46h86v108.46q0 41.31-28.64 69.81T713.69-148H246.31Z"/></svg>
                        <p>SPDX</p>
                    </button>
                </div>

            </header>
            <SummaryCard id={id}></SummaryCard>
            <Vulnsection id={id}></Vulnsection>
         

        </div>
    );
}

export default VulnerabilityDashboard;