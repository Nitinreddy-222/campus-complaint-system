const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Student endpoints
router.post('/', protect, upload.single('attachment'), createComplaint);
router.get('/my', protect, getMyComplaints);

// Staff endpoints
router.get('/assigned', protect, authorize('staff', 'admin'), getAssignedComplaints);

// Admin/Staff view all
router.get('/', protect, authorize('admin', 'staff'), getAllComplaints);

// Specific complaint operations
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, upload.single('attachment'), updateComplaint);
router.delete('/:id', protect, deleteComplaint);

// Status update and assignment
router.put('/:id/status', protect, authorize('staff', 'admin'), updateComplaintStatus);
router.put('/:id/assign', protect, authorize('staff', 'admin'), assignComplaint);

// Comments & History
router.post('/:id/comments', protect, addComment);
router.get('/:id/history', protect, getComplaintHistory);

module.exports = router;
