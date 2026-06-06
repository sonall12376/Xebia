import mongoose from 'mongoose';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

const AUTH_URL = 'http://localhost:5000/api/auth';
const ATTENDANCE_URL = 'http://localhost:5000/api/attendance';

const runAttendanceVerification = async () => {
  console.log('--- Starting Attendance Management (Module 5) API Verification ---');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_performance_db';
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB database for verification.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }

  // Pre-test cleanup
  const testEmails = ['att-admin@example.com', 'att-mgr@example.com', 'att-emp@example.com'];
  const testUsers = await User.find({ email: { $in: testEmails } });
  const testUserIds = testUsers.map(u => u._id);
  await Attendance.deleteMany({ userId: { $in: testUserIds } });
  await User.deleteMany({ email: { $in: testEmails } });

  try {
    // 1. Register test users
    console.log('\n1. Registering test Admin, Manager, and Employee...');
    
    // Admin
    const adminReg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Att Admin', email: 'att-admin@example.com', password: 'password123', role: 'Admin' })
    });
    const adminData = await adminReg.json();
    const adminToken = adminData.token;

    // Manager
    const mgrReg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Att Manager', email: 'att-mgr@example.com', password: 'password123', role: 'Manager' })
    });
    const mgrData = await mgrReg.json();
    const mgrToken = mgrData.token;
    const mgrId = mgrData._id;

    // Employee
    const empReg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Att Employee', 
        email: 'att-emp@example.com', 
        password: 'password123', 
        role: 'Employee', 
        department: 'Support',
        designation: 'Support Engineer',
        managerId: mgrId 
      })
    });
    const empData = await empReg.json();
    const empToken = empData.token;
    const empId = empData._id;

    console.log('✓ Test users registered.');

    // 2. Query today's status initially (should be null)
    console.log('\n2. Testing GET /api/attendance/status (Initial check)...');
    const initStatusRes = await fetch(`${ATTENDANCE_URL}/status`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const initStatus = await initStatusRes.json();
    if (initStatusRes.status !== 200 || initStatus !== null) {
      throw new Error(`Expected null today status, got: ${JSON.stringify(initStatus)}`);
    }
    console.log('✓ Today status is null initially (no check-in yet).');

    // 3. Test check-in (clock-in)
    console.log('\n3. Testing POST /api/attendance/check-in...');
    const checkInRes = await fetch(`${ATTENDANCE_URL}/check-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const checkInLog = await checkInRes.json();
    if (checkInRes.status !== 201 || !checkInLog._id || checkInLog.checkOutTime !== null) {
      throw new Error(`Failed to check in: ${JSON.stringify(checkInLog)}`);
    }
    console.log(`✓ Checked in successfully. Timestamp: ${checkInLog.checkInTime}`);

    // 4. Test duplicate check-in blocking
    console.log('\n4. Testing POST /api/attendance/check-in duplicate protection...');
    const dupCheckInRes = await fetch(`${ATTENDANCE_URL}/check-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const dupCheckInData = await dupCheckInRes.json();
    if (dupCheckInRes.status !== 400) {
      throw new Error(`Expected status 400 on duplicate check-in, got: ${dupCheckInRes.status}`);
    }
    console.log('✓ Duplicate check-in blocked as expected:', dupCheckInData.message);

    // 5. Query today's status after check-in
    console.log('\n5. Testing GET /api/attendance/status (After check-in)...');
    const statusRes = await fetch(`${ATTENDANCE_URL}/status`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const statusLog = await statusRes.json();
    if (statusRes.status !== 200 || !statusLog || statusLog.checkOutTime !== null) {
      throw new Error(`Today status query failed or invalid log: ${JSON.stringify(statusLog)}`);
    }
    console.log('✓ Today status returns active check-in session details.');

    // 6. Test check-out (clock-out)
    console.log('\n6. Testing POST /api/attendance/check-out...');
    const checkOutRes = await fetch(`${ATTENDANCE_URL}/check-out`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const checkOutLog = await checkOutRes.json();
    if (checkOutRes.status !== 200 || !checkOutLog.checkOutTime) {
      throw new Error(`Failed to check out: ${JSON.stringify(checkOutLog)}`);
    }
    console.log(`✓ Checked out successfully. Timestamp: ${checkOutLog.checkOutTime}`);

    // 7. Test duplicate check-out blocking
    console.log('\n7. Testing POST /api/attendance/check-out duplicate protection...');
    const dupCheckOutRes = await fetch(`${ATTENDANCE_URL}/check-out`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const dupCheckOutData = await dupCheckOutRes.json();
    if (dupCheckOutRes.status !== 400) {
      throw new Error(`Expected status 400 on duplicate check-out, got: ${dupCheckOutRes.status}`);
    }
    console.log('✓ Duplicate check-out blocked as expected:', dupCheckOutData.message);

    // 8. Test personal history list query
    console.log('\n8. Testing GET /api/attendance/my-history...');
    const historyRes = await fetch(`${ATTENDANCE_URL}/my-history`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const historyList = await historyRes.json();
    if (historyRes.status !== 200 || !Array.isArray(historyList) || historyList.length !== 1) {
      throw new Error(`My history list query failed: ${JSON.stringify(historyList)}`);
    }
    const logItem = historyList[0];
    const diffMs = new Date(logItem.checkOutTime) - new Date(logItem.checkInTime);
    const durationHours = diffMs / (1000 * 60 * 60);
    console.log(`✓ History list retrieved. Session duration calculated: ${durationHours.toFixed(4)} hours.`);

    // 9. Test team attendance audits query
    console.log('\n9. Testing GET /api/attendance/team (Manager and Admin)...');
    
    // Manager: should retrieve Employee's log populated with user details
    const mgrTeamRes = await fetch(`${ATTENDANCE_URL}/team`, {
      headers: { Authorization: `Bearer ${mgrToken}` }
    });
    const mgrTeamLogs = await mgrTeamRes.json();
    if (mgrTeamRes.status !== 200 || !Array.isArray(mgrTeamLogs)) {
      throw new Error(`Manager team logs query failed: ${JSON.stringify(mgrTeamLogs)}`);
    }
    const empLog = mgrTeamLogs.find(l => l.userId._id === empId);
    if (!empLog || empLog.userId.name !== 'Att Employee' || empLog.userId.department !== 'Support') {
      throw new Error(`Manager did not fetch populated details for reports: ${JSON.stringify(mgrTeamLogs)}`);
    }
    console.log('✓ Manager retrieved team presence logs populated with user descriptions.');

    // Admin: should also retrieve Employee's log
    const adminTeamRes = await fetch(`${ATTENDANCE_URL}/team`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminTeamLogs = await adminTeamRes.json();
    if (adminTeamRes.status !== 200 || adminTeamLogs.length === 0) {
      throw new Error(`Admin team logs query failed: ${JSON.stringify(adminTeamLogs)}`);
    }
    console.log('✓ Admin retrieved organization-wide attendance logs.');

    // Clean up
    console.log('\nCleaning up verification records...');
    await Attendance.deleteMany({ userId: { $in: [empId, mgrId, adminData._id] } });
    await User.deleteMany({ email: { $in: testEmails } });
    console.log('✓ Cleanup completed.');

    console.log('\n--- ALL ATTENDANCE ENDPOINTS AND LOGIC VERIFIED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    // Cleanup on failure
    const cleanupUsers = await User.find({ email: { $in: testEmails } });
    const cleanupUserIds = cleanupUsers.map(u => u._id);
    await Attendance.deleteMany({ userId: { $in: cleanupUserIds } });
    await User.deleteMany({ email: { $in: testEmails } });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

setTimeout(runAttendanceVerification, 1000);
