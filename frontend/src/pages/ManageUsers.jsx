import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import Loading from '../components/Loading';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Edit User Modal
  const [editUser, setEditUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    department: '',
    phone: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getUsers({
        search,
        role,
        page,
        limit: 10
      });
      if (res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await complaintService.getDepartments();
        if (res.success) setDepartments(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [role, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setEditFormData({
      name: u.name,
      role: u.role,
      department: u.department?._id || '',
      phone: u.phone || '',
      isActive: u.isActive
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await complaintService.updateUser(editUser._id, editFormData);
      if (res.success) {
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
      const res = await complaintService.deleteUser(id);
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">User & Role Management</h3>
        <p className="text-muted small mb-0">Oversee student credentials, assign staff roles, and activate/deactivate accounts</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search user by name, email, student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Roles</option>
              <option value="student">Students</option>
              <option value="staff">Staff / Faculty</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="col-md-4 text-md-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearch('');
                setRole('All');
                setPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <Loading message="Loading registered campus users..." />
      ) : users.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
          No users found matching your search.
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>User Details</th>
                  <th>ID / Roll No</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="fw-bold text-dark">{u.name}</div>
                      <small className="text-muted font-monospace">{u.email}</small>
                    </td>
                    <td className="small font-monospace">
                      {u.studentId || u.employeeId || '-'}
                    </td>
                    <td className="small text-secondary">
                      {u.department?.name || 'General'}
                    </td>
                    <td>
                      <span
                        className={`badge text-uppercase ${
                          u.role === 'admin'
                            ? 'bg-danger'
                            : u.role === 'staff'
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                          Active
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="small text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEditModal(u)}
                        title="Edit User"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        title="Delete User"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
              <span className="small text-muted">
                Showing page {pagination.page} of {pagination.pages}
              </span>
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-secondary"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Edit User Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEditUser(null)}
                ></button>
              </div>
              <form onSubmit={handleSaveUser}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Role</label>
                    <select
                      className="form-select"
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Department</label>
                    <select
                      className="form-select"
                      value={editFormData.department}
                      onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    >
                      <option value="">No Department / General</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-check form-switch mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activeSwitch"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold small" htmlFor="activeSwitch">
                      Account Is Active
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={saving}>
                    {saving ? 'Saving...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
