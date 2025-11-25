@echo off
REM Sample batch file to test Blue Dart API endpoints
REM Replace placeholders with actual values

set BASE_URL=http://localhost:4000
set ADMIN_TOKEN=your-admin-token
set ORDER_ID=your-order-id
set AWB=BD123456789
set PINCODE=110001

echo Testing Blue Dart API endpoints...

REM 1. Check serviceability
echo 1. Checking serviceability for pincode %PINCODE%...
curl -X POST "%BASE_URL%/api/bluedart/serviceability" ^
  -H "Content-Type: application/json" ^
  -d "{\"pincode\": \"%PINCODE%\"}"

echo.

REM 2. Create shipment (requires admin token)
echo 2. Creating shipment for order %ORDER_ID%...
curl -X POST "%BASE_URL%/api/bluedart/create-shipment" ^
  -H "Content-Type: application/json" ^
  -H "token: %ADMIN_TOKEN%" ^
  -d "{\"orderId\": \"%ORDER_ID%\"}"

echo.

REM 3. Track shipment
echo 3. Tracking shipment with AWB %AWB%...
curl -X GET "%BASE_URL%/api/bluedart/track/%AWB%"

echo.

REM 4. Test webhook (simulate Blue Dart sending update)
echo 4. Testing webhook...
curl -X POST "%BASE_URL%/api/bluedart/webhook" ^
  -H "Content-Type: application/json" ^
  -d "{ \"awb\": \"%AWB%\", \"status\": \"In Transit\", \"location\": \"Mumbai\", \"description\": \"Package is in transit\" }"

echo.
echo Test completed!
pause