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
      sessionStorage.setItem('loginTimestamp', String(Date.now()));
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
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card auth-card"
      >
        <div className="auth-header">
          <div className="auth-logo">
            <HeartPulse size={22} />
          </div>
          <h1>Sign in</h1>
          <p>Access your healthcare portal</p>
        </div>

        {error && (
          <div className="alert alert-danger mb-16">{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-accent btn-full btn-lg"
            disabled={submitting}
            style={{ marginTop: 6 }}
          >
            {submitting ? 'Signing in...' : <>Sign In <ArrowRight size={15} /></>}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
}
