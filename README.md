# HR Manager & Salary Analytics System
### Final Exam: Internet Programming (2026)
**Student ID:** 6730202556  
**Repository Name:** Std6730202556IPFinal2026  

---

## 📌 Project Overview
Full-stack application consisting of an **Express.js Backend** and a **React Native (Expo) Frontend** designed with modern UI/UX principles.

### Key Features
1. **Authentication (Phase 1):**
   - Admin Login with credentials: `admin` / `password123`
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

## 🚀 How to Run the Project

### 1. Start Backend (Express.js)
```bash
cd backend
npm install
npm start
```
* Backend runs on: `http://localhost:5000`
* Storage mode: In-Memory Array (with automated MySQL fallback support via `.env`)

### 2. Start Frontend (React Native / Expo)
```bash
cd frontend
npm install
npm run web
# หรือรันผ่าน Metro สำหรับ Mobile / Expo Go:
# npx expo start
```
* Web application available at: `http://localhost:8081`

---

## 📡 API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticate admin user (`admin` / `password123`) |
| `GET` | `/api/employees` | Retrieve all employee records |
| `POST` | `/api/employees` | Add a new employee (`name`, `position`, `salary`) |
| `PUT` | `/api/employees/:id/status` | Toggle employee status (`Active` ⟷ `On Leave`) |
| `DELETE` | `/api/employees/:id` | Remove an employee record |
| `GET` | `/api/employees/salary-clusters`| 1D K-Means clustering ($k=3$) on employee salaries |

---

## 🧪 Verification & Testing
An automated test script is included in the backend:
```bash
cd backend
node test-api.js
```
Expected output: **9 PASSED, 0 FAILED**
