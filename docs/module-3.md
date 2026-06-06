# Project Documentation - Module 3: Employee Management (Admin Only)

This document outlines the features, files, APIs, and verification steps implemented during the Employee Management module (Module 3).

## Features Implemented
1. **Admin Employee Directory Page**:
   * Interactive table view listing all employees and managers (excluding admins).
   * Search functionality filtering by name, email, or designation/title in real-time.
   * Department-based filtering selector dropdown.
   * Role-based filtering selector dropdown.
   * Display of profile pictures, emails, departments, designations, assigned manager names, contact numbers, and joining dates.
2. **Add/Edit Employee Dialog Form**:
   * Create new employee/manager profiles (email verification uniqueness enforced).
   * Edit existing profile details (name, role, department, designation, contact, profile picture, manager assignment).
   * Dynamic Manager Dropdown: Fetches current list of users with the `Manager` role to dynamically map standard `Employee` reporting assignments.
   * Hides the reporting manager selection dropdown automatically if the selected user role is `Manager`.
   * Enforces password requirements for new profiles, while keeping password optional on edits (leave blank to maintain current password).
3. **Delete Confirmation Dialog**:
   * Dialog alert protecting against accidental deletion requests.
   * Restructures database reference mapping: deletes references in reports (reverting to null manager) and projects (removing employee/manager references) before user deletion.
4. **Header Navigation Links**:
   * Exposes navigation tabs in `DashboardLayout` for the `Admin` role to switch between the Overview dashboard and the Employee Directory.
   * Styled responsively for mobile viewport sizes.

---

## Files Created/Modified

### Backend
* **[userController.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/controllers/userController.js)** [NEW]: Core controller functions (`getUsers`, `createUser`, `updateUser`, `deleteUser`, `getManagers`) with Mongoose queries and database cleanups.
* **[userRoutes.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/routes/userRoutes.js)** [NEW]: Express router mapping paths to user controller functions under Admin authentication gates.
* **[server.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/server.js)** [MODIFY]: Mounted the `/api/users` routes.
* **[verify-crud.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/scripts/verify-crud.js)** [NEW]: Automated API script verifying register, lookup, manager listings, updates, and deletion.

### Frontend
* **[EmployeeManagement.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/EmployeeManagement.jsx)** [NEW]: Employee Directory component including searching, filtering, and responsive CRUD modals.
* **[App.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/App.jsx)** [MODIFY]: Registered `/admin/employees` route guarded by `ProtectedRoute allowedRoles={['Admin']}`.
* **[Dashboards.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/Dashboards.jsx)** [MODIFY]: Exported `DashboardLayout` and added responsive Admin header links.

---

## APIs Added

### `GET /api/users`
* **Access**: Private (Admin role only)
* **Response**: Returns a list of all user profiles (excluding Admins), populated with manager names and emails.

### `POST /api/users`
* **Access**: Private (Admin role only)
* **Response**: Registers a new user, hashes their password, and returns the profile details.

### `PUT /api/users/:id`
* **Access**: Private (Admin role only)
* **Response**: Updates the targeted user's attributes (e.g. name, designation, contact, managerId, password) and returns the updated details.

### `DELETE /api/users/:id`
* **Access**: Private (Admin role only)
* **Response**: Permanently removes the targeted user and cleans up database references.

### `GET /api/users/managers`
* **Access**: Private (Admin role only)
* **Response**: Returns a simplified dropdown-friendly list of all users with the `Manager` role.

---

## Verification and Testing

### 1. Backend CRUD APIs Verification
An automated script checks all CRUD API responses against the local Express server:
```bash
cd backend
node scripts/verify-crud.js
```
*Expected: "--- ALL CRUD OPERATIONS VERIFIED SUCCESSFULLY ---" output log.*

### 2. Frontend Build Verification
Verify client assets compilation and router registration build successfully:
```bash
cd frontend
npm run build
```
*Expected: Vite builds successfully without any TS, JSX, or bundling errors.*
