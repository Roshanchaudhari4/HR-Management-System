const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createLeaveType,
  getLeaveTypes,
  getActiveLeaveTypes,
  updateLeaveType,
  deactivateLeaveType,
} = require("../controllers/leaveTypeController");

const router = express.Router();

// Admin - Create Leave Type
router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createLeaveType
);

// Employee / Manager - Get Active Leave Types
router.get(
  "/active",
  authMiddleware,
  roleMiddleware("Employee", "Manager"),
  getActiveLeaveTypes
);

// Admin - Get All Leave Types
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  getLeaveTypes
);

// Admin - Update Leave Type
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updateLeaveType
);

// Admin - Deactivate Leave Type
router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware("Admin"),
  deactivateLeaveType
);

module.exports = router;

// fakr admin la access delay leave type genrate krayche update krayche deactive krayche 