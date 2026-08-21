import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { adminApi } from '../../api/admin.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { FileText, Download, User, Calendar, Search, ShieldCheck } from 'lucide-react';

export default function VisitHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    adminApi.getVisitHistory()
      .then(res => setHistory(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const filteredHistory = history.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      (item.patient?.name || '').toLowerCase().includes(q) ||
      (item.doctor?.user?.name || '').toLowerCase().includes(q) ||
      (item.doctor?.specialisation || '').toLowerCase().includes(q) ||
      (item.symptomForm?.chiefComplaint || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1150 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>
              Medical Visit Records & Prescriptions
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Audit clinical history log, patient prescriptions, and download official medical PDFs.
            </p>
          </div>

          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, doctor, diagnosis..."
              style={{ paddingLeft: 40, fontSize: 13 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading visit history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No visit records found matching criteria.
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Date & Ref ID</th>
                  <th style={{ padding: '12px 16px' }}>Patient Name</th>
                  <th style={{ padding: '12px 16px' }}>Doctor Name</th>
                  <th style={{ padding: '12px 16px' }}>Urgency</th>
                  <th style={{ padding: '12px 16px' }}>Diagnosis / Prescriptions</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>PDF Export</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const doctorName = item.doctor?.user?.name || 'Doctor';
                  const patientName = item.patient?.name || 'Patient';
                  const hasPrescription = Array.isArray(item.visitNote?.prescription) && item.visitNote.prescription.length > 0;

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {new Date(item.startsAt).toLocaleDateString('en-IN')}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {item.id.slice(0, 8)}
                        </span>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{patientName}</strong>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.patient?.email}</span>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{doctorName}</strong>
                        <span style={{ fontSize: 12, color: 'var(--accent-cyan)' }}>{item.doctor?.specialisation}</span>
                      </td>

                      <td style={{ padding: '16px' }}>
                        {item.symptomForm?.urgency ? (
                          <UrgencyBadge level={item.symptomForm.urgency} />
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Standard</span>
                        )}
                      </td>

                      <td style={{ padding: '16px', maxWidth: 260 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.visitNote?.clinicalNotes || item.symptomForm?.chiefComplaint || 'Consultation Record'}
                        </p>
                        {hasPrescription && (
                          <span style={{ fontSize: 11, color: 'var(--accent-emerald)', fontWeight: 600 }}>
                            💊 {item.visitNote.prescription.length} Meds Prescribed
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button
                          onClick={() => generatePrescriptionPdf(item, 'ADMIN')}
                          className="btn-secondary"
                          style={{ fontSize: 12, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <Download size={14} /> PDF
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
