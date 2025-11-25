# Blue Dart API Integration Guide

This guide explains how to implement the actual Blue Dart API calls in the placeholder functions.

## 1. Serviceability Check API

Replace the placeholder code in `checkServiceability` function with the actual Blue Dart API call:

```javascript
// Replace the simulated response with actual Blue Dart API call
const xmlRequest = `
<?xml version="1.0" encoding="utf-8"?>
<ServiceabilityRequest>
  <RequestFields>
    <LicenceKey>${BLUEDART_CONFIG.licenseKey}</LicenceKey>
    <LoginID>${BLUEDART_CONFIG.loginId}</LoginID>
    <PinCode>${pincode}</PinCode>
  </RequestFields>
</ServiceabilityRequest>`;

const response = await axios.post(
  `${BLUEDART_CONFIG.apiBaseUrl}/Serviceability.svc/ServiceabilityCheck`,
  xmlRequest,
  {
    headers: {
      'Content-Type': 'text/xml'
    }
  }
);

const parsedResponse = parser.parse(response.data);
const isServiceable = parsedResponse.ServiceabilityResponse.IsServiceable === 'true';

res.json({
  success: true,
  serviceable: isServiceable,
  message: isServiceable ? 'Location is serviceable' : 'Location is not serviceable'
});
```

## 2. Waybill Generation API

Replace the placeholder code in `createShipment` function with the actual Blue Dart API call:

```javascript
// Replace the simulated response with actual Blue Dart API call
const xmlRequest = `
<?xml version="1.0" encoding="utf-8"?>
<WaybillRequest>
  <RequestFields>
    <LicenceKey>${BLUEDART_CONFIG.licenseKey}</LicenceKey>
    <LoginID>${BLUEDART_CONFIG.loginId}</LoginID>
    <CustomerCode>${BLUEDART_CONFIG.customerCode}</CustomerCode>
    <OrderNo>${order._id}</OrderNo>
    <Consignee>
      <Name>${order.address.firstName} ${order.address.lastName}</Name>
      <Address1>${order.address.street}</Address1>
      <City>${order.address.city}</City>
      <PinCode>${order.address.zipcode}</PinCode>
      <State>${order.address.state}</State>
      <Phone>${order.address.phone}</Phone>
    </Consignee>
    <Pieces>${order.items.length}</Pieces>
    <Weight>${calculateTotalWeight(order.items)}</Weight>
    <Amount>${order.amount}</Amount>
  </RequestFields>
</WaybillRequest>`;

const response = await axios.post(
  `${BLUEDART_CONFIG.apiBaseUrl}/WaybillGeneration.svc/GenerateWaybill`,
  xmlRequest,
  {
    headers: {
      'Content-Type': 'text/xml'
    }
  }
);

const parsedResponse = parser.parse(response.data);
const awb = parsedResponse.WaybillResponse.AWBNo;
const labelUrl = parsedResponse.WaybillResponse.LabelUrl;

// Save shipment to database
const shipment = new Shipment({
  orderId: order._id,
  awb: awb,
  status: 'Pickup Scheduled',
  labelUrl: labelUrl
});

await shipment.save();

// Update order with shipment reference
await orderModel.findByIdAndUpdate(order._id, { shipmentId: shipment._id });

res.json({
  success: true,
  awb: awb,
  labelUrl: labelUrl,
  message: 'Shipment created successfully'
});
```

## 3. Tracking API

Replace the placeholder code in `trackShipment` function with the actual Blue Dart API call:

```javascript
// Replace the simulated response with actual Blue Dart API call
const xmlRequest = `
<?xml version="1.0" encoding="utf-8"?>
<TrackRequest>
  <RequestFields>
    <LicenceKey>${BLUEDART_CONFIG.licenseKey}</LicenceKey>
    <LoginID>${BLUEDART_CONFIG.loginId}</LoginID>
    <AWBNo>${awb}</AWBNo>
  </RequestFields>
</TrackRequest>`;

const response = await axios.post(
  `${BLUEDART_CONFIG.apiBaseUrl}/Tracking.svc/TrackShipment`,
  xmlRequest,
  {
    headers: {
      'Content-Type': 'text/xml'
    }
  }
);

const parsedResponse = parser.parse(response.data);
const trackingEvents = parsedResponse.TrackingResponse.Events;

// Update shipment with tracking events
const events = trackingEvents.map(event => ({
  status: event.Status,
  location: event.Location,
  timestamp: new Date(event.DateTime),
  description: event.Description
}));

// Update shipment in database
await Shipment.findOneAndUpdate(
  { awb: awb },
  { 
    events: events,
    status: events.length > 0 ? events[events.length - 1].status : 'Unknown'
  }
);

res.json({
  success: true,
  awb: awb,
  status: events.length > 0 ? events[events.length - 1].status : 'Unknown',
  events: events,
  labelUrl: shipment.labelUrl
});
```

## 4. Webhook Validation

Implement proper webhook validation in `handleWebhook` function:

```javascript
// Add proper webhook validation
const signature = req.headers['x-bluedart-signature'];
const expectedSignature = createHmac('sha256', process.env.BLUEDART_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ success: false, message: 'Invalid signature' });
}
```

## 5. Environment Variables

Make sure to add the webhook secret to your `.env` file:

```
BLUEDART_LOGIN_ID=your_login_id
BLUEDART_LICENSE_KEY=your_license_key
BLUEDART_CUSTOMER_CODE=your_customer_code
BLUEDART_API_BASE_URL=https://api.bluedart.com
BLUEDART_WEBHOOK_SECRET=your_webhook_secret
```

## 6. Helper Functions

Implement the `calculateTotalWeight` function based on your product data:

```javascript
// Helper function to calculate total weight
function calculateTotalWeight(items) {
  // Adjust this based on your product data structure
  return items.reduce((total, item) => {
    // Example: if each item has a weight property
    return total + (item.weight || 0.5) * item.quantity;
  }, 0);
}
```

## 7. Error Handling

Add proper error handling for all API calls:

```javascript
try {
  const response = await axios.post(
    `${BLUEDART_CONFIG.apiBaseUrl}/Serviceability.svc/ServiceabilityCheck`,
    xmlRequest,
    {
      headers: {
        'Content-Type': 'text/xml'
      }
    }
  );
  
  // Process response
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Blue Dart API error:', error.response.data);
    res.status(error.response.status).json({
      success: false,
      message: 'Blue Dart API error'
    });
  } else if (error.request) {
    // Request was made but no response received
    console.error('Blue Dart API request error:', error.request);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Blue Dart API'
    });
  } else {
    // Something else happened
    console.error('Blue Dart API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to call Blue Dart API'
    });
  }
}
```

## 8. Testing

After implementing the actual API calls, test using:

1. The provided curl scripts (`test-bluedart.sh` or `test-bluedart.bat`)
2. The Jest test file (`bluedart.test.js`)
3. Manual testing through the admin panel

## 9. Production Considerations

1. Implement proper logging for all API calls
2. Add retry logic for failed API calls
3. Implement rate limiting to avoid exceeding API quotas
4. Add monitoring and alerting for API failures
5. Secure all environment variables
6. Register your webhook URL in the Blue Dart panel