# Shiprocket Integration Guide

## Setup Instructions

1. Obtain your Shiprocket API credentials:
   - Sign up at https://www.shiprocket.in/
   - Go to Settings > API > API Users
   - Create an API user or use your existing account credentials
   - Add these to your backend `.env` file:

```
SHIPROCKET_API_EMAIL=your_shiprocket_email
SHIPROCKET_API_PASSWORD=your_shiprocket_password
SHIPROCKET_WEBHOOK_SECRET=your_shiprocket_webhook_secret
```

2. Configure webhooks in your Shiprocket dashboard:
   - Go to Settings > API > Webhooks
   - Add a new webhook with the following settings:
   - URL: `https://your-domain.com/api/shipping/shiprocket/webhook`
   - Secret: Your `SHIPROCKET_WEBHOOK_SECRET`
   - Events: Select all shipment-related events

## API Endpoints

### Authentication
```bash
# Refresh Shiprocket token (admin-only)
curl -X POST http://localhost:4000/api/shipping/shiprocket/token \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Shipping Rates
```bash
# Get shipping rates and available couriers
curl -X POST http://localhost:4000/api/shipping/shiprocket/rates \
  -H "Content-Type: application/json" \
  -d '{
    "pickupPincode": "110001",
    "deliveryPincode": "400001",
    "weight": 0.5,
    "dimensions": {
      "length": 10,
      "breadth": 10,
      "height": 10
    }
  }'
```

### Shipment Creation
```bash
# Create shipment in Shiprocket (admin-only)
curl -X POST http://localhost:4000/api/shipping/shiprocket/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "orderId": "order-123",
    "orderDate": "2023-01-01",
    "pickupLocation": "Primary Warehouse",
    "billingCustomerName": "John",
    "billingLastName": "Doe",
    "billingAddress": "123 Main Street",
    "billingCity": "Mumbai",
    "billingPincode": "400001",
    "billingState": "Maharashtra",
    "billingCountry": "India",
    "billingEmail": "john.doe@example.com",
    "billingPhone": "9876543210",
    "shippingIsBilling": true,
    "orderItems": [
      {
        "name": "Test Product",
        "sku": "TEST-001",
        "units": 1,
        "selling_price": 500,
        "discount": 0,
        "tax": 0,
        "hsn": "123456"
      }
    ],
    "paymentMethod": "Prepaid",
    "subTotal": 500,
    "length": 10,
    "breadth": 10,
    "height": 10,
    "weight": 0.5
  }'
```

### Shipment Tracking
```bash
# Track shipment by AWB
curl -X GET http://localhost:4000/api/shipping/shiprocket/track/123456789
```

### Webhook Testing
```bash
# Simulate a webhook event
curl -X POST http://localhost:4000/api/shipping/shiprocket/webhook \
  -H "Content-Type: application/json" \
  -H "X-Shiprocket-Signature: YOUR_SIGNATURE" \
  -d '{
    "event": "shipment.tracking",
    "awb": "123456789",
    "tracking_data": {
      "current_status": "In Transit",
      "courier_name": "DTDC",
      "shipment_track_activities": [
        {
          "status": "Pickup Scheduled",
          "activity": "Pickup scheduled for 10:00 AM",
          "date": "2023-01-01T10:00:00Z",
          "location": "Mumbai"
        }
      ]
    }
  }'
```

## Testing

1. Run unit tests:
```bash
cd backend
npm test
```

2. Use the provided Postman collection:
   - Import `SHIPROCKET_INTEGRATION.postman_collection.json` into Postman
   - Update the variables with your actual values
   - Run the requests to test each endpoint

3. Test through the admin panel UI:
   - Log in to the admin panel
   - Navigate to the orders page
   - Select an order and use the Shiprocket shipping options

## Implementation Notes

### Token Management
- Shiprocket tokens are valid for approximately 240 hours (10 days)
- The service automatically refreshes tokens before they expire
- You can manually refresh tokens using the admin endpoint

### Rate Calculation
- The service calls Shiprocket's courier serviceability API
- Results include available couriers, rates, and estimated delivery times
- Dimensions are optional but recommended for accurate pricing

### Shipment Creation
- The service creates shipments in Shiprocket and stores tracking information
- AWB numbers, labels, and tracking data are saved to the database
- Orders are linked to shipments for easy retrieval

### Webhook Handling
- Webhooks are verified using HMAC signatures
- Supported events include tracking updates and delivery confirmations
- Events are stored in the database and can trigger notifications

### Error Handling
- All API calls include proper error handling and logging
- Transient errors are retried automatically
- Detailed error messages are returned to clients