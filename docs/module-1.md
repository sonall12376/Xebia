# Project Documentation - Module 1: Authentication & Authorization

This document outlines the features, files, APIs, and verification steps implemented during the Authentication and Authorization module (Module 1).

## Features Implemented
1. **JWT Session Generation**: Signed cryptographic JWT sessions for secure client-server transactions.
2. **Endpoint Protection Middleware**: Built a middleware validator checking for valid Bearer JWT tokens in request headers.
3. **Role-based Access Control (RBAC)**: Added authorization checks verifying that users possess allowed roles before granting access to server routes.
4. **Client-side Routing Guards**: Set up React ProtectedRoute wrapper to redirect unauthenticated navigation and enforce role checks in the browser.
5. **Onboarding Views**: Styled and implemented Login, Signup, and mock ForgotPassword layout pages using Tailwind CSS.

---

## Files Created/Modified

### Backend
* **[generateToken.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/utils/generateToken.js)** [NEW]: Utility function to sign user tokens.
* **[authMiddleware.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/middleware/authMiddleware.js)** [NEW]: Protect and authorize route control handlers.
* **[authController.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/controllers/authController.js)** [NEW]: Controllers for registration, login, and fetching the user profile.
* **[authRoutes.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/routes/authRoutes.js)** [NEW]: Express router mapping endpoints to handlers.
* **[server.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/server.js)** [NEW]: Server entrypoint bootstrapping db connections and endpoints.
* **[verify-auth.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/scripts/verify-auth.js)** [NEW]: API test runner executing endpoint assertions.

### Frontend
* **[AuthContext.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/context/AuthContext.jsx)** [NEW]: Context provider managing user sessions and requests.
* **[ProtectedRoute.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/components/ProtectedRoute.jsx)** [NEW]: Client-side path guard.
* **[Login.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/Login.jsx)** [NEW]: Enterprise login screen.
* **[Signup.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/Signup.jsx)** [NEW]: User registration portal.
* **[ForgotPassword.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/ForgotPassword.jsx)** [NEW]: Password reset screen.
* **[Dashboards.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/Dashboards.jsx)** [NEW]: Console placeholders for Admin, Manager, and Employee screens.
* **[main.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/main.jsx)** [MODIFY]: Wrapped React mount tree in the `AuthProvider`.
* **[App.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/App.jsx)** [MODIFY]: Set up browser path routing.
* **[package.json](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/package.json)** [MODIFY]: Installed `react-router-dom` and `lucide-react`.

---

## APIs Added

### `POST /api/auth/register`
* **Access**: Public
* **Payload**: `{ name, email, password, role, department, designation, contact }`
* **Response**: Returns registered user credentials profile and signed JWT token.

### `POST /api/auth/login`
* **Access**: Public
* **Payload**: `{ email, password }`
* **Response**: Checks credentials, returning user details and signed JWT token on success.

### `GET /api/auth/me`
* **Access**: Private (Protected via JWT)
* **Headers**: `Authorization: Bearer <token>`
* **Response**: Returns authenticated user session profile.

---

## Verification and Testing

### 1. Backend Verification Script
1. Boot the server:
   ```bash
   node server.js
   ```
2. In a separate terminal, execute the verification tests:
   ```bash
   node scripts/verify-auth.js
   ```
*Asserts admin, manager, employee registrations, logins, duplicate checks, password validations, and decoded token matching.*

### 2. Frontend Build Verification
Verify client CSS compilation and router imports bundle successfully:
```bash
npm run build
```
*Webpack/Vite assets render without warnings.*
