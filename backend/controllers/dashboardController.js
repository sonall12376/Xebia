import User from '../models/User.js';
import Project from '../models/Project.js';
import Attendance from '../models/Attendance.js';
import Review from '../models/Review.js';

// Helper to normalize dates to midnight UTC
const getTodayMidnight = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
export const getAdminDashboard = async (req, res) => {
  try {
    const today = getTodayMidnight();

    // 1. Total Employees count (Employees + Managers)
    const totalEmployees = await User.countDocuments({ role: { $in: ['Employee', 'Manager'] } });
    const onlyEmployees = await User.countDocuments({ role: 'Employee' });

    // 2. Active Projects count
    const activeProjects = await Project.countDocuments({ status: 'In Progress' });

    // 3. Attendance % (Today's check-ins / onlyEmployees)
    const todayCheckIns = await Attendance.countDocuments({ date: today });
    const attendancePercent = onlyEmployees > 0 ? Math.round((todayCheckIns / onlyEmployees) * 100) : 0;

    // 4. Pending Reviews count (Employees without any submitted reviews)
    const allEmployeeIds = await User.find({ role: 'Employee' }).distinct('_id');
    const reviewedEmployeeIds = await Review.find().distinct('employeeId');
    const pendingReviewsCount = allEmployeeIds.filter(
      (id) => !reviewedEmployeeIds.some((rid) => rid.equals(id))
    ).length;

    // 5. Recent Activities (combining check-ins, projects, and reviews)
    const recentCheckIns = await Attendance.find({ date: today })
      .sort({ checkInTime: -1 })
      .limit(5)
      .populate('userId', 'name');

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('managerId', 'name');

    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employeeId', 'name')
      .populate('managerId', 'name');

    const activities = [];

    recentCheckIns.forEach((c) => {
      activities.push({
        _id: c._id,
        type: 'check-in',
        message: `${c.userId?.name || 'An employee'} checked in today`,
        time: c.checkInTime,
      });
    });

    recentProjects.forEach((p) => {
      activities.push({
        _id: p._id,
        type: 'project',
        message: `New project "${p.name}" was created by ${p.managerId?.name || 'a manager'}`,
        time: p.createdAt,
      });
    });

    recentReviews.forEach((r) => {
      activities.push({
        _id: r._id,
        type: 'review',
        message: `${r.managerId?.name || 'A manager'} submitted a review for ${r.employeeId?.name || 'an employee'}`,
        time: r.createdAt,
      });
    });

    // Sort combined activities by time descending and take top 8
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 8);

    res.json({
      totalEmployees,
      activeProjects,
      attendancePercent,
      pendingReviewsCount,
      recentActivities,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Manager Dashboard Stats
// @route   GET /api/dashboard/manager
// @access  Private/Manager
export const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;
    const today = getTodayMidnight();

    // 1. Team members (Employees reporting to this manager)
    const teamMembers = await User.find({ managerId }).select('name email department designation joiningDate contact');
    const teamIds = teamMembers.map((m) => m._id);

    // 2. Assigned Projects list (Projects managed by this manager)
    const projects = await Project.find({ managerId })
      .select('name description status priority startDate endDate employeeIds')
      .populate('employeeIds', 'name email');

    // 3. Team Attendance status for today
    const teamAttendanceLogs = await Attendance.find({
      userId: { $in: teamIds },
      date: today,
    }).select('userId checkInTime checkOutTime');

    const attendanceSummary = teamMembers.map((member) => {
      const log = teamAttendanceLogs.find((l) => l.userId.equals(member._id));
      return {
        _id: member._id,
        name: member.name,
        email: member.email,
        designation: member.designation,
        status: log ? (log.checkOutTime ? 'Checked Out' : 'Checked In') : 'Absent',
        checkInTime: log ? log.checkInTime : null,
        checkOutTime: log ? log.checkOutTime : null,
      };
    });

    // 4. Pending reviews list (direct reports who don't have a review from this manager)
    const completedReviews = await Review.find({ managerId }).distinct('employeeId');
    const pendingReviewsList = teamMembers.filter(
      (member) => !completedReviews.some((rid) => rid.equals(member._id))
    );

    res.json({
      teamCount: teamMembers.length,
      projects,
      attendanceSummary,
      pendingReviews: pendingReviewsList,
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Employee Dashboard Stats
// @route   GET /api/dashboard/employee
// @access  Private/Employee
export const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const today = getTodayMidnight();

    // 1. User's projects (Projects where employee is assigned)
    const projects = await Project.find({ employeeIds: employeeId })
      .select('name description status priority startDate endDate managerId')
      .populate('managerId', 'name email');

    // 2. Today's attendance log
    const todayAttendance = await Attendance.findOne({
      userId: employeeId,
      date: today,
    }).select('checkInTime checkOutTime');

    // 3. User's performance reviews history & score calculation
    const reviews = await Review.find({ employeeId })
      .populate('managerId', 'name designation')
      .sort({ createdAt: -1 });

    const scoreMetrics = {
      technical: 0,
      communication: 0,
      teamwork: 0,
      problemSolving: 0,
      leadership: 0,
      overallAverage: 0,
    };

    if (reviews.length > 0) {
      reviews.forEach((r) => {
        scoreMetrics.technical += r.technical;
        scoreMetrics.communication += r.communication;
        scoreMetrics.teamwork += r.teamwork;
        scoreMetrics.problemSolving += r.problemSolving;
        scoreMetrics.leadership += r.leadership;
      });

      const count = reviews.length;
      scoreMetrics.technical = Number((scoreMetrics.technical / count).toFixed(1));
      scoreMetrics.communication = Number((scoreMetrics.communication / count).toFixed(1));
      scoreMetrics.teamwork = Number((scoreMetrics.teamwork / count).toFixed(1));
      scoreMetrics.problemSolving = Number((scoreMetrics.problemSolving / count).toFixed(1));
      scoreMetrics.leadership = Number((scoreMetrics.leadership / count).toFixed(1));

      const sumOfAverages =
        scoreMetrics.technical +
        scoreMetrics.communication +
        scoreMetrics.teamwork +
        scoreMetrics.problemSolving +
        scoreMetrics.leadership;
      scoreMetrics.overallAverage = Number((sumOfAverages / 5).toFixed(1));
    }

    res.json({
      projects,
      todayAttendance,
      scoreMetrics,
      reviews,
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};
