# HR Manager & Salary Analytics System
### Final Exam: Internet Programming (2026)
**Student ID:** 6730202556  
**Repository Name:** Std6730202556IPFinal2026  

---

## 1. Project Overview
Full-stack application consisting of an **Express.js Backend** and a **React Native (Expo) Frontend** designed with modern UI/UX principles.

### Key Features
1. **Authentication (Phase 1):**
   - Admin Login with credentials: `admin` / `password123` (Full Access)
   - HR Login: `hr_user` / `hr123` (View Salaries, Toggle Status, K-Means Analytics)
   - Staff Login: `staff` / `staff123` (View Attendance Status only, Salaries Masked)
   - Access token storage & route protection
2. **Employee Management CRUD (Phase 1):**
   - View all employees with status badges (`Active` / `On Leave`)
   - Add new employees with client-side form validation (prevents empty submissions)
   - Toggle employee status (`Active` ⟷ `On Leave`)
   - Delete employee with confirmation dialog alert
3. **K-Means Salary Analytics (Phase 2):**
   - 1D K-Means Clustering ($k=3$) grouping salaries into **Tier 1 (Base)**, **Tier 2 (Mid)**, and **Tier 3 (Senior)**
   - Loading indicator during server calculation
   - Interactive Summary Cards displaying average salary (centroid) and employee count per tier

---

## 2. Test User Accounts for Examiner (6 Accounts >= 5 Required)

| Role | Username | Password | Full Name | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password123` | System Administrator | Full access: CRUD, Status Toggle, Delete, K-Means Analytics |
| **Admin** | `admin2` | `admin123` | Deputy Administrator | Full administrative access |
| **HR Manager** | `hr_user` | `hr123` | HR Manager | View Salaries, Status Toggle, K-Means Analytics (Delete restricted) |
| **HR Specialist** | `hr_specialist` | `hr123` | HR Specialist | View Salaries, Status Toggle, K-Means Analytics |
| **Staff** | `staff` | `staff123` | General Staff | View Attendance status only (Salaries masked, Actions restricted) |
| **Staff** | `staff_viewer` | `staff123` | Junior Staff | View Attendance status only (Salaries masked, Actions restricted) |

---

## 3. How to Run the Project

### Start Backend (Express.js)
```bash
cd backend
npm install
npm start
```
* Backend runs on: `http://localhost:5000`
* Storage mode: In-Memory Array (with automated MySQL fallback support via `.env`)

### Start Frontend (React Native / Expo)
```bash
cd frontend
npm install
npm run web
# Or run with Expo for mobile:
# npx expo start
```
* Web application available at: `http://localhost:8081`

---

## 4. API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticate user (`admin`, `hr_user`, `staff`, etc.) |
| `GET` | `/api/employees` | Retrieve all employee records |
| `POST` | `/api/employees` | Add a new employee (`name`, `position`, `salary`) |
| `PUT` | `/api/employees/:id/status` | Toggle employee status (`Active` ⟷ `On Leave`) |
| `DELETE` | `/api/employees/:id` | Remove an employee record |
| `GET` | `/api/employees/salary-clusters`| 1D K-Means clustering ($k=3$) on employee salaries |

---

## 5. Verification & Testing
An automated test script is included in the backend:
```bash
cd backend
node test-api.js
```
Expected output: **11 PASSED, 0 FAILED**
