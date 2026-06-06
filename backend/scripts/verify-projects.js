import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';

const AUTH_URL = 'http://localhost:5000/api/auth';
const PROJECTS_URL = 'http://localhost:5000/api/projects';

const runProjectsVerification = async () => {
  console.log('--- Starting Project Management (Module 4) API Verification ---');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_performance_db';
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB database for verification.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }

  // Pre-test cleanup
  const testEmails = [
    'proj-admin@example.com',
    'proj-mgr1@example.com',
    'proj-mgr2@example.com',
    'proj-emp1@example.com',
    'proj-emp2@example.com'
  ];
  await User.deleteMany({ email: { $in: testEmails } });
  await Project.deleteMany({ name: { $regex: '^Proj-' } });

  try {
    // 1. Register test users
    console.log('\n1. Registering test Admin, Managers, and Employees...');
    
    // Admin
    const adminReg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Proj Admin', email: 'proj-admin@example.com', password: 'password123', role: 'Admin' })
    });
    const adminData = await adminReg.json();
    const adminToken = adminData.token;

    // Manager 1
    const mgr1Reg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Proj Manager 1', email: 'proj-mgr1@example.com', password: 'password123', role: 'Manager' })
    });
    const mgr1Data = await mgr1Reg.json();
    const mgr1Token = mgr1Data.token;
    const mgr1Id = mgr1Data._id;

    // Manager 2
    const mgr2Reg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Proj Manager 2', email: 'proj-mgr2@example.com', password: 'password123', role: 'Manager' })
    });
    const mgr2Data = await mgr2Reg.json();
    const mgr2Token = mgr2Data.token;
    const mgr2Id = mgr2Data._id;

    // Employee 1
    const emp1Reg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Proj Employee 1', email: 'proj-emp1@example.com', password: 'password123', role: 'Employee', managerId: mgr1Id })
    });
    const emp1Data = await emp1Reg.json();
    const emp1Token = emp1Data.token;
    const emp1Id = emp1Data._id;

    // Employee 2
    const emp2Reg = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Proj Employee 2', email: 'proj-emp2@example.com', password: 'password123', role: 'Employee', managerId: mgr1Id })
    });
    const emp2Data = await emp2Reg.json();
    const emp2Id = emp2Data._id;

    console.log('✓ Test users registered successfully.');

    // 2. Test lookup routes
    console.log('\n2. Testing lookup endpoints (employees & managers listings)...');
    const getEmpsRes = await fetch(`${PROJECTS_URL}/employees`, {
      headers: { Authorization: `Bearer ${mgr1Token}` }
    });
    const empsList = await getEmpsRes.json();
    if (getEmpsRes.status !== 200 || !Array.isArray(empsList)) {
      throw new Error(`Failed to fetch project employees: ${JSON.stringify(empsList)}`);
    }
    console.log(`✓ Fetched ${empsList.length} employees for multi-select checklist.`);

    const getMgrsRes = await fetch(`${PROJECTS_URL}/managers`, {
      headers: { Authorization: `Bearer ${mgr1Token}` }
    });
    const mgrsList = await getMgrsRes.json();
    if (getMgrsRes.status !== 200 || !Array.isArray(mgrsList)) {
      throw new Error(`Failed to fetch project managers: ${JSON.stringify(mgrsList)}`);
    }
    console.log(`✓ Fetched ${mgrsList.length} managers for project assignments.`);

    // 3. Test project creations
    console.log('\n3. Testing POST /api/projects (Project creation)...');
    
    // Project 1 (Created by Admin, managed by Manager 1, staffed with Employee 1)
    const createRes1 = await fetch(PROJECTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Proj-AdminProject',
        description: 'Created by Admin',
        startDate: '2026-06-01',
        endDate: '2026-12-31',
        managerId: mgr1Id,
        employeeIds: [emp1Id],
        priority: 'High'
      })
    });
    const project1 = await createRes1.json();
    if (createRes1.status !== 201 || !project1._id) {
      throw new Error(`Admin failed to create project: ${JSON.stringify(project1)}`);
    }
    console.log('✓ Project 1 created by Admin.');

    // Project 2 (Created by Manager 1, automatically managed by themselves, staffed with Employee 1 & 2)
    const createRes2 = await fetch(PROJECTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgr1Token}`
      },
      body: JSON.stringify({
        name: 'Proj-MgrProject1',
        description: 'Created by Manager 1',
        startDate: '2026-07-01',
        endDate: '2026-10-31',
        employeeIds: [emp1Id, emp2Id],
        priority: 'Medium'
      })
    });
    const project2 = await createRes2.json();
    if (createRes2.status !== 201 || !project2._id) {
      throw new Error(`Manager 1 failed to create project: ${JSON.stringify(project2)}`);
    }
    console.log('✓ Project 2 created by Manager 1.');

    // 4. Test project listing by roles
    console.log('\n4. Testing GET /api/projects role visibility filtering...');
    
    // Admin: should see both
    const adminGet = await fetch(PROJECTS_URL, { headers: { Authorization: `Bearer ${adminToken}` } });
    const adminProjects = await adminGet.json();
    if (adminProjects.length < 2) {
      throw new Error(`Admin did not retrieve both projects: ${adminProjects.length}`);
    }
    console.log('✓ Admin retrieved all projects.');

    // Manager 1: should see both (since they manage both)
    const mgr1Get = await fetch(PROJECTS_URL, { headers: { Authorization: `Bearer ${mgr1Token}` } });
    const mgr1Projects = await mgr1Get.json();
    if (mgr1Projects.length < 2) {
      throw new Error(`Manager 1 did not retrieve both projects: ${mgr1Projects.length}`);
    }
    console.log('✓ Manager 1 retrieved projects they manage.');

    // Manager 2: should see 0 (since they manage none of these)
    const mgr2Get = await fetch(PROJECTS_URL, { headers: { Authorization: `Bearer ${mgr2Token}` } });
    const mgr2Projects = await mgr2Get.json();
    const testMgr2Projects = mgr2Projects.filter(p => p.name.startsWith('Proj-'));
    if (testMgr2Projects.length !== 0) {
      throw new Error(`Manager 2 retrieved projects they do not manage: ${JSON.stringify(testMgr2Projects)}`);
    }
    console.log('✓ Manager 2 filters out projects they do not manage.');

    // Employee 1: should see both (since they are assigned to both)
    const emp1Get = await fetch(PROJECTS_URL, { headers: { Authorization: `Bearer ${emp1Token}` } });
    const emp1Projects = await emp1Get.json();
    const testEmp1Projects = emp1Projects.filter(p => p.name.startsWith('Proj-'));
    if (testEmp1Projects.length !== 2) {
      throw new Error(`Employee 1 did not see both projects they are assigned to: ${testEmp1Projects.length}`);
    }
    console.log('✓ Employee 1 retrieved both projects they are assigned to.');

    // 5. Test Update Authorization safeguards
    console.log('\n5. Testing PUT /api/projects/:id ownership checks...');
    
    // Manager 2 tries to update Manager 1's project -> should fail with 403
    const badUpdateRes = await fetch(`${PROJECTS_URL}/${project2._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgr2Token}`
      },
      body: JSON.stringify({ name: 'Proj-HackedName' })
    });
    if (badUpdateRes.status !== 403) {
      throw new Error(`Expected status 403 for unauthorized manager update, got: ${badUpdateRes.status}`);
    }
    console.log('✓ Unauthorized project modification blocked (Status 403) as expected.');

    // Manager 1 updates their own project -> should succeed
    const goodUpdateRes = await fetch(`${PROJECTS_URL}/${project2._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgr1Token}`
      },
      body: JSON.stringify({ status: 'In Progress', priority: 'High' })
    });
    const updatedProject = await goodUpdateRes.json();
    if (goodUpdateRes.status !== 200 || updatedProject.status !== 'In Progress' || updatedProject.priority !== 'High') {
      throw new Error(`Failed to update project: ${JSON.stringify(updatedProject)}`);
    }
    console.log('✓ Project updated successfully by manager.');

    // 6. Test Delete Authorization safeguards & Soft-Delete logic
    console.log('\n6. Testing DELETE /api/projects/:id (Soft-Delete checks)...');
    
    // Manager 2 tries to delete Manager 1's project -> should fail with 403
    const badDeleteRes = await fetch(`${PROJECTS_URL}/${project2._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${mgr2Token}` }
    });
    if (badDeleteRes.status !== 403) {
      throw new Error(`Expected status 403 for unauthorized manager delete, got: ${badDeleteRes.status}`);
    }
    console.log('✓ Unauthorized project deletion blocked (Status 403) as expected.');

    // Manager 1 deletes their project (soft delete) -> should succeed
    const goodDeleteRes = await fetch(`${PROJECTS_URL}/${project2._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${mgr1Token}` }
    });
    if (goodDeleteRes.status !== 200) {
      throw new Error(`Failed to delete project: ${goodDeleteRes.status}`);
    }
    console.log('✓ Project deleted successfully.');

    // 7. Verify soft deletion visibility
    console.log('\n7. Verifying soft delete in list queries...');
    const verifyGetRes = await fetch(PROJECTS_URL, { headers: { Authorization: `Bearer ${adminToken}` } });
    const verifyProjects = await verifyGetRes.json();
    const deletedFound = verifyProjects.find(p => p._id === project2._id);
    if (deletedFound) {
      throw new Error('Soft-deleted project is still visible in list queries!');
    }
    console.log('✓ Deleted project is no longer visible in list query.');

    // 8. Direct database audit: ensure record remains intact but isDeleted is true
    console.log('\n8. Performing direct database audit...');
    const directProject = await Project.findById(project2._id);
    if (!directProject) {
      throw new Error('Project was permanently deleted from the database instead of soft-deleted!');
    }
    if (directProject.isDeleted !== true) {
      throw new Error(`Project document does not have isDeleted set to true: ${JSON.stringify(directProject)}`);
    }
    console.log('✓ Direct database audit passed. Project document is soft-deleted (isDeleted === true).');

    // Clean up
    console.log('\nCleaning up verification records...');
    await User.deleteMany({ email: { $in: testEmails } });
    await Project.deleteMany({ name: { $regex: '^Proj-' } });
    console.log('✓ Cleanup completed.');

    console.log('\n--- ALL PROJECT ENDPOINTS AND SOFT DELETES VERIFIED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    // Cleanup on failure
    await User.deleteMany({ email: { $in: testEmails } });
    await Project.deleteMany({ name: { $regex: '^Proj-' } });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

setTimeout(runProjectsVerification, 1000);
