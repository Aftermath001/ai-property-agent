import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 theme-dark:bg-slate-950 theme-dark:text-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 shadow-md theme-dark:border-slate-800 theme-dark:bg-slate-900">Loading account details…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
