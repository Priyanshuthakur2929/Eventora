# Eventora - Full-Stack Event Booking Platform

Eventora is a full-stack MERN application that allows users to seamlessly browse, register, and pay natively without any third party tools. It features an administrative dashboard for event organizers to create and manage free and paid events. All bookings can be managed manually by an admin to handle payments directly.

## Features
- **User Authentication**: Secure login & registration with JWT and bcrypt.
- **2FA OTP Verification**: 
  - Mandatory Email OTP to activate your account upon Registration (or delayed login attempts).
  - Mandatory Email OTP to finalize and secure event ticket booking.
- **Role-Based Access**: 
  - **Admin**: Create, edit, and delete events. Confirm and reject all incoming booking requests, mark them as 'Paid' or 'Not Paid'. Access is strictly locked to database-flagged users only.
  - **User**: Browse events, submit ticket booking requests via OTP, view personal dashboard pending status, and cancel bookings.
- **Event Management**: Create free and paid events with detailed descriptions, external image URLs, dates, categories, and seating capacity.
- **Smart Booking System**:
  - Mandatory 2FA OTP to authorize a booking request.
  - All booking requests (both free and paid) enter a secure 'Pending' queue for Admin verification.
  - Seat availability accurately updates and securely validates against overbooking logic.
- **Admin Analytics Dashboard**: Track live data such as Pending Requests, Total Revenue, and Total Confirmed Paid Clients directly from the admin panel.
- **Email Notifications**: Automated email delivery upon successful booking confirmation using Nodemailer.
- **Sleek UI/UX**: Built entirely with React, Tailwind CSS, and polished with micro-interactions.

---

## 🚀 Setup Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
You will also need a MongoDB database (e.g., [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/register)).

### 1. Environment Variables Configuration
Navigate to `server/.env` and fill in the necessary keys:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=supersecretjwtkey_eventora
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=5000
```
> **Note**: For `EMAIL_PASS`, you need to generate an "App Password" from your Google Account settings, standard passwords won't work due to 2FA.

### 2. Run from Outer Folder (Single Terminal)
You can now manage both backend and frontend from the project root:

```bash
# from Eventora root
npm install
npm run install:all
npm run dev
```

- `npm run dev` starts both `server` and `client` together using `concurrently`.
- `npm run dev:all` installs dependencies (server + client) and starts both in one command.
- `npm run start` runs backend `start` + frontend `preview` together.

### 3. Install Dependencies
Open two separate terminals for the backend and frontend.

**Backend Terminal:**
```bash
cd server
npm install --legacy-peer-deps
```

**Frontend Terminal:**
```bash
cd client
npm install
```

### 4. Run the Application Local Servers
**Run Backend:**
```bash
cd server
npm run dev
```
*(Server will run on `http://localhost:5000`)*

**Run Frontend:**
```bash
cd client
npm run dev
```
*(Client will run on a local port provided by Vite, typically `http://localhost:5173`)* 

// README.md for SELL PURPOSE
# Eventora - Online Event Booking Platform

Eventora is a full-stack web application for discovering events and booking tickets online. Organizers can list events, and attendees can browse and book them from any device.

**Live demo:** https://eventora-smoky.vercel.app

<!-- Add 3-4 screenshots here after you capture them:
![Home](./docs/screenshots/home.png)
![Events](./docs/screenshots/events.png)
![Booking](./docs/screenshots/booking.png)
-->

## Features

<!-- Keep only what your app really does. Buyers check this list against the demo. -->
- Browse and search upcoming events
- Event details page with date, venue, and price
- Online ticket booking flow
- User authentication (sign up / log in)
- Responsive design for mobile and desktop
- REST API with MongoDB storage

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend | Node.js (Express) |
| Database | MongoDB |
| Hosting | Vercel |
| Version control | Git and GitHub |

## Project Structure

```
eventora/
├── client/          # React frontend
├── server/          # Node.js backend (API)
├── docs/            # Screenshots and extra documentation
├── README.md
└── SETUP.md         # Detailed installation and deployment guide
```

## Quick Start

```bash
# 1. Clone
git clone https://github.com/<your-username>/eventora.git
cd eventora

# 2. Backend
cd server
npm install
cp .env.example .env      # then fill in your values
npm start

# 3. Frontend (new terminal)
cd client
npm install
cp .env.example .env      # then fill in your values
npm run dev
```

The frontend runs on `http://localhost:5173` (Vite) or `http://localhost:3000` (Create React App), and the API on `http://localhost:5500`.

See [SETUP.md](./SETUP.md) for the full guide, including MongoDB setup and deployment.

## Roadmap

- Payment gateway integration (Razorpay / Stripe)
- Analytics dashboard for organizers
- Mobile app integration

## License

<!-- Choose one before selling: MIT for open source, or "All rights reserved" / a commercial license for paid sales. -->
Copyright (c) 2026 Priyanshu Raj. All rights reserved.

## Author

**Priyanshu Raj**, B.Tech CSE, Greater Noida Institute of Technology