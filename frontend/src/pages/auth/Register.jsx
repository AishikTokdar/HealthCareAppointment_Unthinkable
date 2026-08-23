import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { Activity } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [role, setRole] = useState('PATIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialisation, setSpecialisation] = useState('General Medicine');
  const [slotDuration, setSlotDuration] = useState('30');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'PATIENT') {
        const res = await authApi.registerPatient({ name, email, password, phone });
        login(res.data.token, res.data.user);
        navigate('/patient/dashboard');
      } else {
        const res = await authApi.registerDoctor({
          name, email, password, phone, specialisation,
          slotDuration: parseInt(slotDuration, 10), bio
        });
        login(res.data.token, res.data.user);
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      const detailMsg = err.response?.data?.details?.length
        ? err.response.data.details.join(', ')
        : err.response?.data?.error || 'Registration failed. Please check inputs.';
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  const specialisations = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Neurology',
    'Pediatrics', 'Orthopedics', 'ENT (Ear, Nose, Throat)',
    'Gynecology', 'Ayurveda / AYUSH'
  ];

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card auth-card"
        style={{ maxWidth: 460 }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <Activity size={20} />
          </div>
          <h1>Create an account</h1>
          <p>Join the healthcare portal</p>
        </div>

        <div className="role-toggle">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={role === 'PATIENT' ? 'active' : ''}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            className={role === 'DOCTOR' ? 'active' : ''}
          >
            Doctor
          </button>
        </div>

        {error && <div className="alert alert-danger mb-16">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Patel" required />
          </div>

          <div className="form-group">
            <label className="label">Email Address</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required />
          </div>

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className="form-group">
              <label className="label">Phone Number</label>
              <input type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>

          {role === 'DOCTOR' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="label">Specialisation</label>
                  <select className="input" value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}>
                    {specialisations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Slot Duration</label>
                  <select className="input" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)}>
                    <option value="15">15 Mins</option>
                    <option value="30">30 Mins</option>
                    <option value="45">45 Mins</option>
                    <option value="60">60 Mins</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Bio</label>
                <textarea className="input" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Consultant with 10+ years clinical experience..." />
              </div>
            </motion.div>
          )}

          <button type="submit" disabled={loading} className="btn btn-accent btn-full btn-lg" style={{ marginTop: 6 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
