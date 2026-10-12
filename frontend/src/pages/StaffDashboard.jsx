import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loading from '../components/Loading';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getStaffDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError('Failed to load staff dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffStats();
  }, []);

  if (loading) return <Loading message="Loading staff dashboard..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  const summary = data?.summary || { totalAssigned: 0, pending: 0, inProgress: 0, highPriority: 0, resolved: 0 };
  const recent = data?.recentComplaints || [];
  const statusCounts = data?.statusCounts || {};

  const barChartData = {
    labels: ['Assigned', 'In Progress', 'Under Review', 'Resolved'],
    datasets: [
      {
        label: 'Issues Count',
        data: [
          statusCounts['Assigned'] || 0,
          statusCounts['In Progress'] || 0,
          statusCounts['Under Review'] || 0,
          statusCounts['Resolved'] || 0
        ],
        backgroundColor: ['#0d6efd', '#0dcaf0', '#ffc107', '#198754'],
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Staff / Department Officer Dashboard</h3>
          <p className="text-muted small mb-0">Manage department tickets, triage priorities, and update status</p>
        </div>
        <Link to="/staff/assigned" className="btn btn-primary fw-bold px-3 py-2 rounded-pill shadow-sm">
          <i className="bi bi-card-checklist me-1"></i> View Assigned Queue
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Assigned</span>
                <h2 className="fw-bold text-primary mb-0 mt-1">{summary.totalAssigned}</h2>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                <i className="bi bi-inbox-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-danger">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">High / Critical</span>
                <h2 className="fw-bold text-danger mb-0 mt-1">{summary.highPriority}</h2>
              </div>
              <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                <i className="bi bi-exclamation-triangle-fill fs-4"></i>
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
                <i className="bi bi-gear-wide-connected fs-4"></i>
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
                <i className="bi bi-patch-check-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="row g-4">
        {/* Status Chart */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <h5 className="fw-bold text-dark mb-3">Workload Status Distribution</h5>
            <div style={{ height: '260px' }}>
              <Bar data={barChartData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* Assigned Issues Table */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Action Required Queue</h5>
              <Link to="/staff/assigned" className="btn btn-outline-primary btn-sm rounded-pill">
                Open Full Queue
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-5 text-muted small">No complaints currently assigned to your queue.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Ticket ID</th>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((c) => (
                      <tr key={c._id}>
                        <td className="font-monospace fw-bold text-primary small">{c.complaintId}</td>
                        <td className="text-truncate fw-medium" style={{ maxWidth: '200px' }} title={c.title}>
                          {c.title}
                        </td>
                        <td>
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td>
                          <Link to={`/complaints/${c._id}`} className="btn btn-primary btn-sm rounded-pill px-3">
                            Manage
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

export default StaffDashboard;
