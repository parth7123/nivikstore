# Forever Full Stack - E-commerce Application

A complete MERN stack e-commerce application with admin panel, user authentication, product management, cart functionality, and order processing.

## Features

- User authentication (login/signup)
- Product browsing and search
- Shopping cart functionality
- Order placement and management
- Admin panel for product and order management
- Payment integration (Razorpay)
- Blue Dart shipping integration
- Shiprocket shipping integration

## Blue Dart Shipping Integration

This application includes a complete Blue Dart shipping integration that allows you to:

1. Check delivery serviceability by PIN code
2. Create shipments and generate AWB numbers
3. Track shipments through the delivery process
4. Receive webhook updates for delivery status changes

### Setup Instructions

1. Obtain your Blue Dart API credentials:
   - BLUEDART_LOGIN_ID
   - BLUEDART_LICENSE_KEY
   - BLUEDART_CUSTOMER_CODE
   - BLUEDART_API_BASE_URL

2. Add these to your backend `.env` file:
```
BLUEDART_LOGIN_ID=your_login_id
BLUEDART_LICENSE_KEY=your_license_key
BLUEDART_CUSTOMER_CODE=your_customer_code
BLUEDART_API_BASE_URL=https://api.bluedart.com
```

3. The integration is already set up with:
   - Backend API endpoints (`/api/bluedart/*`)
   - Admin panel components (ShippingPanel, TrackingWidget)
   - Frontend integration in checkout process
   - Database models for shipment tracking
   - Webhook handling for status updates

### Implementation Notes

The current implementation includes placeholder code for Blue Dart API calls. To implement the actual API calls:

1. Refer to `BLUEDART_INTEGRATION_GUIDE.md` for detailed implementation instructions
2. Replace the placeholder functions in `backend/controllers/bluedartController.js`
3. Test using the provided scripts and test files

### Testing

- Use `backend/test-bluedart.sh` (Linux/Mac) or `backend/test-bluedart.bat` (Windows) for API testing
- Run unit tests with `npm test` in the backend directory
- Test through the admin panel UI

## Shiprocket Shipping Integration

This application now includes a complete Shiprocket shipping integration that works alongside the existing Blue Dart integration. Shiprocket provides additional shipping options and couriers for your e-commerce business.

### Setup Instructions

1. Obtain your Shiprocket API credentials:
   - SHIPROCKET_API_EMAIL (Your Shiprocket account email)
   - SHIPROCKET_API_PASSWORD (Your Shiprocket account password)
   - SHIPROCKET_WEBHOOK_SECRET (A secret key for webhook verification)

2. Add these to your backend `.env` file:
```
SHIPROCKET_API_EMAIL=your_shiprocket_email
SHIPROCKET_API_PASSWORD=your_shiprocket_password
SHIPROCKET_WEBHOOK_SECRET=your_shiprocket_webhook_secret
```

3. The integration is already set up with:
   - Backend API endpoints (`/api/shipping/shiprocket/*`)
   - Service module with token management and API wrappers
   - Database models updated to support multiple shipping providers
   - Webhook handling for status updates

### API Endpoints

- POST `/api/shipping/shiprocket/token` - (Admin-only) Force refresh authentication token
- POST `/api/shipping/shiprocket/rates` - Calculate shipping rates and available couriers
- POST `/api/shipping/shiprocket/create` - (Admin-only) Create shipment in Shiprocket
- GET `/api/shipping/shiprocket/track/:awb` - Track shipment by AWB number
- POST `/api/shipping/shiprocket/webhook` - Receive shipment status updates from Shiprocket

### Implementation Details

The Shiprocket integration includes:

1. **Authentication Service**: Manages API tokens with automatic refresh (tokens are valid for ~240 hours)
2. **Rate Calculation**: Fetches available couriers and shipping costs based on package details
3. **Shipment Creation**: Creates shipments in Shiprocket and stores tracking information
4. **Tracking**: Retrieves and normalizes shipment tracking data
5. **Webhook Handling**: Processes real-time updates from Shiprocket with signature verification

### Testing

- Use the provided Postman collection (`SHIPROCKET_INTEGRATION.postman_collection.json`)
- Run unit tests with `npm test` in the backend directory
- Test through the admin panel UI (once frontend components are implemented)

## Project Structure

```
.
├── admin/              # Admin panel (React)
├── backend/            # Backend API (Node.js/Express)
├── frontend/           # User frontend (React)
└── README.md           # This file
```

## Installation

1. Clone the repository
2. Install dependencies in each directory:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../admin && npm install
   ```
3. Set up environment variables in `.env` files
4. Start the development servers:
   ```bash
   # Backend
   cd backend && npm run server
   
   # Frontend
   cd frontend && npm run dev
   
   # Admin
   cd admin && npm run dev
   ```

## Environment Variables

### Backend (.env)
```
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
BLUEDART_LOGIN_ID=your_bluedart_login_id
BLUEDART_LICENSE_KEY=your_bluedart_license_key
BLUEDART_CUSTOMER_CODE=your_bluedart_customer_code
BLUEDART_API_BASE_URL=https://api.bluedart.com
SHIPROCKET_API_EMAIL=your_shiprocket_email
SHIPROCKET_API_PASSWORD=your_shiprocket_password
SHIPROCKET_WEBHOOK_SECRET=your_shiprocket_webhook_secret
```

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Admin (.env)
```
VITE_BACKEND_URL=http://localhost:4000
```

## API Endpoints

### User Authentication
- POST `/api/user/register` - User registration
- POST `/api/user/login` - User login

### Products
- GET `/api/product/list` - List all products
- GET `/api/product/latest` - Get latest products
- POST `/api/product/add` - Add new product (admin)
- POST `/api/product/remove` - Remove product (admin)

### Cart
- POST `/api/cart/add` - Add item to cart
- POST `/api/cart/update` - Update cart item quantity
- POST `/api/cart/get` - Get user's cart

### Orders
- POST `/api/order/place` - Place order (COD)
- POST `/api/order/razorpay` - Create Razorpay order
- POST `/api/order/verifyRazorpay` - Verify Razorpay payment
- POST `/api/order/userorders` - Get user's orders
- POST `/api/order/list` - Get all orders (admin)
- POST `/api/order/status` - Update order status (admin)
- POST `/api/order/cancel` - Cancel order (user)
- POST `/api/order/admin-cancel` - Cancel order (admin)

### Blue Dart Shipping
- POST `/api/bluedart/serviceability` - Check delivery serviceability
- POST `/api/bluedart/create-shipment` - Create shipment (admin)
- GET `/api/bluedart/track/:awb` - Track shipment
- POST `/api/bluedart/webhook` - Receive delivery updates

### Shiprocket Shipping
- POST `/api/shipping/shiprocket/token` - Force refresh token (admin-only)
- POST `/api/shipping/shiprocket/rates` - Compute available couriers and prices
- POST `/api/shipping/shiprocket/create` - Create shipment in Shiprocket (admin-only)
- GET `/api/shipping/shiprocket/track/:awb` - Track shipment by AWB
- POST `/api/shipping/shiprocket/webhook` - Receive Shiprocket webhooks

## Development

### Technologies Used

- **Frontend**: React, Tailwind CSS, React Router
- **Admin Panel**: React, Tailwind CSS, React Router
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: JWT
- **Payment**: Razorpay
- **Shipping**: Blue Dart API, Shiprocket API
- **Image Storage**: Cloudinary
- **Testing**: Jest, Supertest

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.