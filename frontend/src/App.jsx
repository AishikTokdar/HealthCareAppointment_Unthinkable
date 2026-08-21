import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import PatientDashboard from './pages/patient/Dashboard';
import DoctorSearch from './pages/patient/DoctorSearch';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import PatientAppointmentDetail from './pages/patient/AppointmentDetail';
import PatientMedicalHistory from './pages/patient/MedicalHistory';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointmentDetail from './pages/doctor/AppointmentDetail';
import SubmitVisitNote from './pages/doctor/SubmitVisitNote';
import DoctorPatientHistory from './pages/doctor/PatientHistory';

import AdminDashboard from './pages/admin/Dashboard';
import PendingDoctors from './pages/admin/PendingDoctors';
import DoctorList from './pages/admin/DoctorList';
import NotificationLog from './pages/admin/NotificationLog';
import VisitHistory from './pages/admin/VisitHistory';

import CalendarSuccess from './pages/CalendarSuccess';

export default function App() {
  const { user } = useContext(AuthContext);

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'PATIENT') return '/patient/dashboard';
    if (user.role === 'DOCTOR') return '/doctor/dashboard';
    return '/admin/dashboard';
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/calendar-success" element={<CalendarSuccess />} />

      <Route path="/patient/dashboard" element={<PrivateRoute allowedRoles={['PATIENT']}><PatientDashboard /></PrivateRoute>} />
      <Route path="/patient/doctors" element={<PrivateRoute allowedRoles={['PATIENT']}><DoctorSearch /></PrivateRoute>} />
      <Route path="/patient/book/:doctorId" element={<PrivateRoute allowedRoles={['PATIENT']}><BookAppointment /></PrivateRoute>} />
      <Route path="/patient/appointments" element={<PrivateRoute allowedRoles={['PATIENT']}><PatientAppointments /></PrivateRoute>} />
      <Route path="/patient/appointments/:id" element={<PrivateRoute allowedRoles={['PATIENT']}><PatientAppointmentDetail /></PrivateRoute>} />
      <Route path="/patient/history" element={<PrivateRoute allowedRoles={['PATIENT']}><PatientMedicalHistory /></PrivateRoute>} />

      <Route path="/doctor/dashboard" element={<PrivateRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></PrivateRoute>} />
      <Route path="/doctor/appointments/:id" element={<PrivateRoute allowedRoles={['DOCTOR']}><DoctorAppointmentDetail /></PrivateRoute>} />
      <Route path="/doctor/visit/:id" element={<PrivateRoute allowedRoles={['DOCTOR']}><SubmitVisitNote /></PrivateRoute>} />
      <Route path="/doctor/patient-history/:patientId" element={<PrivateRoute allowedRoles={['DOCTOR']}><DoctorPatientHistory /></PrivateRoute>} />

      <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/doctors/pending" element={<PrivateRoute allowedRoles={['ADMIN']}><PendingDoctors /></PrivateRoute>} />
      <Route path="/admin/doctors" element={<PrivateRoute allowedRoles={['ADMIN']}><DoctorList /></PrivateRoute>} />
      <Route path="/admin/notifications" element={<PrivateRoute allowedRoles={['ADMIN']}><NotificationLog /></PrivateRoute>} />
      <Route path="/admin/history" element={<PrivateRoute allowedRoles={['ADMIN']}><VisitHistory /></PrivateRoute>} />

      <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
    </Routes>
  );
}
