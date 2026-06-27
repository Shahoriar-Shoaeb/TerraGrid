# TerraGrid — Database Architecture

> **Version:** 1.0  
> **Database:** PostgreSQL 16  
> **ORM:** Hibernate 6 (Spring Data JPA)  
> **Migration Tool:** Flyway  
> **Schema Strategy:** Database-First

---

# 1. Introduction

The database is the core of TerraGrid. Since inventory management involves financial value, regulatory compliance, and operational integrity, the database is designed to be the **primary source of truth**.

The schema emphasizes:

- Data integrity
- Referential integrity
- Transactional consistency
- Auditability
- Performance
- Extensibility

Rather than relying solely on application logic, important business invariants are enforced directly by PostgreSQL using constraints, indexes, and transactions.

---

# 2. Design Goals

The database architecture is designed around the following objectives:

- Prevent invalid data from entering the system.
- Preserve complete inventory history.
- Support concurrent inventory operations safely.
- Optimize common queries.
- Minimize redundancy through normalization.
- Enable future expansion without redesign.
- Maintain deterministic schema evolution using Flyway.

---

# 3. Database Technology

| Component | Technology |
|------------|------------|
| Database | PostgreSQL 16 |
| ORM | Hibernate 6 |
| Persistence | Spring Data JPA |
| Migration | Flyway |
| JDBC Driver | PostgreSQL JDBC Driver |

---

# 4. Schema Ownership

TerraGrid follows a **Database-First** approach.

Ownership is clearly divided.

| Component | Responsibility |
|------------|---------------|
| Flyway | Create and evolve schema |
| Hibernate | Validate entity mappings |
| PostgreSQL | Enforce integrity |
| Spring Data JPA | Object persistence |

Hibernate never creates or updates tables.

Configuration:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

This guarantees reproducible database deployments across all environments.

---

# 5. Entity Relationship Model

The conceptual data model consists of five primary entities.

```
                 Users
                   │
                   │
                   ▼
        Stock Transactions
          ▲           ▲
          │           │
          │           │
      Products     Warehouses
           ▲            ▲
            \          /
             \        /
              ▼      ▼
              Inventory
```

Relationships:

- One User performs many Stock Transactions.
- One Product appears in many Inventory records.
- One Warehouse contains many Inventory records.
- Inventory represents the current stock snapshot.
- Stock Transactions represent immutable historical events.

---

# 6. Database Tables

The schema currently consists of six migration files creating five business tables and supporting indexes.

| Migration | Description |
|------------|-------------|
| V1 | Users |
| V2 | Warehouses |
| V3 | Products |
| V4 | Inventory |
| V5 | Stock Transactions |
| V6 | Indexes |

---

# 7. Users

Purpose:

Stores authenticated application users.

Responsibilities:

- login
- authorization
- audit ownership

Important attributes:

- unique email
- password hash
- role
- active status
- timestamps

Relationships:

```
User

1

↓

Many

Stock Transactions
```

Users are never physically deleted.

---

# 8. Warehouses

Represents physical inventory locations.

Examples:

- Central Warehouse
- Regional Warehouse
- Pharmacy Store

Responsibilities:

- inventory ownership
- transfer endpoints
- reporting

Each warehouse may contain many inventory records.

---

# 9. Products

Represents inventory items.

Examples:

- Paracetamol
- Ibuprofen
- Gloves
- Syringes

Important characteristics:

- globally unique SKU
- descriptive metadata
- soft deletion

SKU values are never reused.

This guarantees historical consistency.

---

# 10. Inventory

The Inventory table stores **current stock levels**.

Unlike Stock Transactions, Inventory is mutable.

Example:

```
Warehouse A

Product X

Quantity = 250
```

Each warehouse-product combination appears exactly once.

Constraint:

```
UNIQUE

(warehouse_id, product_id)
```

This table acts as a materialized snapshot of current inventory.

---

# 11. Stock Transactions

Stock Transactions represent the immutable history of inventory movement.

Examples:

- Stock In
- Stock Out
- Transfer In
- Transfer Out
- Adjustment

Unlike Inventory:

Inventory changes.

Transactions never change.

Every inventory modification inserts a transaction row.

---

# 12. Normalization

The schema follows approximately **Third Normal Form (3NF)**.

Benefits include:

- reduced redundancy
- simplified updates
- improved consistency
- better storage efficiency

Business entities remain independent.

Relationships are represented through foreign keys.

---

# 13. Referential Integrity

