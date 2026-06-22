<!-- # TerraGrid – Multi-Warehouse Inventory Management Platform

TerraGrid is a high-performance, production-quality inventory management dashboard designed for medical and pharmaceutical logistics. It features real-time stock tracking, atomic transfers between warehouses, and a comprehensive audit trail.

## Teck Stack

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

## Credentials (Seed Data)
- **Admin**: `admin@terragrid.com` / `Admin@123`
- **Manager**: `manager@terragrid.com` / `Manager@123`

##  Features
- **Dashboard**: KPI cards with animated count-up numbers and visual stock trends.
- **Inventory Hub**: Full SKU management with temperature sensitivity tracking.
- **Warehouse Network**: Multi-site monitoring with specialized storage type support (Cold Storage, High-Throughput).
- **Atomic Operations**: Bulletproof stock increments, decrements, and transfers with database-level consistency.
- **Audit Logging**: Immutable event timeline for compliance and oversight.
- **Role-Based Access**: Granular control for Admin and Manager roles. -->





















# TerraGrid – Multi-Warehouse Inventory Management Platform

TerraGrid is a high-performance, production-quality inventory management dashboard designed for medical and pharmaceutical logistics. It features real-time stock tracking, atomic transfers between warehouses, and a comprehensive audit trail.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Backend Setup: Node.js (`server`)](#backend-setup-nodejs-server)
- [Backend Setup: Java Spring Boot (`server_java`)](#backend-setup-java-spring-boot-server_java)
- [Frontend Setup (`client`)](#frontend-setup-client)
- [Default Credentials](#default-credentials)
- [API Health Checks](#api-health-checks)

---

## Features

- **Dashboard** – KPI cards with animated count-up numbers and visual stock trends.
- **Inventory Hub** – Full SKU management with temperature sensitivity tracking.
- **Warehouse Network** – Multi-site monitoring with specialized storage type support (Cold Storage, High-Throughput).
- **Atomic Operations** – Bulletproof stock increments, decrements, and transfers with database-level consistency.
- **Audit Logging** – Immutable event timeline for compliance and oversight.
- **Role-Based Access** – Granular control for Admin and Manager roles.

---

## Tech Stack

### Frontend (`client`)
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Recharts | Data visualization |
| React Query | Server state management |
| Lucide Icons | Icon library |

### Backend – Node.js (`server`)
| Technology | Purpose |
|---|---|
| Node.js + Express.js | HTTP server and routing |
| Prisma ORM | Database access layer |
| PostgreSQL | Relational database |
| JWT | Authentication |
| Zod | Request validation |

### Backend – Java (`server_java`)
| Technology | Purpose |
|---|---|
| Java 21 + Spring Boot | HTTP server and application framework |
| Spring Data JPA | Database access layer |
| PostgreSQL | Relational database (shared with Node.js backend) |
| Maven | Build and dependency management |

---

## Project Structure

```
terragrid/
├── client/          # React frontend (Vite)
├── server/          # Node.js + Express backend (port 5000)
└── server_java/     # Java Spring Boot backend (port 5001)
```

---

## Prerequisites

Before setting up any component, ensure the following are installed on your system.

### Node.js (v18+)
```bash
node -v
```

### Java Development Kit (JDK 21+)
```bash
java -version
# Expected: openjdk version "21..." or higher
```

### Apache Maven
```bash
mvn -version
# Expected: Apache Maven 3.x.x ...
```

### PostgreSQL
```bash
psql --version
# Expected: psql (PostgreSQL) 16.x ... (or similar version)
```

---

## Database Setup

Both backends share the same PostgreSQL database. Perform this step once before running either backend.

1. **Start PostgreSQL:**
   ```bash
   sudo systemctl start postgresql
   ```

2. **Create the database:**
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE terragrid;"
   ```

---

## Backend Setup: Node.js (`server`)

The Node.js backend runs on **port 5000** and is responsible for database migrations and initial data seeding.

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create a `.env` file inside the `server` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/terragrid"
JWT_SECRET="your_secret_key"
PORT=5000
```

> Replace `user` and `password` with your PostgreSQL credentials.

### 3. Run Migrations and Seed Data

```bash
npx prisma db push
npm run seed
```

### 4. Start the Server

```bash
npm run dev
```

The Node.js API will be available at `http://localhost:5000`.

---

## Backend Setup: Java Spring Boot (`server_java`)

The Java backend runs on **port 5001** and connects to the same PostgreSQL database. It will automatically seed the database on first run if data is not already present.

### 1. Verify Prerequisites

Confirm that Java 21+ and Maven are available (see [Prerequisites](#prerequisites)).

### 2. Configure the Application

Navigate to the Java server directory:

```bash
cd server_java
```

Review and update the database connection settings in:(rename it to application.properties and ad your credentials)

```
src/main/resources/application-example.properties
```

Ensure the database URL, username, and password match your local PostgreSQL setup. The application is pre-configured to run on port **5001**.

### 3. Start the Server

```bash
mvn spring-boot:run
```

Once you see the following message, the server is ready:

```
Started TerraGridApplication in ... seconds
```

The Java API will be available at `http://localhost:5001`.

---

## Frontend Setup (`client`)

The React frontend connects to either backend via a configurable API URL.

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment (Optional)

By default, the frontend points to `http://localhost:5000/api` (the Node.js backend). To change this, create a `.env` file inside the `client` directory:

```env
VITE_API_URL="http://localhost:5000/api"
```

To use the Java backend instead, update the value to:

```env
VITE_API_URL="http://localhost:5001/api"
```

### 3. Start the Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173` (or the next available port).

---

## Default Credentials

Both backends seed the database with the following accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@terragrid.com` | `Admin@123` |
| Manager | `manager@terragrid.com` | `Manager@123` |

---

## API Health Checks

To verify that each backend is running correctly, use the following commands:

**Node.js backend:**
```bash
curl http://localhost:5000/health
```

**Java backend:**
```bash
curl http://localhost:5001/health
```

Expected response from the Java backend:
```json
{"status":"ok","service":"TerraGrid API (Java)"}
```