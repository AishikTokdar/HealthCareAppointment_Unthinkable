import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import {
  Calendar,
  UserCheck,
  FileText,
  Users,
  Bell,
  LogOut,
  HeartPulse,
  Activity,
  History,
  Sun,
  Moon
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
    { path: '/doctor/dashboard', label: 'Schedule', icon: Calendar }
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Overview', icon: Activity },
    { path: '/admin/doctors/pending', label: 'Pending Approvals', icon: UserCheck },
    { path: '/admin/doctors', label: 'Manage Doctors', icon: Users },
    { path: '/admin/history', label: 'Visit History', icon: FileText },
    { path: '/admin/notifications', label: 'Audit Logs', icon: Bell }
  ];

  const links = user.role === 'PATIENT' ? patientLinks : user.role === 'DOCTOR' ? doctorLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user.name || '')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sidebar-brand-icon">
            <HeartPulse size={18} />
          </div>
          <div>
            <h2>HealthCare</h2>
            <span>{user.role}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
        <button onClick={handleLogout} className="sidebar-signout">
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
