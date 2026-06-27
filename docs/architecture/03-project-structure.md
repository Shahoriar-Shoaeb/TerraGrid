# TerraGrid — Project Structure

> **Version:** 1.0  
> **Architecture Style:** Feature-First Layered Monolith  
> **Base Package:** `com.terragrid`

---

# 1. Introduction

A project's package structure has a significant impact on its maintainability, scalability, and developer productivity. TerraGrid adopts a **feature-first package organization** combined with **layered internals**.

Instead of grouping code solely by technical responsibilities (controllers, services, repositories), the project groups code by **business capability**. Each feature owns its complete implementation, making the system easier to navigate, understand, and evolve.

---

# 2. Design Goals

The project structure is designed to achieve the following objectives:

- High cohesion
- Low coupling
- Clear ownership of business features
- Predictable organization
- Easy navigation
- Improved maintainability
- Straightforward testing
- Future modularization

---

# 3. Base Package

All application code resides under the following root package:

```text
com.terragrid
```

Keeping everything under a single root package enables Spring Boot's component scanning and provides a consistent namespace for the project.

---

# 4. Directory Structure

```text
src
└── main
    ├── java
    │   └── com
    │       └── terragrid
    │           ├── TerraGridApplication.java
    │           │
    │           ├── shared
    │           │   ├── audit
    │           │   ├── dto
    │           │   ├── exception
    │           │   └── util
    │           │
    │           ├── config
    │           │
    │           ├── security
    │           │
    │           ├── user
    │           │   ├── controller
    │           │   ├── dto
    │           │   ├── entity
    │           │   ├── repository
    │           │   └── service
    │           │
    │           ├── product
    │           │   ├── controller
    │           │   ├── dto
    │           │   ├── entity
    │           │   ├── repository
    │           │   └── service
    │           │
    │           ├── warehouse
    │           │   ├── controller
    │           │   ├── dto
    │           │   ├── entity
    │           │   ├── repository
    │           │   └── service
    │           │
    │           └── inventory
    │               ├── controller
    │               ├── dto
    │               ├── entity
    │               ├── repository
    │               └── service
    │
    └── resources
        ├── application.yml
        ├── db
        │   └── migration
        └── static
```

---

# 5. Package Responsibilities

## `config`

Contains Spring configuration classes.

Examples:

```
JpaAuditingConfig

SecurityBeansConfig

JacksonConfig
```

Responsibilities:

- application configuration
- bean definitions
- framework customization
- infrastructure setup

Business logic must never be placed here.

---

## `security`

Contains all authentication and authorization components.

Example:

```
SecurityConfig

JwtAuthenticationFilter

JwtTokenProvider

CustomUserDetailsService

JwtAuthenticationEntryPoint
```

Responsibilities:

- JWT validation
- password encoding
- authentication
- authorization
- security filters
- access control

No business logic belongs in this package.

---

## `shared`

Contains reusable infrastructure shared by multiple business features.

```
shared
├── audit
├── dto
├── exception
└── util
```

Shared components should remain generic and independent of any specific business domain.

---

### `shared/audit`

Contains common auditing infrastructure.

Example:

```
AuditableEntity

JpaAuditingConfig

AuditorAware
```

Responsibilities:

- created timestamps
- modified timestamps
- created by
- modified by

---

### `shared/dto`

Contains reusable API response models.

Examples:

```
ApiErrorResponse

PagedResponse<T>

SuccessResponse

ValidationErrorResponse
```

Feature-specific DTOs do **not** belong here.

---

### `shared/exception`

Contains the application's exception hierarchy.

Examples:

```
GlobalExceptionHandler

ResourceNotFoundException

DuplicateResourceException

BusinessException

InsufficientStockException
```

All exception handling is centralized.

---

### `shared/util`

Contains stateless utility classes.

Examples:

```
DateTimeUtils

StringUtils

ValidationUtils
```

Utility classes:

- contain no business logic
- maintain no state
- expose only helper methods

---

# 6. Feature Packages

Each business capability owns its own package.

```
user

product

warehouse

inventory
```

Each feature is internally layered.

---

## Feature Layout

Example:

```
product
├── controller
├── dto
├── entity
├── repository
└── service
```

Every feature follows the same structure.

This consistency reduces cognitive overhead.

---

# 7. Controller Package

Example:

```
product/controller

ProductController.java
```

Responsibilities:

- REST endpoints
- request validation
- response generation
- DTO mapping

Controllers should remain thin.

