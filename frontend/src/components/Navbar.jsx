import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, unreadNotifications, fetchUnreadCount } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await complaintService.getNotifications();
      if (res.success && res.data) {
        setNotificationsList(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      loadNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const markAllRead = async () => {
    try {
      await complaintService.markAllNotificationsAsRead();
      fetchUnreadCount();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2 px-3">
      <div className="container-fluid">
        {/* Toggle Button for Sidebar */}
        {user && (
          <button
            className="btn btn-outline-light btn-sm me-3 border-0 d-lg-none"
            type="button"
            onClick={onToggleSidebar}
            title="Toggle Menu"
          >
            <i className="bi bi-list fs-4"></i>
          </button>
        )}

        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to={getDashboardLink()}>
          <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
            <i className="bi bi-shield-check fs-5"></i>
          </div>
          <span className="fs-5 tracking-wide">Campus Grievance Portal</span>
        </Link>

        {/* Right Nav Menu */}
        <div className="d-flex align-items-center ms-auto gap-3">
          {user ? (
            <>
              {/* Notification Dropdown */}
              <div className="dropdown position-relative">
                <button
                  className="btn btn-outline-light btn-sm rounded-circle position-relative p-2"
                  type="button"
                  onClick={toggleNotifications}
                  title="Notifications"
                >
                  <i className="bi bi-bell fs-6"></i>
                  {unreadNotifications > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      <span className="visually-hidden">unread notifications</span>
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="dropdown-menu dropdown-menu-end show shadow-lg p-0 position-absolute end-0 mt-2"
                    style={{ width: '320px', maxHeight: '420px', overflowY: 'auto', zIndex: 1050 }}
                  >
                    <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                      <span className="fw-bold small text-uppercase">Notifications</span>
                      {unreadNotifications > 0 && (
                        <button
                          className="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                          style={{ fontSize: '0.78rem' }}
                          onClick={markAllRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="list-group list-group-flush">
                      {loadingNotifs ? (
                        <div className="p-3 text-center text-muted small">Loading...</div>
                      ) : notificationsList.length === 0 ? (
                        <div className="p-4 text-center text-muted small">No notifications yet</div>
                      ) : (
                        notificationsList.map((n) => (
                          <div
                            key={n._id}
                            className={`list-group-item list-group-item-action p-2 px-3 small ${
                              !n.isRead ? 'bg-light fw-semibold' : ''
                            }`}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="text-primary fw-bold" style={{ fontSize: '0.78rem' }}>
                                {n.title}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Identity and Role Badge */}
              <div className="d-none d-md-flex flex-column text-end text-light">
                <span className="fw-semibold small leading-none">{user.name}</span>
                <span className="text-light opacity-75 text-capitalize" style={{ fontSize: '0.72rem' }}>
                  {user.role} {user.studentId ? `(${user.studentId})` : ''}
                </span>
              </div>

              {/* Logout Button */}
              <button
                className="btn btn-light btn-sm fw-medium d-flex align-items-center gap-1 shadow-sm"
                onClick={handleLogout}
                title="Sign out"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span className="d-none d-sm-inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light btn-sm px-3">
                Login
              </Link>
              <Link to="/register" className="btn btn-light btn-sm px-3 fw-medium">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
