const mongoose = require('mongoose');

const preHireFileSchema = mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: true,
    },
    status: {
      type: String,
      enum: ['Received', 'Processing', 'Complete', 'Ready for Review'],
      default: 'Received',
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    adminNotified: {
      type: Boolean,
      default: false,
    },
    userNotified: {
      type: Boolean,
      default: false,
    },
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const PreHireFile = mongoose.model('PreHireFile', preHireFileSchema);
module.exports = PreHireFile;