import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../services/complaintService';

const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    priority: 'Medium',
    department: '',
    description: ''
  });

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();

  // Predefined default categories
  const defaultCategories = [
    'Hostel',
    'Classroom',
    'Laboratory',
    'Library',
    'Canteen',
    'Transport',
    'Internet/Wi-Fi',
    'Electricity',
    'Water Supply',
    'Cleanliness',
    'Security',
    'Infrastructure',
    'Academic',
    'Other'
  ];

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          complaintService.getCategories(),
          complaintService.getDepartments()
        ]);

        if (catRes.success && catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data.map((c) => c.name));
        } else {
          setCategories(defaultCategories);
        }

        if (deptRes.success) {
          setDepartments(deptRes.data || []);
        }
      } catch (err) {
        console.warn('Metadata fetch error, using fallbacks:', err.message);
        setCategories(defaultCategories);
      }
    };

    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setErrors({ ...errors, file: 'Only image files (.jpg, .jpeg, .png) are permitted.' });
        setFile(null);
        setPreviewUrl('');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, file: 'Image size cannot exceed 5MB.' });
        setFile(null);
        setPreviewUrl('');
        return;
      }
      setErrors({ ...errors, file: '' });
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Complaint title is required.';
    else if (formData.title.trim().length > 150) newErrors.title = 'Title cannot exceed 150 characters.';

    if (!formData.category) newErrors.category = 'Please choose a category.';
    if (!formData.location.trim()) newErrors.location = 'Specific location is required (e.g. Block A Room 204).';
    if (!formData.description.trim()) newErrors.description = 'Please describe the issue.';
    else if (formData.description.trim().length < 10) newErrors.description = 'Description should be at least 10 characters.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('location', formData.location);
      data.append('priority', formData.priority);
      data.append('description', formData.description);
      if (formData.department) data.append('department', formData.department);
      if (file) data.append('attachment', file);

      const res = await complaintService.createComplaint(data);
      if (res.success) {
        navigate(`/complaints/${res.data._id}`);
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white text-primary p-2 rounded-circle">
                  <i className="bi bi-file-earmark-plus-fill fs-3"></i>
                </div>
                <div>
                  <h4 className="fw-bold mb-0">Lodge a Campus Complaint</h4>
                  <p className="small mb-0 opacity-75">
                    Submit detailed information to help the administrative officers address the issue quickly.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              {serverError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{serverError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">
                    Complaint Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="Briefly state the issue (e.g. Wi-Fi router disconnected in Lab 2)"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>

                <div className="row g-3 mb-3">
                  {/* Category */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Category *
                    </label>
                    <select
                      name="category"
                      className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                  </div>

                  {/* Priority */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      className="form-select"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="Low">Low - Minor issue, non-disruptive</option>
                      <option value="Medium">Medium - Regular attention needed</option>
                      <option value="High">High - Impeding daily academic activity</option>
                      <option value="Critical">Critical - Urgent / Safety hazard</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Campus Location / Room *
                    </label>
                    <input
                      type="text"
                      name="location"
                      className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                      placeholder="e.g. Boys Hostel Block A, Room 304 / Main Library"
                      value={formData.location}
                      onChange={handleChange}
                    />
                    {errors.location && <div className="invalid-feedback">{errors.location}</div>}
                  </div>

                  {/* Department (Optional) */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Concerned Department (Optional)
                    </label>
                    <select
                      name="department"
                      className="form-select"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">-- Auto-detect / General Administration --</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    placeholder="Provide clear symptoms, when the issue began, exact location details, etc."
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  <div className="form-text small">Minimum 10 characters required.</div>
                </div>

                {/* File Attachment */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-secondary">
                    Optional Photo / Evidence (JPG, PNG - Max 5MB)
                  </label>
                  <input
                    type="file"
                    className={`form-control ${errors.file ? 'is-invalid' : ''}`}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {errors.file && <div className="invalid-feedback">{errors.file}</div>}

                  {previewUrl && (
                    <div className="mt-3 p-2 border rounded bg-light d-inline-block position-relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="rounded"
                        style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl('');
                        }}
                        title="Remove photo"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 fw-medium"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-bold shadow-sm"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Grievance'
                    )}
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

export default SubmitComplaint;
