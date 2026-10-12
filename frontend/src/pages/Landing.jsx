import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5 shadow-sm">
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark fw-bold px-3 py-2 mb-3 rounded-pill text-uppercase">
                <i className="bi bi-mortarboard-fill me-1"></i> Campus Governance & Facility Care
              </span>
              <h1 className="display-4 fw-bold mb-3">
                Campus Complaint & Issue Tracking System
              </h1>
              <p className="lead opacity-90 mb-4">
                A centralized, transparent grievance redressal portal for students, faculty, and campus administrators. Report hostel, lab, electrical, Wi-Fi, or maintenance issues and track resolutions in real-time.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {user ? (
                  <Link to={getDashboardPath()} className="btn btn-warning btn-lg fw-bold px-4 shadow">
                    <i className="bi bi-speedometer2 me-2"></i> Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-warning btn-lg fw-bold px-4 shadow">
                      <i className="bi bi-box-arrow-in-right me-2"></i> Portal Login
                    </Link>
                    <Link to="/register" className="btn btn-outline-light btn-lg fw-semibold px-4">
                      <i className="bi bi-person-plus-fill me-2"></i> Register Account
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="bg-white text-dark p-4 rounded-4 shadow-lg text-start">
                <h5 className="fw-bold text-primary border-bottom pb-2 mb-3">
                  <i className="bi bi-key-fill me-2"></i> Quick Demo Access
                </h5>
                <p className="small text-muted mb-3">
                  For college review & viva presentation, use these pre-seeded demo accounts:
                </p>
                <div className="vstack gap-2 small">
                  <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-danger me-2">Admin</span>
                      <strong className="font-monospace">admin@campus.com</strong>
                    </div>
                    <code className="text-secondary">Admin@123</code>
                  </div>
                  <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-primary me-2">Staff</span>
                      <strong className="font-monospace">staff@campus.com</strong>
                    </div>
                    <code className="text-secondary">Staff@123</code>
                  </div>
                  <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-success me-2">Student</span>
                      <strong className="font-monospace">student@campus.com</strong>
                    </div>
                    <code className="text-secondary">Student@123</code>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <Link to="/login" className="btn btn-outline-primary btn-sm w-100 fw-bold">
                    Go to Login Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Why Use Campus Grievance System?</h2>
            <p className="text-secondary">Digitizing university issue management from complaint submission to verified closure.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-3 text-center">
                <div className="mx-auto bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                  <i className="bi bi-send-check-fill fs-3"></i>
                </div>
                <h5 className="fw-bold">Easy Reporting</h5>
                <p className="text-muted small">
                  Students can quickly submit complaints categorized by hostel, library, Wi-Fi, lab, or electricity with photos and location details.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-3 text-center">
                <div className="mx-auto bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                  <i className="bi bi-clock-history fs-3"></i>
                </div>
                <h5 className="fw-bold">Lifecycle Tracking</h5>
                <p className="text-muted small">
                  Track full transparent status: Submitted &rarr; Under Review &rarr; Assigned &rarr; In Progress &rarr; Resolved &rarr; Closed.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-3 text-center">
                <div className="mx-auto bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                  <i className="bi bi-chat-dots-fill fs-3"></i>
                </div>
                <h5 className="fw-bold">Direct Communication</h5>
                <p className="text-muted small">
                  Real-time comments between student and maintenance officers ensure clear diagnostics and accountability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-3 bg-dark text-white text-center">
        <div className="container">
          <small className="opacity-75">
            &copy; 2026 Campus Complaint & Issue Tracking System | Technical Training Project
          </small>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
