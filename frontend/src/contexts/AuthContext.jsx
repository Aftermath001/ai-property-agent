import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const localDummyUsers = [
  {
    id: 'local-admin',
    name: 'Local Admin',
    email: 'admin@aiagent.local',
    phone: '+254700000001',
    role: 'admin',
    permissions: ['manage_roles', 'view_system_health'],
    password: 'Password123!'
  },
  {
    id: 'local-manager',
    name: 'Local Manager',
    email: 'manager@aiagent.local',
    phone: '+254700000002',
    role: 'manager',
    permissions: ['view_analytics'],
    password: 'Password123!'
  },
  {
    id: 'local-user',
    name: 'Local Buyer',
    email: 'user@aiagent.local',
    phone: '+254700000003',
    role: 'user',
    permissions: [],
    password: 'Password123!'
  }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('aiPropertyAgentToken'))
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      const storedUser = localStorage.getItem('aiPropertyAgentUser')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error('Failed to read stored user', error)
          setUser(null)
        }
      }
    } else {
      delete axios.defaults.headers.common.Authorization
      setUser(null)
    }
    setLoading(false)
  }, [token])

  const authenticate = (authToken, authUser) => {
    localStorage.setItem('aiPropertyAgentToken', authToken)
    localStorage.setItem('aiPropertyAgentUser', JSON.stringify(authUser))
    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`
    setToken(authToken)
    setUser(authUser)
  }

  const login = async (values) => {
    setAuthError(null)
    const identifier = values.identifier?.trim().toLowerCase()
    const dummy = localDummyUsers.find(
      (account) =>
        (account.email.toLowerCase() === identifier || account.phone === identifier) &&
        account.password === values.password
    )
    if (dummy) {
      const authUser = { ...dummy }
      delete authUser.password
      authenticate(`local-token-${authUser.id}`, authUser)
      return authUser
    }

    try {
      const response = await axios.post('/auth/login', values)
      const { token: authToken, user: authUser } = response.data
      authenticate(authToken, authUser)
      return authUser
    } catch (error) {
      let message
      if (error?.message?.includes('Network Error')) {
        message = 'Backend not available. Use local demo credentials or signup locally.'
      } else {
        message = error?.response?.data?.error || 'Login failed'
      }
      setAuthError(message)
      throw new Error(message)
    }
  }

  const register = async (values) => {
    setAuthError(null)
    if (!values?.email || !values?.password) {
      throw new Error('Email and password are required')
    }

    const exists = localDummyUsers.some((account) => account.email === values.email)
    if (exists) {
      throw new Error('This dummy email is already reserved for local login. Use a valid demo email.')
    }

    const authUser = {
      id: `local-${Date.now()}`,
      name: values.name || 'Local User',
      email: values.email,
      phone: values.phone || null,
      role: 'user',
      permissions: [],
      password: values.password
    }
    authenticate(`local-token-${authUser.id}`, authUser)
    return authUser
  }

  const logout = () => {
    localStorage.removeItem('aiPropertyAgentToken')
    localStorage.removeItem('aiPropertyAgentUser')
    delete axios.defaults.headers.common.Authorization
    setToken(null)
    setUser(null)
  }

  const seedDemoUsers = async () => {
    try {
      const response = await axios.post('/auth/seed')
      return response.data
    } catch (error) {
      return { seeded: localDummyUsers.map((user) => ({ identifier: user.email, role: user.role, status: 'local' })) }
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authError,
      login,
      register,
      logout,
      seedDemoUsers,
      authenticate,
      localDummyUsers
    }),
    [user, token, loading, authError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
