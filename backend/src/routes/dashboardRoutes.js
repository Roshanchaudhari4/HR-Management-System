const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getDashboard,
  getEmployeeDashboard,
  getManagerDashboard,
  getAdminDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getDashboard
);

router.get(
  "/employee",
  authMiddleware,
  getEmployeeDashboard
);

router.get(
  "/manager",
  authMiddleware,
  getManagerDashboard
);

router.get(
  "/admin",
  authMiddleware,
  getAdminDashboard
);

module.exports = router;