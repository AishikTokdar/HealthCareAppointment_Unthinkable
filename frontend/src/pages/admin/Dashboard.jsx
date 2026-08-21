import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { adminApi } from '../../api/admin.api';
import { Users, UserCheck, Calendar, Bell, Activity, UserPlus, ShieldAlert, ArrowRight, Clock } from 'lucide-react';

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1200 }}>
        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>Clinic Administration</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>System overview, doctor onboarding, registrations, leave approvals, and notification monitoring.</p>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading analytics...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-violet)', marginBottom: 8 }}>
                  <Users size={20} />
                  <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Doctors</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)' }}>{stats?.totalDoctors || 0}</div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-amber)', marginBottom: 8 }}>
                  <UserCheck size={20} />
                  <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pending Approvals</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)' }}>{stats?.pendingDoctors || 0}</div>
                {stats?.pendingDoctors > 0 && (
                  <Link to="/admin/doctors/pending" style={{ fontSize: 12, color: 'var(--accent-amber)', marginTop: 8, display: 'inline-block', fontWeight: 600 }}>
                    Review Requests →
                  </Link>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-rose)', marginBottom: 8 }}>
                  <Clock size={20} />
                  <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Leave Requests</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)' }}>{stats?.pendingLeaveRequests || 0}</div>
                {stats?.pendingLeaveRequests > 0 && (
                  <Link to="/admin/doctors" style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 8, display: 'inline-block', fontWeight: 600 }}>
                    Review Leave Queue →
                  </Link>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-cyan)', marginBottom: 8 }}>
                  <Calendar size={20} />
                  <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Appointments Today</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)' }}>{stats?.appointmentsToday || 0}</div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-emerald)', marginBottom: 8 }}>
                  <Bell size={20} />
                  <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Queued Notifications</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)' }}>{stats?.queuedNotifications || 0}</div>
              </motion.div>
            </div>

            {/* Quick Actions & Registrations Hub */}
            <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 16 }}>Onboarding & Registrations Hub</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              <Link to="/admin/doctors/pending" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ y: -4 }} className="glass-card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <ShieldAlert size={24} />
                    </div>
                    <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>Review Doctor Registrations</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Approve or reject doctor self-registration applications awaiting clinic authorization.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-amber)', fontSize: 14, fontWeight: 600, marginTop: 20 }}>
                    View Pending Queue <ArrowRight size={16} />
                  </div>
                </motion.div>
              </Link>

              <Link to="/admin/doctors" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ y: -4 }} className="glass-card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <UserPlus size={24} />
                    </div>
                    <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>Manage Doctors & Leave Requests</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Review pending doctor leave requests or directly schedule doctor leave and register new profiles.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-violet)', fontSize: 14, fontWeight: 600, marginTop: 20 }}>
                    Open Doctor Directory <ArrowRight size={16} />
                  </div>
                </motion.div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
