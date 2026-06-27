# TerraGrid — System Overview

> **Version:** 1.0  
> **Project:** TerraGrid  
> **Architecture:** Layered Monolithic Architecture  
> **Backend:** Spring Boot 3.x (Java 21)  
> **Database:** PostgreSQL 16  
> **Schema Management:** Flyway  
> **Documentation Date:** June 2026

---

# 1. Introduction

TerraGrid is a multi-warehouse inventory management platform designed to provide accurate, secure, and auditable inventory operations across multiple storage locations.

The system enables organizations to manage products, warehouses, inventory levels, and stock movements while maintaining complete transactional consistency and historical traceability.

Rather than treating inventory as simple CRUD data, TerraGrid models inventory as a transactional domain where every stock movement is permanently recorded. This approach ensures that current inventory levels can always be verified against historical transactions.

Although the initial implementation targets pharmaceutical inventory management, the overall architecture is domain-agnostic and can be adapted for manufacturing, retail, logistics, healthcare, or any organization requiring reliable inventory tracking.

---

# 2. Objectives

The primary objectives of TerraGrid are:

- Maintain accurate inventory across multiple warehouses.
- Provide complete traceability of every stock movement.
- Support concurrent inventory operations safely.
- Protect business data using role-based security.
- Ensure database consistency through ACID transactions.
- Provide a maintainable and scalable backend architecture.
- Enable future expansion without significant redesign.

---

# 3. Scope

The first version of TerraGrid focuses on the core inventory lifecycle.

## Included Features

- User authentication
- Role-based authorization
- Product management
- Warehouse management
- Inventory management
- Stock In operations
- Stock Out operations
- Warehouse transfers
- Inventory adjustments
- Transaction history
- Inventory reporting
- Dashboard statistics

## Future Features

The architecture intentionally leaves room for future modules such as:

- Suppliers
- Purchase Orders
- Sales Orders
- Barcode scanning
- QR code support
- Batch/Lot management
- Expiry tracking
- Notifications
- Redis caching
- Event-driven messaging
- Analytics
- Mobile applications

---

# 4. Core Business Domains

TerraGrid is organized around several core business domains.

| Domain | Responsibility |
|---------|---------------|
| User Management | Authentication, authorization, account management |
| Product Management | Product catalog, SKU management, metadata |
| Warehouse Management | Physical warehouse information |
| Inventory Management | Current stock levels |
| Stock Transactions | Immutable inventory history |
| Dashboard | Aggregated reporting and analytics |

Each domain owns its own business logic and persistence layer.

---

# 5. Business Operations

The system currently supports the following business operations.

## Stock In

Adds inventory to a warehouse.

Example:

```
Warehouse A

Paracetamol

Current Quantity: 100

Receive: +50

New Quantity: 150
```

Every stock-in operation generates an immutable transaction record.

---

## Stock Out

Removes inventory from a warehouse.

Example:

```
Current Quantity: 150

Ship: -30

Remaining Quantity: 120
```

The operation is rejected if sufficient inventory does not exist.

---

## Warehouse Transfer

Moves inventory between two warehouses.

```
Warehouse A

↓

TRANSFER

↓

Warehouse B
```

A transfer consists of:

- one Transfer Out transaction
- one Transfer In transaction

Both occur within the same database transaction.

---

## Inventory Adjustment

Allows authorized users to manually correct inventory levels.

Examples include:

- damaged goods
- counting errors
- reconciliation corrections

Every adjustment requires an audit note.

---

## Product Management

Administrators can

- create products
- update products
- deactivate products

Products are never permanently deleted.

---

## Warehouse Management

Administrators can

- create warehouses
- update warehouses
- deactivate warehouses

Historical references remain intact.

---

# 6. Functional Requirements

The system shall provide:

- Authentication using JWT.
- Role-based authorization.
- CRUD operations for products.
- CRUD operations for warehouses.
- Inventory lookup.
- Inventory transfers.
- Stock adjustments.
- Historical transaction reporting.
- Soft deletion of business entities.
- Validation of all user input.
- Audit trail for every inventory movement.

---

# 7. Non-Functional Requirements

TerraGrid is designed with several architectural quality goals.

## Reliability

