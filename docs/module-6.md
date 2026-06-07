# Project Documentation - Module 6: Performance Review Management (All Roles)

This document outlines the features, files, APIs, and verification steps implemented during the Performance Review Management module (Module 6).

## Features Implemented
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

---

## Files Created/Modified

### Backend
* **[reviewController.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/controllers/reviewController.js)** [NEW]: Core controller logic for submitting, retrieving, updating, and deleting evaluations.
* **[reviewRoutes.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/routes/reviewRoutes.js)** [NEW]: Route paths mapped to review controllers with token protection and role-based guards.
* **[server.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/server.js)** [MODIFY]: Mounted the new `/api/reviews` endpoints.
* **[verify-reviews.js](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/backend/scripts/verify-reviews.js)** [NEW]: Automated API script testing valid reviews, duplicates, validation errors, ownership checks, updates, and deletes.

### Frontend
* **[ReviewManagement.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/ReviewManagement.jsx)** [NEW]: Interactive evaluations dashboard supporting modals, ratings, comments, and distinct role views.
* **[App.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/App.jsx)** [MODIFY]: Registered `/reviews` route.
* **[Dashboards.jsx](file:///C:/Users/hp/Desktop/Xebia_Internship/Xebia/frontend/src/pages/Dashboards.jsx)** [MODIFY]: Integrated navigation links in headers for Admin, Manager, and Employee.

---

## APIs Added

### `POST /api/reviews`
* **Access**: Private (Manager, Admin only)
* **Response**: Registers a review. Fails with 400 if a review from this evaluator already exists for the employee. Fails with 403 if a Manager attempts to evaluate someone who is not a direct report.

### `GET /api/reviews/my-reviews`
* **Access**: Private (All roles)
* **Response**: Returns a list of evaluations received by the logged-in user.

### `GET /api/reviews/manager`
* **Access**: Private (Manager only)
* **Response**: Returns a list of all reviews submitted by the logged-in manager.

### `GET /api/reviews/employee/:employeeId`
* **Access**: Private (All roles)
* **Response**: Returns reviews history for a specific employee. Access is restricted to the employee themselves, their manager, and Admins.

### `GET /api/reviews`
* **Access**: Private (Admin only)
* **Response**: Returns all reviews across the organization.

### `PUT /api/reviews/:id`
* **Access**: Private (Manager, Admin only)
* **Response**: Updates ratings/comments of a review. Managers can only update reviews they created.

### `DELETE /api/reviews/:id`
* **Access**: Private (Manager, Admin only)
* **Response**: Deletes a review. Managers can only delete reviews they created.

---

## Verification and Testing

### 1. Backend Performance Review APIs Verification
Run the automated test suite:
```bash
cd backend
node scripts/verify-reviews.js
```
*Expected: "--- ALL PERFORMANCE REVIEW ENDPOINTS AND LOGIC VERIFIED SUCCESSFULLY ---" output log.*

### 2. Frontend Build Verification
Verify client assets compilation and router registration build successfully:
```bash
cd frontend
npm run build
```
*Expected: Vite builds successfully without any TS, JSX, or bundling errors.*
