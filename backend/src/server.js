const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveTypeRoutes = require("./routes/leaveTypeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

const errorHandler = require("./middleware/errorHandler");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave-types", leaveTypeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/departments", departmentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HR Management System API is running",
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});