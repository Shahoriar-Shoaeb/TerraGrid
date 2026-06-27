# TerraGrid — API Design

> **Version:** 1.0  
> **Architecture Style:** RESTful API  
> **Protocol:** HTTP/HTTPS  
> **Data Format:** JSON  
> **Authentication:** JWT Bearer Token

---

# 1. Introduction

TerraGrid exposes its functionality through a RESTful API that serves as the communication layer between the frontend and the backend. The API is designed to be predictable, stateless, and resource-oriented while following common HTTP and REST conventions.

The API acts as the public contract of the application. Client applications communicate exclusively through these endpoints without direct access to the database or business logic.

---

# 2. Design Goals

The API is designed to satisfy the following objectives:

- Consistent endpoint structure
- Predictable request and response formats
- Stateless communication
- Proper use of HTTP methods
- Meaningful HTTP status codes
- Strong input validation
- Secure authentication
- Easy extensibility

---

# 3. API Architecture

```
                Client Application
                        │
                        │ HTTP/HTTPS
                        ▼
              Spring REST Controllers
                        │
                        ▼
                 Service Layer
                        │
                        ▼
                  Business Logic
                        │
                        ▼
                 PostgreSQL Database
```

The API layer is responsible only for request handling and response generation.

Business rules remain inside the service layer.

---

# 4. REST Principles

TerraGrid follows REST architectural principles.

## Resource-Oriented Design

Every endpoint represents a business resource.

Examples:

```
/api/products

/api/warehouses

/api/inventory

/api/users
```

---

## Stateless Communication

Each request contains all required information.

The server does not maintain client sessions.

Authentication is performed using JWT tokens.

---

## Uniform Interface

Endpoints follow consistent naming conventions.

Good:

```
GET /api/products

POST /api/products

PUT /api/products/{id}

DELETE /api/products/{id}
```

Avoid:

```
/createProduct

/getProducts

/updateInventoryData
```

Resources should be represented as nouns rather than verbs.

---

# 5. API Versioning

Current version:

```
v1
```

The API can be versioned using the URI.

Example:

```
/api/v1/products

/api/v1/warehouses
```

Future breaking changes can be introduced without affecting existing clients.

---

# 6. Resource Overview

The API currently exposes the following resources.

| Resource | Description |
|------------|-------------|
| Authentication | Login and token generation |
| Users | User management |
| Products | Product catalog |
| Warehouses | Warehouse management |
| Inventory | Stock levels and operations |
| Transactions | Inventory history |

---

# 7. Authentication Endpoints

```
POST /api/auth/login
```

Purpose:

Authenticate a user and return a JWT.

Request:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Response:

```json
{
  "token": "<jwt-token>"
}
```

---

# 8. Product API

## Create Product

```
POST /api/products
```

Request

```json
{
    "sku":"PCM-500",
    "name":"Paracetamol 500mg",
    "description":"Pain relief medication",
    "unit":"BOX"
}
```

Response

```json
{
    "id":1,
    "sku":"PCM-500",
    "name":"Paracetamol 500mg",
    "unit":"BOX",
    "isActive":true
}
```

---

## Get All Products

```
GET /api/products
```

Returns all active products.

---

## Get Product

```
GET /api/products/{id}
```

Returns a single product.

---

## Update Product

```
PUT /api/products/{id}
```

Updates an existing product.

---

## Deactivate Product

```
DELETE /api/products/{id}
```

Soft delete.

The product remains in the database.

---

# 9. Warehouse API

```
POST /api/warehouses

GET /api/warehouses

GET /api/warehouses/{id}

PUT /api/warehouses/{id}

DELETE /api/warehouses/{id}
```

Warehouse deletion performs a soft delete.

---

# 10. Inventory API

Inventory operations represent business workflows rather than CRUD operations.

---

## Stock In

```
POST /api/inventory/stock-in
```

Request

```json
{
    "warehouseId":1,
    "productId":5,
    "quantity":100,
    "note":"Initial inventory"
}
```

---

## Stock Out

```
POST /api/inventory/stock-out
```

```json
{
    "warehouseId":1,
    "productId":5,
    "quantity":20,
    "note":"Customer shipment"
}
```

---

## Transfer

```
POST /api/inventory/transfer
```

```json
{
    "fromWarehouseId":1,
    "toWarehouseId":2,
    "productId":5,
    "quantity":30,
    "note":"Warehouse balancing"
}
```

---

## Inventory Adjustment

