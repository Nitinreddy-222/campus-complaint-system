import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loading from '../components/Loading';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAssignedComplaints({
        status,
        priority,
        search,
        page,
        limit: 10
      });
      if (res.success) {
        setComplaints(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load assigned complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [status, priority, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAssigned();
  };

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Assigned Department Grievances</h3>
        <p className="text-muted small mb-0">Issues assigned to you or your department queue for investigation & resolution</p>
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
                placeholder="Search ticket ID, title, location..."
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
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="col-md-2 text-md-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setStatus('All');
                setPriority('All');
                setSearch('');
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Assigned Table */}
      {loading ? (
        <Loading message="Loading assigned issues..." />
      ) : complaints.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
          No complaints found in your active queue.
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Ticket ID</th>
                  <th>Title & Location</th>
                  <th>Student</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="font-monospace fw-bold text-primary small">
                        {c.complaintId}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }} title={c.title}>
                        {c.title}
                      </div>
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '240px' }}>
                        <i className="bi bi-geo-alt me-1"></i>
                        {c.location}
                      </small>
                    </td>
                    <td>
                      <div className="small fw-semibold">{c.createdBy?.name || 'Student'}</div>
                      <small className="text-muted">{c.createdBy?.studentId || c.createdBy?.phone}</small>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="small text-muted">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="btn btn-sm btn-primary fw-medium px-3 rounded-pill"
                      >
                        Take Action
                      </Link>
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
    </div>
  );
};

export default AssignedComplaints;
