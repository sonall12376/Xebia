import Review from '../models/Review.js';
import User from '../models/User.js';

// @desc    Submit a performance review for an employee
// @route   POST /api/reviews
// @access  Private (Manager, Admin)
export const submitReview = async (req, res) => {
  try {
    const { employeeId, technical, communication, teamwork, problemSolving, leadership, comments } = req.body;
    const managerId = req.user._id;

    // 1. Verify target employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // 2. Manager-specific validation: must be direct report
    if (req.user.role === 'Manager') {
      if (!employee.managerId || !employee.managerId.equals(managerId)) {
        return res.status(403).json({ message: 'Access denied. You can only evaluate your direct reports.' });
      }
    }

    // 3. Prevent duplicate reviews by the same evaluator for this employee
    const alreadyReviewed = await Review.findOne({ employeeId, managerId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already submitted an evaluation for this employee. Please edit the existing review instead.' });
    }

    // 4. Create review
    const review = await Review.create({
      employeeId,
      managerId,
      technical: Number(technical),
      communication: Number(communication),
      teamwork: Number(teamwork),
      problemSolving: Number(problemSolving),
      leadership: Number(leadership),
      comments: comments || ''
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a specific employee
// @route   GET /api/reviews/employee/:employeeId
// @access  Private
export const getEmployeeReviews = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Authorization checks
    if (req.user.role === 'Employee' && !req.user._id.equals(employeeId)) {
      return res.status(403).json({ message: 'Access denied. You can only view your own reviews.' });
    }

    if (req.user.role === 'Manager') {
      const employee = await User.findById(employeeId);
      if (!employee || !employee.managerId || !employee.managerId.equals(req.user._id)) {
        return res.status(403).json({ message: 'Access denied. You can only view reviews of your direct reports.' });
      }
    }

    const reviews = await Review.find({ employeeId })
      .populate('managerId', 'name email department designation')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get employee reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for the logged-in user (personal evaluations)
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ employeeId: req.user._id })
      .populate('managerId', 'name email department designation')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews submitted by the logged-in manager
// @route   GET /api/reviews/manager
// @access  Private (Manager)
export const getManagerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ managerId: req.user._id })
      .populate('employeeId', 'name email department designation')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get manager reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews in the system
// @route   GET /api/reviews
// @access  Private (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('employeeId', 'name email department designation')
      .populate('managerId', 'name email department designation')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an evaluation
// @route   PUT /api/reviews/:id
// @access  Private (Manager, Admin)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { technical, communication, teamwork, problemSolving, leadership, comments } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Verify ownership
    if (req.user.role === 'Manager' && !review.managerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. You can only update your own reviews.' });
    }

    review.technical = technical !== undefined ? Number(technical) : review.technical;
    review.communication = communication !== undefined ? Number(communication) : review.communication;
    review.teamwork = teamwork !== undefined ? Number(teamwork) : review.teamwork;
    review.problemSolving = problemSolving !== undefined ? Number(problemSolving) : review.problemSolving;
    review.leadership = leadership !== undefined ? Number(leadership) : review.leadership;
    review.comments = comments !== undefined ? comments : review.comments;

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an evaluation
// @route   DELETE /api/reviews/:id
// @access  Private (Manager, Admin)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Verify ownership
    if (req.user.role === 'Manager' && !review.managerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own reviews.' });
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: error.message });
  }
};
