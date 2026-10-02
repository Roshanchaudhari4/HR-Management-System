require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const connectDB = require("../config/db");

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@hrms.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "System Admin",
      email: "admin@hrms.com",
      password: hashedPassword,
      role: "Admin",
      status: "Active",
    });

    console.log("Admin user created successfully");
    console.log("Email: admin@hrms.com");
    console.log("Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();