import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user id'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide the date of attendance'],
      // We will normalize this date to midnight (00:00:00.000 UTC) before saving
    },
    checkInTime: {
      type: Date,
      required: [true, 'Please provide check-in time'],
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce compound uniqueness for a user checking in on a specific date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
