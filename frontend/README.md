# HR Management System

A full-stack Human Resource Management System built using the MERN stack. The system provides role-based access for Admin, Manager, and Employee users and manages employees, attendance, leave requests, and dashboards.

---

## 📌 Project Overview

The HR Management System is designed to simplify and manage common HR activities through a centralized web application.

The system provides different access levels based on user roles:

- Admin
- Manager
- Employee

Each role has access only to the modules and data relevant to their responsibilities.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- User login using email and password
- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Protected API routes
- Active/Inactive user validation
- Secure password storage
- Token-based API authorization

---

## 👥 User Roles

### Admin

Admin has complete access to the HR system.

Admin can:

- View dashboard
- Manage employees
- Add employees
- Edit employee details
- View employee details
- Assign department
- Assign manager
- Assign role
- Deactivate employees
- View all attendance records
- Filter attendance records
- Manage leave requests
- Approve leave requests
- Reject leave requests
- Manage leave types
- Manage departments

### Manager

Manager can manage assigned team members.

Manager can:

- View manager dashboard
- View assigned team members
- View team attendance
- Filter team attendance
- View team leave requests
- Approve team leave requests
- Reject team leave requests
- View team attendance statistics

### Employee

Employee can manage their own attendance and leave requests.

Employee can:

- View employee dashboard
- Check in
- Check out
- View attendance history
- Filter attendance history
- Apply for leave
- View own leave requests
- Filter leave requests
- Cancel pending/approved leave requests
- View leave status

---

# 🏗️ Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- Bootstrap
- JavaScript

## Backend

- Node.js
- Express.js
- REST API
- JWT
- bcryptjs

## Database

- MongoDB
- Mongoose

---

# 📂 Project Structure

```text
HR-Management-System/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── employeeController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── leaveController.js
│   │   │   ├── leaveTypeController.js
│   │   │   ├── dashboardController.js
│   │   │   └── departmentController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Attendance.js
│   │   │   ├── LeaveRequest.js
│   │   │   ├── LeaveType.js
│   │   │   ├── Department.js
│   │   │   └── Notification.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── employeeRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── leaveRoutes.js
│   │   │   ├── leaveTypeRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   └── departmentRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── layouts/
    │   │   ├── MainLayout.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── TopNavbar.jsx
    │   │   └── layout.css
    │   │
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Attendance.jsx
    │   │   ├── LeaveManagement.jsx
    │   │   ├── ManagerDashboard.jsx
    │   │   ├── ManagerTeam.jsx
    │   │   ├── ManagerAttendance.jsx
    │   │   ├── ManagerLeaveRequests.jsx
    │   │   ├── EmployeeDashboard.jsx
    │   │   ├── MyAttendance.jsx
    │   │   └── MyLeaves.jsx
    │   │
    │   ├── services/
    │   │   └── api.js
    │   │
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    │
    ├── package.json
    └── vite.config.js