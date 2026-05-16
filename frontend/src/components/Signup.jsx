import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, canUseOAuth } from '../lib/supabaseClient'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const user = await register({ name, email, phone, password })
      navigate(user.role === 'user' ? '/' : '/admin', { replace: true })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setMessage('Redirecting to Google...')
    if (!canUseOAuth) {
      setMessage('Google signup is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
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
      setMessage('Unable to start Google signup. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 theme-dark:bg-slate-950 theme-dark:text-slate-100">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl theme-dark:border-slate-800 theme-dark:bg-slate-900">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">New agent account</p>
            <h1 className="mt-3 text-3xl font-semibold">Create your account</h1>
            <p className="mt-3 text-sm text-slate-600 theme-dark:text-slate-300">
              Sign up to save properties, view listings, and access the AI Property Agent experience.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || !canUseOAuth}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-700/20 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {!canUseOAuth && (
            <p className="text-xs text-slate-500 theme-dark:text-slate-400">
              Google signup is not configured in this environment. Fill the form below to register locally.
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 theme-dark:text-slate-400">
            <span>Or sign up with your email.</span>
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-800">
              Login
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 theme-dark:text-slate-300">Full name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 theme-dark:text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@aiagent.local"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 theme-dark:text-slate-300">Phone</label>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+254700000000"
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

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-300">
            <p className="font-semibold">Already have an account?</p>
            <p className="mt-2">
              <Link to="/login" className="text-emerald-600 hover:text-emerald-800">
                Sign in here.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
