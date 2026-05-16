import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, canUseOAuth } from '../lib/supabaseClient'

const demoAccounts = [
  { role: 'admin', label: 'Admin', identifier: 'admin@aiagent.local' },
  { role: 'manager', label: 'Manager', identifier: 'manager@aiagent.local' },
  { role: 'user', label: 'Buyer', identifier: 'user@aiagent.local' }
]

const dummyCredentials = [
  { email: 'admin@aiagent.local', password: 'Password123!', role: 'admin' },
  { email: 'manager@aiagent.local', password: 'Password123!', role: 'manager' },
  { email: 'user@aiagent.local', password: 'Password123!', role: 'buyer' }
]

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [seeded, setSeeded] = useState(false)
  const { login, seedDemoUsers, authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const user = await login({ identifier, password })
      if (user.role === 'user') {
        navigate('/', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    setLoading(true)
    setMessage('Seeding demo accounts...')
    try {
      const data = await seedDemoUsers()
      setSeeded(true)
      setMessage('Demo accounts are ready. Use the quick login buttons below.')
      console.log('Seed response', data)
    } catch (error) {
      setMessage('Could not seed demo accounts. Try again after backend startup.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setMessage('Redirecting to Google...')
    if (!canUseOAuth) {
      setMessage('Google login is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/oauth-callback`
      }
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (data?.url) {
      window.location.href = data.url
    } else {
      setMessage('Unable to start Google sign in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 theme-dark:bg-slate-950 theme-dark:text-slate-100">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl theme-dark:border-slate-800 theme-dark:bg-slate-900">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Agent access</p>
            <h1 className="mt-3 text-3xl font-semibold">Login with demo credentials</h1>
            <p className="mt-3 text-sm text-slate-600 theme-dark:text-slate-300">
              Use the seeded admin, manager, or buyer account to experience the role-based platform.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => {
                  setIdentifier(account.identifier)
                  setPassword('Password123!')
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900 transition hover:border-emerald-500 hover:bg-emerald-50 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
              >
                <span className="block text-slate-900 theme-dark:text-white">{account.label}</span>
                <span className="text-xs text-slate-500 theme-dark:text-slate-400">{account.identifier}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || !canUseOAuth}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-700/20 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Redirecting…' : 'Continue with Google'}
            </button>
            {!canUseOAuth && (
              <p className="text-xs text-slate-500 theme-dark:text-slate-400">
                Google login is not configured in this environment. Use the local demo credentials below.
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 theme-dark:text-slate-400">
              <span>Or use your email and password.</span>
              <Link to="/signup" className="font-semibold text-emerald-600 hover:text-emerald-800">
                Sign up
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-slate-900 theme-dark:border-emerald-900 theme-dark:bg-slate-950 theme-dark:text-slate-100">
            <p className="font-semibold">Local demo login details</p>
            <ul className="mt-3 space-y-2">
              {dummyCredentials.map((cred) => (
                <li key={cred.email} className="rounded-2xl bg-white p-3 text-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-100">
                  <span className="font-semibold">{cred.role}</span>: {cred.email} / {cred.password}
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 theme-dark:text-slate-300">Email or Phone</label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="admin@aiagent.local"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 theme-dark:text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password123!"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 theme-dark:border-rose-900 theme-dark:bg-rose-950 theme-dark:text-rose-300">
                {message}
              </div>
            )}
            {authError && <p className="text-sm text-rose-600">{authError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center justify-between text-sm text-slate-500 theme-dark:text-slate-400">
            <button
              type="button"
              onClick={handleSeed}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 hover:border-emerald-500 hover:bg-emerald-50 theme-dark:border-slate-800 theme-dark:bg-slate-950"
            >
              Seed demo accounts
            </button>
            <div className="space-y-1 text-right">
              <Link to="/signup" className="block font-semibold text-emerald-600 hover:text-emerald-800">
                Create an account
              </Link>
              <Link to="/" className="text-slate-500 hover:text-slate-900 theme-dark:text-slate-400">Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

