import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { adminApi } from '../../api/admin.api';
import { Users, UserCheck, Calendar, Bell, ShieldAlert, ArrowRight, Clock, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1200 }}>
        <div className="page-header">
          <h1>Clinic Administration</h1>
          <p>System overview, doctor onboarding, registrations, leave approvals, and notifications.</p>
        </div>

        {loading ? (
          <div className="loading-text">Loading analytics...</div>
        ) : (
          <>
            <div className="grid-stats mb-32">
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card stat-card">
                <div className="stat-label">
                  <Users size={16} /> Active Doctors
                </div>
                <div className="stat-value">{stats?.totalDoctors || 0}</div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card stat-card">
                <div className="stat-label">
                  <UserCheck size={16} style={{ color: 'var(--warning)' }} /> Pending Approvals
                </div>
                <div className="stat-value">{stats?.pendingDoctors || 0}</div>
                {stats?.pendingDoctors > 0 && (
                  <Link to="/admin/doctors/pending" className="stat-link">Review Requests &rarr;</Link>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card stat-card">
                <div className="stat-label">
                  <Clock size={16} style={{ color: 'var(--danger)' }} /> Leave Requests
                </div>
                <div className="stat-value">{stats?.pendingLeaveRequests || 0}</div>
                {stats?.pendingLeaveRequests > 0 && (
                  <Link to="/admin/doctors" className="stat-link">Review Leave Queue &rarr;</Link>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card stat-card">
                <div className="stat-label">
                  <Calendar size={16} /> Appointments Today
                </div>
                <div className="stat-value">{stats?.appointmentsToday || 0}</div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card stat-card">
                <div className="stat-label">
                  <Bell size={16} style={{ color: 'var(--success)' }} /> Queued Notifications
                </div>
                <div className="stat-value">{stats?.queuedNotifications || 0}</div>
              </motion.div>
            </div>

            <h2 className="section-title mb-16">Onboarding & Registrations Hub</h2>
            <div className="grid-2">
              <Link to="/admin/doctors/pending" style={{ color: 'inherit' }}>
                <div className="card card-interactive" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <ShieldAlert size={20} style={{ color: 'var(--warning)' }} />
                    <h3 style={{ fontSize: 16, margin: 0 }}>Review Doctor Registrations</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, flex: 1 }}>
                    Approve or reject doctor self-registration applications awaiting clinic authorization.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
                    View Pending Queue <ArrowRight size={14} />
                  </div>
                </div>
              </Link>

              <Link to="/admin/doctors" style={{ color: 'inherit' }}>
                <div className="card card-interactive" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <UserPlus size={20} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontSize: 16, margin: 0 }}>Manage Doctors & Leave Requests</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, flex: 1 }}>
                    Review pending doctor leave requests or directly schedule doctor leave and register new profiles.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
                    Open Doctor Directory <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
