const mongoose = require("mongoose");

/**
 * Session Schema
 *
 * date      – ISO date string  (e.g. "2026-04-10")
 * startTime – 24h time string  (e.g. "14:00")
 * endTime   – 24h time string  (e.g. "15:30")
 */
const SessionSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, "Session title is required"],
      trim:     true,
      minlength: [3,  "Title must be at least 3 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    date: {
      type:     String,
      required: [true, "Session date is required"],
      match:    [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },

    startTime: {
      type:     String,
      required: [true, "Start time is required"],
      match:    [/^\d{2}:\d{2}$/, "Start time must be HH:MM"],
    },

    endTime: {
      type:     String,
      required: [true, "End time is required"],
      match:    [/^\d{2}:\d{2}$/, "End time must be HH:MM"],
    },

    meetingLink: {
      type:     String,
      required: [true, "Meeting link is required"],
      trim:     true,
    },

    mentorId: {
      type:     String,
      required: [true, "Mentor ID is required"],
    },

    mentorName: {
      type:    String,
      default: "Mentor",
      trim:    true,
    },

    studentId: {
      type:     String,
      required: [true, "Student ID is required"],
    },

    studentName: {
      type:    String,
      default: "Student",
      trim:    true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

/* Compound index for quick student/mentor lookups */
SessionSchema.index({ studentId: 1, date: 1 });
SessionSchema.index({ mentorId:  1, date: 1 });

module.exports = mongoose.model("Session", SessionSchema);
