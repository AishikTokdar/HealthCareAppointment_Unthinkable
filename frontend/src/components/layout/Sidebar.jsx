import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Calendar,
  UserCheck,
  FileText,
  Users,
  Clock,
  Bell,
  LogOut,
  HeartPulse,
  Activity,
  History
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const patientLinks = [
    { path: '/patient/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/patient/doctors', label: 'Find Doctors', icon: Users },
    { path: '/patient/appointments', label: 'My Bookings', icon: Calendar },
    { path: '/patient/history', label: 'Medical History', icon: History }
  ];

  const doctorLinks = [
    { path: '/doctor/dashboard', label: 'Today\'s Schedule', icon: Calendar }
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Overview', icon: Activity },
    { path: '/admin/doctors/pending', label: 'Pending Approvals', icon: UserCheck },
    { path: '/admin/doctors', label: 'Manage Doctors', icon: Users },
    { path: '/admin/history', label: 'Visit History & PDFs', icon: FileText },
    { path: '/admin/notifications', label: 'Audit Logs', icon: Bell }
  ];

  const links = user.role === 'PATIENT' ? patientLinks : user.role === 'DOCTOR' ? doctorLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 260,
      minHeight: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px 32px 12px' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <HeartPulse size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, color: 'var(--text-primary)' }}>HealthCare Manager</h2>
          <span style={{ fontSize: 11, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {user.role} PORTAL
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-violet)' : '3px solid transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--accent-violet)' : 'var(--text-muted)' }} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div style={{
        padding: '16px',
        background: 'var(--bg-base)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        marginTop: 'auto'
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{user.email}</div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border-light)',
            color: 'var(--accent-rose)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
