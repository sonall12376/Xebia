# Project Documentation - Module 4: Project Management (Admin & Manager)

This document outlines the features, files, APIs, and verification steps implemented during the Project Management module (Module 4).

## Features Implemented
1. **Interactive Project Board**:
   * Displays project listings filtered by search query (name and description), priority status (`High`, `Medium`, `Low`), and status-lane tabs (`All`, `Not Started`, `In Progress`, `Completed`, `On Hold`).
   * Visual project cards rendering name, description, active timeline duration, priority/status badges, manager designation, and initials avatars of assigned employee reports.
   * Auto-calculates remaining days to project deadlines and displays approaching warnings for non-completed projects (when deadline is within 10 days).
2. **Project Creation & Edit Modals**:
   * Accessible by `Admin` and `Manager` roles.
   * Allows creating/updating project names, descriptions, timelines (start and end dates), statuses, and priority weights.
   * Restricts managers to editing/deleting only projects they own, while Admins have system-wide privileges to manage all projects.
   * Employee Multi-Select: Renders a searchable checklist of all employees (with role `Employee`) to easily check/uncheck multiple assignees.
   * Manager Assignment: Admins can select any project manager from a dropdown list of users with role `Manager`. For Managers, the assignment defaults to themselves.
3. **Cascading Database and Soft-Delete Architecture**:
   * Implemented soft delete: when a project is deleted, its `isDeleted` flag is updated to `true` instead of deleting the document.
   * Soft-deleted projects are automatically excluded from dashboard queries, statistics counts, activity feeds, and frontend boards.
   * Historical records, reviews, and audits related to these projects are preserved since the project document remains in the database.
4. **Header Navigation Links**:
   * Exposes navigation tabs in `DashboardLayout` for the `Manager` role to switch between the Overview dashboard and the Project Board.
   * Exposes navigation tabs in `DashboardLayout` for the `Admin` role to toggle between the Overview dashboard, Employee Directory, and the Project Board.

---

## Files Created/Modified

### Backend
* **[Project.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/models/Project.js)** [MODIFY]: Added `isDeleted` Boolean field with default `false`.
* **[dashboardController.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/controllers/dashboardController.js)** [MODIFY]: Filtered out projects where `isDeleted === true` in dashboard feeds, statistics, and listings.
* **[projectController.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/controllers/projectController.js)** [NEW]: Core controller handling project queries, role permissions, soft-deletes, and assignee lookup utilities.
* **[projectRoutes.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/routes/projectRoutes.js)** [NEW]: Route paths mapped to project controllers.
* **[server.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/server.js)** [MODIFY]: Mounted the new `/api/projects` endpoints.
* **[verify-projects.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/scripts/verify-projects.js)** [NEW]: Automated API script testing Project CRUD, lookups, role boundaries, and soft delete database flags.

### Frontend
* **[ProjectManagement.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/ProjectManagement.jsx)** [NEW]: Interactive project dashboard rendering boards, modals, filters, and multi-select assignees.
* **[App.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/App.jsx)** [MODIFY]: Registered `/projects` route guarded by `allowedRoles={['Admin', 'Manager']}`.
* **[Dashboards.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/Dashboards.jsx)** [MODIFY]: Added project navigation links in `DashboardLayout` for Admins and Managers.

---

## APIs Added

### `GET /api/projects`
* **Access**: Private (Admin, Manager, Employee)
* **Response**: Returns a list of non-deleted projects.
  - Admin: Returns all projects.
  - Manager: Returns projects managed by them.
  - Employee: Returns projects assigned to them.

### `POST /api/projects`
* **Access**: Private (Admin, Manager)
* **Payload**: `{ name, description, startDate, endDate, status, priority, managerId, employeeIds }`
* **Response**: Registers a new project. Locks managerId to req.user._id if created by a Manager.

### `PUT /api/projects/:id`
* **Access**: Private (Admin, Manager)
* **Response**: Updates the targeted project's parameters. Prevents managers from editing projects they do not manage.

### `DELETE /api/projects/:id`
* **Access**: Private (Admin, Manager)
* **Response**: Performs a soft delete (sets `isDeleted = true`). Prevents managers from soft-deleting projects they do not manage.

### `GET /api/projects/employees`
* **Access**: Private (Admin, Manager)
* **Response**: Returns dropdown lookup list of all users with role `'Employee'`.

### `GET /api/projects/managers`
* **Access**: Private (Admin, Manager)
* **Response**: Returns dropdown lookup list of all users with role `'Manager'`.

---

## Verification and Testing

### 1. Backend Project APIs Verification
Run the automated testing suite against the local Express server:
```bash
cd backend
node scripts/verify-projects.js
```
*Expected: "--- ALL PROJECT ENDPOINTS AND SOFT DELETES VERIFIED SUCCESSFULLY ---" output log.*

### 2. Frontend Build Verification
Verify client assets compilation and router registration build successfully:
```bash
cd frontend
npm run build
```
*Expected: Vite builds successfully without any TS, JSX, or bundling errors.*
