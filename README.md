# TerraGrid – Multi-Warehouse Inventory Management Platform

TerraGrid is a high-performance, production-quality inventory management dashboard designed for medical and pharmaceutical logistics. It features real-time stock tracking, atomic transfers between warehouses, and a comprehensive audit trail.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Backend Setup: Java Spring Boot (`server_java`)](#backend-setup-java-spring-boot-server_java)
- [Frontend Setup (`client`)](#frontend-setup-client)
- [Default Credentials](#default-credentials)
- [API Health Check](#api-health-check)

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

### Backend (`server_java`)
| Technology | Purpose |
|---|---|
| Java 21 + Spring Boot | HTTP server and application framework |
| Spring Data JPA | Database access layer |
| PostgreSQL | Relational database |
| Maven | Build and dependency management |

---

## Project Structure

```
terragrid/
├── client/          # React frontend (Vite)
└── server_java/     # Java Spring Boot backend (port 5001)
```

---

## Prerequisites

Before setting up any component, ensure the following are installed on your system.

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

Perform this step once before running the backend.

1. **Start PostgreSQL:**
   ```bash
   sudo systemctl start postgresql
   ```

2. **Create the database:**
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE terragrid;"
   ```

---

## Backend Setup: Java Spring Boot (`server_java`)

The Java backend runs on **port 5001** and will automatically seed the database on first run if data is not already present.

### 1. Configure the Application

Navigate to the Java server directory:

```bash
cd server_java
```

Copy the example properties file and add your credentials:

```bash
cp src/main/resources/application-example.properties src/main/resources/application.properties
```

Edit `application.properties` and set your PostgreSQL username and password. The application is pre-configured to run on port **5001**.

### 2. Start the Server

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

The React frontend connects to the Java backend via a configurable API URL.

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment

Create a `.env` file inside the `client` directory:

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

The backend seeds the database with the following accounts on first run:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@terragrid.com` | `Admin@123` |
| Manager | `manager@terragrid.com` | `Manager@123` |

---

## API Health Check

To verify that the backend is running correctly:

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"status":"ok","service":"TerraGrid API (Java)"}
```