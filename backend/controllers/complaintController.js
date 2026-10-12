const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Department = require('../models/Department');
const generateComplaintId = require('../utils/generateComplaintId');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Student, Staff, Admin)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority, department } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, and location.'
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters long.'
      });
    }

    const complaintId = await generateComplaintId();

    let attachmentPath = '';
    if (req.file) {
      attachmentPath = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create({
      complaintId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      priority: priority || 'Medium',
      department: department || null,
      attachment: attachmentPath,
      createdBy: req.user._id,
      status: 'Submitted'
    });

    // Create initial history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      previousStatus: 'None',
      newStatus: 'Submitted',
      changedBy: req.user._id,
      comment: 'Complaint submitted by student',
      changedAt: new Date()
    });

    // Create confirmation notification for the user
    await Notification.create({
      recipient: req.user._id,
      complaint: complaint._id,
      title: 'Complaint Submitted',
      message: `Your complaint #${complaint.complaintId} has been successfully submitted and is under review.`,
      type: 'new_complaint'
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email studentId')
      .populate('department', 'name');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      data: populatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's complaints
// @route   GET /api/complaints/my
// @access  Private
const getMyComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, search, page = 1, limit = 10 } = req.query;

    const query = { createdBy: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (category && category !== 'All') query.category = category;

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('department', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (Admin / Staff)
// @route   GET /api/complaints
// @access  Private (Staff, Admin)
const getAllComplaints = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (category && category !== 'All') query.category = category;
    if (department && department !== 'All') query.department = department;

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email studentId phone')
      .populate('assignedTo', 'name email')
      .populate('department', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints assigned to logged in staff or their department
// @route   GET /api/complaints/assigned
// @access  Private (Staff, Admin)
const getAssignedComplaints = async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;

    // Assigned directly to staff member OR assigned to staff's department
    const conditions = [{ assignedTo: req.user._id }];
    if (req.user.department) {
      conditions.push({ department: req.user.department });
    }

    const query = { $or: conditions };

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;

    if (search) {
      query.$and = [
        {
          $or: [
            { complaintId: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email studentId phone')
      .populate('assignedTo', 'name email')
      .populate('department', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email studentId phone')
      .populate('assignedTo', 'name email phone employeeId')
      .populate('department', 'name description head')
      .populate('comments.user', 'name role email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Role check: Students can only view their own complaints
    if (
      req.user.role === 'student' &&
      complaint.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint.'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint (Student editing pending complaint, or Admin)
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Students can only update their own complaints and only when status is 'Submitted'
    if (req.user.role === 'student') {
      if (complaint.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to edit this complaint.'
        });
      }
      if (complaint.status !== 'Submitted') {
        return res.status(400).json({
          success: false,
          message: `Cannot edit complaint once it is in '${complaint.status}' status.`
        });
      }
    }

    const { title, description, category, location, priority, department } = req.body;

    if (title) complaint.title = title.trim();
    if (description) complaint.description = description.trim();
    if (category) complaint.category = category.trim();
    if (location) complaint.location = location.trim();

    // Staff or admin can modify priority/department directly
    if (['admin', 'staff'].includes(req.user.role)) {
      if (priority) complaint.priority = priority;
      if (department) complaint.department = department;
    }

    if (req.file) {
      complaint.attachment = `/uploads/${req.file.filename}`;
    }

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully.',
      data: updatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Staff, Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, comment, priority } = req.body;

    const allowedStatuses = [
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed',
      'Rejected'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    const previousStatus = complaint.status;
    complaint.status = status;

    if (priority) {
      complaint.priority = priority;
    }

    if (status === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    } else if (status !== 'Resolved' && status !== 'Closed') {
      complaint.resolvedAt = null;
    }

    await complaint.save();

    // Log in ComplaintHistory
    await ComplaintHistory.create({
      complaint: complaint._id,
      previousStatus,
      newStatus: status,
      changedBy: req.user._id,
      comment: comment || `Status updated from ${previousStatus} to ${status}`,
      changedAt: new Date()
    });

    // Create Notification for complaint owner
    await Notification.create({
      recipient: complaint.createdBy,
      sender: req.user._id,
      complaint: complaint._id,
      title: 'Status Updated',
      message: `Your complaint #${complaint.complaintId} status changed from "${previousStatus}" to "${status}".`,
      type: 'status_change'
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status} successfully.`,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to staff and/or department
// @route   PUT /api/complaints/:id/assign
// @access  Private (Staff, Admin)
const assignComplaint = async (req, res, next) => {
  try {
    const { assignedTo, department, comment } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    if (department) complaint.department = department;
    if (assignedTo) complaint.assignedTo = assignedTo;

    const previousStatus = complaint.status;
    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    await complaint.save();

    let staffName = 'Staff';
    if (assignedTo) {
      const staffUser = await User.findById(assignedTo);
      if (staffUser) staffName = staffUser.name;
    }

    // Log history
    await ComplaintHistory.create({
      complaint: complaint._id,
      previousStatus,
      newStatus: complaint.status,
      changedBy: req.user._id,
      comment: comment || `Assigned to ${staffName}`,
      changedAt: new Date()
    });

    // Notify assigned staff
    if (assignedTo) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        complaint: complaint._id,
        title: 'New Complaint Assigned',
        message: `Complaint #${complaint.complaintId} (${complaint.title}) has been assigned to you.`,
        type: 'assigned'
      });
    }

    // Notify student owner
    await Notification.create({
      recipient: complaint.createdBy,
      sender: req.user._id,
      complaint: complaint._id,
      title: 'Complaint Assigned',
      message: `Your complaint #${complaint.complaintId} has been assigned to ${staffName} for resolution.`,
      type: 'assigned'
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email studentId')
      .populate('assignedTo', 'name email')
      .populate('department', 'name');

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully.',
      data: populatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    const newComment = {
      user: req.user._id,
      comment: comment.trim(),
      createdAt: new Date()
    };

    complaint.comments.push(newComment);
    await complaint.save();

    // Notify the other party
    // If student commented, notify assigned staff / admin
    if (req.user.role === 'student' && complaint.assignedTo) {
      await Notification.create({
        recipient: complaint.assignedTo,
        sender: req.user._id,
        complaint: complaint._id,
        title: 'New Comment on Complaint',
        message: `${req.user.name} added a comment on complaint #${complaint.complaintId}.`,
        type: 'comment'
      });
    } else if (req.user.role !== 'student') {
      // If staff/admin commented, notify student
      await Notification.create({
        recipient: complaint.createdBy,
        sender: req.user._id,
        complaint: complaint._id,
        title: 'New Response on Complaint',
        message: `${req.user.name} (${req.user.role}) added a comment on complaint #${complaint.complaintId}.`,
        type: 'comment'
      });
    }

    const updated = await Complaint.findById(req.params.id)
      .populate('comments.user', 'name role email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: updated.comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint lifecycle history
// @route   GET /api/complaints/:id/history
// @access  Private
const getComplaintHistory = async (req, res, next) => {
  try {
    const history = await ComplaintHistory.find({ complaint: req.params.id })
      .populate('changedBy', 'name role email')
      .sort({ changedAt: 1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin or Student if 'Submitted')
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Check authority: Admin can delete any, Student can only cancel/delete if Submitted
    if (req.user.role === 'student') {
      if (complaint.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this complaint.'
        });
      }
      if (complaint.status !== 'Submitted') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete complaint after it is being reviewed or processed.'
        });
      }
    }

    await ComplaintHistory.deleteMany({ complaint: complaint._id });
    await Notification.deleteMany({ complaint: complaint._id });
    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getAssignedComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  assignComplaint,
  addComment,
  getComplaintHistory,
  deleteComplaint
};
