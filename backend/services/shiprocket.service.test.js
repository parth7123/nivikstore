import axios from 'axios';
import crypto from 'crypto';
import * as shiprocketService from './shiprocket.service.js';

// Mock axios
jest.mock('axios');

describe('Shiprocket Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getShiprocketToken', () => {
    it('should return cached token if still valid', async () => {
      // Set up cache with valid token
      const validToken = 'valid-token';
      shiprocketService.shiprocketTokenCache.token = validToken;
      shiprocketService.shiprocketTokenCache.expiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours from now

      const token = await shiprocketService.getShiprocketToken();
      expect(token).toBe(validToken);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should fetch new token if cache is expired', async () => {
      // Set up cache with expired token
      shiprocketService.shiprocketTokenCache.token = 'expired-token';
      shiprocketService.shiprocketTokenCache.expiry = Date.now() - 1000; // 1 second ago

      const mockResponse = { data: { token: 'new-token' } };
      axios.post.mockResolvedValue(mockResponse);

      const token = await shiprocketService.getShiprocketToken();
      expect(token).toBe('new-token');
      expect(axios.post).toHaveBeenCalledWith(
        'https://apiv2.shiprocket.in/v1/external/auth/login',
        {
          email: process.env.SHIPROCKET_API_EMAIL,
          password: process.env.SHIPROCKET_API_PASSWORD
        }
      );
    });

    it('should handle authentication errors', async () => {
      shiprocketService.shiprocketTokenCache.token = null;
      shiprocketService.shiprocketTokenCache.expiry = 0;

      // Mock axios to return a response with data property
      const errorResponse = { response: { data: { message: 'Authentication failed' } } };
      axios.post.mockRejectedValue(errorResponse);

      await expect(shiprocketService.getShiprocketToken()).rejects.toThrow('Failed to authenticate with Shiprocket');
    });
  });

  describe('getShippingRates', () => {
    it('should fetch shipping rates successfully', async () => {
      const mockToken = 'test-token';
      const mockResponse = { data: { data: { available_courier_companies: [] } } };
      
      // Mock token retrieval
      jest.spyOn(shiprocketService, 'getShiprocketToken').mockResolvedValue(mockToken);
      axios.post.mockResolvedValue(mockResponse);

      const shipmentData = {
        pickupPincode: '110001',
        deliveryPincode: '400001',
        weight: 0.5
      };

      const result = await shiprocketService.getShippingRates(shipmentData);
      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        'https://apiv2.shiprocket.in/v1/external/courier/serviceability',
        {
          pickup_postcode: shipmentData.pickupPincode,
          delivery_postcode: shipmentData.deliveryPincode,
          weight: shipmentData.weight,
          length: 10,
          breadth: 10,
          height: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should handle rate calculation errors', async () => {
      jest.spyOn(shiprocketService, 'getShiprocketToken').mockResolvedValue('test-token');
      axios.post.mockRejectedValue(new Error('Rate calculation failed'));

      const shipmentData = {
        pickupPincode: '110001',
        deliveryPincode: '400001',
        weight: 0.5
      };

      await expect(shiprocketService.getShippingRates(shipmentData)).rejects.toThrow('Failed to calculate shipping rates');
    });
  });

  describe('verifyWebhookSignature', () => {
    beforeEach(() => {
      // Set the webhook secret
      process.env.SHIPROCKET_WEBHOOK_SECRET = 'test-secret';
    });

    it('should verify valid webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
      
      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // The function expects the signature to be a hex string, not a buffer
      const result = shiprocketService.verifyWebhookSignature(payload, expectedSignature);
      expect(result).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
      
      const result = shiprocketService.verifyWebhookSignature(payload, 'invalid-signature');
      expect(result).toBe(false);
    });
  });

  describe('normalizeTrackingData', () => {
    it('should normalize Shiprocket tracking data', () => {
      const shiprocketData = {
        tracking_data: {
          awb: '123456789',
          current_status: 'In Transit',
          courier_name: 'DTDC',
          shipment_track_activities: [
            {
              status: 'Pickup Scheduled',
              activity: 'Pickup scheduled for 10:00 AM',
              date: '2023-01-01T10:00:00Z',
              location: 'Mumbai'
            }
          ]
        },
        label_url: 'https://example.com/label.pdf'
      };

      const normalized = shiprocketService.normalizeTrackingData(shiprocketData);
      
      expect(normalized).toEqual({
        awb: '123456789',
        status: 'In Transit',
        courier: 'DTDC',
        labelUrl: 'https://example.com/label.pdf',
        events: [
          {
            status: 'Pickup Scheduled',
            message: 'Pickup scheduled for 10:00 AM',
            timestamp: '2023-01-01T10:00:00Z',
            location: 'Mumbai',
            raw: shiprocketData.tracking_data.shipment_track_activities[0]
          }
        ]
      });
    });

    it('should handle missing tracking data', () => {
      const shiprocketData = {};
      
      const normalized = shiprocketService.normalizeTrackingData(shiprocketData);
      
      expect(normalized).toEqual({
        awb: '',
        status: 'Unknown',
        courier: '',
        labelUrl: '',
        events: []
      });
    });
  });
});