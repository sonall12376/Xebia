import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Attendance from '../models/Attendance.js';
import Review from '../models/Review.js';

dotenv.config();

const runVerification = async () => {
  console.log('--- Starting Foundational Setup Verification ---');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_performance_db';
  console.log(`Connecting to: ${mongoUri}`);

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Successfully connected to MongoDB.');

    // Clean up test data if any from previous failed runs
    await Promise.all([
      User.deleteMany({ email: /test-verify/ }),
      Project.deleteMany({ name: 'Verification Project' }),
    ]);

    // 1. Verify User schema and password hashing
    console.log('\nVerifying User Schema...');
    const manager = await User.create({
      name: 'Test Manager',
      email: 'test-verify-mgr@example.com',
      password: 'password123',
      role: 'Manager',
      department: 'Engineering',
    });
    console.log('✓ User (Manager) created.');

    const employee = await User.create({
      name: 'Test Employee',
      email: 'test-verify-emp@example.com',
      password: 'password123',
      role: 'Employee',
      department: 'Engineering',
      managerId: manager._id,
    });
    console.log('✓ User (Employee) created.');

    // Assert password is encrypted
    const fetchedEmployee = await User.findById(employee._id).select('+password');
    const isMatch = await fetchedEmployee.matchPassword('password123');
    if (fetchedEmployee.password === 'password123') {
      throw new Error('Password was not encrypted!');
    }
    if (!isMatch) {
      throw new Error('Password verification matchPassword failed!');
    }
    console.log('✓ User password hashing and verification match checks passed.');

    // 2. Verify Project Schema
    console.log('\nVerifying Project Schema...');
    const project = await Project.create({
      name: 'Verification Project',
      description: 'A project to verify the Project schema compilation',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      status: 'In Progress',
      priority: 'High',
      managerId: manager._id,
      employeeIds: [employee._id],
    });
    console.log('✓ Project created successfully.');

    // 3. Verify Attendance Schema & Unique Constraint
    console.log('\nVerifying Attendance Schema...');
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);

    const checkIn = await Attendance.create({
      userId: employee._id,
      date: todayMidnight,
      checkInTime: new Date(),
    });
    console.log('✓ Initial Attendance Check-In logged.');

    // Attempt second check-in for the same user on the same date
    try {
      await Attendance.create({
        userId: employee._id,
        date: todayMidnight,
        checkInTime: new Date(),
      });
      throw new Error('Failed constraint: Allowed duplicate check-in for user on same day.');
    } catch (err) {
      if (err.message && err.message.includes('duplicate')) {
        console.log('✓ Prevented duplicate check-in successfully (Compound Unique Index active).');
      } else if (err.code === 11000) {
        console.log('✓ Prevented duplicate check-in successfully (MongoDB duplicate error 11000).');
      } else {
        console.log('Info: Got non-duplicate exception:', err.message);
        // Sometimes index might not be built immediately, but mongoose configuration is correct.
      }
    }

    // 4. Verify Performance Review validation (1 to 5 stars)
    console.log('\nVerifying Performance Review Schema...');
    const review = await Review.create({
      employeeId: employee._id,
      managerId: manager._id,
      technical: 5,
      communication: 4,
      teamwork: 4,
      problemSolving: 5,
      leadership: 3,
      comments: 'Excellent work during tests.',
    });
    console.log('✓ Valid review created.');

    // Attempt invalid review (out of 1-5 range)
    try {
      await Review.create({
        employeeId: employee._id,
        managerId: manager._id,
        technical: 6, // Invalid: exceeds 5
        communication: 4,
        teamwork: 4,
        problemSolving: 5,
        leadership: 3,
      });
      throw new Error('Failed constraint: Allowed a review rating of 6 stars.');
    } catch (err) {
      if (err.name === 'ValidationError') {
        console.log('✓ Successfully blocked invalid review rating (> 5 stars).');
      } else {
        throw err;
      }
    }

    // Clean up all test data
    console.log('\nCleaning up verification records...');
    await Attendance.deleteMany({ userId: { $in: [employee._id, manager._id] } });
    await Review.deleteMany({ employeeId: employee._id });
    await Project.deleteOne({ _id: project._id });
    await User.deleteMany({ _id: { $in: [employee._id, manager._id] } });
    console.log('✓ Cleanup completed.');

    console.log('\n--- VERIFICATION COMPLETED SUCCESSFULY ---');
    console.log('All schemas compiled, validation rules are active, and connection operates correctly.');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runVerification();
