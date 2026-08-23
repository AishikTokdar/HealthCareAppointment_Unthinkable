import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { doctorsApi } from '../../api/doctors.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { ArrowLeft, User, Download, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DoctorPatientHistory() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchHistory(); }, [patientId]);

  const fetchHistory = () => {
    setLoading(true);
    doctorsApi.getPatientHistory(patientId)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.error || 'Access denied.'))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="page-main"><div className="loading-text">Loading patient medical history...</div></main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="page-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ padding: 40, maxWidth: 460, textAlign: 'center', borderTop: '3px solid var(--danger)' }}>
            <ShieldAlert size={32} style={{ color: 'var(--danger)', marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Access Restricted</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>{error}</p>
            <button onClick={() => navigate('/doctor/dashboard')} className="btn btn-accent">
              <ArrowLeft size={14} /> Return to Schedule
            </button>
          </div>
        </main>
      </div>
    );
  }

  const patient = data?.patient;
  const appointments = data?.appointments || [];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1050 }}>
        <button onClick={() => navigate(-1)} className="back-link"><ArrowLeft size={14} /> Back</button>

        <div className="page-header">
          <h1>Patient Clinical History</h1>
          <p>Patient: {patient?.name} ({patient?.email})</p>
        </div>

        <div className="card mb-24" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar avatar-lg"><User size={26} /></div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 16 }}>{patient?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Email: {patient?.email} · Phone: {patient?.phone || 'N/A'}</div>
          </div>
        </div>

        <h2 className="section-title mb-16">Visit Timeline</h2>

        {appointments.length === 0 ? (
          <div className="card empty-state">
            <p>No historical visits recorded.</p>
          </div>
        ) : (
          <div className="timeline">
            {appointments.map((appt, idx) => {
              const doctorName = appt.doctor?.user?.name || 'Doctor';
              const hasVisitNote = !!appt.visitNote;

              return (
                <motion.div key={appt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }} className="timeline-item">
                  <div className={`timeline-dot ${hasVisitNote ? 'completed' : ''}`} />

                  <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>
                          {new Date(appt.startsAt).toLocaleDateString('en-IN', { dateStyle: 'full' })}
                        </div>
                        <div style={{ fontWeight: 500 }}>
                          {doctorName} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>({appt.doctor?.specialisation})</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {appt.symptomForm?.urgency && <UrgencyBadge level={appt.symptomForm.urgency} />}
                        {hasVisitNote && (
                          <button onClick={() => generatePrescriptionPdf(appt, 'DOCTOR')} className="btn btn-ghost btn-sm"><Download size={13} /> PDF</button>
                        )}
                      </div>
                    </div>

                    <div className="form-row form-row-2" style={{ background: 'var(--bg-inset)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                      <div><div className="detail-label">Chief Complaint</div><p style={{ fontSize: 12, margin: 0 }}>{appt.symptomForm?.chiefComplaint || appt.symptomForm?.rawSymptoms || 'N/A'}</p></div>
                      <div><div className="detail-label">Clinical Notes</div><p style={{ fontSize: 12, margin: 0 }}>{appt.visitNote?.clinicalNotes || 'Pending'}</p></div>
                    </div>

                    {hasVisitNote && Array.isArray(appt.visitNote.prescription) && appt.visitNote.prescription.length > 0 && (
                      <div>
                        <div className="detail-label mb-4">Medications</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {appt.visitNote.prescription.map((m, i) => (
                            <span key={i} className="badge badge-success" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>{m.drug} · {m.dose}</span>
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
