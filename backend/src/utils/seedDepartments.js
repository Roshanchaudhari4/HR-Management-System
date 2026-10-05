require("dotenv").config();

const Department = require("../models/Department");
const connectDB = require("../config/db");

const seedDepartments = async () => {
  try {
    await connectDB();

    const departments = [
      {
        name: "IT",
        description: "Information Technology Department",
        status: "Active",
      },
      {
        name: "HR",
        description: "Human Resources Department",
        status: "Active",
      },
      {
        name: "Finance",
        description: "Finance Department",
        status: "Active",
      },
      {
        name: "Sales",
        description: "Sales Department",
        status: "Active",
      },
      {
        name: "Marketing",
        description: "Marketing Department",
        status: "Active",
      },
    ];

    for (const department of departments) {
      const existingDepartment = await Department.findOne({
        name: department.name,
      });

      if (existingDepartment) {
        console.log(
          `${department.name} department already exists`
        );
        continue;
      }

      await Department.create(department);

      console.log(
        `${department.name} department created successfully`
      );
    }

    console.log("Department seeding completed");

    process.exit(0);
  } catch (error) {
    console.error(
      "Department seed failed:",
      error.message
    );

    process.exit(1);
  }
};

seedDepartments();