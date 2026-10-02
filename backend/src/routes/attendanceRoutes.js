const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTeamAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.post(
  "/check-in",
  authMiddleware,
  roleMiddleware("Employee", "Manager"),
  checkIn
);

router.post(
  "/check-out",
  authMiddleware,
  roleMiddleware("Employee", "Manager"),
  checkOut
);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware("Employee", "Manager"),
  getAttendanceHistory
);

router.get(
  "/team",
  authMiddleware,
  roleMiddleware("Manager", "Admin"),
  getTeamAttendance
);

module.exports = router;


// employee kiva manager swatachi  attendance check kru shakto tyanatar ya madhe authmiddlware pan ahe jwt valid ahe te check krto
