const bcrypt = require("bcryptjs");
const User = require("../models/User");

const validateManager = async (managerId) => {
  if (!managerId) {
    return {
      valid: false,
      message: "Manager is required for an Employee",
    };
  }

  const manager = await User.findOne({
    _id: managerId,
    role: "Manager",
    status: "Active",
  });

  if (!manager) {
    return {
      valid: false,
      message: "Selected manager is invalid or inactive",
    };
  }

  return {
    valid: true,
    manager,
  };
};

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

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (role === "Employee") {
      const managerValidation = await validateManager(manager);

      if (!managerValidation.valid) {
        return res.status(400).json({
          success: false,
          message: managerValidation.message,
        });
      }
    }

    if (role === "Manager" || role === "Admin") {
      if (manager) {
        return res.status(400).json({
          success: false,
          message:
            "Manager assignment is allowed only for Employee role",
        });
      }
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      department,
      designation,
      role: role || "Employee",
      manager: role === "Employee" ? manager : undefined,
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
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search && search.trim()) {
      const searchValue = search.trim();

      filter.$or = [
        {
          name: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchValue,
            $options: "i",
          },
        },
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

    const currentPage = Math.max(
      parseInt(page) || 1,
      1
    );

    const pageLimit = Math.max(
      parseInt(limit) || 10,
      1
    );

    const skip = (currentPage - 1) * pageLimit;

    const [employees, totalRecords] =
      await Promise.all([
        User.find(filter)
          .select("-password")
          .populate("department", "name")
          .populate("manager", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageLimit),

        User.countDocuments(filter),
      ]);

    const totalPages = Math.ceil(
      totalRecords / pageLimit
    );

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: employees,
      pagination: {
        currentPage,
        limit: pageLimit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(
      req.params.id
    )
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

    const employee = await User.findById(
      req.params.id
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const updatedRole =
      role ?? employee.role;

    if (email && email !== employee.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: {
          $ne: req.params.id,
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (updatedRole === "Employee") {
      const selectedManager =
        manager ?? employee.manager;

      const managerValidation =
        await validateManager(selectedManager);

      if (!managerValidation.valid) {
        return res.status(400).json({
          success: false,
          message: managerValidation.message,
        });
      }

      employee.manager = selectedManager;
    }

    if (
      updatedRole === "Manager" ||
      updatedRole === "Admin"
    ) {
      employee.manager = undefined;
    }

    employee.name =
      name ?? employee.name;

    employee.email =
      email
        ? email.toLowerCase().trim()
        : employee.email;

    employee.phone =
      phone ?? employee.phone;

    employee.department =
      department ?? employee.department;

    employee.designation =
      designation ?? employee.designation;

    employee.role = updatedRole;

    employee.joiningDate =
      joiningDate ?? employee.joiningDate;

    employee.status =
      status ?? employee.status;

    await employee.save();

    const employeeData =
      employee.toObject();

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

const deactivateEmployee = async (
  req,
  res,
  next
) => {
  try {
    const employee = await User.findById(
      req.params.id
    );

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
      message:
        "Employee deactivated successfully",
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