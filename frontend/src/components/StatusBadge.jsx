import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'bg-secondary';

  switch (status) {
    case 'Submitted':
      badgeClass = 'bg-info text-dark';
      break;
    case 'Under Review':
      badgeClass = 'bg-warning text-dark';
      break;
    case 'Assigned':
      badgeClass = 'bg-primary text-white';
      break;
    case 'In Progress':
      badgeClass = 'bg-info text-white';
      break;
    case 'Resolved':
      badgeClass = 'bg-success text-white';
      break;
    case 'Closed':
      badgeClass = 'bg-dark text-white';
      break;
    case 'Rejected':
      badgeClass = 'bg-danger text-white';
      break;
    default:
      badgeClass = 'bg-secondary text-white';
  }

  return (
    <span
      className={`badge rounded-pill px-3 py-2 fw-semibold ${badgeClass}`}
      style={{ fontSize: '0.82rem', letterSpacing: '0.3px' }}
    >
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
