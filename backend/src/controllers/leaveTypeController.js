const LeaveType = require("../models/LeaveType");

const createLeaveType = async (req, res, next) => {
  try {
    const { name, yearlyLimit, status } = req.body;

    if (!name || yearlyLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: "Leave type name and yearly limit are required",
      });
    }

    const existingLeaveType = await LeaveType.findOne({ name });

    if (existingLeaveType) {
      return res.status(400).json({
        success: false,
        message: "Leave type already exists",
      });
    }

    const leaveType = await LeaveType.create({
      name,
      yearlyLimit,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      data: leaveType,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Leave types fetched successfully",
      data: leaveTypes,
    });
  } catch (error) {
    next(error);
  }
};

const getActiveLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find({
      status: "Active",
    }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      message: "Active leave types fetched successfully",
      data: leaveTypes,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeaveType = async (req, res, next) => {
  try {
    const { name, yearlyLimit, status } = req.body;

    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    if (name && name !== leaveType.name) {
      const existingLeaveType = await LeaveType.findOne({
        name,
        _id: { $ne: req.params.id },
      });

      if (existingLeaveType) {
        return res.status(400).json({
          success: false,
          message: "Leave type already exists",
        });
      }
    }

    leaveType.name = name ?? leaveType.name;
    leaveType.yearlyLimit =
      yearlyLimit ?? leaveType.yearlyLimit;
    leaveType.status = status ?? leaveType.status;

    await leaveType.save();

    res.status(200).json({
      success: true,
      message: "Leave type updated successfully",
      data: leaveType,
    });
  } catch (error) {
    next(error);
  }
};

const deactivateLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    leaveType.status = "Inactive";

    await leaveType.save();

    res.status(200).json({
      success: true,
      message: "Leave type deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveType,
  getLeaveTypes,
  getActiveLeaveTypes,
  updateLeaveType,
  deactivateLeaveType,
};

// ya madhe leave type save update delete