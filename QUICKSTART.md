# 🚀 Quick Start Guide - Garuda Mall Parking Backend

Get the backend up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
MONGODB_URI=mongodb://localhost:27017/garuda-mall-parking
JWT_SECRET=your_random_secure_string_here
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Ubuntu/Debian
sudo systemctl start mongod

# On macOS (with Homebrew)
brew services start mongodb-community

# Or run directly
mongod --dbpath /path/to/data
```

### 4. Seed Database
```bash
npm run seed
```

This creates:
- 48 parking slots (Zones A, B, C, D)
- Default settings
- Admin user (email: admin@garudamallparking.com, password: Admin@1234)

### 5. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

## ✅ Verify Installation

### Test Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Garuda Mall Parking API is running",
  "timestamp": "2024-04-10T..."
}
```

### Test Login (Admin)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@garudamallparking.com",
    "password": "Admin@1234"
  }'
```

You should receive a JWT token.

## 📱 Test with Postman

1. Import `postman_collection.json` into Postman
2. Set `base_url` variable to `http://localhost:5000/api`
3. Login to get token
4. Copy token to `token` variable
5. Test other endpoints!

## 🎯 Common Tasks

### Create a Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'
```

### Get Available Slots
```bash
curl http://localhost:5000/api/slots/available?vehicleType=2W
```

### Create a Booking (requires auth token)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "slotId": "SLOT_ID_FROM_PREVIOUS_CALL",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "2W",
    "expectedDuration": 3
  }'
```

## 🔧 Optional Services

### Email (Nodemailer)
For email notifications, add to `.env`:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### SMS (Twilio)
For SMS notifications, add to `.env`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Payment (Razorpay)
For online payments, add to `.env`:
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill process using port 5000

### JWT Secret Missing
```
Error: JWT_SECRET is not defined
```
**Solution:** Add JWT_SECRET to `.env` file

## 📚 Next Steps

1. Read the full [README.md](./README.md) for complete API documentation
2. Import Postman collection for easy testing
3. Connect your frontend to the API
4. Configure optional services (Email, SMS, Payment)
5. Deploy to production server

## 🎉 You're Ready!

Backend is now running. Start building your frontend or use the API directly!

For detailed API documentation, see [README.md](./README.md)