They should never contain:

- SQL
- transactions
- business rules

---

# 8. DTO Package

Example:

```
product/dto

CreateProductRequest

UpdateProductRequest

ProductResponse
```

DTOs define the API contract.

Separate DTOs are used for:

- requests
- responses

Entities are never exposed directly to clients.

---

# 9. Entity Package

Contains JPA entities.

Example:

```
Product

Warehouse

Inventory

User

StockTransaction
```

Responsibilities:

- database mapping
- relationships
- persistence metadata

Entities should not contain HTTP-specific concerns.

---

# 10. Repository Package

Repositories encapsulate persistence.

Example:

```
ProductRepository
```

Responsibilities:

- CRUD
- pagination
- custom queries
- locking queries

Repositories should never contain business workflows.

---

# 11. Service Package

Services implement business logic.

Example:

```
InventoryService
```

Responsibilities:

- inventory operations
- validation
- transactions
- orchestration
- business rules

This is where most application logic resides.

---

# 12. Resources Directory

```
resources
├── application.yml
├── db
└── static
```

---

## `application.yml`

Contains application configuration.

Examples:

- datasource
- Hibernate
- Flyway
- logging
- JWT properties
- server configuration

---

## `db/migration`

Contains Flyway migration scripts.

```
V1__create_users_table.sql

V2__create_warehouses_table.sql

V3__create_products_table.sql

V4__create_inventory_table.sql

V5__create_stock_transactions_table.sql

V6__add_indexes.sql
```

Database schema evolves exclusively through these files.

---

# 13. Package Dependency Rules

Dependencies always move downward.

```
Controller
        │
        ▼
Service
        │
        ▼
Repository
        │
        ▼
Entity
```

Allowed:

```
Controller
↓

Service

↓

Repository
```

Not allowed:

```
Controller

↓

Repository
```

Not allowed:

```
Repository

↓

Controller
```

Not allowed:

```
Entity

↓

DTO
```

These constraints prevent architectural erosion.

---

# 14. Naming Conventions

## Controllers

```
ProductController

WarehouseController

InventoryController
```

---

## Services

```
ProductService

WarehouseService

InventoryService
```

---

## Repositories

```
ProductRepository

InventoryRepository
```

---

## Entities

Singular nouns.

```
User

Product

Warehouse

Inventory

StockTransaction
```

---

## Request DTOs

```
CreateProductRequest

UpdateWarehouseRequest

TransferRequest
```

---

## Response DTOs

```
ProductResponse

WarehouseResponse

InventoryResponse

TransactionResponse
```

---

## Exceptions

```
ProductNotFoundException

WarehouseNotFoundException

DuplicateSkuException

InsufficientStockException
```

Consistent naming improves discoverability.

---

# 15. Why Feature-First?

Traditional package-by-layer organization often looks like:

```
controller/

service/

repository/

entity/
```

As projects grow:

- dozens of controllers accumulate in one package
- related classes become physically separated
- feature development requires navigating many directories

Feature-first organization keeps everything related to a business capability together.

For example:

```
product/

controller

service

repository

entity

dto
```

A developer working on product management rarely needs to leave the `product` package.

---

# 16. Testing Structure

The test directory mirrors the production package structure.

```text
src
└── test
    └── java
        └── com
            └── terragrid
                ├── product
                ├── warehouse
                ├── inventory
                └── user
```

Benefits:

- predictable organization
- easy navigation
- direct correspondence with production code

---

# 17. Future Expansion

The structure supports additional business modules without refactoring.

Examples:

```text
supplier

purchaseorder

salesorder

notification

report

analytics

barcode

batch

expiry
```

Each new feature follows the same internal structure.

No existing package requires reorganization.

---

# 18. Project Organization Principles

TerraGrid follows these organizational principles:

- Business features own their implementation.
- Shared code is kept minimal.
- Framework configuration is isolated.
- Infrastructure concerns remain separate from business logic.
- Dependencies always flow downward.
- Business logic resides only in services.
- Entities model persistence, not APIs.
- DTOs model APIs, not persistence.

---

# 19. Summary

The TerraGrid project structure emphasizes **clarity, cohesion, and maintainability**. By organizing code around business capabilities and enforcing strict layer boundaries, the architecture minimizes coupling while making feature development intuitive and scalable.

This organization supports long-term evolution, simplifies onboarding for new contributors, and provides a strong foundation for future expansion into additional modules or, if ever required, a modular or distributed architecture.
