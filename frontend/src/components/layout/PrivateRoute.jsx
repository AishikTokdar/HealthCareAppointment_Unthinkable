import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="page-layout">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 200, height: 12 }} />
            <div className="skeleton" style={{ width: 140, height: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'PATIENT' ? '/patient/dashboard' : user.role === 'DOCTOR' ? '/doctor/dashboard' : '/admin/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
