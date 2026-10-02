const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
} = require("../controllers/employeeController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  createEmployee
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  getEmployees
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  getEmployeeById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  updateEmployee
);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware("Admin"),
  deactivateEmployee
);

module.exports = router;

// ya file madhe aapan role assign kely mahnje rolemiddleware(admin) mahnje employee chi info fakt admin view update delete put pacth kru shakto