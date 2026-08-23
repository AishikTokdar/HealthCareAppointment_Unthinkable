import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { doctorsApi } from '../../api/doctors.api';
import { User, Clock, ArrowRight } from 'lucide-react';

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
    'General Medicine', 'Cardiology', 'Dermatology', 'Neurology',
    'Pediatrics', 'Orthopedics', 'ENT (Ear, Nose, Throat)',
    'Gynecology', 'Ayurveda / AYUSH'
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <h1>Find a Specialist</h1>
          <p>Select a doctor to view availability and book an appointment.</p>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={() => setSpecialisation('')} className={`chip${!specialisation ? ' active' : ''}`}>
            All
          </button>
          {specialisations.map((spec) => (
            <button key={spec} onClick={() => setSpecialisation(spec)} className={`chip${specialisation === spec ? ' active' : ''}`}>
              {spec}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-text">Searching doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="card empty-state">
            <User size={36} />
            <h3>No doctors found</h3>
            <p>No doctors match your current filter.</p>
          </div>
        ) : (
          <div className="grid-auto">
            {doctors.map((doc) => {
              const cleanName = (doc.user?.name || '').replace(/^Dr\.?\s+/i, '');
              const initials = cleanName.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                  style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div className="avatar avatar-md avatar-circle" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{cleanName}</div>
                        <span style={{ fontSize: 12, color: 'var(--accent)' }}>{doc.specialisation}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {doc.bio || 'Experienced clinical specialist.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
                      <Clock size={12} /> {doc.slotDuration} min slots
                    </div>
                  </div>
                  <Link to={`/patient/book/${doc.id}`} className="btn btn-accent btn-full">
                    Book Appointment <ArrowRight size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
