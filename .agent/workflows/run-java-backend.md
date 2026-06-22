---
description: How to setup and run the Java Spring Boot backend
---

# Setup and Run Java Backend

## Prerequisites Check
1. Check Java version
```bash
java -version
```
2. Check Maven version
```bash
mvn -version
```

## Running the Application
// turbo
1. Navigate to the java server directory and run
```bash
cd server_java && mvn spring-boot:run
```

## Verification
2. Confirm service is alive
```bash
curl http://localhost:5001/health
```
