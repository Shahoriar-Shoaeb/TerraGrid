# TerraGrid — High-Level Architecture

> **Version:** 1.0  
> **Architecture Style:** Layered Monolithic Architecture  
> **Backend Framework:** Spring Boot 3.x  
> **Language:** Java 21

---

# 1. Introduction

This document describes the high-level software architecture of TerraGrid and explains how the major components interact to provide a secure, maintainable, and transactionally consistent inventory management platform.

TerraGrid adopts a **layered monolithic architecture** with **feature-first package organization**. This architectural style was chosen because it provides a clear separation of concerns while avoiding unnecessary complexity. For the current scale of the application, a modular monolith offers excellent maintainability, strong transactional guarantees, and straightforward deployment.

---

# 2. Architectural Goals

The architecture is designed to achieve the following goals:

- Clear separation of responsibilities
- High maintainability
- Strong transactional consistency
- Secure authentication and authorization
- Scalability for future business growth
- Simplicity over unnecessary abstraction
- Testability
- Extensibility

---

# 3. Architectural Style

## Layered Monolithic Architecture

TerraGrid follows a traditional layered architecture.

```
                Client
                   │
                   ▼
          REST Controllers
                   │
                   ▼
            Service Layer
                   │
                   ▼
          Repository Layer
                   │
                   ▼
             PostgreSQL
```

Each layer has a clearly defined responsibility and communicates only with the layer directly below it.

---

## Why a Monolith?

TerraGrid currently consists of a single business application with one database and tightly related business domains.

Using microservices at this stage would introduce unnecessary complexity:

- distributed transactions
- service discovery
- network failures
- message brokers
- deployment overhead

A modular monolith provides:

- simpler deployment
- easier debugging
- better development velocity
- strong ACID transactions
- lower operational cost

If the system grows significantly, the feature-based architecture allows gradual extraction into independent services.

---

# 4. High-Level Component Diagram

```
                        +----------------------+
                        |    React Frontend    |
                        +----------+-----------+
                                   |
                            HTTPS / REST API
                                   |
                                   ▼
                    +-----------------------------+
                    | Spring Security (JWT Filter)|
                    +-------------+---------------+
                                  |
                                  ▼
                       +------------------------+
                       |     REST Controllers   |
                       +-----------+------------+
                                   |
                                   ▼
                       +------------------------+
                       |     Service Layer      |
                       +-----------+------------+
                                   |
                     +-------------+-------------+
                     |                           |
                     ▼                           ▼
           Repository Layer             Validation Rules
                     |
                     ▼
               PostgreSQL Database
                     |
                     ▼
             Flyway Migrations
```

---

# 5. Layer Responsibilities

## Presentation Layer

### Responsibilities

- Handle HTTP requests
- Deserialize JSON
- Validate request DTOs
- Call application services
- Return HTTP responses
- Convert entities into response DTOs

### Contains

```
controller/
```

Controllers should remain thin.

They do **not** contain:

- SQL
- business rules
- transaction management

---

## Service Layer

The service layer contains all business logic.

Responsibilities include:

- business rules
- inventory workflows
- stock validation
- authorization checks
- transaction management
- orchestration

Example:

```
Transfer Inventory

↓

Validate User

↓

Lock Inventory

↓

Validate Quantity

↓

Create Transaction Records

↓

Update Inventory

↓

Commit
```

All write operations are transactional.

---

## Repository Layer

Repositories provide data access.

Responsibilities include:

- CRUD operations
- custom queries
- locking queries
- pagination

Repositories should never contain business logic.

---

## Database Layer

The database is responsible for:

- persistence
- foreign keys
- unique constraints
- check constraints
- indexing
- transactional consistency

Business invariants are enforced at the database whenever possible.

---

# 6. Feature-Based Organization

Instead of grouping code by technical layer,

```
controller/
service/
repository/
```

TerraGrid groups code by business capability.

```
user/

product/

warehouse/

inventory/
```

Each feature contains its own:

```
controller

dto

entity

service

repository
```

Advantages include:

- higher cohesion
- easier navigation
- reduced coupling
- independent feature evolution
- easier future modularization

---

# 7. Dependency Direction

Dependencies always flow downward.

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
Database
```

No dependency points upward.

For example:

```
Controller
    ✔ depends on Service

