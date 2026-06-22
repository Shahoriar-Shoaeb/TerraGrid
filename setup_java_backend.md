# Setup Guide: TerraGrid Java Backend

Follow these steps to set up and run the Java Spring Boot backend on your Ubuntu system.

## 1. Prerequisites Check

Before starting, ensure you have the following installed. Run these commands in your terminal to check:

### ✅ Java Development Kit (JDK 21+)
```bash
java -version
```
*Expected: `openjdk version "21..."` or higher.*

### ✅ Apache Maven
```bash
mvn -version
```
*Expected: `Apache Maven 3.x.x ...`*

### ✅ PostgreSQL
```bash
psql --version
```
*Expected: `psql (PostgreSQL) 16.x ...` (or similar version)*

---

## 2. Infrastructure Setup (Database)

The Java backend uses the same PostgreSQL database as the Node.js backend.

1. **Start PostgreSQL**:
   ```bash
   sudo systemctl start postgresql
   ```
2. **Create Database** (if not already created for the Node.js backend):
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE terragrid;"
   ```
3. **Verify Connection**: Ensure the credentials in `server_java/src/main/resources/application.properties` match your local PostgreSQL setup.

---

## 3. Configuration

The application is pre-configured to run on port **5001**.

1. Navigate to the Java server directory:
   ```bash
   cd server_java
   ```
2. (Optional) Review `src/main/resources/application.properties` to ensure the database URL, username, and password are correct for your environment.

---

## 4. How to Run

From the `server_java` directory, execute:

```bash
mvn spring-boot:run
```

Once you see `Started TerraGridApplication in ... seconds`, the backend is ready!

---

## 5. Initial Credentials
The first time you run the application, it will automatically seed the database with:
- **Admin**: `admin@terragrid.com` / `Admin@123`
- **Manager**: `manager@terragrid.com` / `Manager@123`

## 6. Testing the Setup
Run this command from another terminal to verify the health of the system:
```bash
curl http://localhost:5001/health
```
*Expected Response: `{"status":"ok","service":"TerraGrid API (Java)"}`*
