import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const ComplaintCard = ({ complaint }) => {
  return (
    <div className="card shadow-sm border-0 h-100 rounded-3 hover-shadow transition">
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-light text-primary border border-primary-subtle fw-bold font-monospace px-2 py-1">
            {complaint.complaintId}
          </span>
          <StatusBadge status={complaint.status} />
        </div>

        <h5 className="card-title fw-bold text-dark mt-2 mb-2 text-truncate" title={complaint.title}>
          {complaint.title}
        </h5>

        <p className="card-text text-secondary small flex-grow-1 line-clamp-2" style={{ minHeight: '2.4rem' }}>
          {complaint.description}
        </p>

        <div className="d-flex flex-wrap gap-2 align-items-center mt-3 pt-3 border-top">
          <PriorityBadge priority={complaint.priority} />
          <span className="badge bg-light text-secondary border">
            <i className="bi bi-tag-fill me-1"></i>
            {complaint.category}
          </span>
          <span className="badge bg-light text-secondary border text-truncate" style={{ maxWidth: '140px' }}>
            <i className="bi bi-geo-alt-fill me-1"></i>
            {complaint.location}
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>
            <i className="bi bi-clock me-1"></i>
            {new Date(complaint.createdAt).toLocaleDateString()}
          </span>
          <Link
            to={`/complaints/${complaint._id}`}
            className="btn btn-outline-primary btn-sm fw-medium px-3 rounded-pill"
          >
            Details <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
