import React from 'react';

const PriorityBadge = ({ priority }) => {
  let badgeClass = 'bg-secondary';
  let icon = 'bi-flag';

  switch (priority) {
    case 'Critical':
      badgeClass = 'bg-danger text-white';
      icon = 'bi-exclamation-triangle-fill';
      break;
    case 'High':
      badgeClass = 'bg-warning text-dark';
      icon = 'bi-exclamation-circle-fill';
      break;
    case 'Medium':
      badgeClass = 'bg-primary text-white';
      icon = 'bi-dash-circle';
      break;
    case 'Low':
      badgeClass = 'bg-light text-dark border';
      icon = 'bi-arrow-down-circle';
      break;
    default:
      badgeClass = 'bg-secondary text-white';
  }

  return (
    <span
      className={`badge rounded-pill px-2 py-1 fw-medium ${badgeClass}`}
      style={{ fontSize: '0.78rem' }}
    >
      <i className={`bi ${icon} me-1`}></i>
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
