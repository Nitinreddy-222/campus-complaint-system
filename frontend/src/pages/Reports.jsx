import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import Loading from '../components/Loading';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getAdminDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportsData();
  }, []);

  if (loading) return <Loading message="Compiling institutional grievance reports..." />;

  const summary = data?.summary || {};
  const categoryStats = data?.categoryStats || [];
  const departmentStats = data?.departmentStats || [];
  const statusDist = data?.statusDistribution || [];

  const resolutionRate =
    summary.totalComplaints > 0
      ? Math.round((summary.resolvedComplaints / summary.totalComplaints) * 100)
      : 0;

  return (
    <div className="container-fluid p-4">
      {/* Report Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Grievance & Resolution Analytics Report</h3>
          <p className="text-muted small mb-0">Official compliance and operational health summary for campus management</p>
        </div>
        <button
          className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer me-1"></i> Print / Save PDF
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-light">
            <span className="text-muted small text-uppercase fw-semibold">Overall Resolution Rate</span>
            <h2 className="fw-bold text-success mb-0 mt-1">{resolutionRate}%</h2>
            <small className="text-muted">{summary.resolvedComplaints} of {summary.totalComplaints} closed</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-light">
            <span className="text-muted small text-uppercase fw-semibold">Active Unresolved</span>
            <h2 className="fw-bold text-warning mb-0 mt-1">
              {(summary.pendingComplaints || 0) + (summary.inProgressComplaints || 0)}
            </h2>
            <small className="text-muted">Tickets in action queue</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-light">
            <span className="text-muted small text-uppercase fw-semibold">Critical Incidents</span>
            <h2 className="fw-bold text-danger mb-0 mt-1">{summary.criticalComplaints || 0}</h2>
            <small className="text-muted">High priority flags</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-light">
            <span className="text-muted small text-uppercase fw-semibold">Registered Stakeholders</span>
            <h2 className="fw-bold text-primary mb-0 mt-1">{summary.totalUsers || 0}</h2>
            <small className="text-muted">{summary.totalStudents} students, {summary.totalStaff} staff</small>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold text-dark mb-3">Complaints Logged By Department</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Department</th>
                    <th className="text-end">Ticket Count</th>
                    <th className="text-end">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentStats.map((d, idx) => {
                    const pct = summary.totalComplaints > 0 ? ((d.count / summary.totalComplaints) * 100).toFixed(1) : 0;
                    return (
                      <tr key={idx}>
                        <td className="fw-semibold text-dark">{d.name}</td>
                        <td className="text-end fw-bold">{d.count}</td>
                        <td className="text-end text-muted">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold text-dark mb-3">Complaints Logged By Category</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Category</th>
                    <th className="text-end">Tickets</th>
                    <th className="text-end">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.map((c, idx) => {
                    const pct = summary.totalComplaints > 0 ? ((c.count / summary.totalComplaints) * 100).toFixed(1) : 0;
                    return (
                      <tr key={idx}>
                        <td>
                          <span className="badge bg-light text-primary border">{c._id}</span>
                        </td>
                        <td className="text-end fw-bold">{c.count}</td>
                        <td className="text-end text-muted">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Status Lifecycle Distribution Table */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h5 className="fw-bold text-dark mb-3">Status Distribution Summary</h5>
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                {statusDist.map((s, idx) => (
                  <th key={idx}>{s._id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {statusDist.map((s, idx) => (
                  <td key={idx} className="fs-5 fw-bold text-primary">
                    {s.count}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
