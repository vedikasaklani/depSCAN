import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LoginPage from './loginauth.jsx'
import Projectpage from './projectlist.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<LoginPage/>}/>
    <Route path="/projects" element={<Projectpage/>}/>
  </Routes>
  </BrowserRouter>
  </StrictMode>
)
