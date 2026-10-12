import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loading from '../components/Loading';

// Chart.js imports
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getStudentDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError('Failed to load dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Loading student dashboard..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  const summary = data?.summary || { total: 0, pending: 0, inProgress: 0, resolved: 0 };
  const recent = data?.recentComplaints || [];
  const statusCounts = data?.statusCounts || {};

  const chartData = {
    labels: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
    datasets: [
      {
        data: [
          statusCounts['Submitted'] || 0,
          statusCounts['Under Review'] || 0,
          statusCounts['In Progress'] || 0,
          statusCounts['Resolved'] || 0,
          statusCounts['Rejected'] || 0
        ],
        backgroundColor: ['#0dcaf0', '#ffc107', '#0d6efd', '#198754', '#dc3545'],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, font: { size: 11 } }
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Student Dashboard</h3>
          <p className="text-muted small mb-0">Overview of your submitted issues and resolution progress</p>
        </div>
        <Link
          to="/student/submit"
          className="btn btn-primary fw-bold px-4 py-2 shadow-sm rounded-pill d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-circle-fill fs-5"></i>
          <span>+ Submit New Complaint</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Reported</span>
                <h2 className="fw-bold text-primary mb-0 mt-1">{summary.total}</h2>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                <i className="bi bi-folder2-open fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Pending Review</span>
                <h2 className="fw-bold text-warning mb-0 mt-1">{summary.pending}</h2>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                <i className="bi bi-hourglass-split fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">In Progress</span>
                <h2 className="fw-bold text-info mb-0 mt-1">{summary.inProgress}</h2>
              </div>
              <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                <i className="bi bi-tools fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Resolved</span>
                <h2 className="fw-bold text-success mb-0 mt-1">{summary.resolved}</h2>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Chart & Recent Complaints */}
      <div className="row g-4">
        {/* Status Distribution Chart */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <h5 className="fw-bold text-dark mb-3">Status Breakdown</h5>
            {summary.total === 0 ? (
              <div className="text-center py-5 text-muted small">No complaints submitted yet to plot chart.</div>
            ) : (
              <div style={{ height: '260px' }}>
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Recently Submitted Complaints */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Recent Submissions</h5>
              <Link to="/student/my-complaints" className="btn btn-outline-primary btn-sm rounded-pill">
                View All
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox text-muted fs-1 mb-2 d-block"></i>
                <p className="text-muted mb-3">You haven't submitted any complaints yet.</p>
                <Link to="/student/submit" className="btn btn-primary btn-sm">
                  Report First Issue
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((c) => (
                      <tr key={c._id}>
                        <td className="font-monospace fw-bold text-primary small">{c.complaintId}</td>
                        <td className="text-truncate fw-medium" style={{ maxWidth: '180px' }} title={c.title}>
                          {c.title}
                        </td>
                        <td className="small text-secondary">{c.category}</td>
                        <td>
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td>
                          <Link to={`/complaints/${c._id}`} className="btn btn-sm btn-light border text-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
