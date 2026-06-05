import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the employee id'],
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the manager id'],
    },
    // Core criteria rated 1 to 5 stars
    technical: {
      type: Number,
      required: [true, 'Please provide a technical rating'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    communication: {
      type: Number,
      required: [true, 'Please provide a communication rating'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    teamwork: {
      type: Number,
      required: [true, 'Please provide a teamwork rating'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    problemSolving: {
      type: Number,
      required: [true, 'Please provide a problem solving rating'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    leadership: {
      type: Number,
      required: [true, 'Please provide a leadership rating'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Optimize search by indexing employeeId and managerId
reviewSchema.index({ employeeId: 1 });
reviewSchema.index({ managerId: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
