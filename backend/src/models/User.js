const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,   // false mule passoword parat milnar nahi
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    designation: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["Employee", "Manager", "Admin"],
      required: true,
      default: "Employee",
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",                  // employee kontya manager la assign ahe te  store krel
    },

    joiningDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);