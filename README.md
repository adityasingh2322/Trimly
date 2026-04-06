# Trimly — Premium Barber Booking App

A full-stack barber shop booking platform with online payments, email confirmations, and an admin control panel.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, React Router v7  
**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT  
**Payments:** Razorpay  
**Email:** Resend  

---

## Project Structure

```
Trimly/
├── Backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth & error middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── utils/          # Email service, JWT helper
│   ├── seeder.js       # DB seed script
│   └── server.js       # Entry point
└── frontend/
    └── src/
        ├── api/        # Axios instance
        ├── components/ # Navbar
        ├── context/    # Auth context
        └── pages/      # Home, Booking, Dashboard, Admin
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Razorpay account (test keys work)
- Resend account

### Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

FROM_NAME="Trimly Bookings"
RESEND_API_KEY=your_resend_api_key
# Use onboarding@resend.dev for testing, or noreply@yourdomain.com after domain verification
RESEND_FROM_EMAIL=onboarding@resend.dev

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### Seed the Database

```bash
cd Backend
node seeder.js
```

---

## Features

- **Booking Flow** — Select barber, pick a date and time slot, pay ₹50 token via Razorpay to confirm
- **Email Notifications** — Confirmation email with a 4-digit check-in code on booking; thank-you email on completion
- **User Dashboard** — View upcoming/past appointments, cancel bookings, edit profile
- **Admin Panel** — View all bookings, add barbers, block/unblock time slots, complete appointments via check-in code

---

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET/PUT | `/api/auth/profile` | Private | Get/update profile |
| GET | `/api/barbers` | Public | List all barbers |
| POST | `/api/barbers` | Admin | Add barber |
| PUT/DELETE | `/api/barbers/:id` | Admin | Update/delete barber |
| GET | `/api/slots` | Public | Get slots by barber & date |
| POST | `/api/slots/toggle-availability` | Admin | Block/unblock a slot |
| POST | `/api/appointments` | Private | Book appointment |
| GET | `/api/appointments/myappointments` | Private | Get user's appointments |
| GET | `/api/appointments` | Admin | Get all appointments |
| PUT | `/api/appointments/:id/cancel` | Private | Cancel appointment |
| PUT | `/api/appointments/:id/complete` | Admin | Complete appointment |
| POST | `/api/payment/order` | Private | Create Razorpay order |
| POST | `/api/payment/verify` | Private | Verify payment signature |

---

## Deployment

- **Backend** — [Render](https://render.com) (set all `.env` variables in the Render dashboard)
- **Frontend** — [Vercel](https://vercel.com) (set `VITE_RAZORPAY_KEY_ID` and `VITE_API_URL` in project settings)

### Resend Domain Verification

To send emails to any user (not just your Resend account email), verify a domain at [resend.com/domains](https://resend.com/domains) and update `RESEND_FROM_EMAIL` to `noreply@yourdomain.com`.

---

## License

MIT