Relationships are enforced using foreign key constraints.

Examples:

```
Inventory

↓

Warehouse

Inventory

↓

Product

Transaction

↓

User
```

All foreign keys use

```
ON DELETE RESTRICT
```

This prevents accidental deletion of referenced data.

Historical records remain valid forever.

---

# 14. Constraints

PostgreSQL enforces several categories of constraints.

## Primary Keys

Every table uses

```
BIGINT GENERATED ALWAYS AS IDENTITY
```

Advantages:

- scalable
- efficient indexing
- database-generated

---

## Foreign Keys

Foreign keys prevent orphan records.

Example:

Inventory cannot reference a warehouse that does not exist.

---

## CHECK Constraints

Examples include:

```
quantity >= 0

role IN (...)

transaction_type IN (...)
```

These ensure invalid business values cannot be stored.

---

## Unique Constraints

Examples:

```
Warehouse + Product

UNIQUE
```

```
Product SKU

UNIQUE
```

Duplicate inventory rows cannot exist.

---

# 15. Inventory Design

The system intentionally separates:

```
Current State

↓

Inventory Table
```

from

```
Historical Events

↓

Stock Transactions
```

This offers the best of both approaches.

Inventory lookups remain extremely fast.

Historical reconstruction remains possible.

---

# 16. Transaction Model

Every inventory modification follows this sequence.

```
Begin Transaction

↓

Lock Inventory Row

↓

Validate

↓

Insert Transaction

↓

Update Inventory

↓

Commit
```

Rollback occurs automatically if any step fails.

---

# 17. Soft Deletes

Business entities contain

```
is_active
```

instead of physical deletion.

Advantages:

- preserves history
- protects foreign keys
- enables recovery
- maintains auditability

Queries normally filter

```
WHERE is_active = TRUE
```

---

# 18. Timestamp Strategy

Every business entity records:

```
created_at

updated_at
```

using

```
TIMESTAMPTZ
```

Benefits:

- UTC storage
- timezone awareness
- consistent auditing

---

# 19. Indexing Strategy

Indexes are designed around common access patterns.

Primary goals:

- login performance
- inventory lookup
- reporting
- transaction history
- reconciliation

Important indexes include:

| Index | Purpose |
|--------|---------|
| email | Authentication |
| sku | Product lookup |
| warehouse_id | Inventory lookup |
| product_id | Inventory lookup |
| created_at | Reporting |
| reference_id | Transfer lookup |
| user_id | Audit reporting |
| (product_id, warehouse_id) | Reconciliation |

Indexes are added through Flyway migrations.

---

# 20. Database Performance

Performance is improved through:

- normalized schema
- indexed foreign keys
- unique indexes
- composite indexes
- efficient joins
- transaction-local updates

Future improvements may include:

- table partitioning
- materialized views
- Redis caching
- read replicas

---

# 21. Flyway Migration Strategy

Database evolution is version-controlled.

Example:

```
V1__create_users_table.sql

↓

V2__create_warehouses_table.sql

↓

V3__create_products_table.sql
```

Migration rules:

- Never edit an executed migration.
- Always create a new migration.
- Migrations are forward-only.
- All environments share identical schema history.

---

# 22. Future Schema Evolution

The architecture supports future additions without redesign.

Planned tables include:

```
suppliers

purchase_orders

sales_orders

purchase_order_items

sales_order_items

inventory_batches

expiry_tracking

notifications
```

Because the schema is normalized, these modules integrate naturally through foreign keys.

---

# 23. Database Design Principles

TerraGrid follows several principles.

## Database as Source of Truth

The database ultimately guarantees correctness.

---

## Immutable History

Historical transactions are append-only.

---

## Current State + Historical Events

Inventory provides fast reads.

Transactions provide complete history.

---

## Defensive Constraints

Application validation is complemented by database validation.

Both layers protect data integrity.

---

## Deterministic Schema Evolution

Flyway ensures every environment evolves identically.

---

# 24. Summary

The TerraGrid database architecture is designed to prioritize **correctness, consistency, and auditability**. By combining a normalized relational model with PostgreSQL constraints, transactional guarantees, and Flyway-managed schema evolution, the database provides a robust foundation for inventory management.

The separation between mutable inventory state and immutable transaction history enables both high-performance operational queries and complete historical traceability. This architecture supports current application requirements while remaining flexible enough to accommodate future features such as suppliers, purchase orders, batch tracking, and advanced reporting without requiring fundamental redesign.
