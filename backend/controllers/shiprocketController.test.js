import { 
  refreshToken, 
  getRates, 
  createShipmentOrder, 
  trackShipmentOrder, 
  handleWebhook 
} from './shiprocketController.js';
import * as shiprocketService from '../services/shiprocket.service.js';
import Shipment from '../models/Shipment.js';
import orderModel from '../models/orderModel.js';

// Mock the models
jest.mock('../models/Shipment.js');
jest.mock('../models/orderModel.js');

// Mock the service functions
jest.mock('../services/shiprocket.service.js');

describe('Shiprocket Controller', () => {
  let mockRequest, mockResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      body: {},
      params: {},
      headers: {}
    };
    
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('refreshToken', () => {
    it('should refresh Shiprocket token successfully', async () => {
      const mockToken = 'new-token';
      shiprocketService.refreshShiprocketToken.mockResolvedValue(mockToken);

      await refreshToken(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        token: mockToken,
        message: 'Shiprocket token refreshed successfully'
      });
    });

    it('should handle token refresh errors', async () => {
      const errorMessage = 'Token refresh failed';
      shiprocketService.refreshShiprocketToken.mockRejectedValue(new Error(errorMessage));

      await refreshToken(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('getRates', () => {
    it('should get shipping rates successfully', async () => {
      mockRequest.body = {
        pickupPincode: '110001',
        deliveryPincode: '400001',
        weight: 0.5
      };

      const mockRates = { data: { rates: [] } };
      shiprocketService.getShippingRates.mockResolvedValue(mockRates);

      await getRates(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRates
      });
    });

    it('should return error for missing parameters', async () => {
      mockRequest.body = {
        pickupPincode: '110001'
        // Missing deliveryPincode and weight
      };

      await getRates(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required parameters: pickupPincode, deliveryPincode, weight'
      });
    });
  });

  describe('createShipmentOrder', () => {
    it('should create shipment successfully', async () => {
      mockRequest.body = {
        orderId: 'order-123'
      };

      const mockShiprocketResponse = {
        awb: '123456789',
        label_url: 'https://example.com/label.pdf',
        shipment_id: 'shipment-123'
      };

      shiprocketService.createShipment.mockResolvedValue(mockShiprocketResponse);

      const mockShipment = { _id: 'shipment-db-123', save: jest.fn() };
      Shipment.mockImplementation(() => mockShipment);

      orderModel.findByIdAndUpdate.mockResolvedValue({});

      await createShipmentOrder(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          shipmentId: 'shipment-db-123',
          awb: '123456789',
          labelUrl: 'https://example.com/label.pdf',
          shiprocketShipmentId: 'shipment-123',
          message: 'Shipment created successfully'
        }
      });
    });

    it('should return error for missing orderId', async () => {
      mockRequest.body = {};

      await createShipmentOrder(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required parameter: orderId'
      });
    });
  });

  describe('trackShipmentOrder', () => {
    it('should track shipment successfully', async () => {
      mockRequest.params = { awb: '123456789' };

      const mockTrackingData = {
        tracking_data: {
          awb: '123456789',
          current_status: 'In Transit'
        }
      };

      shiprocketService.trackShipment.mockResolvedValue(mockTrackingData);
      shiprocketService.normalizeTrackingData.mockReturnValue({
        awb: '123456789',
        status: 'In Transit',
        events: []
      });

      const mockShipment = { save: jest.fn() };
      Shipment.findOne.mockResolvedValue(mockShipment);

      await trackShipmentOrder(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          awb: '123456789',
          status: 'In Transit',
          events: []
        }
      });
    });

    it('should return error for missing AWB', async () => {
      mockRequest.params = {};

      await trackShipmentOrder(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required parameter: awb'
      });
    });
  });

  describe('handleWebhook', () => {
    it('should handle valid webhook with tracking update', async () => {
      const payload = {
        event: 'shipment.tracking',
        awb: '123456789',
        tracking_data: { current_status: 'In Transit' }
      };

      mockRequest.body = payload;
      mockRequest.headers['x-shiprocket-signature'] = 'valid-signature';

      shiprocketService.verifyWebhookSignature.mockReturnValue(true);
      Shipment.findOne.mockResolvedValue({ save: jest.fn() });

      await handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook processed successfully'
      });
    });

    it('should reject invalid webhook signature', async () => {
      mockRequest.headers['x-shiprocket-signature'] = 'invalid-signature';
      shiprocketService.verifyWebhookSignature.mockReturnValue(false);

      await handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid webhook signature'
      });
    });
  });
});