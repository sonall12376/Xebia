import mongoose from 'mongoose';
import User from '../models/User.js';
import Review from '../models/Review.js';

const AUTH_URL = 'http://localhost:5000/api/auth';
const REVIEWS_URL = 'http://localhost:5000/api/reviews';

const runReviewsVerification = async () => {
  console.log('--- Starting Performance Reviews (Module 6) API Verification ---');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_performance_db';
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB database for verification.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }

  // Pre-test cleanup
  const testEmails = ['rev-admin@example.com', 'rev-mgr@example.com', 'rev-emp@example.com'];
  const testUsers = await User.find({ email: { $in: testEmails } });
  const testUserIds = testUsers.map(u => u._id);
  await Review.deleteMany({
    $or: [
      { employeeId: { $in: testUserIds } },
      { managerId: { $in: testUserIds } }
    ]
  });
  await User.deleteMany({ email: { $in: testEmails } });

  try {
    // 1. Register test users
    console.log('\n1. Registering test Admin, Manager, and Employee...');
    
    // Admin
    const adminReg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Rev Admin', email: 'rev-admin@example.com', password: 'password123', role: 'Admin' })
    });
    const adminData = await adminReg.json();
    const adminToken = adminData.token;

    // Manager
    const mgrReg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Rev Manager', email: 'rev-mgr@example.com', password: 'password123', role: 'Manager' })
    });
    const mgrData = await mgrReg.json();
    const mgrToken = mgrData.token;
    const mgrId = mgrData._id;

    // Employee
    const empReg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Rev Employee', 
        email: 'rev-emp@example.com', 
        password: 'password123', 
        role: 'Employee', 
        department: 'Engineering',
        designation: 'Software Engineer',
        managerId: mgrId 
      })
    });
    const empData = await empReg.json();
    const empToken = empData.token;
    const empId = empData._id;

    console.log('✓ Test users registered.');

    // 2. Submit a valid review (by Manager)
    console.log('\n2. Testing POST /api/reviews (Submit valid review)...');
    const submitRes = await fetch(`${REVIEWS_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgrToken}`
      },
      body: JSON.stringify({
        employeeId: empId,
        technical: 5,
        communication: 4,
        teamwork: 4,
        problemSolving: 5,
        leadership: 3,
        comments: 'Outstanding performance in engineering tasks.'
      })
    });
    const reviewData = await submitRes.json();
    if (submitRes.status !== 201 || !reviewData._id) {
      throw new Error(`Failed to submit review: ${JSON.stringify(reviewData)}`);
    }
    const reviewId = reviewData._id;
    console.log(`✓ Review submitted successfully. ID: ${reviewId}`);

    // 3. Test duplicate review submission blocking
    console.log('\n3. Testing POST /api/reviews duplicate protection...');
    const dupRes = await fetch(`${REVIEWS_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgrToken}`
      },
      body: JSON.stringify({
        employeeId: empId,
        technical: 4,
        communication: 4,
        teamwork: 4,
        problemSolving: 4,
        leadership: 4,
        comments: 'Duplicate attempt.'
      })
    });
    const dupData = await dupRes.json();
    if (dupRes.status !== 400) {
      throw new Error(`Expected status 400 on duplicate review, got: ${dupRes.status}`);
    }
    console.log('✓ Duplicate review blocked as expected:', dupData.message);

    // 4. Test score limit validation (rating out of bounds, e.g. 6 stars)
    console.log('\n4. Testing POST /api/reviews out-of-bounds ratings...');
    const invalidRes = await fetch(`${REVIEWS_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgrToken}`
      },
      body: JSON.stringify({
        employeeId: empId,
        technical: 6, // Invalid: exceeds 5
        communication: 4,
        teamwork: 4,
        problemSolving: 5,
        leadership: 3,
        comments: 'Out of bounds test.'
      })
    });
    const invalidData = await invalidRes.json();
    if (invalidRes.status !== 500 && invalidRes.status !== 400) {
      throw new Error(`Expected error status (400 or 500) on out-of-bounds rating, got: ${invalidRes.status}`);
    }
    console.log('✓ Out-of-bounds rating blocked successfully.');

    // 5. Test get my reviews (by Employee)
    console.log('\n5. Testing GET /api/reviews/my-reviews...');
    const myHistoryRes = await fetch(`${REVIEWS_URL}/my-reviews`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const myHistory = await myHistoryRes.json();
    if (myHistoryRes.status !== 200 || !Array.isArray(myHistory) || myHistory.length !== 1) {
      throw new Error(`Employee failed to fetch their own reviews: ${JSON.stringify(myHistory)}`);
    }
    console.log('✓ Employee fetched their reviews history successfully. Evaluator name populated:', myHistory[0].managerId.name);

    // 6. Test update review details (by Manager)
    console.log('\n6. Testing PUT /api/reviews/:id (Update review)...');
    const updateRes = await fetch(`${REVIEWS_URL}/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgrToken}`
      },
      body: JSON.stringify({
        technical: 5,
        communication: 5, // Updated rating
        comments: 'Excellent work and communication skill upgrades.' // Updated comment
      })
    });
    const updatedReview = await updateRes.json();
    if (updateRes.status !== 200 || updatedReview.communication !== 5 || updatedReview.comments !== 'Excellent work and communication skill upgrades.') {
      throw new Error(`Failed to update review: ${JSON.stringify(updatedReview)}`);
    }
    console.log('✓ Review updated successfully. New comments saved:', updatedReview.comments);

    // 7. Test get manager's submitted reviews
    console.log('\n7. Testing GET /api/reviews/manager...');
    const mgrReviewsRes = await fetch(`${REVIEWS_URL}/manager`, {
      headers: { Authorization: `Bearer ${mgrToken}` }
    });
    const mgrReviews = await mgrReviewsRes.json();
    if (mgrReviewsRes.status !== 200 || !Array.isArray(mgrReviews) || mgrReviews.length !== 1) {
      throw new Error(`Manager failed to get their submitted reviews: ${JSON.stringify(mgrReviews)}`);
    }
    console.log('✓ Manager retrieved their evaluations list. Target Employee name:', mgrReviews[0].employeeId.name);

    // 8. Test get all reviews in the system (by Admin)
    console.log('\n8. Testing GET /api/reviews (Admin)...');
    const adminReviewsRes = await fetch(`${REVIEWS_URL}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminReviews = await adminReviewsRes.json();
    if (adminReviewsRes.status !== 200 || !Array.isArray(adminReviews) || adminReviews.length === 0) {
      throw new Error(`Admin failed to get all reviews: ${JSON.stringify(adminReviews)}`);
    }
    console.log('✓ Admin retrieved all system evaluations.');

    // 9. Test delete review (by Manager)
    console.log('\n9. Testing DELETE /api/reviews/:id...');
    const deleteRes = await fetch(`${REVIEWS_URL}/${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${mgrToken}` }
    });
    const deleteData = await deleteRes.json();
    if (deleteRes.status !== 200) {
      throw new Error(`Failed to delete review: ${JSON.stringify(deleteData)}`);
    }
    console.log('✓ Review deleted successfully.');

    // Clean up
    console.log('\nCleaning up verification records...');
    await Review.deleteMany({
      $or: [
        { employeeId: { $in: [empId, mgrId, adminData._id] } },
        { managerId: { $in: [empId, mgrId, adminData._id] } }
      ]
    });
    await User.deleteMany({ email: { $in: testEmails } });
    console.log('✓ Cleanup completed.');

    console.log('\n--- ALL PERFORMANCE REVIEW ENDPOINTS AND LOGIC VERIFIED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    // Cleanup on failure
    const cleanupUsers = await User.find({ email: { $in: testEmails } });
    const cleanupUserIds = cleanupUsers.map(u => u._id);
    await Review.deleteMany({
      $or: [
        { employeeId: { $in: cleanupUserIds } },
        { managerId: { $in: cleanupUserIds } }
      ]
    });
    await User.deleteMany({ email: { $in: testEmails } });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

setTimeout(runReviewsVerification, 1000);
