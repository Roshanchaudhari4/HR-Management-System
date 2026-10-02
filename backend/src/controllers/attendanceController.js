const Attendance = require("../models/Attendance");
const User = require("../models/User");

const getTodayDate = () => {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
};

const calculateWorkingHours = (checkIn, checkOut) => {
  const differenceInMilliseconds =
    new Date(checkOut).getTime() - new Date(checkIn).getTime();

  return Number(
    (differenceInMilliseconds / (1000 * 60 * 60)).toFixed(2)
  );
};

const calculateAttendanceStatus = (checkInTime) => {
  const checkIn = new Date(checkInTime);

  const lateTime = new Date(checkIn);
  lateTime.setHours(9, 30, 0, 0);

  if (checkIn <= lateTime) {
    return "Present";
  }

  return "Late";
};

const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user.userId;
    const today = getTodayDate();

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "You have already checked in today",
      });
    }

    const checkInTime = new Date();

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      checkIn: checkInTime,
      status: calculateAttendanceStatus(checkInTime),
    });

    res.status(201).json({
      success: true,
      message: "Check-in successful",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user.userId;
    const today = getTodayDate();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "Please check in before checking out",
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Please check in before checking out",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today",
      });
    }

    const checkOutTime = new Date();

    attendance.checkOut = checkOutTime;
    attendance.workingHours = calculateWorkingHours(
      attendance.checkIn,
      checkOutTime
    );

    if (attendance.workingHours < 4) {
      attendance.status = "Half Day";
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check-out successful",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceHistory = async (req, res, next) => {
  try {
    const employeeId = req.user.userId;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = {
      employee: employeeId,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};

      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    const [attendance, totalRecords] = await Promise.all([
      Attendance.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),

      Attendance.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      success: true,
      message: "Attendance history fetched successfully",
      data: attendance,
      pagination: {
        currentPage: page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTeamAttendance = async (req, res, next) => {
  try {
    let employeeIds = [];

    if (req.user.role === "Manager") {
      const teamMembers = await User.find({
        manager: req.user.userId,
        status: "Active",
      }).select("_id");

      employeeIds = teamMembers.map((employee) => employee._id);
    }

    if (req.user.role === "Admin") {
      const allEmployees = await User.find({
        status: "Active",
      }).select("_id");

      employeeIds = allEmployees.map((employee) => employee._id);
    }

    const filter = {
      employee: { $in: employeeIds },
    };

    if (req.query.employee) {
      const employeeExists = employeeIds.some(
        (id) => id.toString() === req.query.employee
      );

      if (!employeeExists) {
        return res.status(403).json({
          success: false,
          message: "Employee is not accessible",
        });
      }

      filter.employee = req.query.employee;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};

      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [attendance, totalRecords] = await Promise.all([
      Attendance.find(filter)
        .populate(
          "employee",
          "name email designation department"
        )
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),

      Attendance.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      success: true,
      message: "Attendance records fetched successfully",
      data: attendance,
      pagination: {
        currentPage: page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTeamAttendance,
};


// Logged-in employee चा ID req.user.userId मधून घेतला.
// आजची attendance शोधली.
// आधीच check-in असेल तर duplicate check-in रोखला.
// Check-in करताना current time save केला.
// Check-out करण्यापूर्वी check-in आहे का ते check केले.
// आधीच checkout केले असेल तर पुन्हा checkout रोखला.
// Check-in आणि Check-out मधून working hours automatically calculate केले.
// Attendance status सुरुवातीला Present ठेवला.