```
POST /api/inventory/adjustment
```

```json
{
    "warehouseId":1,
    "productId":5,
    "quantity":5,
    "reason":"Physical stock correction"
}
```

---

## Inventory Lookup

```
GET /api/inventory
```

Returns current inventory.

---

## Inventory by Warehouse

```
GET /api/inventory/warehouse/{warehouseId}
```

---

## Inventory by Product

```
GET /api/inventory/product/{productId}
```

---

# 11. Transaction API

Retrieve historical inventory activity.

```
GET /api/transactions
```

Retrieve transaction by ID.

```
GET /api/transactions/{id}
```

Filter by warehouse.

```
GET /api/transactions?warehouseId=1
```

Filter by product.

```
GET /api/transactions?productId=10
```

Filter by date.

```
GET /api/transactions?from=2026-01-01&to=2026-01-31
```

---

# 12. HTTP Methods

| Method | Purpose |
|---------|----------|
| GET | Read resources |
| POST | Create resources or business operations |
| PUT | Replace or update resources |
| DELETE | Soft delete resources |

PATCH may be introduced in future versions.

---

# 13. HTTP Status Codes

The API consistently uses standard HTTP status codes.

| Status | Meaning |
|---------|----------|
| 200 OK | Successful request |
| 201 Created | Resource created |
| 204 No Content | Successful deletion |
| 400 Bad Request | Invalid request |
| 401 Unauthorized | Authentication required |
| 403 Forbidden | Access denied |
| 404 Not Found | Resource does not exist |
| 409 Conflict | Duplicate or conflicting resource |
| 422 Unprocessable Entity | Business rule violation |
| 500 Internal Server Error | Unexpected server error |

---

# 14. Request Validation

All request DTOs use Bean Validation.

Examples:

```java
@NotBlank

@NotNull

@Positive

@Email

@Size(max = 255)
```

Validation occurs before business logic executes.

---

# 15. Response Structure

Successful responses contain only the necessary resource data.

Example:

```json
{
    "id":5,
    "sku":"PCM-500",
    "name":"Paracetamol",
    "unit":"BOX",
    "isActive":true
}
```

---

# 16. Error Response Format

All errors follow a consistent structure.

```json
{
    "timestamp":"2026-06-27T15:40:00Z",
    "status":404,
    "error":"Not Found",
    "message":"Product not found",
    "path":"/api/products/5"
}
```

Validation errors additionally include field-specific details.

```json
{
    "status":400,
    "error":"Validation Failed",
    "errors":[
        {
            "field":"sku",
            "message":"must not be blank"
        }
    ]
}
```

---

# 17. Authentication Header

Protected endpoints require the Authorization header.

```
Authorization: Bearer <jwt-token>
```

Missing or invalid tokens result in:

```
401 Unauthorized
```

---

# 18. Pagination

Collection endpoints should support pagination.

Example:

```
GET /api/products?page=0&size=20
```

Future response format:

```json
{
    "content":[ ... ],
    "page":0,
    "size":20,
    "totalElements":154,
    "totalPages":8
}
```

---

# 19. Filtering

Endpoints may support filtering through query parameters.

Examples:

```
GET /api/products?active=true

GET /api/transactions?warehouseId=2

GET /api/transactions?productId=10

GET /api/inventory?warehouseId=1
```

Filtering should not require additional endpoints.

---

# 20. API Design Principles

The API follows several design principles.

- Resource-oriented URIs
- Stateless communication
- Consistent JSON structures
- Standard HTTP methods
- Proper HTTP status codes
- Feature-specific DTOs
- Thin controllers
- Business logic isolated in services
- Validation before execution
- Consistent error handling

---

# 21. Future Enhancements

The API architecture supports future improvements such as:

- API version negotiation
- OpenAPI / Swagger documentation
- Rate limiting
- Refresh tokens
- Batch operations
- Bulk imports
- GraphQL gateway
- WebSocket notifications
- Cursor-based pagination
- HATEOAS (if required)

---

# 22. Summary

The TerraGrid API is designed as a **RESTful, stateless, and resource-oriented interface** that exposes the application's business capabilities through consistent HTTP endpoints. By adhering to REST principles, standard HTTP semantics, structured validation, and predictable request/response formats, the API provides a stable and maintainable contract between clients and the backend.

The separation of concerns between controllers, services, and repositories ensures that the API layer remains lightweight while business rules are centralized within the service layer. This architecture enables the API to evolve over time without compromising consistency or usability.
