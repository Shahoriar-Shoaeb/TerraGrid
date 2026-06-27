# TerraGrid — Security Architecture

> **Version:** 1.0  
> **Framework:** Spring Security 6  
> **Authentication:** JWT (JSON Web Token)  
> **Password Hashing:** BCrypt  
> **Session Management:** Stateless

---

# 1. Introduction

Security is a fundamental architectural concern in TerraGrid. The system is designed to protect inventory data, enforce role-based access control, and ensure that only authenticated users can perform business operations.

The security architecture follows modern REST API best practices by using **stateless authentication** with JSON Web Tokens (JWT). Authentication and authorization are delegated to Spring Security, while business services enforce domain-specific authorization rules.

---

# 2. Security Goals

The security architecture is designed to achieve the following goals:

- Authenticate every user securely.
- Authorize requests based on user roles.
- Prevent unauthorized access to protected resources.
- Never store plaintext passwords.
- Ensure APIs remain stateless.
- Protect against common web vulnerabilities.
- Provide a secure foundation for future expansion.

---

# 3. Security Components

```
Client
   │
   │ HTTPS + JWT
   ▼
Spring Security Filter Chain
   │
   ▼
JWT Authentication Filter
   │
   ▼
UserDetailsService
   │
   ▼
Spring Security Context
   │
   ▼
REST Controllers
   │
   ▼
Business Services
```

Each incoming request passes through the Spring Security filter chain before reaching the application.

---

# 4. Authentication

Authentication verifies the identity of a user.

TerraGrid uses:

- Email
- Password
- JWT Access Token

Authentication is performed only once during login.

After successful authentication, the server issues a signed JWT.

Subsequent requests authenticate using this token rather than sending credentials again.

---

# 5. Authentication Flow

```
Client

↓

POST /api/auth/login

↓

AuthenticationManager

↓

UserDetailsService

↓

Database

↓

Password Verification

↓

JWT Generation

↓

JWT Returned

↓

Client Stores Token

↓

Future Requests Include JWT
```

Passwords are never transmitted again after login.

---

# 6. JWT Authentication

JWTs contain authenticated user information.

Typical claims include:

```
User ID

Email

Role

Issued Time

Expiration Time
```

The token is digitally signed to prevent tampering.

On every request the signature is verified before access is granted.

---

# 7. Stateless Sessions

TerraGrid does **not** maintain server-side HTTP sessions.

Instead:

```
Client

↓

JWT

↓

Every Request
```

Benefits:

- horizontal scalability
- reduced server memory usage
- easier deployment
- load-balancer friendly

Each request is completely independent.

---

# 8. Password Security

Passwords are **never stored in plaintext**.

Instead, passwords are hashed using BCrypt.

```
User Password

↓

BCrypt

↓

Password Hash

↓

Database
```

During login:

```
Submitted Password

↓

BCrypt Verification

↓

Stored Hash
```

Only the hash is stored.

The original password cannot be recovered.

---

# 9. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

TerraGrid uses **Role-Based Access Control (RBAC)**.

Current roles:

```
ADMIN

MANAGER
```

Future roles may include:

```
AUDITOR

OPERATOR

VIEWER
```

---

# 10. Role Permissions

| Operation | ADMIN | MANAGER |
|------------|:-----:|:-------:|
| Login | ✓ | ✓ |
| View Products | ✓ | ✓ |
| Create Products | ✓ | ✓ |
| Update Products | ✓ | ✓ |
| Manage Warehouses | ✓ | ✓ |
| Stock In | ✓ | ✓ |
| Stock Out | ✓ | ✓ |
| Transfer Inventory | ✓ | ✓ |
| View Reports | ✓ | ✓ |
| Manage Users | ✓ | ✗ |

Additional roles can be introduced without changing the architecture.

---

# 11. Spring Security Filter Chain

Every request passes through the filter chain.

```
HTTP Request

↓

Security Filter Chain

↓

JWT Authentication Filter

↓

Token Validation

↓

Security Context

↓

Authorization

↓

Controller
```

Requests with invalid or missing tokens are rejected before reaching application logic.

---

# 12. Security Context

After successful authentication:

```
JWT

↓

Authenticated User

↓

SecurityContextHolder
```

Controllers and services can retrieve the currently authenticated user without manually parsing the token.

This avoids duplicate authentication logic.

---

# 13. Endpoint Protection

Public endpoints:

```
POST /api/auth/login
```

Protected endpoints:

```
/api/products/**

/api/warehouses/**

/api/inventory/**
```

Protected endpoints require a valid JWT.

---

# 14. HTTPS

All communication between clients and the server should occur over HTTPS.

HTTPS provides:

- encryption
- confidentiality
- integrity
- server authentication

JWTs should never be transmitted over unencrypted HTTP in production.

---

# 15. Input Validation

Security also includes validating incoming data.

Bean Validation is applied to request DTOs.

Examples:

```
@NotBlank

@NotNull

@Email

@Positive

@Size
```

Invalid requests are rejected before business logic executes.

---

# 16. SQL Injection Protection

Persistence uses Spring Data JPA and parameterized queries.

Example:

```
Repository

↓

Prepared Statement

↓

Database
```

User input is never concatenated into SQL strings.

This significantly reduces SQL injection risk.

---

# 17. Cross-Site Request Forgery (CSRF)

Because TerraGrid is a stateless REST API using JWT authentication, CSRF protection is disabled.

Reason:

- no server-side sessions
- authentication uses Authorization headers
- cookies are not used for authentication

---

# 18. Cross-Origin Resource Sharing (CORS)

The backend allows requests only from approved frontend origins.

Typical configuration:

```
http://localhost:5173
```

Future production configuration:

```
https://terragrid.example.com
```

Restricting origins prevents unauthorized browser-based requests.

---

# 19. Exception Handling

Authentication failures return:

```
401 Unauthorized
```

Authorization failures return:

```
403 Forbidden
```

Example:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token."
}
```

All security errors follow a consistent JSON format.

---

# 20. Security Logging

The application logs security-relevant events.

Examples include:

- successful login
- failed login
- invalid token
- unauthorized access
- forbidden operations

Sensitive information is **never** logged.

Examples of data that must not appear in logs:

- passwords
- JWT contents
- password hashes

---

# 21. Future Security Enhancements

The architecture supports future additions, including:

- Refresh Tokens
- Account Lockout
- Multi-Factor Authentication (MFA)
- OAuth2 / OpenID Connect
- API Rate Limiting
- Secret Management (e.g., Vault)
- Security Monitoring
- Audit Dashboards

These enhancements can be integrated without major architectural changes.

---

# 22. Security Best Practices

TerraGrid follows several established security practices:

- Stateless authentication
- Principle of least privilege
- BCrypt password hashing
- Role-based authorization
- HTTPS communication
- Bean Validation
- Parameterized database queries
- Centralized exception handling
- Secure logging
- No sensitive data stored in plaintext

---

# 23. Summary

TerraGrid adopts a modern, stateless security architecture based on Spring Security and JWT authentication. Authentication is performed once during login, after which signed JWTs authorize subsequent requests. Role-based access control ensures users can perform only permitted operations, while BCrypt hashing, HTTPS, validation, and database-safe persistence protect sensitive information.

This architecture provides a secure foundation for the current application and is designed to accommodate future enhancements such as refresh tokens, multi-factor authentication, and external identity providers without requiring significant redesign.
