import api from './api';

export const complaintService = {
  // Create complaint (handles FormData with optional file attachment)
  createComplaint: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get current student's complaints
  getMyComplaints: async (params) => {
    const response = await api.get('/complaints/my', { params });
    return response.data;
  },

  // Get all complaints (admin / staff)
  getAllComplaints: async (params) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  // Get assigned complaints (staff)
  getAssignedComplaints: async (params) => {
    const response = await api.get('/complaints/assigned', { params });
    return response.data;
  },

  // Get single complaint details
  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Update complaint (student editing draft or admin updating details)
  updateComplaint: async (id, formData) => {
    const response = await api.put(`/complaints/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update status (staff / admin)
  updateStatus: async (id, statusData) => {
    const response = await api.put(`/complaints/${id}/status`, statusData);
    return response.data;
  },

  // Assign complaint (admin / staff)
  assignComplaint: async (id, assignData) => {
    const response = await api.put(`/complaints/${id}/assign`, assignData);
    return response.data;
  },

  // Add comment
  addComment: async (id, comment) => {
    const response = await api.post(`/complaints/${id}/comments`, { comment });
    return response.data;
  },

  // Get history
  getComplaintHistory: async (id) => {
    const response = await api.get(`/complaints/${id}/history`);
    return response.data;
  },

  // Delete complaint
  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  // Dashboard statistics
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },

  getStaffDashboard: async () => {
    const response = await api.get('/dashboard/staff');
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Departments and categories
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/departments/categories/all');
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/departments/categories/new', data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/departments/categories/${id}`);
    return response.data;
  },

  // Users (Admin)
  getUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getStaffList: async () => {
    const response = await api.get('/users/staff/list');
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};
