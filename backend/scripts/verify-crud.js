import mongoose from 'mongoose';
import User from '../models/User.js';

const AUTH_URL = 'http://localhost:5000/api/auth';
const USERS_URL = 'http://localhost:5000/api/users';

const runCrudVerification = async () => {
  console.log('--- Starting Employee CRUD Operations API Verification ---');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_performance_db';
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB database for verification controls.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }

  // Pre-test cleanup
  await User.deleteMany({
    email: { $in: ['crud-admin@example.com', 'crud-mgr@example.com', 'crud-emp@example.com'] }
  });

  try {
    // 1. Register a temporary Admin to perform CRUD actions
    console.log('\n1. Registering test Admin...');
    const adminRegRes = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Crud Admin',
        email: 'crud-admin@example.com',
        password: 'password123',
        role: 'Admin',
        department: 'HR'
      }),
    });
    const adminRegData = await adminRegRes.json();
    if (adminRegRes.status !== 201 || !adminRegData.token) {
      throw new Error(`Admin registration failed: ${JSON.stringify(adminRegData)}`);
    }
    const adminToken = adminRegData.token;
    console.log('✓ Admin registered. Token successfully received.');

    // 2. Register a temporary Manager to check manager lists and assignment
    console.log('\n2. Registering test Manager...');
    const mgrRegRes = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Crud Manager',
        email: 'crud-mgr@example.com',
        password: 'password123',
        role: 'Manager',
        department: 'Engineering'
      }),
    });
    const mgrRegData = await mgrRegRes.json();
    if (mgrRegRes.status !== 201) {
      throw new Error(`Manager registration failed: ${JSON.stringify(mgrRegData)}`);
    }
    const managerId = mgrRegData._id;
    console.log(`✓ Manager registered. ID: ${managerId}`);

    // 3. Test get managers route (for dropdown populating)
    console.log('\n3. Testing GET /api/users/managers (dropdown query)...');
    const getMgrsRes = await fetch(`${USERS_URL}/managers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    });
    const mgrsList = await getMgrsRes.json();
    if (getMgrsRes.status !== 200 || !Array.isArray(mgrsList)) {
      throw new Error(`Get managers list failed: ${JSON.stringify(mgrsList)}`);
    }
    const foundMgr = mgrsList.find(m => m.email === 'crud-mgr@example.com');
    if (!foundMgr) {
      throw new Error('Could not find the test manager in /api/users/managers response!');
    }
    console.log('✓ Get managers successful. Test manager found in list.');

    // 4. Test User Creation route (POST /api/users)
    console.log('\n4. Testing POST /api/users (Create Employee reporting to Manager)...');
    const createEmpRes = await fetch(USERS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Crud Employee',
        email: 'crud-emp@example.com',
        password: 'password123',
        role: 'Employee',
        department: 'Engineering',
        designation: 'Software Developer',
        contact: '1234567890',
        managerId: managerId
      })
    });
    const createEmpData = await createEmpRes.json();
    if (createEmpRes.status !== 201 || !createEmpData._id) {
      throw new Error(`Employee creation failed: ${JSON.stringify(createEmpData)}`);
    }
    const employeeId = createEmpData._id;
    console.log(`✓ Employee created successfully. ID: ${employeeId}`);

    // 5. Test Get Users route (GET /api/users)
    console.log('\n5. Testing GET /api/users (Get Directory)...');
    const getUsersRes = await fetch(USERS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    });
    const usersList = await getUsersRes.json();
    if (getUsersRes.status !== 200 || !Array.isArray(usersList)) {
      throw new Error(`Get users list failed: ${JSON.stringify(usersList)}`);
    }
    const foundEmp = usersList.find(u => u.email === 'crud-emp@example.com');
    if (!foundEmp) {
      throw new Error('Created employee was not found in user list!');
    }
    if (!foundEmp.managerId || foundEmp.managerId._id !== managerId) {
      throw new Error(`Employee manager was not populated correctly: ${JSON.stringify(foundEmp.managerId)}`);
    }
    console.log('✓ Users list fetched. Created employee verified with populated manager details.');

    // 6. Test User Update route (PUT /api/users/:id)
    console.log('\n6. Testing PUT /api/users/:id (Update designation & contact)...');
    const updateEmpRes = await fetch(`${USERS_URL}/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        designation: 'Senior Software Developer',
        contact: '9999999999'
      })
    });
    const updateEmpData = await updateEmpRes.json();
    if (updateEmpRes.status !== 200 || updateEmpData.designation !== 'Senior Software Developer' || updateEmpData.contact !== '9999999999') {
      throw new Error(`Employee update failed: ${JSON.stringify(updateEmpData)}`);
    }
    console.log('✓ Employee updated successfully.');

    // 7. Test User Deletion route (DELETE /api/users/:id)
    console.log('\n7. Testing DELETE /api/users/:id...');
    const deleteEmpRes = await fetch(`${USERS_URL}/${employeeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    });
    const deleteEmpData = await deleteEmpRes.json();
    if (deleteEmpRes.status !== 200) {
      throw new Error(`Employee deletion failed: ${JSON.stringify(deleteEmpData)}`);
    }
    console.log('✓ Employee deleted successfully.');

    // 8. Verify employee no longer in database/list
    console.log('\n8. Verifying deletion in list...');
    const verifyGetUsersRes = await fetch(USERS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    });
    const verifyUsersList = await verifyGetUsersRes.json();
    const deletedEmpFound = verifyUsersList.find(u => u.email === 'crud-emp@example.com');
    if (deletedEmpFound) {
      throw new Error('Employee still found in directory after deletion!');
    }
    console.log('✓ Employee deletion verified successfully.');

    // Clean up
    console.log('\nCleaning up verification records...');
    await User.deleteMany({
      email: { $in: ['crud-admin@example.com', 'crud-mgr@example.com', 'crud-emp@example.com'] }
    });
    console.log('✓ Cleanup completed.');

    console.log('\n--- ALL CRUD OPERATIONS VERIFIED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    // Force cleanup on failure
    await User.deleteMany({
      email: { $in: ['crud-admin@example.com', 'crud-mgr@example.com', 'crud-emp@example.com'] }
    });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

setTimeout(runCrudVerification, 1000);
