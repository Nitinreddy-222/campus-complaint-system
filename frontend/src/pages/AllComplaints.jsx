import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loading from '../components/Loading';

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [department, setDepartment] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAllComplaints({
        status,
        priority,
        category,
        department,
        search,
        sortBy,
        sortOrder,
        page,
        limit: 10
      });
      if (res.success) {
        setComplaints(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load all complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await complaintService.getDepartments();
        if (res.success) setDepartments(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadDepts();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [status, priority, category, department, page, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Campus Grievance Registry</h3>
          <p className="text-muted small mb-0">Search, triage, reassign, and track all institutional complaints</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="ID, title, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit">
                Find
              </button>
            </div>
          </div>

          <div className="col-sm-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="col-sm-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="col-sm-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-sm-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="priority-desc">Priority</option>
            </select>
          </div>

          <div className="col-md-1 text-md-end">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => {
                setStatus('All');
                setPriority('All');
                setCategory('All');
                setDepartment('All');
                setSearch('');
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Complaints List Table */}
      {loading ? (
        <Loading message="Fetching complaints registry..." />
      ) : complaints.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
          No complaints found matching the criteria.
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Ticket ID</th>
                  <th>Title & Location</th>
                  <th>Student Info</th>
                  <th>Department / Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Logged Date</th>
                  <th>Action</th>
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
                      <div className="small fw-semibold">{c.createdBy?.name || 'Unknown'}</div>
                      <small className="text-muted font-monospace">{c.createdBy?.email}</small>
                    </td>
                    <td>
                      <div className="small fw-medium text-dark">{c.department?.name || 'Unassigned'}</div>
                      <small className="text-muted">{c.assignedTo?.name || 'No Officer'}</small>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="small text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to={`/complaints/${c._id}`}
                        className="btn btn-sm btn-outline-primary fw-medium px-3 rounded-pill"
                      >
                        Inspect
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
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total records)
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

export default AllComplaints;
