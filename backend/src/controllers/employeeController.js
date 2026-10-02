const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      department,
      designation,
      role,
      manager,
      joiningDate,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      department,
      designation,
      role: role || "Employee",
      manager,
      joiningDate,
      status: "Active",
    });

    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employeeData,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const {
      search,
      department,
      role,
      status,
    } = req.query;

    const filter = {};

    if (search && search.trim()) {
      const searchValue = search.trim();

      filter.$or = [
        { name: { $regex: searchValue, $options: "i" } },
        { email: { $regex: searchValue, $options: "i" } },
      ];
    }

    if (department) {
      filter.department = department;
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    const employees = await User.find(filter)
      .select("-password")
      .populate("department", "name")
      .populate("manager", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id)
      .select("-password")
      .populate("department", "name")
      .populate("manager", "name email");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      designation,
      role,
      manager,
      joiningDate,
      status,
    } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (email && email !== employee.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    employee.name = name ?? employee.name;
    employee.email = email ?? employee.email;
    employee.phone = phone ?? employee.phone;
    employee.department = department ?? employee.department;
    employee.designation = designation ?? employee.designation;
    employee.role = role ?? employee.role;
    employee.manager = manager ?? employee.manager;
    employee.joiningDate = joiningDate ?? employee.joiningDate;
    employee.status = status ?? employee.status;

    await employee.save();

    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employeeData,
    });
  } catch (error) {
    next(error);
  }
};

const deactivateEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    employee.status = "Inactive";

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
};


// navin employee tayr krto view edit update inactive pan kru shakto dublicate email check krto passowrord pan bcrypt krto