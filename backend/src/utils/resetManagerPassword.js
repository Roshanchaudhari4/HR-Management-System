require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const connectDB = require("../config/db");

const resetManagerPassword = async () => {
  try {
    await connectDB();

    const manager = await User.findById(
      "6abf7fe5ef755b3e0f7744c9"
    );

    if (!manager) {
      console.log("Manager not found");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(
      "Manager@123",
      10
    );

    manager.password = hashedPassword;

    await manager.save();

    console.log("Manager password reset successfully");
    console.log("Email:", manager.email);
    console.log("Password: Manager@123");

    process.exit(0);
  } catch (error) {
    console.error(
      "Password reset failed:",
      error.message
    );

    process.exit(1);
  }
};

resetManagerPassword();