- ACID transactions
- Database constraints
- Referential integrity
- Immutable transaction history

---

## Security

- BCrypt password hashing
- JWT authentication
- Role-based authorization
- Input validation
- SQL injection protection

---

## Performance

- Indexed foreign keys
- Optimized inventory lookups
- Composite indexes
- Efficient reporting queries

---

## Maintainability

- Feature-first package organization
- Layered architecture
- Explicit dependency direction
- Clear separation of concerns

---

## Scalability

Current architecture supports:

- increasing products
- increasing warehouses
- increasing users
- increasing transaction volume

Future scalability includes:

- Docker
- Kubernetes
- Redis
- RabbitMQ

---

# 8. Technology Stack

| Layer | Technology |
|---------|------------|
| Programming Language | Java 21 |
| Framework | Spring Boot 3.x |
| Build Tool | Maven |
| Security | Spring Security + JWT |
| Persistence | Spring Data JPA |
| ORM | Hibernate 6 |
| Database | PostgreSQL 16 |
| Schema Management | Flyway |
| Validation | Jakarta Bean Validation |
| API | RESTful JSON |
| Frontend | React + Vite + Tailwind CSS |

---

# 9. Architectural Principles

Several guiding principles influenced the system design.

## Database First

The database enforces structural correctness.

Examples include:

- foreign keys
- CHECK constraints
- unique indexes
- transaction consistency

The application cannot violate database invariants.

---

## Immutable Audit Trail

Inventory history is append-only.

Existing transaction records are never modified.

Current inventory is derived from historical events.

---

## Separation of Concerns

Each architectural layer has a single responsibility.

```
Controller

↓

Service

↓

Repository

↓

Database
```

Business logic is isolated from HTTP and persistence concerns.

---

## Feature-First Organization

The codebase is organized around business capabilities.

```
product/

warehouse/

inventory/

user/
```

instead of

```
controller/

service/

repository/
```

This improves cohesion and long-term maintainability.

---

## Explicit Code

The project intentionally avoids unnecessary framework magic.

Examples:

- constructor injection
- explicit getters/setters
- explicit entity mappings
- explicit DTO mapping

This improves readability and learning.

---

# 10. System Context

```
                 +-------------------------+
                 |       Administrator     |
                 +-----------+-------------+
                             |
                             |
                 +-----------v-------------+
                 |        TerraGrid        |
                 | Spring Boot REST API    |
                 +-----------+-------------+
                             |
          +------------------+------------------+
          |                                     |
          |                                     |
+---------v---------+                 +---------v---------+
| React Frontend    |                 | PostgreSQL 16     |
| User Interface    |                 | Inventory Storage |
+-------------------+                 +-------------------+
```

The backend exposes REST APIs consumed by a React frontend.

Persistent business data is stored in PostgreSQL.

---

# 11. Design Philosophy

TerraGrid favors simplicity over unnecessary abstraction.

Instead of adopting highly abstract architectural styles prematurely, the project uses a pragmatic layered monolith that emphasizes:

- correctness
- readability
- maintainability
- transactional consistency
- scalability when justified

This approach reduces accidental complexity while providing a solid foundation for future growth.

---

# 12. Current Project Status

The current implementation includes:

- Project initialization
- Maven configuration
- Spring Boot setup
- PostgreSQL integration
- Flyway database migrations
- Normalized relational schema
- Feature-first package structure
- Application configuration
- Architecture documentation

The project is now ready for implementation of the domain model, service layer, REST APIs, and security infrastructure.

---

# 13. Future Evolution

The architecture has been designed to support future enhancements without requiring fundamental redesign.

Planned improvements include:

- Redis caching
- Batch and expiry management
- Supplier management
- Purchase orders
- Sales orders
- Docker deployment
- Kubernetes orchestration
- Observability
- Metrics collection
- Distributed messaging
- Mobile client support

---

# 14. Summary

TerraGrid is a production-oriented inventory management platform built on modern Java technologies with a strong emphasis on correctness, maintainability, and data integrity.

By combining a layered architecture, feature-first organization, immutable transaction history, and database-enforced consistency, the system provides a reliable foundation for inventory management while remaining extensible for future business requirements.
