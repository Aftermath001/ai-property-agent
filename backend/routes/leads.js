const express = require('express');
const Joi = require('joi');
const { supabase } = require('../config/database');
const winston = require('winston');

const router = express.Router();

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/leads.log' }),
  ],
});

// Validation schemas
const leadQuerySchema = Joi.object({
  category: Joi.string().valid('hot', 'warm', 'cold').optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().optional(),
});

// GET /api/leads - Fetch all leads with filtering
router.get('/', async (req, res) => {
  try {
    const { error: validationError, value } = leadQuerySchema.validate(req.query);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { category, limit, offset, search } = value;

    let query = supabase
      .from('property_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('lead_category', category);
    }

    if (search) {
      query = query.or(`phone.ilike.%${search}%,location.ilike.%${search}%,message.ilike.%${search}%`);
    }

    const { data: leads, error, count } = await query;

    if (error) {
      logger.error('Error fetching leads:', error);
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }

    res.json({
      leads,
      total: count,
      limit,
      offset,
      hasMore: offset + limit < count
    });

  } catch (err) {
    logger.error('Unexpected error in leads route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leads/:id - Get lead details with matched properties
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch lead
    const { data: lead, error: leadError } = await supabase
      .from('property_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (leadError) {
      if (leadError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Lead not found' });
      }
      logger.error('Error fetching lead:', leadError);
      return res.status(500).json({ error: 'Failed to fetch lead' });
    }

    // Fetch matched properties based on lead criteria
    let propertyQuery = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (lead.location) {
      propertyQuery = propertyQuery.ilike('location', `%${lead.location}%`);
    }

    if (lead.bedrooms) {
      propertyQuery = propertyQuery.eq('bedrooms', lead.bedrooms);
    }

    if (lead.budget) {
      propertyQuery = propertyQuery.lte('price', lead.budget);
    }

    const { data: matchedProperties, error: propertyError } = await propertyQuery.limit(5);

    if (propertyError) {
      logger.error('Error fetching matched properties:', propertyError);
      // Don't fail the request if property matching fails
    }

    res.json({
      lead,
      matchedProperties: matchedProperties || []
    });

  } catch (err) {
    logger.error('Unexpected error in lead detail route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leads/stats/summary - Get lead statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .rpc('get_lead_stats');

    if (error) {
      // Fallback to manual aggregation if RPC doesn't exist
      const { data: leads, error: leadsError } = await supabase
        .from('property_leads')
        .select('lead_category, lead_score, created_at');

      if (leadsError) {
        logger.error('Error fetching lead stats:', leadsError);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      const summary = {
        total: leads.length,
        hot: leads.filter(l => l.lead_category === 'hot').length,
        warm: leads.filter(l => l.lead_category === 'warm').length,
        cold: leads.filter(l => l.lead_category === 'cold').length,
        average_score: leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length,
        recent_leads: leads.filter(l => {
          const created = new Date(l.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return created > weekAgo;
        }).length
      };

      return res.json(summary);
    }

    res.json(stats);

  } catch (err) {
    logger.error('Unexpected error in stats route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;