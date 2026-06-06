# Project Documentation - Module 2: Dashboards (The Control Centers)

This document outlines the features, files, APIs, and verification steps implemented during the Dashboards module (Module 2).

## Features Implemented
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

---

## Files Created/Modified

### Backend
* **[dashboardController.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/controllers/dashboardController.js)** [NEW]: Aggregated database stats queries for each user role.
* **[dashboardRoutes.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/routes/dashboardRoutes.js)** [NEW]: Route configuration file mapping paths to controllers.
* **[seed.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/scripts/seed.js)** [NEW]: Seeding script generating admin, manager, employees, active projects, attendance check-ins, and performance evaluations.
* **[server.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/server.js)** [MODIFY]: Registered and mounted the `/api/dashboard` router paths.

### Frontend
* **[Dashboards.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/Dashboards.jsx)** [MODIFY]: Overwrote placeholders with complete console views, backend API integrations, and rating visualizers.

---

## APIs Added

### `GET /api/dashboard/admin`
* **Access**: Private (Admin role only)
* **Response**: Returns organization statistics (employee count, active projects, attendance %, pending reviews) and recent activity logs.

### `GET /api/dashboard/manager`
* **Access**: Private (Manager role only)
* **Response**: Returns team statistics (report details, managed projects, reports check-in logs, pending reviews list).

### `GET /api/dashboard/employee`
* **Access**: Private (Employee role only)
* **Response**: Returns employee statistics (projects assigned, today's attendance log, score averages, review feed history).

---

## Verification and Testing

### 1. Seeding Data
Before testing, seed the MongoDB database with dashboard mock feeds:
```bash
cd backend
node scripts/seed.js
```

### 2. Backend Dashboard APIs Verification
Check the API responses using a REST client (e.g., fetch, curl) or using manual testing.

### 3. Frontend Build Verification
Verify client CSS compilation and router imports bundle successfully:
```bash
cd frontend
npm run build
```
*Vite assets bundle without CSS or JSX errors.*
