import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { drugDatabase, checkDrugPairInteraction } from '../../data/drugInteractionsData';
import { Search, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function DrugLookupModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(null);

  const [pairDrug1, setPairDrug1] = useState('');
  const [pairDrug2, setPairDrug2] = useState('');
  const [pairResult, setPairResult] = useState(null);
  const [pairChecked, setPairChecked] = useState(false);

  const filteredDrugs = drugDatabase.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.indications.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTestPair = (e) => {
    e.preventDefault();
    setPairChecked(true);
    const result = checkDrugPairInteraction(pairDrug1, pairDrug2);
    setPairResult(result);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Clinical Drug Reference & Interaction Checker">
      <div style={{ maxWidth: 680, width: '100%' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label className="detail-label mb-6">Search Drug Database</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input"
                style={{ paddingLeft: 34 }}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setSelectedDrug(null); }}
                placeholder="Search drug (Warfarin, Sildenafil, Lisinopril, Metformin)..."
              />
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        <div className="card mb-20" style={{ padding: 16, background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>
            Quick Pairwise Interaction Test
          </div>
          <form onSubmit={handleTestPair} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              className="input"
              style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
              value={pairDrug1}
              onChange={(e) => setPairDrug1(e.target.value)}
              placeholder="Drug A (e.g. Warfarin)"
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>+</span>
            <input
              type="text"
              className="input"
              style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
              value={pairDrug2}
              onChange={(e) => setPairDrug2(e.target.value)}
              placeholder="Drug B (e.g. Aspirin)"
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 14px' }}>
              Check Pair
            </button>
          </form>

          {pairChecked && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border-color)' }}>
              {pairResult ? (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: pairResult.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: pairResult.severity === 'CRITICAL' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: pairResult.severity === 'CRITICAL' ? '#f87171' : '#fbbf24' }}>
                    <ShieldAlert size={16} /> [{pairResult.severity}] {pairResult.drug1} + {pairResult.drug2}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{pairResult.detail}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--success)' }}>
                  <CheckCircle2 size={16} /> No direct high-risk interaction logged between {pairDrug1} and {pairDrug2}.
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedDrug ? '1fr 1fr' : '1fr', gap: 16, maxHeight: 380, overflowY: 'auto' }}>
          <div>
            <div className="detail-label mb-8">Clinical Database Records</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredDrugs.map((drug) => (
                <div
                  key={drug.name}
                  onClick={() => setSelectedDrug(drug)}
                  className="card-flat"
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderColor: selectedDrug?.name === drug.name ? 'var(--accent)' : 'var(--border-color)',
                    background: selectedDrug?.name === drug.name ? 'var(--accent-subtle)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main)' }}>{drug.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{drug.class}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Indications: {drug.indications}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedDrug && (
            <div className="card" style={{ padding: 16, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>{selectedDrug.name}</div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, marginBottom: 12 }}>{selectedDrug.class}</div>

              <div className="mb-12">
                <div className="detail-label mb-4">Contraindications & Warnings</div>
                <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', padding: '8px 10px', borderRadius: 6 }}>
                  {selectedDrug.contraindications}
                </div>
              </div>

              <div>
                <div className="detail-label mb-6">Known Drug Interactions ({selectedDrug.interactions.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedDrug.interactions.map((item, idx) => (
                    <div key={idx} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 12, color: 'var(--text-main)' }}>{item.drug}</strong>
                        <span className={`badge ${item.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                          {item.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
