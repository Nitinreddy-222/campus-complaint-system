import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const getNavLinks = () => {
    if (role === 'student') {
      return [
        { to: '/student/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
        { to: '/student/submit', icon: 'bi-plus-circle-fill', label: 'Submit Complaint' },
        { to: '/student/my-complaints', icon: 'bi-folder2-open', label: 'My Complaints' },
        { to: '/profile', icon: 'bi-person-badge', label: 'My Profile' }
      ];
    } else if (role === 'staff') {
      return [
        { to: '/staff/dashboard', icon: 'bi-speedometer2', label: 'Staff Dashboard' },
        { to: '/staff/assigned', icon: 'bi-inbox-fill', label: 'Assigned Complaints' },
        { to: '/complaints', icon: 'bi-card-list', label: 'All Campus Issues' },
        { to: '/profile', icon: 'bi-person-badge', label: 'My Profile' }
      ];
    } else if (role === 'admin') {
      return [
        { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Admin Dashboard' },
        { to: '/admin/complaints', icon: 'bi-card-checklist', label: 'All Complaints' },
        { to: '/admin/users', icon: 'bi-people-fill', label: 'Manage Users' },
        { to: '/admin/departments', icon: 'bi-buildings', label: 'Departments & Tags' },
        { to: '/admin/reports', icon: 'bi-graph-up-arrow', label: 'Reports & Analytics' },
        { to: '/profile', icon: 'bi-person-badge', label: 'Admin Profile' }
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar container */}
      <aside
        className={`bg-white border-end shadow-sm d-flex flex-column transition-all ${
          isOpen ? 'd-block' : 'd-none d-lg-flex'
        }`}
        style={{
          width: '260px',
          minWidth: '260px',
          minHeight: 'calc(100vh - 58px)',
          position: isOpen ? 'fixed' : 'relative',
          top: isOpen ? '58px' : '0',
          left: 0,
          zIndex: 1045
        }}
      >
        {/* User Card in Sidebar */}
        <div className="p-3 bg-light border-bottom">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{ width: 44, height: 44, fontSize: '1.2rem' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h6 className="mb-0 text-truncate fw-bold">{user.name}</h6>
              <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.68rem' }}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="p-3 flex-grow-1">
          <div className="text-muted text-uppercase fw-bold mb-2 ps-2" style={{ fontSize: '0.68rem', letterSpacing: '0.8px' }}>
            Main Menu
          </div>
          <ul className="nav nav-pills flex-column gap-1">
            {navLinks.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 px-3 py-2 fw-medium rounded-3 ${
                      isActive ? 'active bg-primary text-white shadow-sm' : 'text-dark hover-light'
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 992) onClose();
                  }}
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* System info footer in sidebar */}
        <div className="p-3 border-top bg-light text-center">
          <span className="text-muted d-block small" style={{ fontSize: '0.72rem' }}>
            Campus Grievance System v1.0
          </span>
          <span className="text-secondary fw-semibold small" style={{ fontSize: '0.7rem' }}>
            Academic Year 2026
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
