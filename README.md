# 🏙️ UrbanBazaar – Full‑Stack Marketplace (MERN)

UrbanBazaar is a complete **multi‑vendor e‑commerce platform** built with the **MERN stack** – MongoDB, Express.js, React.js, and Node.js.  
It was developed as a **final project for the HackerU Full‑Stack Web Developer course**, demonstrating a production‑grade marketplace system with multiple user roles, payments, and full CRUD management.

---

## 🚀 Features

### ✅ User Roles
- 👤 **Customer** – browse products, add to cart, and place orders  
- 🧑‍💻 **Seller** – manage own products and view orders for their items  
- 🧑‍💼 **Admin** – full control over users, products, and orders  

### ✅ Core Functions
- Secure authentication and authorization with **JWT**
- Role‑based access control (**Admin / Seller / Customer**)
- **PayPal Sandbox** integration for payments
- Full **CRUD operations** for products, orders, and users
- Image upload via **Multer / Cloudinary**
- Persistent shopping cart (saved in localStorage per user)
- Light / Dark theme saved per user
- Responsive UI with **React‑Bootstrap**
- Admin dashboard with summary statistics

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 18, React‑Router‑DOM, Axios, React‑Bootstrap |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Payments | PayPal REST API |
| File Uploads | Multer (with Cloudinary option) |
| Styling | Bootstrap + custom CSS |
| Others | dotenv, CORS, Helmet |

---

## 🧩 Project Structure

```
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
```

---

## ⚙️ Installation & Run

1️⃣ **Clone the project**
```bash
git clone https://github.com/MichaelEyvazov/UrbanBazaar.git
cd UrbanBazaar
```

2️⃣ **Setup backend**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

3️⃣ **Setup frontend**
```bash
cd ../frontend
npm install
npm start
```
Then open 👉 [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables (.env)

Create a `.env` file in the backend folder with the following values:

```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/urbanbazaar
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=sb
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BREVO_API_KEY=your_brevo_api_key
MAIL_FROM_EMAIL=you@yourdomain.com
MAIL_FROM_NAME=UrbanBazaar
BASE_URL=http://localhost:3000

```

---

## 🌱 Seed Demo Data

Reset and seed the database with demo users/products:

```
GET http://localhost:4000/api/seed
```
Creates:
- Admin, Seller, and Regular user accounts  
- Demo products linked to the Seller

---

## 🧱 CRUD Summary

| Entity   | Create | Read | Update | Delete | Access Level |
|-----------|---------|-------|---------|---------|--------------|
| User      | ✅ Register | ✅ Profile/Admin | ✅ Profile/Admin | ✅ Admin only | Admin/User |
| Product   | ✅ Seller/Admin | ✅ All users | ✅ Seller/Admin | ✅ Seller/Admin | Seller/Admin |
| Order     | ✅ Auth User | ✅ Own/Admin | ✅ Admin (mark paid/delivered) | ✅ Admin | User/Admin |
| Uploads   | ✅ Auth User | ✅ via URL | ❌ | ❌ | Authenticated |

---

## 🌐 Accessibility & Responsiveness

- Fully responsive layout (tested on desktop, tablet, and mobile)
- ARIA labels for accessibility
- Dark/Light theme for better contrast
- High‑contrast color palette and scalable text

---

## 🔒 Security

- JWT tokens stored in LocalStorage per user session
- Passwords hashed with bcrypt
- Protected routes with authentication middleware
- `.env` excluded from version control
- CORS and Helmet middleware for basic protection

---

## 📊 Roles & Permissions

| Action | User | Seller | Admin |
|---------|-------|---------|--------|
| View Products | ✅ | ✅ | ✅ |
| Add Product | ❌ | ✅ | ✅ |
| Delete Product | ❌ | ✅ (own) | ✅ |
| View Orders | ✅ (own) | ✅ (own items) | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

---

## 💡 Key Highlights

- Fully functional marketplace with real role segregation  
- Dark/Light mode and persistent cart per user  
- PayPal payment integration  
- Responsive design for mobile and desktop  
- Secure API with middleware authentication  

---

## 👨‍💻 Author

**Michael Eyvazov**  
Final Project – Full‑Stack Web Developer Course (2025)  
© 2025 Michael Eyvazov | Developed as part of HackerU Full‑Stack Program
