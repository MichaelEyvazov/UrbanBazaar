UrbanBazaar – Full-Stack Marketplace (MERN)

UrbanBazaar is a complete multi-vendor e-commerce platform built with the MERN stack – MongoDB, Express.js, React.js, and Node.js.
It was developed as a final project for a Full-Stack Web Developer course, and demonstrates a production-grade marketplace system with multiple user roles, payments, and full CRUD management.

🚀 Features

✅ User Roles

👤 Customer – can browse products, add to cart, and place orders

🧑‍💻 Seller – can manage own products and see orders for their items

🧑‍💼 Admin – has full control over users, products, and orders

✅ Core Functions

Secure authentication and authorization with JWT

Role-based access control (Admin / Seller / Customer)

PayPal Sandbox integration for payments

CRUD operations for products, orders, and users

Image upload via Multer

Persistent shopping cart (saved in localStorage per user)

Light/Dark theme saved per user

Responsive UI with React-Bootstrap

Admin dashboard with summary statistics

🧠 Tech Stack
Layer	Technology
Frontend	React 18, React-Router-DOM, Axios, React-Bootstrap
Backend	Node.js, Express.js
Database	MongoDB, Mongoose
Auth	JWT, bcryptjs
Payments	PayPal REST API
File Uploads	Multer
Styling	Bootstrap + custom CSS
Others	dotenv, CORS, Helmet
🧩 Project Structure
UrbanBazaar/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes (users, products, orders, uploads, seed, keys)
│   ├── data.js          # Demo seed data
│   ├── server.js        # Express server
│   └── .env.example     # Environment variables template
│
├── frontend/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App pages (Home, Product, Cart, Order, etc.)
│   ├── layout/          # Header, Sidebar, ThemeToggle
│   ├── Store.js         # Global context state
│   ├── utils.js         # Helper functions
│   └── App.js           # Main routing
│
└── README.md

⚙️ Installation & Run
1️⃣ Clone the project
git clone https://github.com/<yourusername>/UrbanBazaar.git
cd UrbanBazaar

2️⃣ Setup backend
cd backend
npm install
cp .env.example .env
npm run dev

3️⃣ Setup frontend
cd ../frontend
npm install
npm start


Open 👉 http://localhost:3000

🔑 Environment Variables (.env)

Create a .env file in the backend folder with the following values:

PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/urbanbazaar
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=sb
MAILGUN_DOMAIN=
MAILGUN_API_KEY=

🌱 Seed Demo Data

To reset and seed the database with demo users/products:

GET http://localhost:4000/api/seed


Creates an admin, seller, and user

Inserts demo products linked to the seller

📊 Roles & Permissions
Action	       User	    Seller	      Admin
View Products	✅	    ✅	         ✅
Add Product	    ❌	    ✅	         ✅
Delete Product	❌	    ✅       (own)✅
View Orders	    ✅ (own)	✅ (own items)✅
Manage Users	❌	    ❌	         ✅

💡 Key Highlights

Fully functional marketplace system with real roles and restrictions

Dark/Light mode and cart persistence per user

PayPal payments integration

Responsive design for desktop and mobile

Secure API with authentication middleware

Michael Eyvazov
Final Project – Full-Stack Web Developer Course 2025
