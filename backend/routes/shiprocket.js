import express from 'express';
import { 
  refreshToken,
  getRates,
  createShipmentOrder,
  trackShipmentOrder,
  handleWebhook
} from '../controllers/shiprocketController.js';
import adminAuth from '../middleware/adminAuth.js';

const shiprocketRouter = express.Router();

// Public endpoints
shiprocketRouter.post('/rates', getRates);
shiprocketRouter.get('/track/:awb', trackShipmentOrder);
shiprocketRouter.post('/webhook', handleWebhook);

// Admin endpoints
shiprocketRouter.post('/token', adminAuth, refreshToken);
shiprocketRouter.post('/create', adminAuth, createShipmentOrder);

export default shiprocketRouter;