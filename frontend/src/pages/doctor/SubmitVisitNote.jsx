import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { visitsApi } from '../../api/visits.api';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function SubmitVisitNote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescription, setPrescription] = useState([
    { drug: '', dose: '', frequency: 'once daily', days: '7' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedication = () => {
    setPrescription([...prescription, { drug: '', dose: '', frequency: 'once daily', days: '7' }]);
  };

  const handleRemoveMedication = (index) => {
    setPrescription(prescription.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...prescription];
    updated[index][field] = value;
    setPrescription(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) {
      setError('Please enter clinical notes.');
      return;
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
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Enter clinical observations and prescribe medications. AI will generate a patient summary and set up reminder alerts.</p>

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
              <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Prescription & Dosage</h3>
              <button type="button" onClick={handleAddMedication} className="btn-secondary" style={{ fontSize: 13, padding: '6px 12px' }}>
                <Plus size={16} /> Add Medication
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {prescription.map((med, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 40px', gap: 12, alignItems: 'center', background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Drug Name (e.g. Amoxicillin)"
                    value={med.drug}
                    onChange={(e) => handleMedChange(idx, 'drug', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Dose (e.g. 500mg)"
                    value={med.dose}
                    onChange={(e) => handleMedChange(idx, 'dose', e.target.value)}
                  />
                  <select
                    className="input-field"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                  >
                    <option value="once daily">once daily</option>
                    <option value="twice daily">twice daily</option>
                    <option value="three times daily">three times daily</option>
                    <option value="every 8 hours">every 8 hours</option>
                  </select>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Days (e.g. 7)"
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
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '16px', justifyContent: 'center' }}>
            {submitting ? 'Processing Summary...' : <>Finalize Visit & Send Post-Visit Summary <CheckCircle2 size={18} /></>}
          </button>
        </form>
      </main>
    </div>
  );
}
