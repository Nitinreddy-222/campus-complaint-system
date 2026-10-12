import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loading from '../components/Loading';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status modal state (Staff/Admin)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assign modal state (Staff/Admin)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [assignComment, setAssignComment] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Student Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchComplaintData = async () => {
    try {
      setLoading(true);
      const [compRes, histRes] = await Promise.all([
        complaintService.getComplaintById(id),
        complaintService.getComplaintHistory(id)
      ]);

      if (compRes.success) {
        setComplaint(compRes.data);
        setNewStatus(compRes.data.status);
        setNewPriority(compRes.data.priority);
        setSelectedStaff(compRes.data.assignedTo?._id || '');
        setSelectedDepartment(compRes.data.department?._id || '');
        setEditTitle(compRes.data.title);
        setEditDescription(compRes.data.description);
        setEditLocation(compRes.data.location);
      }
      if (histRes.success) {
        setHistory(histRes.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintData();
  }, [id]);

  const loadAssignData = async () => {
    try {
      const [staffRes, deptRes] = await Promise.all([
        complaintService.getStaffList(),
        complaintService.getDepartments()
      ]);
      if (staffRes.success) setStaffList(staffRes.data || []);
      if (deptRes.success) setDepartments(deptRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await complaintService.addComment(id, newComment);
      if (res.success) {
        setComplaint((prev) => ({ ...prev, comments: res.data }));
        setNewComment('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      const res = await complaintService.updateStatus(id, {
        status: newStatus,
        comment: statusComment,
        priority: newPriority
      });
      if (res.success) {
        setShowStatusModal(false);
        setStatusComment('');
        fetchComplaintData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      setAssigning(true);
      const res = await complaintService.assignComplaint(id, {
        assignedTo: selectedStaff || null,
        department: selectedDepartment || null,
        comment: assignComment
      });
      if (res.success) {
        setShowAssignModal(false);
        setAssignComment('');
        fetchComplaintData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('location', editLocation);

      const res = await complaintService.updateComplaint(id, formData);
      if (res.success) {
        setIsEditing(false);
        fetchComplaintData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!window.confirm('Are you sure you want to permanently delete/cancel this complaint?')) return;
    try {
      const res = await complaintService.deleteComplaint(id);
      if (res.success) {
        if (user.role === 'admin') navigate('/admin/complaints');
        else navigate('/student/my-complaints');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete complaint');
    }
  };

  if (loading) return <Loading message="Loading ticket details..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;
  if (!complaint) return <div className="alert alert-warning m-4">Ticket not found</div>;

  const isStaffOrAdmin = ['staff', 'admin'].includes(user.role);
  const isOwner = user._id === complaint.createdBy?._id;
  const canEdit = isOwner && complaint.status === 'Submitted';
  const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:5000';

  return (
    <div className="container-fluid p-4">
      {/* Back button & Action Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Back to List
        </button>

        <div className="d-flex flex-wrap gap-2">
          {/* Edit complaint for student if still in Submitted state */}
          {canEdit && (
            <button
              className="btn btn-outline-primary btn-sm fw-medium"
              onClick={() => setIsEditing(!isEditing)}
            >
              <i className="bi bi-pencil-square me-1"></i> {isEditing ? 'Cancel Edit' : 'Edit Issue'}
            </button>
          )}

          {/* Delete button (Admin or student when draft) */}
          {(user.role === 'admin' || canEdit) && (
            <button className="btn btn-outline-danger btn-sm fw-medium" onClick={handleDeleteComplaint}>
              <i className="bi bi-trash me-1"></i> {user.role === 'admin' ? 'Delete Complaint' : 'Cancel Ticket'}
            </button>
          )}

          {/* Staff/Admin actions */}
          {isStaffOrAdmin && (
            <>
              <button
                className="btn btn-outline-primary btn-sm fw-medium"
                onClick={() => {
                  loadAssignData();
                  setShowAssignModal(true);
                }}
              >
                <i className="bi bi-person-gear me-1"></i> Assign Officer
              </button>
              <button
                className="btn btn-primary btn-sm fw-bold shadow-sm"
                onClick={() => setShowStatusModal(true)}
              >
                <i className="bi bi-check2-circle me-1"></i> Update Status & Priority
              </button>
            </>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Complaint Details & Timeline */}
        <div className="col-lg-8">
          {/* Main Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <span className="badge bg-light text-primary border border-primary-subtle fw-bold font-monospace px-3 py-2 fs-6">
                {complaint.complaintId}
              </span>
              <div className="d-flex gap-2 align-items-center">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="my-3 border p-3 rounded bg-light">
                <h6 className="fw-bold mb-3">Edit Grievance Information</h6>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h4 className="fw-bold text-dark mb-3">{complaint.title}</h4>
                <div className="p-3 bg-light rounded-3 mb-3 text-secondary" style={{ whiteSpace: 'pre-line' }}>
                  {complaint.description}
                </div>
              </>
            )}

            {/* Location & Category Grid */}
            <div className="row g-3 p-3 bg-white border rounded-3 mb-3 small">
              <div className="col-sm-6">
                <span className="text-muted d-block">Incident Category:</span>
                <span className="fw-semibold text-dark">{complaint.category}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Campus Location:</span>
                <span className="fw-semibold text-dark">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {complaint.location}
                </span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Assigned Department:</span>
                <span className="fw-semibold text-dark">
                  {complaint.department?.name || 'General Campus Admin'}
                </span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Responsible Officer:</span>
                <span className="fw-semibold text-dark">
                  {complaint.assignedTo ? `${complaint.assignedTo.name} (${complaint.assignedTo.email})` : 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Attachment Display */}
            {complaint.attachment && (
              <div className="mt-2">
                <label className="form-label small fw-semibold text-secondary">Attached Photo Evidence</label>
                <div className="border rounded p-2 bg-light d-inline-block">
                  <a
                    href={`${imgBaseUrl}${complaint.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Click to view full image"
                  >
                    <img
                      src={`${imgBaseUrl}${complaint.attachment}`}
                      alt="Complaint attachment"
                      className="rounded"
                      style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </a>
                  <small className="d-block text-muted mt-1">
                    <i className="bi bi-box-arrow-up-right me-1"></i> Click photo to view original
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Complaint Lifecycle History Timeline */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-4">
              <i className="bi bi-clock-history me-2 text-primary"></i> Lifecycle Audit Trail
            </h5>

            {history.length === 0 ? (
              <p className="text-muted small">No status changes recorded yet.</p>
            ) : (
              <div className="position-relative ps-4 border-start border-2 border-primary ms-2">
                {history.map((h) => (
                  <div key={h._id} className="position-relative mb-4">
                    <div
                      className="position-absolute bg-primary rounded-circle"
                      style={{
                        width: '12px',
                        height: '12px',
                        left: '-23px',
                        top: '4px'
                      }}
                    ></div>
                    <div className="d-flex justify-content-between align-items-baseline">
                      <span className="fw-bold small text-dark">
                        Status &rarr; <StatusBadge status={h.newStatus} />
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(h.changedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="small text-secondary mt-1">
                      {h.comment || 'Status transition recorded'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Updated by: <span className="fw-semibold">{h.changedBy?.name || 'System'}</span> ({h.changedBy?.role || 'user'})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments / Communication Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-chat-left-dots-fill me-2 text-primary"></i> Communication & Remarks
            </h5>

            {complaint.comments.length === 0 ? (
              <p className="text-muted small py-3">No remarks added yet. Start communication below.</p>
            ) : (
              <div className="vstack gap-3 mb-4">
                {complaint.comments.map((c) => (
                  <div key={c._id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold small text-dark">{c.user?.name || 'User'}</span>
                        <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                          {c.user?.role || 'staff'}
                        </span>
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mb-0 small text-secondary">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type an update, question, or diagnostic note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary fw-medium px-4"
                  disabled={submittingComment}
                >
                  {submittingComment ? 'Sending...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Complainant Metadata Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
              <i className="bi bi-person-vcard-fill me-2 text-primary"></i> Complainant Details
            </h6>
            <div className="vstack gap-2 small">
              <div>
                <span className="text-muted d-block">Submitted by:</span>
                <span className="fw-bold text-dark">{complaint.createdBy?.name}</span>
              </div>
              <div>
                <span className="text-muted d-block">Email:</span>
                <span className="text-dark font-monospace">{complaint.createdBy?.email}</span>
              </div>
              {complaint.createdBy?.studentId && (
                <div>
                  <span className="text-muted d-block">Student ID / Roll No:</span>
                  <span className="fw-bold text-dark">{complaint.createdBy.studentId}</span>
                </div>
              )}
              {complaint.createdBy?.phone && (
                <div>
                  <span className="text-muted d-block">Contact Phone:</span>
                  <span className="text-dark">{complaint.createdBy.phone}</span>
                </div>
              )}
              <div>
                <span className="text-muted d-block">Date Logged:</span>
                <span className="text-dark">{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
              {complaint.resolvedAt && (
                <div>
                  <span className="text-muted d-block text-success fw-bold">Date Resolved:</span>
                  <span className="text-success">{new Date(complaint.resolvedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white">
            <h6 className="fw-bold mb-2">Grievance SLA Standard</h6>
            <p className="small opacity-90 mb-0">
              Campus complaints with Critical priority are attended to within 24 hours. Normal issues are diagnosed and closed in 3 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Update Complaint Status</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Lifecycle Status</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Priority Level</label>
                    <select
                      className="form-select"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Status Update Remark</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Add resolution explanation or reason for status update..."
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={updatingStatus}>
                    {updatingStatus ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Assign Ticket</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAssignModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAssign}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Assign Department</label>
                    <select
                      className="form-select"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option value="">-- Choose Department --</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Assign Staff Officer</label>
                    <select
                      className="form-select"
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                      <option value="">-- Choose Staff Member --</option>
                      {staffList.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.role}) - {s.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Internal Assignment Note</label>
                    <textarea
                      rows="2"
                      className="form-control"
                      placeholder="Optional instructions for the assignee..."
                      value={assignComment}
                      onChange={(e) => setAssignComment(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={assigning}>
                    {assigning ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;
