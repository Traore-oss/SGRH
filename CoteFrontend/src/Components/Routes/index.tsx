
import { Dashboard } from '../../pages/Dashboard'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AdminDashboard } from '../../roleDashboard/AdminDashboard'
import { LoginPage } from '../log/Login'

function AppRoutes() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        {/* Redirection de la racine vers /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/adminDashboard" element={<AdminDashboard/>}/>
        {/* 404 */}
        <Route path="*" element={<div>404 - Page introuvable</div>} />
      </Routes>
        </BrowserRouter>
    </div>
  )
}

export default AppRoutes