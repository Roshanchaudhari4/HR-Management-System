const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  updateLeaveStatus,
  cancelLeave,
} = require("../controllers/leaveController");

const router = express.Router();

// Employee / Manager - Apply Leave
router.post(
  "/",
  authMiddleware,
  roleMiddleware("Employee", "Manager"),
  applyLeave
);

// Employee / Manager - My Leaves
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("Employee", "Manager"),
  getMyLeaves
);

// Manager - Team Leaves
router.get(
  "/team",
  authMiddleware,
  roleMiddleware("Manager"),
  getTeamLeaves
);

// Admin - All Leaves
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  getAllLeaves
);

// Employee / Manager / Admin - View Specific Leave
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("Employee", "Manager", "Admin"),
  getLeaveById
);

// Employee - Update Own Pending Leave
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Employee"),
  updateLeave
);

// Manager / Admin - Approve or Reject Leave
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("Manager", "Admin"),
  updateLeaveStatus
);

// Employee / Manager - Cancel Own Leave
router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("Employee", "Manager"),
  cancelLeave
);

module.exports = router;