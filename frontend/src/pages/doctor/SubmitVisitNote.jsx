import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { visitsApi } from '../../api/visits.api';
import { ArrowLeft, Plus, Trash2, CheckCircle2, ShieldAlert, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

export default function SubmitVisitNote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescription, setPrescription] = useState([
    { drug: '', dose: '', frequency: 'twice daily (BD)', days: '5' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [checkingSafety, setCheckingSafety] = useState(false);
  const [safetyResult, setSafetyResult] = useState(null);

  const handleAddMedication = () => {
    setPrescription([...prescription, { drug: '', dose: '', frequency: 'twice daily (BD)', days: '5' }]);
    setSafetyResult(null);
  };

  const handleRemoveMedication = (index) => {
    setPrescription(prescription.filter((_, i) => i !== index));
    setSafetyResult(null);
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...prescription];
    updated[index][field] = value;
    setPrescription(updated);
    setSafetyResult(null);
  };

  const handleVerifyDrugSafety = async () => {
    const validMeds = prescription.filter(m => m.drug && m.drug.trim());
    if (validMeds.length === 0) { alert('Enter at least one medication name.'); return; }
    setCheckingSafety(true);
    setSafetyResult(null);
    try { const res = await visitsApi.checkSafety(id, validMeds); setSafetyResult(res.data); }
    catch { alert('Drug safety check failed.'); }
    finally { setCheckingSafety(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) { setError('Please enter clinical notes.'); return; }
    if (safetyResult?.safetyStatus === 'CRITICAL') {
      if (!window.confirm('CRITICAL drug interaction detected. Proceed anyway?')) return;
    }
    setError('');
    setSubmitting(true);
    try { await visitsApi.submit(id, clinicalNotes, prescription); navigate(`/doctor/appointments/${id}`); }
    catch (err) { setError(err.response?.data?.error || 'Failed to submit visit notes'); }
    finally { setSubmitting(false); }
  };

  const safetyColor = safetyResult?.safetyStatus === 'CRITICAL' ? 'danger' : safetyResult?.safetyStatus === 'WARNING' ? 'warning' : 'success';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 900 }}>
        <button onClick={() => navigate(`/doctor/appointments/${id}`)} className="back-link">
          <ArrowLeft size={14} /> Back to briefing
        </button>

        <div className="page-header">
          <h1>Record Visit & Prescription</h1>
          <p>Enter clinical observations and prescribe medications.</p>
        </div>

        {error && <div className="alert alert-danger mb-16">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 className="section-title mb-12">Clinical Notes & Assessment</h3>
            <textarea className="input" rows={6} value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Diagnosis, observations, examination findings, follow-up..." required />
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 className="section-title" style={{ margin: 0 }}>Prescription & Dosage</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enter prescribed drugs and timings.</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={handleVerifyDrugSafety} disabled={checkingSafety} className="btn btn-ghost btn-sm">
                  <Sparkles size={14} /> {checkingSafety ? 'Checking...' : 'Safety Check'}
                </button>
                <button type="button" onClick={handleAddMedication} className="btn btn-ghost btn-sm">
                  <Plus size={14} /> Add Row
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {prescription.map((med, idx) => (
                <div key={idx} className="med-row">
                  <input type="text" className="input" placeholder="Drug (e.g. Warfarin 5mg)" value={med.drug} onChange={(e) => handleMedChange(idx, 'drug', e.target.value)} />
                  <input type="text" className="input" placeholder="Dose (e.g. 1 tab)" value={med.dose} onChange={(e) => handleMedChange(idx, 'dose', e.target.value)} />
                  <select className="input" value={med.frequency} onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}>
                    <option value="once daily (OD)">once daily (OD)</option>
                    <option value="twice daily (BD)">twice daily (BD)</option>
                    <option value="three times daily (TDS)">three times daily (TDS)</option>
                    <option value="every 8 hours">every 8 hours</option>
                  </select>
                  <input type="text" className="input" placeholder="Days" value={med.days} onChange={(e) => handleMedChange(idx, 'days', e.target.value)} />
                  {prescription.length > 1 && (
                    <button type="button" onClick={() => handleRemoveMedication(idx)} className="med-remove"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence>
              {safetyResult && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className={`alert alert-${safetyColor}`} style={{ marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {safetyResult.safetyStatus === 'CRITICAL' ? <ShieldAlert size={18} /> : safetyResult.safetyStatus === 'WARNING' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                        <strong>Drug Safety: {safetyResult.safetyStatus}</strong>
                      </div>
                      {safetyResult.dosageAdvice && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{safetyResult.dosageAdvice}</p>}
                      {safetyResult.warnings?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {safetyResult.warnings.map((w, idx) => (
                            <div key={idx} className="card-flat" style={{ padding: 10 }}>
                              <strong style={{ fontSize: 12, color: w.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)', display: 'block', marginBottom: 2 }}>{w.severity}: {w.drugPair}</strong>
                              <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{w.message}</p>
                              <span style={{ fontSize: 11, color: 'var(--accent)' }}>Recommendation: {w.recommendation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-accent btn-full btn-lg">
            {submitting ? 'Processing...' : <>Finalize Visit <CheckCircle2 size={16} /></>}
          </button>
        </form>
      </main>
    </div>
  );
}
