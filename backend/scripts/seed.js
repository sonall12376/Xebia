import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Attendance from '../models/Attendance.js';
import Review from '../models/Review.js';

dotenv.config();

const seedDB = async () => {
  console.log('--- Database Seeding Init ---');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_performance_db';

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB.');

    // 1. Clean collections
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Attendance.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('✓ Collections cleared.');

    // 2. Create Users
    console.log('\nCreating Users...');
    
    // Admin
    const admin = await User.create({
      name: 'Alice Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'Admin',
      department: 'HR Operations',
      designation: 'HR Director',
      contact: '+1 (555) 001-1122',
    });

    // Manager
    const manager = await User.create({
      name: 'Marcus Manager',
      email: 'manager@example.com',
      password: 'manager123',
      role: 'Manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
      contact: '+1 (555) 002-2233',
    });

    // Employee 1
    const employee1 = await User.create({
      name: 'Edward Employee',
      email: 'employee1@example.com',
      password: 'employee123',
      role: 'Employee',
      department: 'Engineering',
      designation: 'Frontend Engineer',
      contact: '+1 (555) 003-3344',
      managerId: manager._id,
    });

    // Employee 2
    const employee2 = await User.create({
      name: 'Emma Employee',
      email: 'employee2@example.com',
      password: 'employee123',
      role: 'Employee',
      department: 'Engineering',
      designation: 'Backend Engineer',
      contact: '+1 (555) 004-4455',
      managerId: manager._id,
    });

    console.log(`✓ Admin Created: ${admin.email}`);
    console.log(`✓ Manager Created: ${manager.email}`);
    console.log(`✓ Employee 1 Created: ${employee1.email}`);
    console.log(`✓ Employee 2 Created: ${employee2.email}`);

    // 3. Create Projects
    console.log('\nCreating Projects...');
    const project1 = await Project.create({
      name: 'Project Phoenix',
      description: 'Rebuild core portals with Vite React and Tailwind CSS.',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),   // 45 days later
      status: 'In Progress',
      priority: 'High',
      managerId: manager._id,
      employeeIds: [employee1._id, employee2._id],
    });

    const project2 = await Project.create({
      name: 'Project Falcon',
      description: 'Design robust microservice endpoints for reporting.',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),  // 25 days later
      status: 'Not Started',
      priority: 'Medium',
      managerId: manager._id,
      employeeIds: [employee2._id],
    });

    console.log(`✓ Active Project Created: ${project1.name}`);
    console.log(`✓ Pending Project Created: ${project2.name}`);

    // 4. Create Attendance Logs
    console.log('\nCreating Today\'s Attendance Logs...');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Employee 1 is currently checked in (no checkOutTime)
    const checkIn1 = new Date();
    checkIn1.setHours(9, 15, 0, 0);
    await Attendance.create({
      userId: employee1._id,
      date: today,
      checkInTime: checkIn1,
    });

    // Employee 2 is checked in and checked out
    const checkIn2 = new Date();
    checkIn2.setHours(9, 0, 0, 0);
    const checkOut2 = new Date();
    checkOut2.setHours(17, 30, 0, 0);
    await Attendance.create({
      userId: employee2._id,
      date: today,
      checkInTime: checkIn2,
      checkOutTime: checkOut2,
    });

    console.log(`✓ Check-In logged for ${employee1.name} (Active)`);
    console.log(`✓ Check-In/Out logged for ${employee2.name} (Completed)`);

    // 5. Create Performance Reviews
    console.log('\nCreating Performance Reviews...');
    const review = await Review.create({
      employeeId: employee1._id,
      managerId: manager._id,
      technical: 5,
      communication: 4,
      teamwork: 5,
      problemSolving: 4,
      leadership: 3,
      comments: 'Edward exhibits stellar technical skills and is an excellent team collaborator. Needs slight improvement in leading team sync sessions.',
    });

    console.log(`✓ Performance review created for ${employee1.name} (Submitted by ${manager.name})`);

    console.log('\n--- DATABASE SEEDED SUCCESSFULLY ---');
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedDB();
