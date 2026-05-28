# VeloFinance — Premium Personal Finance Tracker

A production-ready, beautiful, full-stack personal finance tracker designed for students and individuals to manage cash flows, starting pocket money, and monthly spending budgets.

Built with **React (Vite, TypeScript, Tailwind, Recharts, Framer Motion)** on the frontend and **Node.js (Express, MongoDB)** on the backend.

---

## Folder Structure

```text
khataBook/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # JWT authentication middleware
│   ├── models/          # User, Transaction, and Budget schemas
│   ├── routes/          # Express API route controllers
│   ├── .env             # Environment variables (secret)
│   ├── server.js        # Entry server script
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, StatCard, TransactionModal, ConfirmDialog
    │   ├── context/     # AuthContext session provider
    │   ├── pages/       # Landing, Auth, Dashboard, Transactions, Analytics, Settings
    │   ├── utils/       # Axios API client setup
    │   ├── App.tsx      # Routing and layout wrapping
    │   ├── index.css    # Typography, glassmorphism, scrollbars base styles
    │   └── main.tsx     # React bootstrapper
    ├── index.html       # HTML entry point with meta tags
    ├── tailwind.config.js
    └── package.json
```

---

## Database Schemas (Mongoose)

### 1. User
- `name` (String, required): Display name of the user.
- `email` (String, unique, required): Registered email.
- `password` (String, required): Hashed credentials (bcrypt).
- `currency` (String, default: 'INR'): Symbol preference (`INR`, `USD`, `EUR`, `GBP`, `JPY`).
- `initialBalance` (Number, default: 0): Starting pocket money / cash.

### 2. Transaction
- `user` (ObjectId, ref: User, required): Relation link.
- `type` (String, required): `'income'` (add money) or `'expense'`.
- `amount` (Number, required): Numeric value.
- `category` (String, required): Dropdown selection category.
- `note` (String, optional): Description memo.
- `date` (Date, default: Date.now, required): Selected date.

### 3. Budget
- `user` (ObjectId, ref: User, required): Relation link.
- `limit` (Number, required): Monthly spending limit.
- `month` (Number, 0-11, required): Calendar month.
- `year` (Number, required): Calendar year.

---

## REST API Endpoints

### Authentication Router (`/api/auth`)
- `POST /api/auth/register`: Register new account.
- `POST /api/auth/login`: Authenticate and obtain JWT token.
- `GET /api/auth/me` *(Protected)*: Get authenticated user details.
- `PUT /api/auth/profile` *(Protected)*: Update profile settings (name, currency, starting cash).

### Transactions Router (`/api/transactions`)
- `GET /api/transactions` *(Protected)*: Query transactions. Supports search, type/category filters, and sorting parameters.
- `POST /api/transactions` *(Protected)*: Add a new inflow or outflow log.
- `PUT /api/transactions/:id` *(Protected)*: Edit an existing entry.
- `DELETE /api/transactions/:id` *(Protected)*: Delete an entry.

### Budget Router (`/api/budgets`)
- `GET /api/budgets/current` *(Protected)*: Retrieve active spending limits for current month.
- `POST /api/budgets` *(Protected)*: Upsert monthly spending budget limits.

---

## Environment Setup

### Backend Config (`backend/.env`)
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/velofinance
JWT_SECRET=velofinance_secret_token_18273645
```

### Frontend Config (`frontend/.env`)
Vite defaults to contacting `http://localhost:5000/api`. If your backend runs elsewhere, create a `.env` file in `frontend/`:
```env
VITE_API_URL=https://your-backend-api.com/api
```

---

## Installation & How to Run

Ensure you have **Node.js** and **MongoDB** installed and running on your local machine.

### 1. Launch the Backend API
```bash
cd backend
npm install
npm run dev
# The backend will start on http://localhost:5000
```

### 2. Launch the Frontend Dev Server
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
# The frontend will start on http://localhost:5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser to experience VeloFinance.
