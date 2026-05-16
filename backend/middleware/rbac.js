const rolePermissions = {
  admin: [
    'view_properties',
    'save_properties',
    'request_viewing',
    'chat_with_manager',
    'manage_leads',
    'manage_properties',
    'manage_appointments',
    'view_analytics',
    'manage_workflows',
    'manage_roles',
    'view_system_health'
  ],
  manager: [
    'view_properties',
    'manage_leads',
    'manage_properties',
    'manage_appointments',
    'chat_with_manager',
    'view_analytics'
  ],
  user: [
    'view_properties',
    'save_properties',
    'request_viewing',
    'chat_with_manager'
  ]
}

const permit = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userPermissions = new Set([
      ...(req.user.permissions || []),
      ...(rolePermissions[req.user.role] || [])
    ])

    const isAllowed = requiredPermissions.every(permission => userPermissions.has(permission))
    if (!isAllowed) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    return next()
  }
}

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

module.exports = { permit, requireRole }
