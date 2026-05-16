const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const { authenticate } = require('../middleware/auth')
const { supabase } = require('../config/database')

const router = express.Router()

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(8).required(),
})

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
})

const demoAccounts = [
  {
    name: 'Admin User',
    email: 'admin@aiagent.local',
    phone: '+254700000001',
    password: 'Password123!',
    role: 'admin',
    permissions: ['manage_roles', 'view_system_health']
  },
  {
    name: 'Manager User',
    email: 'manager@aiagent.local',
    phone: '+254700000002',
    password: 'Password123!',
    role: 'manager',
    permissions: ['view_analytics']
  },
  {
    name: 'Buyer User',
    email: 'user@aiagent.local',
    phone: '+254700000003',
    password: 'Password123!',
    role: 'user',
    permissions: []
  }
]

const jwtSecret = process.env.JWT_SECRET || 'ai-property-agent-secret'

const generateToken = (user) => {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, {
    expiresIn: '7d'
  })
}

router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  try {
    const { data: existing, error: existsError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${value.email},phone.eq.${value.phone}`)
      .limit(1)

    if (existsError) {
      return res.status(500).json({ error: 'Failed to verify user' })
    }
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Email or phone already registered' })
    }

    const password_hash = await bcrypt.hash(value.password, 10)
    const newUser = {
      name: value.name,
      email: value.email,
      phone: value.phone,
      password_hash,
      role: 'user',
      permissions: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert(newUser)
      .select('id, name, email, phone, role, permissions')
      .single()

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create user' })
    }

    const token = generateToken(user)
    res.status(201).json({ user, token })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  try {
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, email, phone, password_hash, role, permissions')
      .or(`email.eq.${value.identifier},phone.eq.${value.identifier}`)
      .limit(1)

    if (userError || !users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = users[0]
    const isValid = await bcrypt.compare(value.password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const payloadUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions || []
    }
    const token = generateToken(payloadUser)
    res.json({ user: payloadUser, token })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/oauth-login', async (req, res) => {
  const { email, name } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email is required for OAuth login' })
  }

  try {
    const { data: existingUsers, error: existingError } = await supabase
      .from('users')
      .select('id, name, email, phone, role, permissions')
      .eq('email', email)
      .limit(1)

    if (existingError) {
      return res.status(500).json({ error: 'Failed to verify OAuth user' })
    }

    let user = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null

    if (!user) {
      const displayName = name || email.split('@')[0]
      const newUser = {
        name: displayName,
        email,
        phone: null,
        role: 'user',
        permissions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdUser, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select('id, name, email, phone, role, permissions')
        .single()

      if (insertError) {
        return res.status(500).json({ error: 'Failed to create OAuth user' })
      }

      user = createdUser
    }

    const payloadUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions || []
    }
    const token = generateToken(payloadUser)
    res.json({ user: payloadUser, token })
  } catch (err) {
    res.status(500).json({ error: 'OAuth login failed' })
  }
})

router.post('/seed', async (req, res) => {
  try {
    const seeded = []

    for (const account of demoAccounts) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .or(`email.eq.${account.email},phone.eq.${account.phone}`)
        .limit(1)

      const password_hash = await bcrypt.hash(account.password, 10)
      const userData = {
        name: account.name,
        email: account.email,
        phone: account.phone,
        password_hash,
        role: account.role,
        permissions: account.permissions,
        updated_at: new Date().toISOString()
      }

      if (existing && existing.length > 0) {
        await supabase
          .from('users')
          .update(userData)
          .eq('id', existing[0].id)

        seeded.push({ identifier: account.email, role: account.role, status: 'updated' })
      } else {
        await supabase
          .from('users')
          .insert({ ...userData, created_at: new Date().toISOString() })

        seeded.push({ identifier: account.email, role: account.role, status: 'created' })
      }
    }

    res.json({ seeded })
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed demo accounts' })
  }
})

router.get('/profile', authenticate, async (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
