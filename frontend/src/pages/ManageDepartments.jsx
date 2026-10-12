import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import Loading from '../components/Loading';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Department State
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [submittingDept, setSubmittingDept] = useState(false);

  // New Category State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, catRes] = await Promise.all([
        complaintService.getDepartments(),
        complaintService.getCategories()
      ]);
      if (deptRes.success) setDepartments(deptRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    try {
      setSubmittingDept(true);
      const res = await complaintService.createDepartment({
        name: deptName.trim(),
        description: deptDesc.trim(),
        head: deptHead.trim()
      });
      if (res.success) {
        setDeptName('');
        setDeptDesc('');
        setDeptHead('');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add department');
    } finally {
      setSubmittingDept(false);
    }
  };

  const handleDeleteDept = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try {
      const res = await complaintService.deleteDepartment(id);
      if (res.success) fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleCreateCat = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      setSubmittingCat(true);
      const res = await complaintService.createCategory({
        name: catName.trim(),
        description: catDesc.trim()
      });
      if (res.success) {
        setCatName('');
        setCatDesc('');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCat = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await complaintService.deleteCategory(id);
      if (res.success) fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <Loading message="Loading departments & categories..." />;

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Campus Departments & Categories</h3>
        <p className="text-muted small mb-0">Manage resolution units and complaint classification tags</p>
      </div>

      <div className="row g-4">
        {/* Departments Column */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-buildings-fill text-primary me-2"></i> Campus Departments ({departments.length})
            </h5>

            {/* Add Department Form */}
            <form onSubmit={handleCreateDept} className="bg-light p-3 rounded-3 mb-4 border">
              <h6 className="fw-bold small mb-2 text-uppercase text-secondary">Add New Department</h6>
              <div className="row g-2">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Department Name *"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Department Head / Officer"
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button type="submit" className="btn btn-primary btn-sm w-100 fw-bold" disabled={submittingDept}>
                    {submittingDept ? 'Adding...' : '+ Add'}
                  </button>
                </div>
                <div className="col-12">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Scope / Responsibility description (optional)"
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                  />
                </div>
              </div>
            </form>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Department Name</th>
                    <th>Officer / Head</th>
                    <th>Scope</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d._id}>
                      <td className="fw-bold text-dark">{d.name}</td>
                      <td className="small text-secondary">{d.head || 'Not assigned'}</td>
                      <td className="small text-muted">{d.description || '-'}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteDept(d._id, d.name)}
                          title="Delete Department"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Categories Column */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-tags-fill text-primary me-2"></i> Complaint Categories ({categories.length})
            </h5>

            {/* Add Category Form */}
            <form onSubmit={handleCreateCat} className="bg-light p-3 rounded-3 mb-4 border">
              <h6 className="fw-bold small mb-2 text-uppercase text-secondary">Add New Category</h6>
              <div className="row g-2">
                <div className="col-8">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Category Name *"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-4">
                  <button type="submit" className="btn btn-primary btn-sm w-100 fw-bold" disabled={submittingCat}>
                    {submittingCat ? 'Adding...' : '+ Add'}
                  </button>
                </div>
                <div className="col-12">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Short description (optional)"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                  />
                </div>
              </div>
            </form>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-bold text-dark">
                        <span className="badge bg-light text-primary border">{c.name}</span>
                      </td>
                      <td className="small text-muted">{c.description || '-'}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteCat(c._id, c.name)}
                          title="Delete Category"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageDepartments;