Service
    ✔ depends on Repository

Repository
    ✔ depends on Entity

Repository
    ✘ never depends on Controller

Entity
    ✘ never depends on DTO

Controller
    ✘ never accesses Repository directly
```

This one-way dependency graph prevents circular dependencies and keeps the architecture maintainable.

---

# 8. Request Processing Pipeline

A typical request follows this sequence.

```
HTTP Request

↓

Security Filter Chain

↓

JWT Validation

↓

DispatcherServlet

↓

Controller

↓

Bean Validation

↓

Service

↓

Repository

↓

PostgreSQL

↓

Repository

↓

Service

↓

DTO Mapping

↓

HTTP Response
```

Every request passes through the same predictable lifecycle.

---

# 9. Transaction Boundaries

Transaction management is centralized in the service layer.

```
Controller

↓

Service
@Transactional

↓

Repositories

↓

Database
```

Write operations:

```
@Transactional
```

Read operations:

```
@Transactional(readOnly = true)
```

This ensures:

- atomicity
- consistency
- rollback on failure

Controllers should never manage transactions.

---

# 10. Cross-Cutting Components

Several components serve multiple business features.

## Security

Responsible for:

- JWT validation
- authentication
- authorization
- password hashing

Package:

```
security/
```

---

## Shared Exceptions

Provides:

- custom exceptions
- global exception handler
- error responses

Package:

```
shared/exception/
```

---

## Shared DTOs

Contains reusable response models.

Examples:

```
ApiErrorResponse

PagedResponse

ValidationErrorResponse
```

Package:

```
shared/dto/
```

---

## Configuration

Contains Spring configuration.

Examples:

- SecurityConfig
- JpaAuditingConfig

Package:

```
config/
```

---

## Utilities

Pure helper functions.

Examples:

- DateTime utilities
- String utilities

Utilities contain **no business logic**.

---

# 11. Data Flow

Example: Stock Transfer

```
Client

↓

InventoryController

↓

InventoryService

↓

InventoryRepository

↓

Inventory Row (FOR UPDATE)

↓

Validate Quantity

↓

Insert Transfer Out

↓

Insert Transfer In

↓

Update Inventory

↓

Commit

↓

Response
```

Everything occurs within a single database transaction.

---

# 12. Design Principles

The architecture follows several core principles.

## Separation of Concerns

Each layer has one responsibility.

---

## Single Responsibility

Each class performs one primary function.

Examples:

```
ProductController

only HTTP

ProductService

only business logic

ProductRepository

only persistence
```

---

## High Cohesion

Classes that change together are located together.

Business features own their code.

---

## Low Coupling

Features communicate through services rather than directly accessing each other's internals.

---

## Explicit Dependencies

Constructor injection is used exclusively.

Example:

```java
public ProductService(ProductRepository repository) {
    this.repository = repository;
}
```

Dependencies are visible and immutable.

---

## Database as Source of Truth

The application validates data first.

The database validates it again.

This layered validation prevents corruption.

---

# 13. Architectural Constraints

The following rules must always be respected.

- Controllers never access repositories directly.
- Services contain all business logic.
- Entities are never returned directly to API clients.
- DTOs are never persisted.
- Repository methods never contain business workflows.
- Transactions are managed only in the service layer.
- Database schema changes occur only through Flyway.
- Hibernate validates schema but never creates it.

---

# 14. Future Evolution

The architecture supports gradual evolution.

Potential future additions include:

```
Current Monolith

        │

        ▼

Docker Deployment

        │

        ▼

Redis Cache

        │

        ▼

RabbitMQ Events

        │

        ▼

Observability

        │

        ▼

Modular Monolith

        │

        ▼

Microservices (Only if justified)
```

Because the application is organized around business features rather than framework layers, future extraction of modules can occur incrementally without major refactoring.

---

# 15. Summary

TerraGrid employs a pragmatic layered monolithic architecture that prioritizes simplicity, correctness, and maintainability. By combining feature-first organization with strict layer boundaries and database-enforced consistency, the system provides a robust foundation for inventory management while remaining flexible enough to support future expansion.

The architecture deliberately avoids premature complexity, instead focusing on clear responsibilities, predictable data flow, and strong transactional guarantees. This results in a codebase that is easier to understand, test, maintain, and evolve over time.
