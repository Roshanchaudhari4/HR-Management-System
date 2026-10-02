const User = require("../models/User");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveType = require("../models/LeaveType");

const getDateRange = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return { startDate, endDate };
};

const getEmployeeDashboard = async (req, res, next) => {
  try {
    const employeeId = req.user.userId;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const { startDate, endDate } = getDateRange(year, month);

    const todayStart = new Date(
      year,
      month,
      now.getDate()
    );

    const todayEnd = new Date(
      year,
      month,
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const [todayAttendance, monthlyAttendance, leaveRequests] =
      await Promise.all([
        Attendance.findOne({
          employee: employeeId,
          date: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        }),

        Attendance.find({
          employee: employeeId,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        }).sort({ date: -1 }),

        LeaveRequest.find({
          employee: employeeId,
        })
          .populate("leaveType", "name yearlyLimit")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    const presentDays = monthlyAttendance.filter(
      (attendance) =>
        attendance.status === "Present" ||
        attendance.status === "Late"
    ).length;

    const totalWorkingDays = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const attendancePercentage =
      totalWorkingDays > 0
        ? Number(
            (
              (presentDays / totalWorkingDays) *
              100
            ).toFixed(2)
          )
        : 0;

    const leaveTypes = await LeaveType.find({
      status: "Active",
    });

    const leaveBalance = [];

    for (const leaveType of leaveTypes) {
      if (leaveType.name === "Unpaid") {
        leaveBalance.push({
          leaveType: leaveType.name,
          yearlyLimit: leaveType.yearlyLimit,
          usedDays: 0,
          remainingDays: null,
        });

        continue;
      }

      const approvedLeaves =
        await LeaveRequest.aggregate([
          {
            $match: {
              employee: req.user.userId,
              leaveType: leaveType._id,
              status: "Approved",
              startDate: {
                $gte: new Date(year, 0, 1),
                $lte: new Date(
                  year,
                  11,
                  31,
                  23,
                  59,
                  59,
                  999
                ),
              },
            },
          },
          {
            $group: {
              _id: null,
              totalDays: {
                $sum: "$days",
              },
            },
          },
        ]);

      const usedDays =
        approvedLeaves.length > 0
          ? approvedLeaves[0].totalDays
          : 0;

      leaveBalance.push({
        leaveType: leaveType.name,
        yearlyLimit: leaveType.yearlyLimit,
        usedDays,
        remainingDays:
          leaveType.yearlyLimit - usedDays,
      });
    }

    const pendingLeaves = leaveRequests.filter(
      (leave) => leave.status === "Pending"
    );

    res.status(200).json({
      success: true,
      message: "Employee dashboard data fetched successfully",
      data: {
        todayAttendance,
        attendanceSummary: {
          monthlyAttendancePercentage: attendancePercentage,
          presentDays,
          totalWorkingDays,
        },
        leaveBalance,
        pendingLeaves,
        recentLeaves: leaveRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getManagerDashboard = async (req, res, next) => {
  try {
    const managerId = req.user.userId;

    const teamMembers = await User.find({
      manager: managerId,
      status: "Active",
    }).select("_id name email designation");

    const employeeIds = teamMembers.map(
      (employee) => employee._id
    );

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const { startDate, endDate } = getDateRange(year, month);

    const [attendance, leaves] = await Promise.all([
      Attendance.find({
        employee: {
          $in: employeeIds,
        },
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate(
          "employee",
          "name email designation"
        )
        .sort({ date: -1 }),

      LeaveRequest.find({
        employee: {
          $in: employeeIds,
        },
      })
        .populate(
          "employee",
          "name email designation"
        )
        .populate(
          "leaveType",
          "name"
        )
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    const todayStart = new Date(
      year,
      month,
      now.getDate()
    );

    const todayEnd = new Date(
      year,
      month,
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const todayAttendance = attendance.filter(
      (record) =>
        record.date >= todayStart &&
        record.date <= todayEnd
    );

    const pendingLeaves = leaves.filter(
      (leave) => leave.status === "Pending"
    );

    const presentToday = todayAttendance.filter(
      (record) =>
        record.status === "Present" ||
        record.status === "Late"
    ).length;

    const lateToday = todayAttendance.filter(
      (record) => record.status === "Late"
    ).length;

    const halfDayToday = todayAttendance.filter(
      (record) => record.status === "Half Day"
    ).length;

    res.status(200).json({
      success: true,
      message: "Manager dashboard data fetched successfully",
      data: {
        teamSummary: {
          totalTeamMembers: teamMembers.length,
          presentToday,
          lateToday,
          halfDayToday,
          absentToday:
            teamMembers.length - todayAttendance.length,
        },
        teamMembers,
        todayAttendance,
        pendingLeaves,
        recentLeaves: leaves,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const { startDate, endDate } = getDateRange(year, month);

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalAttendance,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      leaveDistribution,
      attendanceStatus,
      departmentEmployees,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        status: "Active",
      }),

      User.countDocuments({
        status: "Inactive",
      }),

      Attendance.countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }),

      LeaveRequest.countDocuments(),

      LeaveRequest.countDocuments({
        status: "Pending",
      }),

      LeaveRequest.countDocuments({
        status: "Approved",
      }),

      LeaveRequest.countDocuments({
        status: "Rejected",
      }),

      LeaveRequest.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$leaveType",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: "leavetypes",
            localField: "_id",
            foreignField: "_id",
            as: "leaveType",
          },
        },
        {
          $unwind: {
            path: "$leaveType",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            leaveType: "$leaveType.name",
            count: 1,
          },
        },
      ]),

      Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
      ]),

      User.aggregate([
        {
          $match: {
            status: "Active",
          },
        },
        {
          $group: {
            _id: "$department",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "department",
          },
        },
        {
          $unwind: {
            path: "$department",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            department: {
              $ifNull: [
                "$department.name",
                "Unassigned",
              ],
            },
            count: 1,
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: {
        employeeSummary: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
        },

        leaveSummary: {
          totalLeaves,
          pendingLeaves,
          approvedLeaves,
          rejectedLeaves,
        },

        attendanceSummary: {
          totalAttendance,
        },

        charts: {
          leaveDistribution,
          attendanceStatus,
          departmentEmployees,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    if (req.user.role === "Employee") {
      return getEmployeeDashboard(req, res, next);
    }

    if (req.user.role === "Manager") {
      return getManagerDashboard(req, res, next);
    }

    if (req.user.role === "Admin") {
      return getAdminDashboard(req, res, next);
    }

    return res.status(403).json({
      success: false,
      message: "Invalid user role",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getEmployeeDashboard,
  getManagerDashboard,
  getAdminDashboard,
};

// Employee dashboard: आजची attendance, monthly attendance %, leave balance, pending/recent leaves.
// Manager dashboard: team members, आजची Present/Late/Half Day/Absent संख्या, pending/recent leaves.
// Admin dashboard: employees, attendance आणि leave summary + charts साठी data.
// getDashboard() user च्या role नुसार योग्य dashboard data return करतो.