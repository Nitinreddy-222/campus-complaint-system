import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loading from '../components/Loading';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints({
        status,
        priority,
        category,
        search,
        page,
        limit: 8
      });
      if (res.success) {
        setComplaints(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status, priority, category, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Grievances & Complaints</h3>
          <p className="text-muted small mb-0">Track all campus tickets you have registered</p>
        </div>
        <Link to="/student/submit" className="btn btn-primary fw-bold px-3 py-2 rounded-pill shadow-sm">
          <i className="bi bi-plus-circle me-1"></i> New Complaint
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by ID, keyword, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit">
                Search
              </button>
            </div>
          </div>

          <div className="col-sm-4 col-md-2">
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

          <div className="col-sm-4 col-md-2">
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

          <div className="col-sm-4 col-md-2">
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Categories</option>
              <option value="Hostel">Hostel</option>
              <option value="Classroom">Classroom</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Library">Library</option>
              <option value="Internet/Wi-Fi">Internet/Wi-Fi</option>
              <option value="Electricity">Electricity</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div className="col-md-2 text-md-end">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => {
                setStatus('All');
                setPriority('All');
                setCategory('All');
                setSearch('');
                setPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {/* Complaints List / Table */}
      {loading ? (
        <Loading message="Fetching your complaints..." />
      ) : complaints.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <i className="bi bi-folder2-open text-muted fs-1 mb-3"></i>
          <h5 className="fw-bold text-secondary">No complaints found</h5>
          <p className="text-muted small mb-3">You don't have any complaints matching the filter criteria.</p>
          <div>
            <Link to="/student/submit" className="btn btn-primary btn-sm px-4 rounded-pill">
              Submit New Complaint
            </Link>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Ticket ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
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
                      <div className="fw-semibold text-dark">{c.title}</div>
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '280px' }}>
                        <i className="bi bi-geo-alt me-1"></i>
                        {c.location}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{c.category}</span>
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
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
              <span className="small text-muted">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
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

export default MyComplaints;
