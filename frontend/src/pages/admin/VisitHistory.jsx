import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { adminApi } from '../../api/admin.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { Search, Download } from 'lucide-react';

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
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1150 }}>
        <div className="page-header-row mb-24">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Medical Visit Records</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Audit clinical history log, prescriptions, and medical PDFs.</p>
          </div>

          <div className="search-wrap" style={{ width: 280 }}>
            <Search size={14} />
            <input
              type="text"
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, doctor, diagnosis..."
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-text">Loading visit history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="card empty-state">
            <Search size={36} />
            <h3>No visit records found</h3>
            <p>No matching visits found for your criteria.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Ref</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Urgency</th>
                  <th>Diagnosis / Details</th>
                  <th style={{ textAlign: 'right' }}>Export</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const doctorName = item.doctor?.user?.name || 'Doctor';
                  const patientName = item.patient?.name || 'Patient';
                  const hasPrescription = Array.isArray(item.visitNote?.prescription) && item.visitNote.prescription.length > 0;

                  return (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td>
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>{new Date(item.startsAt).toLocaleDateString('en-IN')}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.id.slice(0, 8)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>{patientName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.patient?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>{doctorName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.doctor?.specialisation}</div>
                      </td>
                      <td>
                        {item.symptomForm?.urgency ? (
                          <UrgencyBadge level={item.symptomForm.urgency} />
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Standard</span>
                        )}
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <div className="truncate" style={{ fontSize: 12, marginBottom: hasPrescription ? 4 : 0 }}>
                          {item.visitNote?.clinicalNotes || item.symptomForm?.chiefComplaint || 'Consultation'}
                        </div>
                        {hasPrescription && (
                          <span className="badge badge-success" style={{ fontSize: 10 }}>
                            {item.visitNote.prescription.length} Meds
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => generatePrescriptionPdf(item, 'ADMIN')}
                          className="btn btn-ghost btn-sm"
                        >
                          <Download size={13} /> PDF
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
