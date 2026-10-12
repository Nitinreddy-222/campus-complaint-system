import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      const user = res.data;

      // Navigate based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demo/viva testing
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-primary text-white text-center py-4 px-3">
              <div className="bg-white text-primary rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
                <i className="bi bi-person-lock fs-2"></i>
              </div>
              <h4 className="fw-bold mb-1">Campus Portal Sign In</h4>
              <p className="small mb-0 opacity-75">Access student grievance & resolution dashboard</p>
            </div>

            <div className="card-body p-4">
              {location.search.includes('expired=true') && (
                <div className="alert alert-warning py-2 small" role="alert">
                  Your session expired. Please sign in again.
                </div>
              )}

              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. student@campus.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-secondary">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-shield-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In to Account'
                  )}
                </button>
              </form>

              {/* Quick Demo Autofill Buttons */}
              <div className="mt-4 pt-3 border-top">
                <span className="text-muted d-block text-center small fw-semibold mb-2">
                  Demo Fast Login (Viva Evaluator)
                </span>
                <div className="d-flex justify-content-between gap-1">
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin@campus.com', 'Admin@123')}
                    className="btn btn-outline-danger btn-sm flex-fill fw-medium"
                    title="Auto-fill Admin"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('staff@campus.com', 'Staff@123')}
                    className="btn btn-outline-primary btn-sm flex-fill fw-medium"
                    title="Auto-fill Staff"
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('student@campus.com', 'Student@123')}
                    className="btn btn-outline-success btn-sm flex-fill fw-medium"
                    title="Auto-fill Student"
                  >
                    Student
                  </button>
                </div>
              </div>

              <div className="text-center mt-4">
                <span className="text-muted small">New to the campus portal? </span>
                <Link to="/register" className="fw-semibold small text-decoration-none">
                  Register as Student
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
