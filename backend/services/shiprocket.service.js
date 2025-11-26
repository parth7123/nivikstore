import axios from 'axios';
import crypto from 'crypto';

// In-memory cache for Shiprocket token
export let shiprocketTokenCache = {
  token: null,
  expiry: 0
};

// Helper to get config at runtime
const getConfig = () => ({
  baseUrl: 'https://apiv2.shiprocket.in/v1/external',
  email: process.env.SHIPROCKET_API_EMAIL,
  password: process.env.SHIPROCKET_API_PASSWORD,
  // Remove surrounding quotes if present, then trim
  webhookSecret: (process.env.SHIPROCKET_WEBHOOK_SECRET || '').replace(/^['"]|['"]$/g, '').trim()
});

/**
 * Get Shiprocket authentication token
 * Shiprocket tokens are valid for approximately 240 hours (10 days)
 * We refresh proactively before expiry
 */
export async function getShiprocketToken() {
  try {
    const config = getConfig();
    // Check if credentials are configured
    if (!config.email || 
        !config.password || 
        config.email === 'your_shiprocket_email' || 
        config.password === 'your_shiprocket_password') {
      console.warn('Shiprocket credentials missing or default. specific features will be disabled/mocked.');
      return null;
    }

    // Return cached token if still valid (with 1 hour buffer)
    if (shiprocketTokenCache.token && Date.now() < shiprocketTokenCache.expiry - 60 * 60 * 1000) {
      return shiprocketTokenCache.token;
    }

    // Request new token
    const response = await axios.post(`${config.baseUrl}/auth/login`, {
      email: config.email,
      password: config.password
    });

    const token = response.data.token || response.data.data?.token;
    
    if (!token) {
      throw new Error('Failed to obtain Shiprocket authentication token');
    }

    // Cache token with 240-hour expiry (10 days)
    shiprocketTokenCache.token = token;
    shiprocketTokenCache.expiry = Date.now() + (240 * 60 * 60 * 1000);

    return token;
  } catch (error) {
    console.error('Shiprocket token generation error:', error.response?.data || error.message);
    // Return null instead of throwing to prevent app crash
    return null; 
  }
}

/**
 * Force refresh Shiprocket token (admin-only endpoint)
 */
export async function refreshShiprocketToken() {
  // Clear cache
  shiprocketTokenCache = {
    token: null,
    expiry: 0
  };
  
  // Get new token
  return await getShiprocketToken();
}

/**
 * Initialize automatic token refresh
 * Refreshes token every 8 days (before the 10-day expiry)
 */
export function initializeAutoTokenRefresh() {
  // Refresh token immediately on startup
  getShiprocketToken()
    .then(() => {
      console.log('✓ Shiprocket token initialized successfully');
    })
    .catch((error) => {
      console.error('✗ Failed to initialize Shiprocket token:', error.message);
    });

  // Set up automatic refresh every 8 days (192 hours)
  const refreshInterval = 8 * 24 * 60 * 60 * 1000; // 8 days in milliseconds
  
  setInterval(async () => {
    try {
      console.log('🔄 Auto-refreshing Shiprocket token...');
      await refreshShiprocketToken();
      console.log('✓ Shiprocket token auto-refreshed successfully');
    } catch (error) {
      console.error('✗ Failed to auto-refresh Shiprocket token:', error.message);
    }
  }, refreshInterval);

  console.log('✓ Shiprocket automatic token refresh initialized (every 8 days)');
}

/**
 * Cancel order in Shiprocket
 * @param {String} shiprocketOrderId - Shiprocket order ID
 */
export async function cancelShiprocketOrder(shiprocketOrderId) {
  try {
    const config = getConfig();
    const token = await getShiprocketToken();
    
    if (!token) {
        console.warn('Shiprocket token missing. Cannot cancel order.');
        return { success: false, message: 'Shiprocket disabled' };
    }

    const response = await axios.post(
      `${config.baseUrl}/orders/cancel`,
      { ids: [shiprocketOrderId] },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Shiprocket order cancellation error:', error.response?.data || error.message);
    throw new Error(`Failed to cancel Shiprocket order: ${error.response?.data?.message || error.message}`);
  }
}


/**
 * Get shipping rates and available couriers
 * @param {Object} shipmentData - Contains weight, dimensions, pickup & delivery pincode
 */
export async function getShippingRates(shipmentData) {
  try {
    const config = getConfig();
    const token = await getShiprocketToken();
    
    if (!token) {
        console.warn('Shiprocket token missing. Returning mock shipping rates.');
        return {
            data: {
                available_courier_companies: [
                    {
                        courier_name: "Standard Delivery (Mock)",
                        rate: 50,
                        estimated_delivery_days: 5,
                        etd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        courier_name: "Express Delivery (Mock)",
                        rate: 100,
                        estimated_delivery_days: 2,
                        etd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            }
        };
    }
    
    const response = await axios.post(`${config.baseUrl}/courier/serviceability`, {
      pickup_postcode: shipmentData.pickupPincode,
      delivery_postcode: shipmentData.deliveryPincode,
      weight: shipmentData.weight,
      length: shipmentData.length || 10,
      breadth: shipmentData.breadth || 10,
      height: shipmentData.height || 10
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Shiprocket rate calculation error:', error.response?.data || error.message);
    // Return mock data on error too to keep app usable
    return {
        data: {
            available_courier_companies: []
        }
    };
  }
}

/**
 * Create shipment in Shiprocket
 * @param {Object} orderData - Order details for shipment creation
 */
export async function createShipment(orderData) {
  try {
    const config = getConfig();
    const token = await getShiprocketToken();
    
    if (!token) {
        console.warn('Shiprocket token missing. Returning mock shipment data.');
        return {
            awb: 'MOCK-AWB-' + Date.now(),
            label_url: 'https://example.com/mock-label.pdf',
            shipment_id: 'MOCK-SHIPMENT-' + Date.now()
        };
    }

    // Prepare shipment data according to Shiprocket API
    const shipmentRequest = {
      order_id: orderData.orderId,
      shipment_id: orderData.shipmentId,
      order_date: orderData.orderDate,
      pickup_location: orderData.pickupLocation,
      billing_customer_name: orderData.billingCustomerName,
      billing_last_name: orderData.billingLastName,
      billing_address: orderData.billingAddress,
      billing_address_2: orderData.billingAddress2,
      billing_city: orderData.billingCity,
      billing_pincode: orderData.billingPincode,
      billing_state: orderData.billingState,
      billing_country: orderData.billingCountry,
      billing_email: orderData.billingEmail,
      billing_phone: orderData.billingPhone,
      shipping_is_billing: orderData.shippingIsBilling,
      shipping_customer_name: orderData.shippingCustomerName,
      shipping_last_name: orderData.shippingLastName,
      shipping_address: orderData.shippingAddress,
      shipping_address_2: orderData.shippingAddress2,
      shipping_city: orderData.shippingCity,
      shipping_pincode: orderData.shippingPincode,
      shipping_country: orderData.shippingCountry,
      shipping_state: orderData.shippingState,
      shipping_email: orderData.shippingEmail,
      shipping_phone: orderData.shippingPhone,
      order_items: orderData.orderItems,
      payment_method: orderData.paymentMethod,
      shipping_charges: orderData.shippingCharges,
      giftwrap_charges: orderData.giftwrapCharges,
      transaction_charges: orderData.transactionCharges,
      total_discount: orderData.totalDiscount,
      sub_total: orderData.subTotal,
      length: orderData.length,
      breadth: orderData.breadth,
      height: orderData.height,
      weight: orderData.weight
    };

    const response = await axios.post(`${config.baseUrl}/orders/create/adhoc`, shipmentRequest, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Shiprocket shipment creation error:', error.response?.data || error.message);
    throw new Error(`Failed to create Shiprocket shipment: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Track shipment
 * @param {String} awb - AWB number
 */
export async function trackShipment(awb) {
  try {
    const config = getConfig();
    const token = await getShiprocketToken();
    
    if (!token) {
        console.warn('Shiprocket token missing. Returning mock tracking data.');
        return {
            tracking_data: {
                track_status: 1,
                shipment_status: 7,
                shipment_track: [
                    {
                        status: "Out for Delivery",
                        time: new Date().toISOString()
                    }
                ]
            }
        };
    }

    const response = await axios.get(`${config.baseUrl}/courier/track/awb/${awb}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Shiprocket tracking error:', error.response?.data || error.message);
    throw new Error(`Failed to track shipment: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Verify webhook signature
 * @param {String} payload - Raw request body
 * @param {String} signature - x-shiprocket-signature header
 * @param {Object} headers - Request headers
 */
export function verifyWebhookSignature(payload, signature, headers = {}) {
  try {
    const config = getConfig();
    // Check for x-api-key header first (simple token auth)
    const apiKey = headers['x-api-key'];
    if (apiKey) {
      console.log(`Webhook Verify: Comparing received '${apiKey}' with stored '${config.webhookSecret}'`);
      console.log(`Webhook Verify: Lengths - Received: ${apiKey ? apiKey.length : 0}, Stored: ${config.webhookSecret ? config.webhookSecret.length : 0}`);
      // Use trim() to handle potential whitespace issues from .env files
      return apiKey === config.webhookSecret;
    }
    
    // Fallback to HMAC signature verification if needed
    if (!signature || !config.webhookSecret) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(payload)
      .digest('base64');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Normalize tracking data from Shiprocket
 */
export function normalizeTrackingData(shiprocketData) {
  const data = shiprocketData.tracking_data || shiprocketData;
  
  return {
    status: mapShiprocketStatus(data.shipment_status),
    events: (data.shipment_track || []).map(event => ({
      status: event.status,
      location: event.location,
      timestamp: event.time,
      description: event.activity
    })),
    estimatedDelivery: data.etd
  };
}

/**
 * Map Shiprocket status codes to our status
 */
function mapShiprocketStatus(statusCode) {
  const statusMap = {
    6: 'Shipped',
    7: 'Delivered',
    8: 'Canceled',
    9: 'RTO Initiated',
    10: 'RTO Delivered',
    11: 'Pending',
    12: 'Lost',
    13: 'Pickup Error',
    14: 'RTO Acknowledged',
    15: 'Pickup Rescheduled',
    16: 'Cancellation Requested',
    17: 'Out for Delivery',
    18: 'In Transit',
    19: 'Out for Pickup',
    20: 'Pickup Exception',
    21: 'Undelivered'
  };
  
  return statusMap[statusCode] || 'Processing';
}