const express = require('express');
const router = express.Router();
const {
  getStudentStats,
  getStaffStats,
  getAdminStats
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/student', protect, getStudentStats);
router.get('/staff', protect, authorize('staff', 'admin'), getStaffStats);
router.get('/stats', protect, authorize('admin'), getAdminStats);

module.exports = router;
