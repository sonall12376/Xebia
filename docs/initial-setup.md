# Project Documentation - Initial Setup

This document outlines the features, database schemas, directory structure, and verification steps implemented during the Initial Setup phase (Phase 1).

## Features Implemented
1. **Mono-repository Directory Layout**: Created separate frontend and backend folder systems.
2. **MongoDB Mongoose Schema Design**: Drafted database schemas with strict validation rules.
3. **Tailwind CSS v4 Integration**: Pre-configured the Vite React frontend with Tailwind CSS v4 and PostCSS compatibility.
4. **Schema Verification System**: Created an automated backend script to connect to MongoDB and validate schema constraints.

---

## Directory Structure
```text
Xebia/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection client config
│   ├── models/
│   │   ├── User.js             # User credentials, roles, and info schema
│   │   ├── Project.js          # Project manager & team assignments schema
│   │   ├── Attendance.js       # Daily check-in & check-out logs schema
│   │   └── Review.js           # 5-star performance evaluations schema
│   ├── scripts/
│   │   └── verify-schemas.js   # Database validations verification test script
│   ├── .env                    # Local environmental variables
│   └── package.json            # Node.js backend configuration and packages
├── docs/
│   └── initial-setup.md        # This setup documentation file
└── frontend/
    ├── src/
    │   ├── App.jsx             # Entry component with success verification portal
    │   ├── index.css           # Global CSS and Tailwind directives
    │   └── main.jsx            # React root renderer
    ├── package.json            # Vite React packages and configurations
    ├── postcss.config.js       # PostCSS Tailwind config
    └── tailwind.config.js      # Tailwind content configuration
```

---

## Database Schemas

### 1. User (`backend/models/User.js`)
* **role**: Enum of `['Admin', 'Manager', 'Employee']` (default: `'Employee'`).
* **password**: Cryptographic hashing via `pre-save` hooks using `bcryptjs` with auto salt generation.
* **managerId**: Relational self-reference to `User` table for employee-manager linking.

### 2. Project (`backend/models/Project.js`)
* **status**: Enum of `['Not Started', 'In Progress', 'Completed', 'On Hold']` (default: `'Not Started'`).
* **priority**: Enum of `['Low', 'Medium', 'High']` (default: `'Medium'`).
* **managerId**: Reference link pointing to the project manager (`User`).
* **employeeIds**: Array of references pointing to assigned team members (`User`).

### 3. Attendance (`backend/models/Attendance.js`)
* **userId**: Reference pointing to the employee (`User`).
* **date**: Normalized to midnight UTC to prevent multi-timezone shift bugs.
* **checkInTime** & **checkOutTime**: ISO Date time stamps.
* **Indices**: Compound unique index `{ userId: 1, date: 1 }` to block duplicate daily check-ins.

### 4. Review (`backend/models/Review.js`)
* **employeeId** & **managerId**: Reference links to user documents.
* **Metrics**: 5 core categories rated on a star range of `1` (min) to `5` (max):
  * `technical`, `communication`, `teamwork`, `problemSolving`, `leadership`.
* **comments**: Long-form string feedback.

---

## APIs Added
*None* (Database models only).

---

## Verification and Testing
To run the schema validations script:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Execute the validator:
   ```bash
   node scripts/verify-schemas.js
   ```
*Verification prints assertions for Mongoose schema compile, database connection, password hashing, compound uniqueness, and star rating range limitations.*
