import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import { AuthProvider } from './contexts/AuthContext'
import RequireAuth from './components/RequireAuth'
import AgentLayout from './components/AgentLayout'
import Dashboard from './components/Dashboard'
import Leads from './components/Leads'
import LeadDetail from './components/LeadDetail'
import Properties from './components/Properties'
import AdminMetrics from './components/AdminMetrics'
import Login from './components/Login'
import Signup from './components/Signup'
import OAuthCallback from './components/OAuthCallback'
import ClientHome from './client/ClientHome'
import ClientSearch from './client/ClientSearch'
import ClientPropertyDetail from './client/ClientPropertyDetail'

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3001/api'

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
  }, [theme])

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/" element={<ClientHome theme={theme} setTheme={setTheme} />} />
          <Route path="/search" element={<ClientSearch theme={theme} setTheme={setTheme} />} />
          <Route path="/property/:id" element={<ClientPropertyDetail theme={theme} setTheme={setTheme} />} />

          <Route
            path="/admin"
            element={
              <RequireAuth allowedRoles={['admin', 'manager']}>
                <AgentLayout theme={theme} setTheme={setTheme} />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="properties" element={<Properties />} />
            <Route path="metrics" element={<AdminMetrics />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
