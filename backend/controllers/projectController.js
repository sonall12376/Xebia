import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Get projects list based on role
// @route   GET /api/projects
// @access  Private (Admin, Manager, Employee)
export const getProjects = async (req, res) => {
  try {
    let query = { isDeleted: { $ne: true } };

    if (req.user.role === 'Manager') {
      query.managerId = req.user._id;
    } else if (req.user.role === 'Employee') {
      query.employeeIds = req.user._id;
    }

    const projects = await Project.find(query)
      .populate('managerId', 'name email')
      .populate('employeeIds', 'name email department designation')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin, Manager)
export const createProject = async (req, res) => {
  const { name, description, startDate, endDate, status, priority, managerId, employeeIds } = req.body;

  try {
    // Basic date validations
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after the start date' });
    }

    let assignedManagerId = req.user._id;

    // Admin can assign any manager, Manager is locked to themselves
    if (req.user.role === 'Admin') {
      if (!managerId) {
        return res.status(400).json({ message: 'Please specify a project manager' });
      }
      const mgr = await User.findById(managerId);
      if (!mgr || mgr.role !== 'Manager') {
        return res.status(400).json({ message: 'Selected user is not a valid Manager' });
      }
      assignedManagerId = managerId;
    }

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      status: status || 'Not Started',
      priority: priority || 'Medium',
      managerId: assignedManagerId,
      employeeIds: employeeIds || [],
      isDeleted: false
    });

    const populatedProject = await Project.findById(project._id)
      .populate('managerId', 'name email')
      .populate('employeeIds', 'name email department designation');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Manager)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Role checks: Manager can only modify their own projects
    if (req.user.role === 'Manager' && !project.managerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied: You do not manage this project' });
    }

    // Date validations
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
        return res.status(400).json({ message: 'End date must be after the start date' });
      }
    } else if (req.body.startDate && new Date(req.body.startDate) > new Date(project.endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after existing project end date' });
    } else if (req.body.endDate && new Date(project.startDate) > new Date(req.body.endDate)) {
      return res.status(400).json({ message: 'End date cannot be before existing project start date' });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description !== undefined ? req.body.description : project.description;
    project.startDate = req.body.startDate || project.startDate;
    project.endDate = req.body.endDate || project.endDate;
    project.status = req.body.status || project.status;
    project.priority = req.body.priority || project.priority;
    project.employeeIds = req.body.employeeIds !== undefined ? req.body.employeeIds : project.employeeIds;

    // Only Admin can transfer project manager ownership
    if (req.user.role === 'Admin' && req.body.managerId) {
      const mgr = await User.findById(req.body.managerId);
      if (!mgr || mgr.role !== 'Manager') {
        return res.status(400).json({ message: 'Selected user is not a valid Manager' });
      }
      project.managerId = req.body.managerId;
    }

    const updatedProject = await project.save();
    
    const populatedProject = await Project.findById(updatedProject._id)
      .populate('managerId', 'name email')
      .populate('employeeIds', 'name email department designation');

    res.json(populatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft-delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Manager)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Role checks: Manager can only delete their own projects
    if (req.user.role === 'Manager' && !project.managerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied: You do not manage this project' });
    }

    // Soft delete
    project.isDeleted = true;
    await project.save();

    res.json({ message: 'Project successfully soft-deleted (historical review records preserved)' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees (for checklist assignment dropdown)
// @route   GET /api/projects/employees
// @access  Private (Admin, Manager)
export const getProjectEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' })
      .select('name email department designation');
    res.json(employees);
  } catch (error) {
    console.error('Fetch project employees error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all managers (for manager dropdown)
// @route   GET /api/projects/managers
// @access  Private (Admin, Manager)
export const getProjectManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'Manager' })
      .select('name email');
    res.json(managers);
  } catch (error) {
    console.error('Fetch project managers error:', error);
    res.status(500).json({ message: error.message });
  }
};
