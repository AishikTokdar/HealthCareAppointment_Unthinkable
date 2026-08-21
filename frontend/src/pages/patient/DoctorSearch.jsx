import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { doctorsApi } from '../../api/doctors.api';
import { Search, User, Clock, ArrowRight } from 'lucide-react';

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([]);
  const [specialisation, setSpecialisation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, [specialisation]);

  const fetchDoctors = () => {
    setLoading(true);
    doctorsApi.search(specialisation)
      .then(res => setDoctors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1200 }}>
        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>Find a Specialist</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Select a doctor to view availability and schedule an appointment.</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSpecialisation('')}
            className={!specialisation ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            All Specialisations
          </button>
          {specialisations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialisation(spec)}
              className={specialisation === spec ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: 13, padding: '8px 16px' }}
            >
              {spec}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Searching doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No doctors found matching your criteria.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {doctors.map((doc) => (
              <motion.div
                key={doc.id}
                whileHover={{ y: -4 }}
                className="glass-card"
                style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-violet)'
                    }}>
                      <User size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Dr. {doc.user?.name}</h3>
                      <span style={{ fontSize: 13, color: 'var(--accent-cyan)', fontWeight: 500 }}>{doc.specialisation}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {doc.bio || 'Experienced clinical specialist providing patient-centered healthcare.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    <Clock size={16} /> Slot Duration: {doc.slotDuration} mins
                  </div>
                </div>

                <Link to={`/patient/book/${doc.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Book Appointment <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
