import { 
  getShiprocketToken, 
  refreshShiprocketToken, 
  getShippingRates, 
  createShipment, 
  trackShipment, 
  verifyWebhookSignature, 
  normalizeTrackingData 
} from '../services/shiprocket.service.js';
import Shipment from '../models/Shipment.js';
import orderModel from '../models/orderModel.js';

/**
 * Force refresh Shiprocket token (admin-only)
 */
export const refreshToken = async (req, res) => {
  try {
    const token = await refreshShiprocketToken();
    res.json({
      success: true,
      token: token,
      message: 'Shiprocket token refreshed successfully'
    });
  } catch (error) {
    console.error('Shiprocket token refresh error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get shipping rates and available couriers
 */
export const getRates = async (req, res) => {
  try {
    const { pickupPincode, deliveryPincode, weight, dimensions } = req.body;
    
    if (!pickupPincode || !deliveryPincode || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: pickupPincode, deliveryPincode, weight'
      });
    }

    const shipmentData = {
      pickupPincode,
      deliveryPincode,
      weight,
      ...dimensions // Optional: length, breadth, height
    };

    const rates = await getShippingRates(shipmentData);
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Shiprocket rates error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create shipment in Shiprocket
 */
export const createShipmentOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: orderId'
      });
    }

    // Create shipment in Shiprocket
    const shiprocketResponse = await createShipment(orderData);
    
    // Save shipment to our database
    const shipment = new Shipment({
      orderId: orderData.orderId,
      awb: shiprocketResponse.awb,
      status: 'Pending',
      labelUrl: shiprocketResponse.label_url,
      courier: 'Shiprocket',
      provider: 'shiprocket',
      providerOrderId: shiprocketResponse.shipment_id
    });
    
    await shipment.save();
    
    // Update order with shipment reference
    await orderModel.findByIdAndUpdate(orderData.orderId, {
      shipmentId: shipment._id,
      'shipping.provider': 'shiprocket',
      'shipping.providerOrderId': shiprocketResponse.shipment_id,
      'shipping.awb': shiprocketResponse.awb,
      'shipping.labelUrl': shiprocketResponse.label_url
    });
    
    res.json({
      success: true,
      data: {
        shipmentId: shipment._id,
        awb: shiprocketResponse.awb,
        labelUrl: shiprocketResponse.label_url,
        shiprocketShipmentId: shiprocketResponse.shipment_id,
        message: 'Shipment created successfully'
      }
    });
  } catch (error) {
    console.error('Shiprocket shipment creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Track shipment by AWB
 */
export const trackShipmentOrder = async (req, res) => {
  try {
    const { awb } = req.params;
    
    if (!awb) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: awb'
      });
    }

    // Get tracking data from Shiprocket
    const trackingData = await trackShipment(awb);
    
    // Normalize data to our standard format
    const normalizedData = normalizeTrackingData(trackingData);
    
    // Update our database with latest tracking info
    const shipment = await Shipment.findOne({ awb: awb });
    if (shipment) {
      shipment.status = normalizedData.status;
      shipment.events = normalizedData.events;
      await shipment.save();
    }
    
    res.json({
      success: true,
      data: normalizedData
    });
  } catch (error) {
    console.error('Shiprocket tracking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Handle Shiprocket webhooks
 */
export const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-shiprocket-signature'];
    const rawBody = JSON.stringify(req.body);
    
    console.log('Webhook Debug - Headers:', JSON.stringify(req.headers));
    console.log('Webhook Debug - Configured Secret:', process.env.SHIPROCKET_WEBHOOK_SECRET);

    if (!verifyWebhookSignature(rawBody, signature, req.headers)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature or token'
      });
    }

    // Process webhook event
    const eventData = req.body;
    const eventType = eventData.event || 'unknown';
    
    console.log(`Shiprocket webhook received: ${eventType}`, eventData);
    
    // Handle different event types
    switch (eventType) {
      case 'shipment.created':
        // Handle shipment creation
        break;
      case 'shipment.tracking':
        // Handle tracking updates
        await handleTrackingUpdate(eventData);
        break;
      case 'shipment.delivered':
        // Handle delivery confirmation
        await handleDeliveryConfirmation(eventData);
        break;
      default:
        console.log(`Unhandled Shiprocket event type: ${eventType}`);
    }
    
    // Acknowledge webhook receipt
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Shiprocket webhook error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Handle tracking updates from webhook
 */
async function handleTrackingUpdate(eventData) {
  try {
    const { awb, tracking_data } = eventData;
    
    if (!awb || !tracking_data) {
      console.warn('Invalid tracking update data received');
      return;
    }
    
    // Find shipment by AWB
    const shipment = await Shipment.findOne({ awb: awb });
    if (!shipment) {
      console.warn(`Shipment not found for AWB: ${awb}`);
      return;
    }
    
    // Update shipment with new tracking data
    const normalizedData = normalizeTrackingData({ tracking_data });
    shipment.status = normalizedData.status;
    shipment.events = normalizedData.events;
    shipment.updatedAt = Date.now();
    
    await shipment.save();
    
    console.log(`Shipment tracking updated for AWB: ${awb}`);
  } catch (error) {
    console.error('Error handling tracking update:', error);
  }
}

/**
 * Handle delivery confirmation from webhook
 */
async function handleDeliveryConfirmation(eventData) {
  try {
    const { awb } = eventData;
    
    if (!awb) {
      console.warn('Invalid delivery confirmation data received');
      return;
    }
    
    // Find shipment by AWB
    const shipment = await Shipment.findOne({ awb: awb });
    if (!shipment) {
      console.warn(`Shipment not found for AWB: ${awb}`);
      return;
    }
    
    // Update shipment status
    shipment.status = 'Delivered';
    shipment.updatedAt = Date.now();
    
    await shipment.save();
    
    // Update order status if needed
    const order = await orderModel.findById(shipment.orderId);
    if (order) {
      order.status = 'Delivered';
      await order.save();
    }
    
    console.log(`Shipment delivered for AWB: ${awb}`);
  } catch (error) {
    console.error('Error handling delivery confirmation:', error);
  }
}