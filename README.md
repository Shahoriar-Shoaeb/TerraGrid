# TerraGrid – Multi-Warehouse Inventory Management Platform

TerraGrid is a high-performance, production-quality inventory management dashboard designed for medical and pharmaceutical logistics. It features real-time stock tracking, atomic transfers between warehouses, and a comprehensive audit trail.

## 🚀 Teck Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Query, Lucide Icons.
- **Backend**: Node.js, Express.js, Prisma ORM, JWT Authentication, Zod validation.
- **Database**: PostgreSQL.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/terragrid"
JWT_SECRET="your_secret_key"
PORT=5000
```
Run database migrations and seed the data:
```bash
npx prisma db push
npm run seed
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory (optional, defaults to localhost:5000):
```env
VITE_API_URL="http://localhost:5000/api"
```
Start the dashboard:
```bash
npm run dev
```

## 🔐 Credentials (Seed Data)
- **Admin**: `admin@terragrid.com` / `Admin@123`
- **Manager**: `manager@terragrid.com` / `Manager@123`

## ✨ Features
- **Dashboard**: KPI cards with animated count-up numbers and visual stock trends.
- **Inventory Hub**: Full SKU management with temperature sensitivity tracking.
- **Warehouse Network**: Multi-site monitoring with specialized storage type support (Cold Storage, High-Throughput).
- **Atomic Operations**: Bulletproof stock increments, decrements, and transfers with database-level consistency.
- **Audit Logging**: Immutable event timeline for compliance and oversight.
- **Role-Based Access**: Granular control for Admin and Manager roles.
