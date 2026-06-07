# PerformancePortal - Comprehensive System Documentation

This document compiles the complete system specifications, database schemas, API endpoints, directory structures, and verification steps implemented across all phases of the **PerformancePortal** application (Initial Setup & Modules 1–6).

---

## Table of Contents
1. [Phase 1: Initial Setup & Database Schemas](#phase-1-initial-setup--database-schemas)
2. [Module 1: Authentication & Authorization](#module-1-authentication--authorization)
3. [Module 2: Role-based Dashboards](#module-2-role-based-dashboards)
4. [Module 3: Employee CRUD Management](#module-3-employee-crud-management)
5. [Module 4: Project Management & Soft Deletion](#module-4-project-management--soft-deletion)
6. [Module 5: Attendance Management & Live Shifts](#module-5-attendance-management--live-shifts)
7. [Module 6: Performance Review Management](#module-6-performance-review-management)
8. [System Installation & Startup Instructions](#system-installation--startup-instructions)

---

## Phase 1: Initial Setup & Database Schemas

The initial setup established a clean mono-repository directory layout, designed MongoDB Mongoose schemas with strict validations, and pre-configured the React frontend with Vite, Tailwind CSS v4, and PostCSS.

### Database Schemas

#### 1. User Schema (`backend/models/User.js`)
* **name**: String (required).
* **email**: String (required, unique, matches regex).
* **password**: Cryptographic hashing via `pre-save` hooks using `bcryptjs` with auto salt generation.
* **role**: Enum of `['Admin', 'Manager', 'Employee']` (default: `'Employee'`).
* **department**: String.
* **designation**: String.
* **contact**: String.
* **joiningDate**: Date.
* **managerId**: Relational self-reference to `User` table for employee-manager linking.

#### 2. Project Schema (`backend/models/Project.js`)
* **name**: String (required).
* **description**: String.
* **startDate**: Date.
* **endDate**: Date.
* **status**: Enum of `['Not Started', 'In Progress', 'Completed', 'On Hold']` (default: `'Not Started'`).
* **priority**: Enum of `['Low', 'Medium', 'High']` (default: `'Medium'`).
* **managerId**: Reference link pointing to the project manager (`User`).
* **employeeIds**: Array of references pointing to assigned team members (`User`).
* **isDeleted**: Boolean (default: `false`) for soft deletion.

#### 3. Attendance Schema (`backend/models/Attendance.js`)
* **userId**: Reference pointing to the employee (`User`, required).
* **date**: Normalized to midnight UTC.
* **checkInTime**: Date (required).
* **checkOutTime**: Date.
* **Indices**: Compound unique index `{ userId: 1, date: 1 }` to block duplicate daily check-ins.

#### 4. Review Schema (`backend/models/Review.js`)
* **employeeId**: Reference link pointing to employee (`User`, required).
* **managerId**: Reference link pointing to evaluator (`User`, required).
* **Metrics**: 5 core categories rated on a star range of `1` (min) to `5` (max):
  * `technical`, `communication`, `teamwork`, `problemSolving`, `leadership`.
* **comments**: Long-form string feedback.

---

## Module 1: Authentication & Authorization

Secured client-server transactions through JWT session tokens, endpoint protection, and React browser routing guards.

### Features Implemented
1. **JWT Session Generation**: Signed cryptographic JWT sessions for secure client-server transactions.
2. **Endpoint Protection Middleware**: Built a middleware validator checking for valid Bearer JWT tokens in request headers.
3. **Role-based Access Control (RBAC)**: Added authorization checks verifying that users possess allowed roles before granting access to server routes.
4. **Client-side Routing Guards**: Set up React ProtectedRoute wrapper to redirect unauthenticated navigation and enforce role checks in the browser.
5. **Onboarding Views**: Styled and implemented Login, Signup, and mock ForgotPassword layout pages using Tailwind CSS.

### APIs Added
* `POST /api/auth/register`: Public onboarding endpoint returning user profile details and signed JWT.
* `POST /api/auth/login`: Checks user credentials, returning user profile and JWT token on success.
* `GET /api/auth/me`: Private user profile details request guarded via JWT protect middleware.

---

## Module 2: Role-based Dashboards

Replaced initial route placeholders with responsive, live telemetry consoles tailored to User roles.

### Features Implemented
1. **Admin Control Console**:
   * Statistics grid: total users reporting (employees + managers), active project count (`In Progress`), today's organization attendance percentage, and employees missing reviews.
   * Recent Activity Stream: Dynamic feed displaying checking events, project releases, and evaluation submissions, sorted by date descending.
2. **Manager Team Console**:
   * Direct Reports Grid: Displays team member designations, contact cards, and evaluation completion badges.
   * Project Board: Lists managed projects, status tags, timelines, and team assigned avatars.
   * Daily Team Attendance Check: Real-time list matching check-in and check-out timestamps for direct reports today.
3. **Employee Personal Console**:
   * Personal Metrics Banner: Identifies check-in details today, and displays overall average rating (e.g. `4.5 / 5`).
   * Project Cards Grid: Cards highlighting project details, priorities, and timelines.
   * Star Performance Breakdown: Visual progress bars mapping criteria averages (Technical, Communication, Teamwork, Problem Solving, Leadership).
   * Manager Feedback History: Feedback cards displaying reviewer designations, dates, and review comments.

### APIs Added
* `GET /api/dashboard/admin`: Private (Admin only) organization-wide statistics.
* `GET /api/dashboard/manager`: Private (Manager only) team project summaries, attendance list, and reports checklist.
* `GET /api/dashboard/employee`: Private (Employee only) projects assigned, attendance checks, score averages, and reviews feedback.

---

## Module 3: Employee CRUD Management

Gave Administrators complete control to manage the user base, edit profiles, and map organizational reporting hierarchies.

### Features Implemented
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

### APIs Added
* `GET /api/users`: Returns a list of all user profiles (excluding Admins), populated with manager names and emails.
* `POST /api/users`: Registers a new user, hashes their password, and returns the profile details.
* `PUT /api/users/:id`: Updates the targeted user's attributes (e.g. name, designation, contact, managerId, password) and returns the updated details.
* `DELETE /api/users/:id`: Permanently removes the targeted user and cleans up database references.
* `GET /api/users/managers`: Returns a dropdown-friendly list of all users with the `Manager` role.

---

## Module 4: Project Management & Soft Deletion

Allows creating and managing project boards, assigning team members, and soft-deleting projects to preserve historical logs.

### Features Implemented
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

### APIs Added
* `GET /api/projects`: Returns list of non-deleted projects (Admin sees all, Manager sees owned, Employee sees assigned).
* `POST /api/projects`: Registers a new project (requires Admin/Manager auth).
* `PUT /api/projects/:id`: Updates targeted project attributes. Prevents managers from editing others' projects.
* `DELETE /api/projects/:id`: Soft-deletes project (`isDeleted = true`).
* `GET /api/projects/employees`: Returns lookup list of all Employees.
* `GET /api/projects/managers`: Returns lookup list of all Managers.

---

## Module 5: Attendance Management & Live Shifts

Enables employee check-in and check-out logs tracking, personal log history, active session clock indicators, and manager audit boards.

### Features Implemented
1. **Interactive Clock-In / Clock-Out Widget**:
   * Integrated directly into both the Employee Dashboard and the Manager Dashboard.
   * If there is no check-in log today: renders a "Clock In" action button.
   * Once checked in: shows the active checked-in status and checkbox time, and renders a "Clock Out" action button.
   * Once checked out: displays both check-in and check-out times, and disables subsequent daily clock-in/out actions to enforce calendar uniqueness.
2. **Attendance History Page (Employee)**:
   * Accessible by all employees.
   * Renders summary counters showing the total days present this month and average shift durations.
   * Log history table displaying dates, check-in timestamps, check-out timestamps, calculated hours worked, and status badges.
3. **Manager & Admin Dual Presence view**:
   * Accessible by Managers and Admins.
   * Tabbed toggle layout allowing Managers to switch seamlessly between **"Team Presence Audit"** (to monitor direct reports) and **"My Attendance"** (to review and track their own personal history metrics and logs).
   * Filter console enabling searches by employee name/email and query date range parameters on the team presence view.
4. **Dynamic Work Hours Calculator**:
   * Completed Shifts: Computes shift duration as `(checkOutTime - checkInTime) / (1000 * 60 * 60)` yielding decimal hours.
   * Active Shifts (In Progress): If `checkOutTime` is null, calculates current elapsed duration from `checkInTime` to the user's current clock time, and displays a pulsing "In Progress" status badge.
   * Handles overnight shifts (spanning across midnight) accurately using absolute epoch timestamps.
   * Employs safeguards that catch invalid timestamps (e.g. check-in after check-out) and defaults calculations to `0` hours.

### APIs Added
* `POST /api/attendance/check-in`: Registers a check-in for today. Blocks duplicate entries.
* `POST /api/attendance/check-out`: Registers today's check-out. Updates `checkOutTime`.
* `GET /api/attendance/status`: Returns today's check-in status log for the logged-in user.
* `GET /api/attendance/my-history`: Returns personal history logs sorted by date descending.
* `GET /api/attendance/team`: Returns attendance logs (Managers see direct reports; Admins see all).

---

## Module 6: Performance Review Management

Implements numerical 5-star ratings and text comments for employee evaluations, submitted by reporting managers, and auditable by HR admins.

### Features Implemented
1. **Interactive Star Rating Controls**:
   * Custom, hover-lit star widget allowing managers to easily assign 1-5 star ratings for core categories (Technical, Communication, Team Collaboration, Problem Solving, Leadership).
2. **Dynamic Review Forms**:
   * Evaluator modal form containing star selectors, description helpers, and feedback text fields.
   * Auto-validation verifying that all five rating categories are populated before permitting review submission.
3. **Pending and Submitted Evaluation Management (Managers)**:
   * **Pending Tab**: Lists direct reports who have not received evaluations from the manager yet, with an "Evaluate" action button.
   * **Submitted Tab**: Shows historical logs of all submitted reviews, average score badges, qualitative comments, and options to edit or delete evaluations.
4. **Unified System Audit Log (HR Admins)**:
   * Consolidates all submitted evaluations across the organization in a searchable audit table.
   * Enables Admins to monitor scores, search logs by employee/evaluator, and edit or delete records for compliance.
5. **Detailed Evaluation History (Employees)**:
   * Dedicated reviews log view where employees can see their history of reviews, evaluator information, date, 5-star metric breakdowns, and manager comments.
6. **Overall Rating Syncing**:
   * Reviews submitted or updated reflect immediately on the employee's Dashboard Overview under overall rating gauges and breakdown charts.

### APIs Added
* `POST /api/reviews`: Submits a review. Blocks duplicate reviews. Managers can only evaluate their direct reports.
* `GET /api/reviews/my-reviews`: Returns a list of evaluations received by the logged-in user.
* `GET /api/reviews/manager`: Returns a list of all reviews submitted by the logged-in manager.
* `GET /api/reviews/employee/:employeeId`: Returns reviews history for a specific employee (accessible by the employee, their manager, and Admins).
* `GET /api/reviews`: Returns all reviews across the organization (Admin only).
* `PUT /api/reviews/:id`: Updates ratings/comments of a review. Managers can only update reviews they created.
* `DELETE /api/reviews/:id`: Deletes a review. Managers can only delete reviews they created.

---

## System Installation & Startup Instructions

Follow these instructions to spin up the local development servers for testing:

### 1. Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Running locally on default port `27017` or configured via `.env` file)

### 2. Backend Installation & Setup
1. Open a terminal in the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with mock users, projects, attendance logs, and reviews:
   ```bash
   node scripts/seed.js
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs on port 5000: `Server running in development mode on port 5000`.*

### 3. Frontend Installation & Setup
1. Open a separate terminal in the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend client dev server:
   ```bash
   npm run dev
   ```
   *The React application runs locally: `Vite Dev Server running on http://localhost:5173`.*

### 4. Running Automated Tests
Run any of the automated API verification scripts inside the `backend` folder:
* **Authentication**: `node scripts/verify-auth.js`
* **Schema Validation**: `node scripts/verify-schemas.js`
* **Employee CRUD**: `node scripts/verify-crud.js`
* **Projects**: `node scripts/verify-projects.js`
* **Attendance**: `node scripts/verify-attendance.js`
* **Performance Reviews**: `node scripts/verify-reviews.js`
