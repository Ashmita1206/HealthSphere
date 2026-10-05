const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validate } = require('../middlewares/validate');
const { nearbyHospitals } = require('../controllers/emergencyController');

const locationQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(100).max(50000).optional().default(5000),
  type: Joi.string().valid('hospital', 'pharmacy', 'clinic', 'blood_bank').optional(),
});

/**
 * GET /api/discovery/hospitals
 * Discovers nearby hospitals using live geospatial OpenStreetMap Overpass engine
 */
router.get('/hospitals', nearbyHospitals);

/**
 * GET /api/discovery/facilities
 * Discover healthcare facilities by coordinates and facility type
 */
router.get(
  '/facilities',
  validate(locationQuerySchema, 'query'),
  nearbyHospitals
);

module.exports = router;
