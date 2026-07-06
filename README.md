<div align="center">
  <h1 align="center">Next Haven - Backend API</h1>
  <p align="center">
    The robust, secure, and scalable backend service for the Next Haven hotel booking platform.
  </p>
</div>

## 🌐 Links
- **Frontend Live Demo:** [https://next-haven.vercel.app/](https://next-haven.vercel.app/)
- **Frontend Repository:** [https://github.com/sanoyon211/NextHaven_Frontend](https://github.com/sanoyon211/NextHaven_Frontend)
- **Backend API Live URL:** [https://next-haven-backend.vercel.app/](https://next-haven-backend.vercel.app/)
- **Backend Repository:** [https://github.com/sanoyon211/NextHaven_Backend](https://github.com/sanoyon211/NextHaven_Backend)

## 🚀 Overview
The Next Haven Backend provides a RESTful API architecture that manages rooms, bookings, secure user authentication, and payment processing. It acts as the backbone of the Next Haven platform, ensuring smooth and secure data transactions.

## ✨ Features
- **Robust Architecture:** Built with Node.js and Express.js for scalable API endpoints.
- **Database Management:** Uses MongoDB with Mongoose for flexible and reliable data storage.
- **Secure Authentication:** JWT (JSON Web Tokens) and Firebase Admin for robust user verification and authorization.
- **Payment Processing:** Integrated with Stripe API to handle secure booking transactions.
- **Media Management:** Cloudinary integration for handling room and user image uploads seamlessly.
- **Automated Tasks:** Built-in node-cron for scheduling background tasks.

## 🛠️ Built With
- **[Node.js](https://nodejs.org/)**
- **[Express.js](https://expressjs.com/)**
- **[MongoDB & Mongoose](https://mongoosejs.com/)**
- **[Firebase Admin](https://firebase.google.com/docs/admin/setup)**
- **[Stripe](https://stripe.com/)**
- **[Cloudinary](https://cloudinary.com/)**
- **[JWT](https://jwt.io/)**

## 💻 Getting Started

Follow these steps to get the backend running locally.

### Prerequisites
Make sure you have Node.js and MongoDB installed on your system.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/sanoyon211/NextHaven_Backend.git
   ```

2. **Navigate to the backend directory:**
   ```bash
   cd next_haven/nexthaven_backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up Environment Variables:**
   Configure your environment variables by creating a `.env` file in the root directory. You will need your MongoDB URI, JWT Secret, Stripe Secret Key, Firebase Admin credentials, and Cloudinary credentials.

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The server will typically run on `http://localhost:5000` or whichever port you configured.
