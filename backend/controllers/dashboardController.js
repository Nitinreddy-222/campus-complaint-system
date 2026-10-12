const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get dashboard statistics for Student
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const total = await Complaint.countDocuments({ createdBy: userId });
    const pending = await Complaint.countDocuments({
      createdBy: userId,
      status: { $in: ['Submitted', 'Under Review'] }
    });
    const inProgress = await Complaint.countDocuments({
      createdBy: userId,
      status: { $in: ['Assigned', 'In Progress'] }
    });
    const resolved = await Complaint.countDocuments({
      createdBy: userId,
      status: { $in: ['Resolved', 'Closed'] }
    });
    const rejected = await Complaint.countDocuments({
      createdBy: userId,
      status: 'Rejected'
    });

    const recentComplaints = await Complaint.find({ createdBy: userId })
      .populate('department', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Status breakdown for charts
    const statusCounts = {
      Submitted: await Complaint.countDocuments({ createdBy: userId, status: 'Submitted' }),
      'Under Review': await Complaint.countDocuments({ createdBy: userId, status: 'Under Review' }),
      Assigned: await Complaint.countDocuments({ createdBy: userId, status: 'Assigned' }),
      'In Progress': await Complaint.countDocuments({ createdBy: userId, status: 'In Progress' }),
      Resolved: await Complaint.countDocuments({ createdBy: userId, status: 'Resolved' }),
      Closed: await Complaint.countDocuments({ createdBy: userId, status: 'Closed' }),
      Rejected: rejected
    };

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total,
          pending,
          inProgress,
          resolved,
          rejected
        },
        statusCounts,
        recentComplaints
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for Staff
// @route   GET /api/dashboard/staff
// @access  Private (Staff, Admin)
const getStaffStats = async (req, res, next) => {
  try {
    const conditions = [{ assignedTo: req.user._id }];
    if (req.user.department) {
      conditions.push({ department: req.user.department });
    }
    const staffQuery = { $or: conditions };

    const totalAssigned = await Complaint.countDocuments(staffQuery);
    const pending = await Complaint.countDocuments({
      ...staffQuery,
      status: { $in: ['Submitted', 'Under Review', 'Assigned'] }
    });
    const inProgress = await Complaint.countDocuments({
      ...staffQuery,
      status: 'In Progress'
    });
    const highPriority = await Complaint.countDocuments({
      ...staffQuery,
      priority: { $in: ['High', 'Critical'] },
      status: { $nin: ['Resolved', 'Closed'] }
    });
    const resolved = await Complaint.countDocuments({
      ...staffQuery,
      status: { $in: ['Resolved', 'Closed'] }
    });

    const recentComplaints = await Complaint.find(staffQuery)
      .populate('createdBy', 'name email studentId phone')
      .populate('department', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    const statusCounts = {
      Assigned: await Complaint.countDocuments({ ...staffQuery, status: 'Assigned' }),
      'In Progress': await Complaint.countDocuments({ ...staffQuery, status: 'In Progress' }),
      Resolved: await Complaint.countDocuments({ ...staffQuery, status: 'Resolved' }),
      'Under Review': await Complaint.countDocuments({ ...staffQuery, status: 'Under Review' })
    };

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalAssigned,
          pending,
          inProgress,
          highPriority,
          resolved
        },
        statusCounts,
        recentComplaints
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for Admin
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalDepartments = await Department.countDocuments();

    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: { $in: ['Submitted', 'Under Review'] }
    });
    const inProgressComplaints = await Complaint.countDocuments({
      status: { $in: ['Assigned', 'In Progress'] }
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: { $in: ['Resolved', 'Closed'] }
    });
    const criticalComplaints = await Complaint.countDocuments({
      priority: 'Critical',
      status: { $nin: ['Resolved', 'Closed'] }
    });

    // Breakdown by category
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Breakdown by department
    const departmentStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo'
        }
      },
      {
        $project: {
          name: {
            $ifNull: [{ $arrayElemAt: ['$deptInfo.name', 0] }, 'Unassigned']
          },
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Breakdown by status
    const statusDistribution = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Breakdown by priority
    const priorityDistribution = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Recent complaints
    const recentComplaints = await Complaint.find()
      .populate('createdBy', 'name email studentId')
      .populate('assignedTo', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalStudents,
          totalStaff,
          totalDepartments,
          totalComplaints,
          pendingComplaints,
          inProgressComplaints,
          resolvedComplaints,
          criticalComplaints
        },
        categoryStats,
        departmentStats,
        statusDistribution,
        priorityDistribution,
        recentComplaints
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentStats,
  getStaffStats,
  getAdminStats
};
