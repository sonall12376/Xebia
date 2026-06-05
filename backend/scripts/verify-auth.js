import mongoose from 'mongoose';
import User from '../models/User.js';

const API_URL = 'http://localhost:5000/api/auth';

const runAuthVerification = async () => {
  console.log('--- Starting Authentication & Authorization API Verification ---');

  // Let's connect to database to perform cleanup before and after testing
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_performance_db';
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB database for verification controls.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }

  // Pre-cleanup
  await User.deleteMany({ email: { $in: ['auth-admin@example.com', 'auth-mgr@example.com', 'auth-emp@example.com'] } });

  try {
    // 1. Test registration of Admin
    console.log('\nTesting Admin Registration...');
    const regAdminRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auth Admin',
        email: 'auth-admin@example.com',
        password: 'password123',
        role: 'Admin',
        department: 'Operations',
      }),
    });
    const regAdminData = await regAdminRes.json();
    if (regAdminRes.status !== 201 || !regAdminData.token) {
      throw new Error(`Admin registration failed: ${JSON.stringify(regAdminData)}`);
    }
    console.log(`✓ Admin Registered. JWT: ${regAdminData.token.substring(0, 15)}...`);

    // 2. Test registration of Manager
    console.log('\nTesting Manager Registration...');
    const regMgrRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auth Manager',
        email: 'auth-mgr@example.com',
        password: 'password123',
        role: 'Manager',
        department: 'Engineering',
      }),
    });
    const regMgrData = await regMgrRes.json();
    if (regMgrRes.status !== 201 || !regMgrData.token) {
      throw new Error(`Manager registration failed: ${JSON.stringify(regMgrData)}`);
    }
    console.log(`✓ Manager Registered. User ID: ${regMgrData._id}`);

    // 3. Test registration of Employee (linked to Manager)
    console.log('\nTesting Employee Registration...');
    const regEmpRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auth Employee',
        email: 'auth-emp@example.com',
        password: 'password123',
        role: 'Employee',
        department: 'Engineering',
        managerId: regMgrData._id,
      }),
    });
    const regEmpData = await regEmpRes.json();
    if (regEmpRes.status !== 201 || regEmpData.managerId !== regMgrData._id) {
      throw new Error(`Employee registration failed: ${JSON.stringify(regEmpData)}`);
    }
    console.log('✓ Employee Registered and linked to Manager successfully.');

    // 4. Test duplicate email registration rejection
    console.log('\nTesting Duplicate Email Rejection...');
    const dupRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Employee',
        email: 'auth-emp@example.com', // Already registered
        password: 'password123',
      }),
    });
    const dupData = await dupRes.json();
    if (dupRes.status !== 400) {
      throw new Error(`Duplicate check failed: returned status ${dupRes.status}`);
    }
    console.log('✓ Duplicate registration rejected as expected (Status 400):', dupData.message);

    // 5. Test login functionality
    console.log('\nTesting Login API...');
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'auth-emp@example.com',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    console.log('✓ Login successful. User role confirmed:', loginData.role);

    // 6. Test login failure (invalid password)
    console.log('\nTesting Invalid Login Rejection...');
    const badLoginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'auth-emp@example.com',
        password: 'wrongpassword',
      }),
    });
    const badLoginData = await badLoginRes.json();
    if (badLoginRes.status !== 401) {
      throw new Error(`Bad login test failed: returned status ${badLoginRes.status}`);
    }
    console.log('✓ Incorrect password login rejected as expected (Status 401):', badLoginData.message);

    // 7. Test JWT Protect Middleware (/api/auth/me)
    console.log('\nTesting Protected Profile Query (JWT validation)...');
    const meRes = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.email !== 'auth-emp@example.com') {
      throw new Error(`Protected route access failed: ${JSON.stringify(meData)}`);
    }
    console.log(`✓ Protected profile query successful. Retrieved name: "${meData.name}"`);

    // Clean up created test users
    console.log('\nCleaning up verification records...');
    await User.deleteMany({ email: { $in: ['auth-admin@example.com', 'auth-mgr@example.com', 'auth-emp@example.com'] } });
    console.log('✓ Cleanup completed.');

    console.log('\n--- VERIFICATION COMPLETED SUCCESSFULY ---');
    console.log('Backend endpoints: register, login, me, and middleware JWT authentication work flawlessly!');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    // Cleanup anyway
    await User.deleteMany({ email: { $in: ['auth-admin@example.com', 'auth-mgr@example.com', 'auth-emp@example.com'] } });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Wait a little before starting, in case the server is starting
setTimeout(runAuthVerification, 1000);
