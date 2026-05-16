const jwt = require('jsonwebtoken')
const { supabase } = require('../config/database')

const jwtSecret = process.env.JWT_SECRET || 'ai-property-agent-secret'

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' })
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, phone, name, role, permissions')
      .eq('id', payload.sub)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      permissions: user.permissions || []
    }

    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { authenticate }
