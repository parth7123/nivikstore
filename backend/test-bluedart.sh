#!/bin/bash

# Sample curl commands to test Blue Dart API endpoints
# Replace placeholders with actual values

BASE_URL="http://localhost:4000"
ADMIN_TOKEN="your-admin-token"
ORDER_ID="your-order-id"
AWB="BD123456789"
PINCODE="110001"

echo "Testing Blue Dart API endpoints..."

# 1. Check serviceability
echo "1. Checking serviceability for pincode $PINCODE..."
curl -X POST "$BASE_URL/api/bluedart/serviceability" \
  -H "Content-Type: application/json" \
  -d "{\"pincode\": \"$PINCODE\"}"

echo -e "\n"

# 2. Create shipment (requires admin token)
echo "2. Creating shipment for order $ORDER_ID..."
curl -X POST "$BASE_URL/api/bluedart/create-shipment" \
  -H "Content-Type: application/json" \
  -H "token: $ADMIN_TOKEN" \
  -d "{\"orderId\": \"$ORDER_ID\"}"

echo -e "\n"

# 3. Track shipment
echo "3. Tracking shipment with AWB $AWB..."
curl -X GET "$BASE_URL/api/bluedart/track/$AWB"

echo -e "\n"

# 4. Test webhook (simulate Blue Dart sending update)
echo "4. Testing webhook..."
curl -X POST "$BASE_URL/api/bluedart/webhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"awb\": \"$AWB\",
    \"status\": \"In Transit\",
    \"location\": \"Mumbai\",
    \"description\": \"Package is in transit\"
  }"

echo -e "\nTest completed!"