import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { Stethoscope, User, Lock, Mail, Phone, ArrowRight, Activity } from 'lucide-react';

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
          name,
          email,
          password,
          phone,
          specialisation,
          slotDuration: parseInt(slotDuration, 10),
          bio
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
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'ENT (Ear, Nose, Throat)',
    'Gynecology',
    'Ayurveda / AYUSH'
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '40px 20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: 36,
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 12
          }}>
            <Activity size={24} />
          </div>
          <h1 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 6 }}>Create an Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join the Healthcare Portal</p>
        </div>

        <div style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          marginBottom: 24
        }}>
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'PATIENT' ? 'var(--accent-violet)' : 'transparent',
              color: role === 'PATIENT' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.2s ease'
            }}
          >
            Patient Registration
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'DOCTOR' ? 'var(--accent-violet)' : 'transparent',
              color: role === 'DOCTOR' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.2s ease'
            }}
          >
            Doctor Registration
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            fontSize: 13
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Full Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Patel"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Email Address</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Phone Number</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {role === 'DOCTOR' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Specialisation</label>
                  <select
                    className="input-field"
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
                  >
                    {specialisations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Slot Duration</label>
                  <select
                    className="input-field"
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(e.target.value)}
                  >
                    <option value="15">15 Mins</option>
                    <option value="30">30 Mins</option>
                    <option value="45">45 Mins</option>
                    <option value="60">60 Mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Bio / Profile Summary</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Senior Consultant Physician with 10+ years clinical experience..."
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 10,
              padding: '12px'
            }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
