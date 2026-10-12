import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loading from '../components/Loading';

// Chart.js imports
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getAdminDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError('Failed to fetch administrator statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) return <Loading message="Loading administrative intelligence dashboard..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  const summary = data?.summary || {};
  const categoryStats = data?.categoryStats || [];
  const departmentStats = data?.departmentStats || [];
  const statusDist = data?.statusDistribution || [];
  const recentComplaints = data?.recentComplaints || [];

  // Prepare Category Bar Chart Data
  const catLabels = categoryStats.slice(0, 6).map((c) => c._id);
  const catValues = categoryStats.slice(0, 6).map((c) => c.count);

  const categoryChartData = {
    labels: catLabels.length > 0 ? catLabels : ['No Data'],
    datasets: [
      {
        label: 'Tickets',
        data: catValues.length > 0 ? catValues : [0],
        backgroundColor: '#0d6efd',
        borderRadius: 5
      }
    ]
  };

  // Status Doughnut Chart Data
  const statusLabels = statusDist.map((s) => s._id);
  const statusValues = statusDist.map((s) => s.count);

  const statusChartData = {
    labels: statusLabels.length > 0 ? statusLabels : ['None'],
    datasets: [
      {
        data: statusValues.length > 0 ? statusValues : [0],
        backgroundColor: [
          '#0dcaf0',
          '#ffc107',
          '#0d6efd',
          '#6f42c1',
          '#198754',
          '#212529',
          '#dc3545'
        ]
      }
    ]
  };

  return (
    <div className="container-fluid p-4">
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Campus Administration Dashboard</h3>
          <p className="text-muted small mb-0">Centralized system oversight, metrics, and incident monitoring</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/complaints" className="btn btn-outline-primary btn-sm rounded-pill fw-medium">
            <i className="bi bi-list-task me-1"></i> All Complaints
          </Link>
          <Link to="/admin/reports" className="btn btn-primary btn-sm rounded-pill fw-medium">
            <i className="bi bi-file-earmark-bar-graph me-1"></i> View Reports
          </Link>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-primary">
            <span className="text-muted small fw-semibold text-uppercase">Total Users</span>
            <h3 className="fw-bold text-dark mb-0 mt-1">{summary.totalUsers || 0}</h3>
            <small className="text-muted">{summary.totalStudents || 0} Students</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-info">
            <span className="text-muted small fw-semibold text-uppercase">Total Tickets</span>
            <h3 className="fw-bold text-dark mb-0 mt-1">{summary.totalComplaints || 0}</h3>
            <small className="text-muted">All Time</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-warning">
            <span className="text-muted small fw-semibold text-uppercase">Pending</span>
            <h3 className="fw-bold text-warning mb-0 mt-1">{summary.pendingComplaints || 0}</h3>
            <small className="text-muted">Awaiting Action</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-primary">
            <span className="text-muted small fw-semibold text-uppercase">In Progress</span>
            <h3 className="fw-bold text-primary mb-0 mt-1">{summary.inProgressComplaints || 0}</h3>
            <small className="text-muted">Under Repair</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-success">
            <span className="text-muted small fw-semibold text-uppercase">Resolved</span>
            <h3 className="fw-bold text-success mb-0 mt-1">{summary.resolvedComplaints || 0}</h3>
            <small className="text-muted">Successfully closed</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-danger">
            <span className="text-muted small fw-semibold text-uppercase">Critical</span>
            <h3 className="fw-bold text-danger mb-0 mt-1">{summary.criticalComplaints || 0}</h3>
            <small className="text-danger fw-semibold">High Priority</small>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row g-4 mb-4">
        {/* Status Distribution */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <h5 className="fw-bold text-dark mb-3">Status Breakdown</h5>
            <div style={{ height: '240px' }}>
              <Doughnut
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }}
              />
            </div>
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <h5 className="fw-bold text-dark mb-3">Top Incident Categories</h5>
            <div style={{ height: '240px' }}>
              <Bar
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Grid */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Recent Campus Grievances</h5>
          <Link to="/admin/complaints" className="btn btn-outline-primary btn-sm rounded-pill">
            View All Complaints
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((c) => (
                <tr key={c._id}>
                  <td className="font-monospace fw-bold text-primary small">{c.complaintId}</td>
                  <td className="text-truncate fw-medium" style={{ maxWidth: '200px' }} title={c.title}>
                    {c.title}
                  </td>
                  <td>
                    <div className="small fw-semibold">{c.createdBy?.name || 'Unknown'}</div>
                    <small className="text-muted">{c.createdBy?.email}</small>
                  </td>
                  <td className="small text-secondary">{c.department?.name || 'Unassigned'}</td>
                  <td>
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    <Link to={`/complaints/${c._id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
