# Project Documentation - Module 5: Attendance Management (All Roles)

This document outlines the features, files, APIs, and verification steps implemented during the Attendance Management module (Module 5).

## Features Implemented
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

---

## Files Created/Modified

### Backend
* **[attendanceController.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/controllers/attendanceController.js)** [NEW]: Core controller logic for daily check-ins, check-outs, status queries, personal history lists, and manager team presence lookups.
* **[dashboardController.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/controllers/dashboardController.js)** [MODIFY]: Included manager's own `todayAttendance` status inside `/api/dashboard/manager` payload.
* **[server.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/server.js)** [MODIFY]: Mounted the new `/api/attendance` endpoints.
* **[verify-attendance.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/scripts/verify-attendance.js)** [NEW]: Automated API script testing check-ins, duplicate protections, status fetching, and team audits.

### Frontend
* **[AttendanceManagement.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/AttendanceManagement.jsx)** [MODIFY]: Enabled tab layout to switch between team logs and personal history tables.
* **[App.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/App.jsx)** [MODIFY]: Registered `/attendance` route.
* **[Dashboards.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/Dashboards.jsx)** [MODIFY]: Integrated clock-in/out widget on both Employee and Manager Dashboards.

---

## APIs Added

### `POST /api/attendance/check-in`
* **Access**: Private (All roles)
* **Response**: Registers a check-in for today. Fails if a record already exists for the user on today's calendar date.

### `POST /api/attendance/check-out`
* **Access**: Private (All roles)
* **Response**: Registers a check-out for today, updating `checkOutTime`. Fails if no check-in exists or if already checked out.

### `GET /api/attendance/status`
* **Access**: Private (All roles)
* **Response**: Returns today's check-in record for the logged-in user (or `null` if none).

### `GET /api/attendance/my-history`
* **Access**: Private (All roles)
* **Response**: Returns list of all personal attendance logs sorted by date descending.

### `GET /api/attendance/team`
* **Access**: Private (Admin, Manager only)
* **Response**: Returns list of populated attendance logs. Managers see logs of direct reports; Admins see all logs.

---

## Verification and Testing

### 1. Backend Attendance APIs Verification
Run the automated testing suite against the local Express server:
```bash
cd backend
node scripts/verify-attendance.js
```
*Expected: "--- ALL ATTENDANCE ENDPOINTS AND LOGIC VERIFIED SUCCESSFULLY ---" output log.*

### 2. Frontend Build Verification
Verify client assets compilation and router registration build successfully:
```bash
cd frontend
npm run build
```
*Expected: Vite builds successfully without any TS, JSX, or bundling errors.*
