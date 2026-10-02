const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deactivateDepartment,
} = require("../controllers/departmentController");

const router = express.Router();

// Admin - Create Department
router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createDepartment
);

// Admin - Get Departments
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  getDepartments
);

// Admin - Update Department
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updateDepartment
);

// Admin - Deactivate Department
router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware("Admin"),
  deactivateDepartment
);

module.exports = router;