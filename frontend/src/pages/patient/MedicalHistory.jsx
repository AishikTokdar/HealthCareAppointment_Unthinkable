import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Pill, Activity, Download, CheckCircle2 } from 'lucide-react';

import { cleanText } from '../../utils/cleanText';

export default function PatientMedicalHistory() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi.getPatientAppointments()
      .then(res => setAppointments(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const urgencyCounts = appointments.reduce((acc, appt) => {
    const u = appt.symptomForm?.urgency || 'Medium';
    acc[u] = (acc[u] || 0) + 1;
    return acc;
  }, {});

  const urgencyData = [
    { name: 'Low', value: urgencyCounts['Low'] || 0, color: 'var(--success)' },
    { name: 'Medium', value: urgencyCounts['Medium'] || 0, color: 'var(--warning)' },
    { name: 'High', value: urgencyCounts['High'] || 0, color: 'var(--danger)' }
  ].filter(d => d.value > 0);

  const urgencyColors = ['#6ec87a', '#d4a94e', '#d46a6a'];

  const completedVisits = appointments.filter(a => a.visitNote || a.status === 'COMPLETED');
  const activePrescriptions = completedVisits.flatMap(a => {
    const p = a.visitNote?.prescription;
    return Array.isArray(p) ? p.map(item => ({ ...item, doctorName: a.doctor?.user?.name, date: a.startsAt })) : [];
  });

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1050 }}>
        <div className="page-header">
          <h1>Medical History</h1>
          <p>Past consultations, prescriptions, and clinical timeline.</p>
        </div>

        {loading ? (
          <div className="loading-text">Loading medical records...</div>
        ) : appointments.length === 0 ? (
          <div className="card empty-state">
            <Activity size={36} />
            <h3>No medical history</h3>
            <p>No past visits recorded yet.</p>
          </div>
        ) : (
          <>
            <div className="grid-2 mb-32">
              <div className="card" style={{ padding: 20 }}>
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Activity size={15} style={{ color: 'var(--text-muted)' }} /> Urgency Distribution
                </h3>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={urgencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3}>
                        {urgencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={urgencyColors[index % urgencyColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span><span style={{ color: '#6ec87a' }}>●</span> Low</span>
                  <span><span style={{ color: '#d4a94e' }}>●</span> Medium</span>
                  <span><span style={{ color: '#d46a6a' }}>●</span> High</span>
                </div>
              </div>

              <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill size={15} style={{ color: 'var(--text-muted)' }} /> Active Prescriptions ({activePrescriptions.length})
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Current medications from your physicians.</p>
                <div style={{ flex: 1, maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activePrescriptions.length === 0 ? (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active medications</span>
                  ) : (
                    activePrescriptions.slice(0, 5).map((med, idx) => (
                      <div key={idx} className="card-flat" style={{ padding: '6px 10px', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ color: 'var(--success)' }}>{med.drug} ({med.dose})</strong>
                        <span style={{ color: 'var(--text-muted)' }}>{med.frequency}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <h2 className="section-title mb-16">Consultation Timeline</h2>
            <div className="timeline">
              {appointments.map((appt, idx) => {
                const doctorName = appt.doctor?.user?.name || 'Doctor';
                const hasVisitNote = !!appt.visitNote;

                return (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="timeline-item"
                  >
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
                            <button onClick={() => generatePrescriptionPdf(appt, 'PATIENT')} className="btn btn-ghost btn-sm">
                              <Download size={13} /> PDF
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="form-row form-row-2" style={{ background: 'var(--bg-inset)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                        <div>
                          <div className="detail-label">Symptoms</div>
                          <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0 }}>
                            {cleanText(appt.symptomForm?.chiefComplaint || appt.symptomForm?.rawSymptoms) || 'General consultation'}
                          </p>
                        </div>
                        <div>
                          <div className="detail-label">Clinical Notes</div>
                          <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0 }}>
                            {cleanText(appt.visitNote?.clinicalNotes) || 'Pending'}
                          </p>
                        </div>
                      </div>

                      {hasVisitNote && Array.isArray(appt.visitNote.prescription) && appt.visitNote.prescription.length > 0 && (
                        <div>
                          <div className="detail-label mb-4">Medications</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {appt.visitNote.prescription.map((m, i) => (
                              <span key={i} className="badge badge-success" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                                {m.drug} · {m.dose}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
