const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCategories,
  createCategory,
  deleteCategory
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Departments
router.get('/', getDepartments);
router.post('/', protect, authorize('admin'), createDepartment);
router.put('/:id', protect, authorize('admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

// Categories
router.get('/categories/all', getCategories);
router.post('/categories/new', protect, authorize('admin'), createCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
