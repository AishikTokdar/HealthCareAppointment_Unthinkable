import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { HeartPulse, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await authApi.login({ email, password });
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'PATIENT') navigate('/patient/dashboard');
      else if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid login credentials');
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
          maxWidth: 440,
          padding: 40
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
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
          <h1 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Log in to access your healthcare portal</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ marginTop: 8, width: '100%' }}
          >
            {submitting ? 'Authenticating...' : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
