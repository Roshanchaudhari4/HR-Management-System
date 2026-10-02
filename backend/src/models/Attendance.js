const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,
    },

    checkOut: {
      type: Date,
    },

    workingHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half Day"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);