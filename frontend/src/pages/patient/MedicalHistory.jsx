import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Calendar, User, Pill, Activity, Download, Clock, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export default function PatientMedicalHistory() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    appointmentsApi.getPatientAppointments()
      .then(res => setAppointments(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const urgencyCounts = appointments.reduce((acc, appt) => {
    const u = appt.symptomForm?.urgency || 'Medium';
    acc[u] = (acc[u] || 0) + 1;
    return acc;
  }, {});

  const urgencyData = [
    { name: 'Low Urgency', value: urgencyCounts['Low'] || 0, color: '#10b981' },
    { name: 'Medium Urgency', value: urgencyCounts['Medium'] || 0, color: '#f59e0b' },
    { name: 'High Urgency', value: urgencyCounts['High'] || 0, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  const completedVisits = appointments.filter(a => a.visitNote || a.status === 'COMPLETED');
  const activePrescriptions = completedVisits.flatMap(a => {
    const p = a.visitNote?.prescription;
    return Array.isArray(p) ? p.map(item => ({ ...item, doctorName: a.doctor?.user?.name, date: a.startsAt })) : [];
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>
          Medical History & Prescriptions Timeline
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
          Comprehensive record of past consultations, clinical diagnoses, active medication prescriptions, and downloadable PDFs.
        </p>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading medical records...</div>
        ) : appointments.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No past medical visits recorded yet.
          </div>
        ) : (
          <>
            {/* Visual Analytics & Data Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={18} style={{ color: 'var(--accent-violet)' }} /> Triage Urgency Distribution
                </h3>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={urgencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                        {urgencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 8, color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12 }}>
                  <span style={{ color: '#10b981' }}>● Low</span>
                  <span style={{ color: '#f59e0b' }}>● Medium</span>
                  <span style={{ color: '#f43f5e' }}>● High</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Pill size={18} style={{ color: 'var(--accent-emerald)' }} /> Active Prescriptions ({activePrescriptions.length})
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Current medications prescribed by your attending physicians.</p>
                </div>
                <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activePrescriptions.length === 0 ? (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active medications</span>
                  ) : (
                    activePrescriptions.slice(0, 4).map((med, idx) => (
                      <div key={idx} style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ color: 'var(--accent-emerald)' }}>{med.drug} ({med.dose})</strong>
                        <span style={{ color: 'var(--text-muted)' }}>{med.frequency}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Medical History Timeline */}
            <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 20 }}>Clinical Consultation History Timeline</h2>
            <div style={{ position: 'relative', paddingLeft: 28, borderLeft: '2px dashed var(--accent-violet)' }}>
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
                    {/* Timeline Node Icon */}
                    <div style={{
                      position: 'absolute',
                      left: -41,
                      top: 4,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: hasVisitNote ? 'var(--accent-emerald)' : 'var(--accent-violet)',
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
                            {doctorName} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>({appt.doctor?.specialisation})</span>
                          </h3>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {appt.symptomForm?.urgency && <UrgencyBadge level={appt.symptomForm.urgency} />}
                          {hasVisitNote && (
                            <button
                              onClick={() => generatePrescriptionPdf(appt, 'PATIENT')}
                              className="btn-secondary"
                              style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <Download size={14} /> Download PDF
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Symptoms & Diagnosis */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Reported Symptoms</span>
                          <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>{appt.symptomForm?.chiefComplaint || appt.symptomForm?.rawSymptoms || 'General consultation'}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Doctor Clinical Notes</span>
                          <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>{appt.visitNote?.clinicalNotes || 'Consultation ongoing or notes pending'}</p>
                        </div>
                      </div>

                      {/* Prescriptions Table */}
                      {hasVisitNote && Array.isArray(appt.visitNote.prescription) && appt.visitNote.prescription.length > 0 && (
                        <div>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>Rx - Prescribed Medications</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {appt.visitNote.prescription.map((m, i) => (
                              <div>
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
          </>
        )}
      </main>
    </div>
  );
}
