import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { visitsApi } from '../../api/visits.api';
import { ArrowLeft, Plus, Trash2, CheckCircle2, ShieldAlert, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function SubmitVisitNote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescription, setPrescription] = useState([
    { drug: '', dose: '', frequency: 'twice daily (BD)', days: '5' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Safety Warning state
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
    if (validMeds.length === 0) {
      alert('Please enter at least one medication name before running AI drug safety check.');
      return;
    }

    setCheckingSafety(true);
    setSafetyResult(null);
    try {
      const res = await visitsApi.checkSafety(id, validMeds);
      setSafetyResult(res.data);
    } catch (err) {
      alert('Drug safety check failed. Please try again.');
    } finally {
      setCheckingSafety(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) {
      setError('Please enter clinical notes.');
      return;
    }

    if (safetyResult?.safetyStatus === 'CRITICAL') {
      const confirmSave = window.confirm(
        '⚠️ CRITICAL DRUG INTERACTION DETECTED!\n\nAI flagged critical safety risks with the prescribed drug combinations.\n\nAre you sure you want to proceed and finalize this visit?'
      );
      if (!confirmSave) return;
    }

    setError('');
    setSubmitting(true);

    try {
      await visitsApi.submit(id, clinicalNotes, prescription);
      navigate(`/doctor/appointments/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit visit notes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 900 }}>
        <button onClick={() => navigate(`/doctor/appointments/${id}`)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Briefing
        </button>

        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>Record Visit & Prescription</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Enter clinical observations and prescribe medications. AI will check drug interactions and generate a patient summary.</p>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 16 }}>Clinical Notes & Assessment</h3>
            <textarea
              className="input-field"
              rows={6}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Enter diagnosis, clinical observations, examination findings, and follow-up recommendations..."
              required
            />
          </div>

          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Prescription & Dosage</h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enter prescribed drugs and timings.</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleVerifyDrugSafety}
                  disabled={checkingSafety}
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: '6px 14px', color: 'var(--accent-violet)', borderColor: 'var(--accent-violet)', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Sparkles size={16} /> {checkingSafety ? 'Checking Safety...' : 'Run AI Drug Safety Check'}
                </button>
                <button type="button" onClick={handleAddMedication} className="btn-secondary" style={{ fontSize: 13, padding: '6px 12px' }}>
                  <Plus size={16} /> Add Medication
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {prescription.map((med, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 40px', gap: 12, alignItems: 'center', background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Drug (e.g. Warfarin 5mg, Aspirin 75mg)"
                    value={med.drug}
                    onChange={(e) => handleMedChange(idx, 'drug', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Dose (e.g. 1 tab daily)"
                    value={med.dose}
                    onChange={(e) => handleMedChange(idx, 'dose', e.target.value)}
                  />
                  <select
                    className="input-field"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                  >
                    <option value="once daily (OD)">once daily (OD)</option>
                    <option value="twice daily (BD)">twice daily (BD)</option>
                    <option value="three times daily (TDS)">three times daily (TDS)</option>
                    <option value="every 8 hours">every 8 hours</option>
                  </select>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Days (e.g. 5)"
                    value={med.days}
                    onChange={(e) => handleMedChange(idx, 'days', e.target.value)}
                  />
                  {prescription.length > 1 && (
                    <button type="button" onClick={() => handleRemoveMedication(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: 8 }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* AI Drug Safety & Interaction Analysis Panel */}
            <AnimatePresence>
              {safetyResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: safetyResult.safetyStatus === 'CRITICAL'
                      ? 'rgba(244, 63, 94, 0.12)'
                      : safetyResult.safetyStatus === 'WARNING'
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
                    border: `1px solid ${
                      safetyResult.safetyStatus === 'CRITICAL'
                        ? 'rgba(244, 63, 94, 0.4)'
                        : safetyResult.safetyStatus === 'WARNING'
                        ? 'rgba(245, 158, 11, 0.4)'
                        : 'rgba(16, 185, 129, 0.4)'
                    }`,
                    padding: 20,
                    borderRadius: 'var(--radius-md)',
                    marginTop: 16
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    {safetyResult.safetyStatus === 'CRITICAL' ? (
                      <ShieldAlert size={22} style={{ color: 'var(--accent-rose)' }} />
                    ) : safetyResult.safetyStatus === 'WARNING' ? (
                      <AlertTriangle size={22} style={{ color: 'var(--accent-amber)' }} />
                    ) : (
                      <CheckCircle size={22} style={{ color: 'var(--accent-emerald)' }} />
                    )}
                    <h4 style={{
                      margin: 0,
                      fontSize: 16,
                      color: safetyResult.safetyStatus === 'CRITICAL'
                        ? 'var(--accent-rose)'
                        : safetyResult.safetyStatus === 'WARNING'
                        ? 'var(--accent-amber)'
                        : 'var(--accent-emerald)'
                    }}>
                      AI Drug Safety Analysis: {safetyResult.safetyStatus}
                    </h4>
                  </div>

                  {safetyResult.dosageAdvice && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {safetyResult.dosageAdvice}
                    </p>
                  )}

                  {safetyResult.warnings && safetyResult.warnings.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {safetyResult.warnings.map((w, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-surface)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                          <strong style={{ fontSize: 14, color: w.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)', display: 'block', marginBottom: 4 }}>
                            {w.severity}: {w.drugPair}
                          </strong>
                          <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{w.message}</p>
                          <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 500 }}>
                            💡 Recommendation: {w.recommendation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '16px', justifyContent: 'center' }}>
            {submitting ? 'Processing Summary...' : <>Finalize Visit & Send Post-Visit Summary <CheckCircle2 size={18} /></>}
          </button>
        </form>
      </main>
    </div>
  );
}
