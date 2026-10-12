import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phone: '',
    department: '',
    role: 'student'
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await complaintService.getDepartments();
        if (res.success) {
          setDepartments(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load departments list:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
        phone: formData.phone,
        department: formData.department || null,
        role: formData.role
      });

      const user = res.data;
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-7">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-primary text-white text-center py-4 px-3">
              <div className="bg-white text-primary rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
                <i className="bi bi-person-plus-fill fs-2"></i>
              </div>
              <h4 className="fw-bold mb-1">Create Student Account</h4>
              <p className="small mb-0 opacity-75">Register to submit grievances and track resolutions</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Aarav Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Campus Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="e.g. aarav@campus.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Student ID / Roll No</label>
                    <input
                      type="text"
                      name="studentId"
                      className="form-control"
                      placeholder="e.g. STU-2024-CS-010"
                      value={formData.studentId}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="e.g. +91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Branch / Department</label>
                    <select
                      name="department"
                      className="form-select"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select your department (Optional)</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Role</label>
                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff / Faculty</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Password *</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Re-type password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted small">Already have an account? </span>
                <Link to="/login" className="fw-semibold small text-decoration-none">
                  Sign In here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
