const mongoose = require("mongoose");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveType = require("../models/LeaveType");
const User = require("../models/User");

const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference =
    end.getTime() - start.getTime();

  return (
    Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ) + 1
  );
};

const applyLeave = async (req, res, next) => {
  try {
    const employeeId = req.user.userId;

    const {
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (
      !leaveType ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Leave type, start date, end date and reason are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter valid start and end dates",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message:
          "Start date cannot be after end date",
      });
    }

    const selectedLeaveType =
      await LeaveType.findOne({
        _id: leaveType,
        status: "Active",
      });

    if (!selectedLeaveType) {
      return res.status(400).json({
        success: false,
        message:
          "Selected leave type is not available",
      });
    }

    const days = calculateLeaveDays(
      start,
      end
    );

    const overlappingLeave =
      await LeaveRequest.findOne({
        employee: employeeId,
        status: {
          $in: ["Pending", "Approved"],
        },
        startDate: {
          $lte: end,
        },
        endDate: {
          $gte: start,
        },
      });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a leave request for these dates",
      });
    }

    if (selectedLeaveType.name !== "Unpaid") {
      const currentYear = start.getFullYear();

      const yearStart = new Date(
        currentYear,
        0,
        1
      );

      const yearEnd = new Date(
        currentYear,
        11,
        31,
        23,
        59,
        59,
        999
      );

      const approvedLeave =
        await LeaveRequest.aggregate([
          {
            $match: {
              employee: req.user.userId,
              leaveType:
                selectedLeaveType._id,
              status: "Approved",
              startDate: {
                $gte: yearStart,
                $lte: yearEnd,
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
        approvedLeave.length > 0
          ? approvedLeave[0].totalDays
          : 0;

      if (
        usedDays + days >
        selectedLeaveType.yearlyLimit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Leave balance limit exceeded",
        });
      }
    }

    const leaveRequest =
      await LeaveRequest.create({
        employee: employeeId,
        leaveType: selectedLeaveType._id,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: "Pending",
      });

    res.status(201).json({
      success: true,
      message:
        "Leave request submitted successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getMyLeaves = async (
  req,
  res,
  next
) => {
  try {
    const employeeId = req.user.userId;

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const skip = (page - 1) * limit;

    const filter = {
      employee: employeeId,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    /*
      Leave type filter:
      - Accepts MongoDB ObjectId
      - Also accepts leave type name such as Casual, Sick, Earned, Unpaid
      - Converts leave type name into its ObjectId
    */
    if (req.query.leaveType) {
      let leaveType;

      if (
        mongoose.Types.ObjectId.isValid(
          req.query.leaveType
        )
      ) {
        leaveType =
          await LeaveType.findOne({
            _id: req.query.leaveType,
            status: "Active",
          });
      } else {
        leaveType =
          await LeaveType.findOne({
            name: req.query.leaveType,
            status: "Active",
          });
      }

      if (!leaveType) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave type",
        });
      }

      filter.leaveType = leaveType._id;
    }

    if (
      req.query.startDate ||
      req.query.endDate
    ) {
      filter.startDate = {};

      if (req.query.startDate) {
        filter.startDate.$gte =
          new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(
          req.query.endDate
        );

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        filter.startDate.$lte = endDate;
      }
    }

    const [
      leaves,
      totalRecords,
    ] = await Promise.all([
      LeaveRequest.find(filter)
        .populate(
          "leaveType",
          "name yearlyLimit"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      LeaveRequest.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(
      totalRecords / limit
    );

    res.status(200).json({
      success: true,
      message:
        "Leave requests fetched successfully",
      data: leaves,
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

const getTeamLeaves = async (
  req,
  res,
  next
) => {
  try {
    const teamMembers = await User.find({
      manager: req.user.userId,
      status: "Active",
    }).select("_id");

    const employeeIds =
      teamMembers.map(
        (employee) => employee._id
      );

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const skip = (page - 1) * limit;

    const filter = {
      employee: {
        $in: employeeIds,
      },
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.leaveType) {
      let leaveType;

      if (
        mongoose.Types.ObjectId.isValid(
          req.query.leaveType
        )
      ) {
        leaveType =
          await LeaveType.findOne({
            _id: req.query.leaveType,
            status: "Active",
          });
      } else {
        leaveType =
          await LeaveType.findOne({
            name: req.query.leaveType,
            status: "Active",
          });
      }

      if (!leaveType) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave type",
        });
      }

      filter.leaveType = leaveType._id;
    }

    if (req.query.employee) {
      const employeeExists =
        employeeIds.some(
          (id) =>
            id.toString() ===
            req.query.employee
        );

      if (!employeeExists) {
        return res.status(403).json({
          success: false,
          message:
            "Employee is not accessible",
        });
      }

      filter.employee =
        req.query.employee;
    }

    if (
      req.query.startDate ||
      req.query.endDate
    ) {
      filter.startDate = {};

      if (req.query.startDate) {
        filter.startDate.$gte =
          new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(
          req.query.endDate
        );

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        filter.startDate.$lte = endDate;
      }
    }

    const [
      leaves,
      totalRecords,
    ] = await Promise.all([
      LeaveRequest.find(filter)
        .populate(
          "employee",
          "name email designation department"
        )
        .populate(
          "leaveType",
          "name yearlyLimit"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      LeaveRequest.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(
      totalRecords / limit
    );

    res.status(200).json({
      success: true,
      message:
        "Team leave requests fetched successfully",
      data: leaves,
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

const getAllLeaves = async (
  req,
  res,
  next
) => {
  try {
    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.leaveType) {
      let leaveType;

      if (
        mongoose.Types.ObjectId.isValid(
          req.query.leaveType
        )
      ) {
        leaveType =
          await LeaveType.findOne({
            _id: req.query.leaveType,
            status: "Active",
          });
      } else {
        leaveType =
          await LeaveType.findOne({
            name: req.query.leaveType,
            status: "Active",
          });
      }

      if (!leaveType) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave type",
        });
      }

      filter.leaveType = leaveType._id;
    }

    if (req.query.employee) {
      filter.employee =
        req.query.employee;
    }

    if (
      req.query.startDate ||
      req.query.endDate
    ) {
      filter.startDate = {};

      if (req.query.startDate) {
        filter.startDate.$gte =
          new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(
          req.query.endDate
        );

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        filter.startDate.$lte = endDate;
      }
    }

    const [
      leaves,
      totalRecords,
    ] = await Promise.all([
      LeaveRequest.find(filter)
        .populate(
          "employee",
          "name email designation department"
        )
        .populate(
          "leaveType",
          "name yearlyLimit"
        )
        .populate(
          "approvedBy",
          "name email role"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      LeaveRequest.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(
      totalRecords / limit
    );

    res.status(200).json({
      success: true,
      message:
        "All leave requests fetched successfully",
      data: leaves,
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

const getLeaveById = async (
  req,
  res,
  next
) => {
  try {
    const leaveRequest =
      await LeaveRequest.findById(
        req.params.id
      )
        .populate(
          "employee",
          "name email phone designation department role joiningDate"
        )
        .populate(
          "leaveType",
          "name yearlyLimit"
        )
        .populate(
          "approvedBy",
          "name email role"
        );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Leave request not found",
      });
    }

    if (req.user.role === "Employee") {
      if (
        leaveRequest.employee._id.toString() !==
        req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this leave",
        });
      }
    }

    if (req.user.role === "Manager") {
      const employeeManager =
        await User.findById(
          leaveRequest.employee._id
        ).select("manager");

      if (
        !employeeManager ||
        !employeeManager.manager ||
        employeeManager.manager.toString() !==
          req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this leave",
        });
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Leave request fetched successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeave = async (
  req,
  res,
  next
) => {
  try {
    const employeeId = req.user.userId;

    const {
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (
      !leaveType ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Leave type, start date, end date and reason are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter valid start and end dates",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message:
          "Start date cannot be after end date",
      });
    }

    const leaveRequest =
      await LeaveRequest.findOne({
        _id: req.params.id,
        employee: employeeId,
      });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Leave request not found",
      });
    }

    if (
      leaveRequest.status !== "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending leave requests can be edited",
      });
    }

    const selectedLeaveType =
      await LeaveType.findOne({
        _id: leaveType,
        status: "Active",
      });

    if (!selectedLeaveType) {
      return res.status(400).json({
        success: false,
        message:
          "Selected leave type is not available",
      });
    }

    const days = calculateLeaveDays(
      start,
      end
    );

    const overlappingLeave =
      await LeaveRequest.findOne({
        _id: {
          $ne: req.params.id,
        },
        employee: employeeId,
        status: {
          $in: ["Pending", "Approved"],
        },
        startDate: {
          $lte: end,
        },
        endDate: {
          $gte: start,
        },
      });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a leave request for these dates",
      });
    }

    if (
      selectedLeaveType.name !==
      "Unpaid"
    ) {
      const currentYear =
        start.getFullYear();

      const yearStart = new Date(
        currentYear,
        0,
        1
      );

      const yearEnd = new Date(
        currentYear,
        11,
        31,
        23,
        59,
        59,
        999
      );

      const approvedLeave =
        await LeaveRequest.aggregate([
          {
            $match: {
              employee: employeeId,
              leaveType:
                selectedLeaveType._id,
              status: "Approved",
              startDate: {
                $gte: yearStart,
                $lte: yearEnd,
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
        approvedLeave.length > 0
          ? approvedLeave[0].totalDays
          : 0;

      if (
        usedDays + days >
        selectedLeaveType.yearlyLimit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Leave balance limit exceeded",
        });
      }
    }

    leaveRequest.leaveType =
      selectedLeaveType._id;

    leaveRequest.startDate = start;
    leaveRequest.endDate = end;
    leaveRequest.days = days;
    leaveRequest.reason = reason;

    await leaveRequest.save();

    res.status(200).json({
      success: true,
      message:
        "Leave request updated successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      rejectionReason,
    } = req.body;

    if (
      !["Approved", "Rejected"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Approved or Rejected",
      });
    }

    if (
      status === "Rejected" &&
      !rejectionReason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rejection reason is required",
      });
    }

    const leaveRequest =
      await LeaveRequest.findById(
        req.params.id
      ).populate(
        "employee",
        "name email manager"
      );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Leave request not found",
      });
    }

    if (
      leaveRequest.status !== "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending leave requests can be updated",
      });
    }

    if (req.user.role === "Manager") {
      if (
        !leaveRequest.employee.manager ||
        leaveRequest.employee.manager.toString() !==
          req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this leave",
        });
      }
    }

    leaveRequest.status = status;

    leaveRequest.approvedBy =
      req.user.userId;

    leaveRequest.approvedAt =
      new Date();

    if (status === "Rejected") {
      leaveRequest.rejectionReason =
        rejectionReason;
    } else {
      leaveRequest.rejectionReason =
        undefined;
    }

    await leaveRequest.save();

    res.status(200).json({
      success: true,
      message:
        `Leave request ${status.toLowerCase()} successfully`,
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const cancelLeave = async (
  req,
  res,
  next
) => {
  try {
    const employeeId = req.user.userId;

    const leaveRequest =
      await LeaveRequest.findOne({
        _id: req.params.id,
        employee: employeeId,
      });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Leave request not found",
      });
    }

    if (
      !["Pending", "Approved"].includes(
        leaveRequest.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending or approved leave can be cancelled",
      });
    }

    leaveRequest.status =
      "Cancelled";

    await leaveRequest.save();

    res.status(200).json({
      success: true,
      message:
        "Leave request cancelled successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  updateLeaveStatus,
  cancelLeave,
};