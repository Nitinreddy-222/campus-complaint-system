import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [studentId, setStudentId] = useState(user?.studentId || user?.employeeId || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setSaving(true);
      const res = await authService.updateProfile({
        name,
        phone,
        studentId: user?.role === 'student' ? studentId : undefined,
        employeeId: user?.role !== 'student' ? studentId : undefined
      });

      if (res.success) {
        updateUser(res.data);
        setSuccessMsg('Your profile has been successfully updated.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-primary text-white p-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold fs-3 shadow"
                  style={{ width: 64, height: 64 }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="fw-bold mb-0">{user?.name}</h4>
                  <div className="d-flex gap-2 align-items-center mt-1">
                    <span className="badge bg-warning text-dark text-uppercase">{user?.role}</span>
                    <span className="small opacity-75">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              {successMsg && <div className="alert alert-success py-2 small">{successMsg}</div>}
              {errorMsg && <div className="alert alert-danger py-2 small">{errorMsg}</div>}

              <form onSubmit={handleUpdate}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Campus Email</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || ''}
                      disabled
                    />
                    <small className="text-muted">Email address cannot be changed.</small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      {user?.role === 'student' ? 'Student ID / Roll No' : 'Employee ID'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Account Department</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={user?.department?.name || 'General / Unassigned'}
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Account Created</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary fw-bold px-4 shadow-sm" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
