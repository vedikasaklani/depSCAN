import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LoginPage from './loginauth.jsx'
import Projectpage from './project-page/projectlist.jsx'
import SbomPage from './vuln-dash/vuln-dash.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<LoginPage/>}/>
    <Route path="/projects" element={<Projectpage/>}/>
    <Route path="/projects/:projectId/scans/:id" element={<SbomPage/>}/>
  </Routes>
  </BrowserRouter>
  </StrictMode>
)
