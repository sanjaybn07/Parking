# Garuda Mall Parking Management System - Backend

Complete backend API for Garuda Mall Parking Management System at Nagarathpet, Bangalore.

## 🚀 Features

### Core Features
- ✅ **User Authentication & Authorization** - JWT-based auth with role management
- ✅ **Real-time Slot Management** - Live updates via Socket.IO
- ✅ **Booking System** - Create, track, and manage parking sessions
- ✅ **Payment Integration** - Razorpay integration + cash payments
- ✅ **Admin Dashboard** - Comprehensive analytics and management
- ✅ **Notifications** - Email (Nodemailer) + SMS (Twilio)
- ✅ **Activity Logging** - Complete audit trail
- ✅ **Analytics** - Revenue, bookings, slot utilization
- ✅ **Dynamic Pricing** - Configurable rates via settings

### Technical Features
- RESTful API architecture
- MongoDB with Mongoose ODM
- WebSocket for real-time updates
- Input validation & sanitization
- Error handling middleware
- Rate limiting & security headers
- CORS configuration
- Compression middleware

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm or yarn

## 🛠️ Installation

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/garuda-mall-parking
JWT_SECRET=your_secure_random_string

# Optional (for full functionality)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Seed Database

Populate with initial data (slots, settings, admin user):

```bash
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@garudamallparking.com`
- Password: `Admin@1234`

### 4. Start Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/logout` | Logout user | Private |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| PUT | `/api/auth/reset-password/:token` | Reset password | Public |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update profile | Private |
| POST | `/api/users/vehicles` | Add vehicle | Private |
| DELETE | `/api/users/vehicles/:id` | Remove vehicle | Private |
| PUT | `/api/users/vehicles/:id/primary` | Set primary vehicle | Private |
| PUT | `/api/users/change-password` | Change password | Private |

### Slots

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/slots` | Get all slots | Public |
| GET | `/api/slots/available` | Get available slots | Public |
| GET | `/api/slots/:id` | Get slot by ID | Public |
| PUT | `/api/slots/:id` | Update slot | Admin |
| PUT | `/api/slots/:id/toggle-block` | Block/unblock slot | Admin |
| GET | `/api/slots/stats/overview` | Get slot statistics | Admin |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | Private |
| GET | `/api/bookings/my-bookings` | Get user bookings | Private |
| GET | `/api/bookings/active` | Get active booking | Private |
| GET | `/api/bookings/:id` | Get booking by ID | Private |
| PUT | `/api/bookings/:id/complete` | Complete booking | Private |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Private |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-order` | Create payment order | Private |
| POST | `/api/payments/verify` | Verify payment | Private |
| POST | `/api/payments/:id/complete-cash` | Complete cash payment | Admin |
| GET | `/api/payments/history` | Get payment history | Private |
| GET | `/api/payments/:id` | Get payment by ID | Private |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Get dashboard stats | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| GET | `/api/admin/bookings` | Get all bookings | Admin |
| GET | `/api/admin/payments` | Get all payments | Admin |
| PUT | `/api/admin/users/:id/status` | Update user status | Admin |
| GET | `/api/admin/settings` | Get settings | Admin |
| PUT | `/api/admin/settings` | Update settings | Admin |
| POST | `/api/admin/slots/reset` | Reset all slots | Admin |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/revenue` | Revenue analytics | Admin |
| GET | `/api/analytics/bookings` | Booking analytics | Admin |
| GET | `/api/analytics/slots` | Slot utilization | Admin |
| GET | `/api/analytics/users` | User analytics | Admin |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/notifications/booking-reminder/:id` | Send booking reminder | Private |
| GET | `/api/notifications/check-expiring` | Check expiring bookings | Admin |
| POST | `/api/notifications/custom` | Send custom notification | Admin |

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Request

```javascript
fetch('http://localhost:5000/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    slotId: '507f1f77bcf86cd799439011',
    vehicleNumber: 'KA01AB1234',
    vehicleType: '2W',
    expectedDuration: 3
  })
})
```

## 🎯 Request/Response Examples

### Create Booking

**Request:**
```json
POST /api/bookings
{
  "slotId": "507f1f77bcf86cd799439011",
  "vehicleNumber": "KA01AB1234",
  "vehicleType": "2W",
  "expectedDuration": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "bookingNumber": "BK240410001",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "slot": {
      "_id": "507f1f77bcf86cd799439011",
      "slotId": "A1",
      "zone": "A"
    },
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "2W",
    "entryTime": "2024-04-10T10:30:00.000Z",
    "expectedDuration": 3,
    "pricing": {
      "hourlyRate": 10,
      "estimatedCost": 30
    },
    "status": "active"
  }
}
```

### Create Payment Order

**Request:**
```json
POST /api/payments/create-order
{
  "bookingId": "507f191e810c19729de860ea",
  "amount": 30,
  "method": "UPI"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_NKz1YU5z9xKKqZ",
    "amount": 3000,
    "currency": "INR",
    "paymentId": "507f191e810c19729de860eb",
    "key": "rzp_test_..."
  }
}
```

## 🔌 WebSocket Events

Connect to Socket.IO for real-time updates:

```javascript
const socket = io('http://localhost:5000');

// Join parking updates room
socket.emit('join-parking');

// Listen for slot updates
socket.on('slot-update', (data) => {
  console.log('Slot updated:', data);
  // { slotId, status, bookingId }
});

// Listen for booking expiring
socket.on('booking-expiring', (data) => {
  console.log('Booking expiring:', data);
  // { bookingId, slotId }
});
```

## 📊 Database Models

### User
- Authentication & profile
- Vehicles management
- Booking history
- Total spent tracking

### Slot
- 48 slots (Zones A, B, C, D)
- 2W & 4W types
- Real-time status
- Metadata (charging, covered, accessible)

### Booking
- Session tracking
- Entry/exit times
- Cost calculation
- Payment linking

### Payment
- Multiple methods (UPI, Card, Cash, etc.)
- Razorpay integration
- Receipt generation
- Refund support

### Activity
- Audit logging
- User actions
- System events
- Admin actions

### Settings
- Dynamic pricing
- Notification configs
- System parameters

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/garuda-mall-parking
JWT_SECRET=your_very_secure_random_string
CLIENT_URL=https://your-frontend-domain.com
```

### PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start server.js --name garuda-mall-parking
pm2 save
pm2 startup
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
docker build -t garuda-mall-parking-backend .
docker run -p 5000:5000 --env-file .env garuda-mall-parking-backend
```

## 🔒 Security Features

- JWT authentication with expiration
- Password hashing (bcrypt)
- Input validation & sanitization
- Rate limiting
- Helmet.js security headers
- CORS configuration
- SQL injection prevention (Mongoose)
- XSS protection

## 📝 API Rate Limiting

Default: 100 requests per 15 minutes per IP

Configure in `.env`:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📄 License

MIT License - Feel free to use for your projects

## 👨‍💻 Support

For support, contact:
- WhatsApp: +91 7019595194
- Email: admin@garudamallparking.com

## 🎯 Future Enhancements

- [ ] QR code-based check-in/check-out
- [ ] Mobile app APIs
- [ ] Loyalty program
- [ ] Multi-location support
- [ ] Advanced analytics dashboard
- [ ] Automated billing
- [ ] Integration with accounting software

---

**Built with ❤️ for Garuda Mall Parking, Nagarathpet, Bangalore**
