import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { HeartPulse, ArrowRight } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('PATIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [specialisation, setSpecialisation] = useState('General Medicine');
  const [slotDuration, setSlotDuration] = useState('30');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

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
          slotDuration,
          bio
        });
        login(res.data.token, res.data.user);
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      const detailMsg = err.response?.data?.details?.length
        ? err.response.data.details.join(', ')
        : err.response?.data?.error || 'Registration failed';
      setError(detailMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 24
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 500,
          padding: 40
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: 16
          }}>
            <HeartPulse size={28} />
          </div>
          <h1 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Select portal type to continue</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-surface)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          marginBottom: 24
        }}>
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            style={{
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'PATIENT' ? 'var(--bg-elevated)' : 'transparent',
              color: role === 'PATIENT' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            style={{
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'DOCTOR' ? 'var(--bg-elevated)' : 'transparent',
              color: role === 'DOCTOR' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Doctor
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            fontSize: 14
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
              placeholder="Dr. Aarav Patel"
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
              placeholder="aarav@clinic.in"
              required
            />
          </div>

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

          {role === 'DOCTOR' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Specialisation</label>
                <select
                  className="input-field"
                  value={specialisation}
                  onChange={(e) => setSpecialisation(e.target.value)}
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="ENT (Ear, Nose, Throat)">ENT (Ear, Nose, Throat)</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Ayurveda / AYUSH">Ayurveda / AYUSH</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Slot Duration (mins)</label>
                <select
                  className="input-field"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Bio / Profile Summary</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Senior Consultant Physician with 10+ years of clinical experience..."
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ marginTop: 8, width: '100%' }}
          >
            {submitting ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
