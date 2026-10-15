# HR Manager & Salary Analytics System

**Internet Programming Final Examination 2026**  
- **Student ID:** 6730202556  
- **Repository:** Std0202556IPFinal2026  
- **Database Name:** ip_std6730202556  
- **Tables:** `ArMuean_Employees`, `ArMuean_User`

---

## 1. System Overview

A full-stack Human Resource Management and Salary Analytics application built with **Node.js/Express (Backend)**, **MySQL Database**, and **React Native / Expo (Frontend Web/Mobile)**.

### Key Capabilities
- **Phase 1: Authentication & Role-Based Access Control (RBAC):**
  - Roles: `admin`, `hr`, `staff`
  - JWT token response simulation on login
  - Clean error feedback (401 Unauthorized / 400 Bad Request)
- **Phase 1: Employee Management (CRUD):**
  - View all employees with status indicators (Active / On Leave)
  - Real-time live search filter (by employee name or position)
  - Add new employee with form validation (preventing empty submissions)
  - Edit employee details (name, position, salary)
  - Toggle employee status (`Active` <-> `On Leave`)
  - Delete employee with confirmation dialog alert
- **Phase 2: 1D K-Means Salary Clustering (k = 3):**
  - Algorithmic salary clustering without external machine learning library dependencies
  - Groups salaries into 3 tiers:
    - **Cluster 0:** Tier 1 (Entry / Base Level)
    - **Cluster 1:** Tier 2 (Mid-Career Level)
    - **Cluster 2:** Tier 3 (Senior / Leadership)
  - Loading state indicator during cluster analysis
  - **Multiple Visualizations:**
    1. **2D Scatter Plot:** Exact coordinate distribution graph (X: Salary THB, Y: Stock / Staff Index, vertical boundary partition lines, cluster color dots, and legend)
    2. **Visual Bars:** Proportion bar and centroid comparison chart
    3. **Summary Cards:** Clean overview cards per tier

---

## 2. Project Architecture

```
Std0202556IPFinal2026/
├── schema.sql                      # Database creation and seed data script
├── .gitignore                      # Git ignore rules (protects .env credentials)
├── README.md                       # Project documentation
│
├── backend/                        # Node.js & Express RESTful API
│   ├── .env.example                # Environment variables template
│   ├── package.json                # Backend dependencies (express, cors, mysql2, dotenv)
│   ├── server.js                   # Main application entry point & standalone server
│   ├── config/
│   │   └── db.js                   # MySQL connection pool with In-Memory fallback
│   ├── controllers/
│   │   ├── authController.js       # Login & authentication logic
│   │   ├── employeeController.js   # Employee CRUD operations
│   │   └── analyticsController.js  # K-Means clustering endpoint handler
│   ├── routes/
│   │   └── apiRoutes.js            # Express router mappings under /api prefix
│   ├── data/
│   │   └── mockEmployees.js        # Seed employee records (fallback data)
│   └── utils/
│       └── kmeans.js               # 1D K-Means clustering algorithm implementation
│
└── frontend/                       # React Native / Expo Frontend Application
    ├── package.json                # Frontend dependencies (@expo/vector-icons, etc.)
    ├── App.js                      # Root application component with AuthProvider
    ├── app.json                    # Expo configuration
    └── src/
        ├── context/
        │   └── AuthContext.js      # Global authentication state management
        ├── screens/
        │   ├── LoginScreen.js      # Production login screen
        │   └── DashboardScreen.js  # Full employee dashboard with search & stats
        ├── components/
        │   ├── Header.js           # Top navigation bar with user profile & logout
        │   ├── EmployeeCard.js     # Employee item card with Action buttons
        │   ├── AddEmployeeModal.js # Compact modal to add employee
        │   ├── EditEmployeeModal.js# Compact modal to edit employee
        │   └── SalaryClusterSection.js # K-Means Scatter Plot, Bar Chart, & Cards
        ├── services/
        │   └── api.js              # Centralized API service client
        └── theme/
            └── colors.js           # Curated UI color palette (no emojis)
```

---

## 3. Database Setup (`schema.sql`)

Import the provided `schema.sql` into MySQL:

```bash
mysql -u std6730202556 -p ip_std6730202556 < schema.sql
```

The script creates:
1. `ArMuean_Employees`: 6 initial employee records
2. `ArMuean_User`: 6 initial user accounts

---

## 4. Test User Accounts

| Username | Password | Role | Description |
| :--- | :--- | :---: | :--- |
| `admin` | `password123` | **admin** | System Administrator (Full Access) |
| `admin2` | `admin123` | **admin** | Deputy Administrator |
| `hr_user` | `hr123` | **hr** | HR Manager (CRUD + Analytics) |
| `hr_specialist` | `hr123` | **hr** | HR Specialist |
| `staff` | `staff123` | **staff** | General Staff (Read-Only) |
| `staff_viewer` | `staff123` | **staff** | Junior Staff (Read-Only) |

---

## 5. API Endpoints

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/api/login` | Authenticate user credentials & receive token |
| `GET` | `/api/employees` | Retrieve all employees list |
| `POST` | `/api/employees` | Create new employee (validates empty fields) |
| `PUT` | `/api/employees/:id` | Update employee information |
| `PUT` | `/api/employees/:id/status` | Toggle employee status (`Active` / `On Leave`) |
| `DELETE` | `/api/employees/:id` | Delete employee record |
| `GET` | `/api/employees/salary-clusters` | Compute 1D K-Means salary clusters ($k=3$) |

---

## 6. How to Run Locally

### Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Server starts on http://localhost:5000 (or PORT specified in .env)
```

### Frontend:
```bash
cd frontend
npm install
npm start
# Press 'w' in terminal to open in web browser at http://localhost:8081
```
