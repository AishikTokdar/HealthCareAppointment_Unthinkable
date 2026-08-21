import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { doctorsApi } from '../../api/doctors.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { ArrowLeft, User, Activity, Pill, Download, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DoctorPatientHistory() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  const fetchHistory = () => {
    setLoading(true);
    doctorsApi.getPatientHistory(patientId)
      .then(res => setData(res.data))
      .catch(err => {
        setError(err.response?.data?.error || 'Access denied. You can only view medical history for patients scheduled with you.');
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 40, color: 'var(--text-muted)' }}>Loading patient medical history...</main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: 40, maxWidth: 500, textAlign: 'center', borderTop: '4px solid var(--accent-rose)' }}>
            <ShieldAlert size={40} style={{ color: 'var(--accent-rose)', marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Access Restricted</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{error}</p>
            <button onClick={() => navigate('/doctor/dashboard')} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} /> Return to Schedule
            </button>
          </div>
        </main>
      </div>
    );
  }

  const patient = data?.patient;
  const appointments = data?.appointments || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1050 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>Patient Clinical History</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Patient: {patient?.name} ({patient?.email})</p>
          </div>
        </div>

        {/* Patient Profile Card */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-violet)'
          }}>
            <User size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, color: 'var(--text-primary)', margin: 0 }}>{patient?.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Email: {patient?.email} • Phone: {patient?.phone || 'N/A'}</p>
          </div>
        </div>

        {/* Timeline */}
        <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 20 }}>Historical Visits & Diagnoses Timeline</h2>
        {appointments.length === 0 ? (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No historical visits recorded.</div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 28, borderLeft: '2px dashed var(--accent-cyan)' }}>
            {appointments.map((appt, idx) => {
              const doctorName = appt.doctor?.user?.name || 'Doctor';
              const hasVisitNote = !!appt.visitNote;

              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ position: 'relative', marginBottom: 32 }}
                >
                  <div style={{
                    position: 'absolute',
                    left: -41,
                    top: 4,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: hasVisitNote ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 0 0 4px var(--bg-base)'
                  }}>
                    <CheckCircle2 size={14} />
                  </div>

                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                          {new Date(appt.startsAt).toLocaleDateString('en-IN', { dateStyle: 'full' })}
                        </div>
                        <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                          Consultation with {doctorName} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>({appt.doctor?.specialisation})</span>
                        </h3>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {appt.symptomForm?.urgency && <UrgencyBadge level={appt.symptomForm.urgency} />}
                        {hasVisitNote && (
                          <button
                            onClick={() => generatePrescriptionPdf(appt, 'DOCTOR')}
                            className="btn-secondary"
                            style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <Download size={14} /> Export PDF
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Chief Complaint</span>
                        <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>{appt.symptomForm?.chiefComplaint || appt.symptomForm?.rawSymptoms || 'N/A'}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Clinical Diagnosis & Notes</span>
                        <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>{appt.visitNote?.clinicalNotes || 'Pending'}</p>
                      </div>
                    </div>

                    {hasVisitNote && Array.isArray(appt.visitNote.prescription) && appt.visitNote.prescription.length > 0 && (
                      <div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>Prescribed Medications</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {appt.visitNote.prescription.map((m, i) => (
                            <div key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--accent-emerald)' }}>
                              <strong>{m.drug}</strong> • {m.dose} ({m.frequency})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
