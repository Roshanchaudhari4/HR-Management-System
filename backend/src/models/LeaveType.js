const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["Casual", "Sick", "Earned", "Unpaid"],
      trim: true,
    },

    yearlyLimit: {
      type: Number,
      required: true,
      min: 0,
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

module.exports = mongoose.model("LeaveType", leaveTypeSchema);

// Leave चे प्रकार + limits