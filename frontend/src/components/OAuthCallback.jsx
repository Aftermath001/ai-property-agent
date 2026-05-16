import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { supabase, canUseOAuth } from '../lib/supabaseClient'

export default function OAuthCallback() {
  const [message, setMessage] = useState('Completing Google sign in...')
  const navigate = useNavigate()
  const { authenticate } = useAuth()

  useEffect(() => {
    const completeOAuth = async () => {
      if (!canUseOAuth) {
        setMessage('Google login is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
        return
      }

      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: false })
      if (error) {
        setMessage(error.message || 'Google login failed during callback.')
        return
      }

      const user = data?.session?.user
      if (!user?.email) {
        setMessage('Could not retrieve Google account details.')
        return
      }

      try {
        const displayName = user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0]
        const response = await axios.post('/auth/oauth-login', {
          email: user.email,
          name: displayName
        })

        const { token: authToken, user: authUser } = response.data
        authenticate(authToken, authUser)
        navigate(authUser.role === 'user' ? '/' : '/admin', { replace: true })
      } catch (err) {
        const errorMessage = err?.response?.data?.error || 'Failed to complete OAuth login.'
        setMessage(errorMessage)
      }
    }

    completeOAuth()
  }, [authenticate, navigate])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 theme-dark:bg-slate-950 theme-dark:text-slate-100">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl theme-dark:border-slate-800 theme-dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 theme-dark:text-slate-100">Google sign in</h1>
        <p className="mt-4 text-slate-600 theme-dark:text-slate-300">{message}</p>
      </div>
    </div>
  )
}
