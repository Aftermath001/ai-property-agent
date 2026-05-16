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
    new winston.transports.File({ filename: 'logs/properties.log' }),
  ],
});

// Validation schemas
const propertySchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  location: Joi.string().required().min(2).max(100),
  bedrooms: Joi.number().integer().min(1).max(10).required(),
  price: Joi.number().integer().min(1000).required(),
  description: Joi.string().required().min(10).max(1000),
});

const propertyQuerySchema = Joi.object({
  location: Joi.string().optional(),
  bedrooms: Joi.number().integer().min(1).max(10).optional(),
  min_price: Joi.number().integer().min(0).optional(),
  max_price: Joi.number().integer().max(10000000).optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

// GET /api/properties - List properties with filtering
router.get('/', async (req, res) => {
  try {
    const { error: validationError, value } = propertyQuerySchema.validate(req.query);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { location, bedrooms, min_price, max_price, limit, offset } = value;

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (bedrooms) {
      query = query.eq('bedrooms', bedrooms);
    }

    if (min_price) {
      query = query.gte('price', min_price);
    }

    if (max_price) {
      query = query.lte('price', max_price);
    }

    const { data: properties, error, count } = await query;

    if (error) {
      logger.error('Error fetching properties:', error);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }

    res.json({
      properties,
      total: count,
      limit,
      offset,
      hasMore: offset + limit < count
    });

  } catch (err) {
    logger.error('Unexpected error in properties route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/properties/:id - Get property details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      logger.error('Error fetching property:', error);
      return res.status(500).json({ error: 'Failed to fetch property' });
    }

    res.json(property);

  } catch (err) {
    logger.error('Unexpected error in property detail route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/properties - Create new property
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = propertySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const propertyData = {
      ...value,
      created_at: new Date().toISOString()
    };

    const { data: property, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating property:', error);
      return res.status(500).json({ error: 'Failed to create property' });
    }

    logger.info('Property created:', { id: property.id, title: property.title });
    res.status(201).json(property);

  } catch (err) {
    logger.error('Unexpected error in create property route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error: validationError, value } = propertySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data: property, error } = await supabase
      .from('properties')
      .update(value)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      logger.error('Error updating property:', error);
      return res.status(500).json({ error: 'Failed to update property' });
    }

    logger.info('Property updated:', { id: property.id, title: property.title });
    res.json(property);

  } catch (err) {
    logger.error('Unexpected error in update property route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting property:', error);
      return res.status(500).json({ error: 'Failed to delete property' });
    }

    logger.info('Property deleted:', { id });
    res.status(204).send();

  } catch (err) {
    logger.error('Unexpected error in delete property route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;