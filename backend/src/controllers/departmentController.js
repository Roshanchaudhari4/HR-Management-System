const Department = require("../models/Department");

const createDepartment = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    const existingDepartment = await Department.findOne({
      name: name.trim(),
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (name && name.trim() !== department.name) {
      const existingDepartment = await Department.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });

      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: "Department already exists",
        });
      }

      department.name = name.trim();
    }

    department.description =
      description ?? department.description;

    department.status =
      status ?? department.status;

    await department.save();

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const deactivateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    department.status = "Inactive";

    await department.save();

    res.status(200).json({
      success: true,
      message: "Department deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deactivateDepartment,
};


// POST → Department create
// GET → सर्व departments
// PUT → Department update
// PATCH → Department deactivate
// Duplicate department name prevent केला.
// फक्त Admin ला routes मधून access देणार आहोत.