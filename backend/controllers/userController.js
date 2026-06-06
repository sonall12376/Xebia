import User from '../models/User.js';
import Project from '../models/Project.js';

// @desc    Get all users (excluding Admins)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'Admin' } })
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    designation,
    contact,
    profilePicture,
    managerId,
    joiningDate,
  } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      department: department || '',
      designation: designation || '',
      contact: contact || '',
      profilePicture: profilePicture || '',
      managerId: managerId || null,
      joiningDate: joiningDate || Date.now(),
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      contact: user.contact,
      profilePicture: user.profilePicture,
      managerId: user.managerId,
      joiningDate: user.joiningDate,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if updating email, and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const emailTaken = await User.findOne({ email: req.body.email });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email already taken by another account' });
      }
      user.email = req.body.email;
    }

    user.name = req.body.name || user.name;
    user.role = req.body.role || user.role;
    user.department = req.body.department !== undefined ? req.body.department : user.department;
    user.designation = req.body.designation !== undefined ? req.body.designation : user.designation;
    user.contact = req.body.contact !== undefined ? req.body.contact : user.contact;
    user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;
    user.managerId = req.body.managerId !== undefined ? req.body.managerId : user.managerId;
    
    if (req.body.joiningDate) {
      user.joiningDate = req.body.joiningDate;
    }

    // Hash password if updating password
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      designation: updatedUser.designation,
      contact: updatedUser.contact,
      profilePicture: updatedUser.profilePicture,
      managerId: updatedUser.managerId,
      joiningDate: updatedUser.joiningDate,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Remove references to this manager from reports
    await User.updateMany({ managerId: user._id }, { managerId: null });

    // 2. Remove employee references from assigned projects
    await Project.updateMany({ employeeIds: user._id }, { $pull: { employeeIds: user._id } });

    // 3. Remove manager references from projects
    await Project.updateMany({ managerId: user._id }, { managerId: null });

    // 4. Delete the user document
    await User.deleteOne({ _id: user._id });

    res.json({ message: 'User successfully removed from system database.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with role 'Manager' (for assignment dropdown)
// @route   GET /api/users/managers
// @access  Private/Admin
export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'Manager' }).select('name email');
    res.json(managers);
  } catch (error) {
    console.error('Fetch managers error:', error);
    res.status(500).json({ message: error.message });
  }
};
