# Arkan Authentication API (SQLite)

This document outlines the local authentication API endpoints implemented to replace Firebase Auth.

## Base URL: `/api/auth`

---

### 1. Login
**Endpoint:** `POST /login`  
**Description:** Authenticates a user and establishes a session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "rememberMe": true
}
```

**Response (Success 200):**
Sets an HTTP-only cookie `__session`.
```json
{
  "status": "success",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

---

### 2. Signup
**Endpoint:** `POST /signup`  
**Description:** Creates a new user account and automatically logs them in.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response (Success 201):**
Sets an HTTP-only cookie `__session`.
```json
{
  "status": "success",
  "user": { ... }
}
```

---

### 3. Get Current User (Session Check)
**Endpoint:** `GET /me`  
**Description:** Verifies the current session cookie and returns user profile.

**Response (Success 200):**
```json
{
  "authenticated": true,
  "user": { ... }
}
```

---

### 4. Forgot Password
**Endpoint:** `POST /forgot-password`  
**Description:** Generates a reset token and sends a recovery email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

### 5. Reset Password (Token-based)
**Endpoint:** `POST /reset-password`  
**Description:** Updates password using a valid reset token.

**Request Body:**
```json
{
  "token": "alphanumeric_token",
  "password": "new_secure_password"
}
```

---

### 6. Change Password (Authenticated)
**Endpoint:** `POST /change-password`  
**Description:** Updates password for the currently logged-in user. Requires valid session.

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password"
}
```

---

## Session Management
- **Token Type:** Local JWT (signed with `jose`).
- **Storage:** HTTP-only Cookie (`__session`).
- **Longevity:** 
  - Standard: 5 days.
  - Remember Me: 30 days.
- **Security:** `Secure` (in production), `SameSite=Lax`, `HttpOnly`.
