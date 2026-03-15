import express from 'express';
import { getNearbyLocations } from '../controllers/locationController.js';

const router = express.Router();

// @route   GET /api/v1/locations/nearby
// @desc    Get nearby agriculture locations
// @access  Public
router.get('/nearby', getNearbyLocations);

export default router;
