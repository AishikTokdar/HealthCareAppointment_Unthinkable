export const drugDatabase = [
  {
    name: 'Warfarin',
    class: 'Anticoagulant (Blood Thinner)',
    indications: 'Deep vein thrombosis, Pulmonary embolism, Atrial fibrillation',
    contraindications: 'Active bleeding, Hemophilia, Severe hypertension, Pregnancy',
    interactions: [
      { drug: 'Aspirin', severity: 'CRITICAL', detail: 'Substantially increases risk of major gastrointestinal and systemic hemorrhage.' },
      { drug: 'Ibuprofen', severity: 'CRITICAL', detail: 'NSAID inhibition of platelets combined with Warfarin leads to severe bleeding.' },
      { drug: 'Ciprofloxacin', severity: 'WARNING', detail: 'Inhibits Warfarin metabolism, causing dangerous spikes in INR levels.' }
    ]
  },
  {
    name: 'Sildenafil',
    class: 'PDE5 Inhibitor / Antihypertensive',
    indications: 'Erectile dysfunction, Pulmonary arterial hypertension',
    contraindications: 'Concurrent nitrate therapy, Severe heart failure, Hypotension',
    interactions: [
      { drug: 'Nitroglycerin', severity: 'CRITICAL', detail: 'Causes profound, life-threatening systemic hypotension and circulatory collapse.' },
      { drug: 'Isosorbide Mononitrate', severity: 'CRITICAL', detail: 'Potentiates nitrate vasodilatory effects leading to severe blood pressure drop.' },
      { drug: 'Amlodipine', severity: 'CAUTION', detail: 'Additive blood pressure lowering effects; monitor vital signs.' }
    ]
  },
  {
    name: 'Metformin',
    class: 'Biguanide Antidiabetic',
    indications: 'Type 2 Diabetes Mellitus, Polycystic ovary syndrome',
    contraindications: 'Severe renal impairment (eGFR < 30), Metabolic acidosis, Acute heart failure',
    interactions: [
      { drug: 'Alcohol', severity: 'WARNING', detail: 'Increases risk of severe lactic acidosis and hypoglycemia.' },
      { drug: 'Contrast Media (Iodinated)', severity: 'CRITICAL', detail: 'May trigger acute renal failure leading to metformin accumulation.' }
    ]
  },
  {
    name: 'Lisinopril',
    class: 'ACE Inhibitor',
    indications: 'Hypertension, Heart failure, Post-myocardial infarction',
    contraindications: 'History of angioedema, Hereditary edema, Pregnancy (Fetal toxicity)',
    interactions: [
      { drug: 'Spironolactone', severity: 'CRITICAL', detail: 'Combined potassium retention risks severe hyperkalemia and cardiac arrhythmia.' },
      { drug: 'Potassium Supplements', severity: 'CRITICAL', detail: 'Significant risk of hyperkalemia; monitor serum potassium regularly.' },
      { drug: 'Ibuprofen', severity: 'WARNING', detail: 'NSAIDs decrease antihypertensive efficacy and increase renal impairment risk.' }
    ]
  },
  {
    name: 'Amoxicillin',
    class: 'Penicillin Antibiotic',
    indications: 'Bacterial infections of respiratory tract, ENT, skin, urinary tract',
    contraindications: 'Penicillin hypersensitivity, Severe allergic asthma',
    interactions: [
      { drug: 'Methotrexate', severity: 'WARNING', detail: 'Decreases renal clearance of Methotrexate, increasing bone marrow toxicity risk.' },
      { drug: 'Allopurinol', severity: 'WARNING', detail: 'Higher incidence of generalized skin rashes.' }
    ]
  },
  {
    name: 'Atorvastatin',
    class: 'HMG-CoA Reductase Inhibitor (Statin)',
    indications: 'Hypercholesterolemia, Cardiovascular disease prevention',
    contraindications: 'Active liver disease, Unexplained elevated transaminases, Pregnancy',
    interactions: [
      { drug: 'Grapefruit Juice', severity: 'WARNING', detail: 'Inhibits CYP3A4, causing statin accumulation and rhabdomyolysis risk.' },
      { drug: 'Clarithromycin', severity: 'CRITICAL', detail: 'Markedly increases serum Atorvastatin levels leading to muscle toxicity.' }
    ]
  },
  {
    name: 'Tramadol',
    class: 'Central Analgesic (Opioid Agonist)',
    indications: 'Moderate to severe pain management',
    contraindications: 'Severe respiratory depression, Acute intoxication, MAOI use',
    interactions: [
      { drug: 'Fluoxetine', severity: 'CRITICAL', detail: 'Potentiates central serotonin levels, triggering life-threatening Serotonin Syndrome.' },
      { drug: 'Sertraline', severity: 'CRITICAL', detail: 'Increases seizure threshold risk and serotonin toxicity.' }
    ]
  },
  {
    name: 'Levothyroxine',
    class: 'Thyroid Hormone Synthetic',
    indications: 'Hypothyroidism, Thyroid TSH suppression',
    contraindications: 'Untreated adrenal insufficiency, Thyrotoxicosis, Acute MI',
    interactions: [
      { drug: 'Calcium Carbonate', severity: 'CAUTION', detail: 'Binds Levothyroxine in gastrointestinal tract; separate doses by 4 hours.' },
      { drug: 'Ferrous Sulfate', severity: 'CAUTION', detail: 'Iron chelates thyroid hormone, decreasing clinical efficacy.' }
    ]
  },
  {
    name: 'Clopidogrel',
    class: 'Antiplatelet Agent',
    indications: 'Acute coronary syndrome, Stroke prevention',
    contraindications: 'Active pathological bleeding (peptic ulcer, intracranial hemorrhage)',
    interactions: [
      { drug: 'Omeprazole', severity: 'WARNING', detail: 'Inhibits CYP2C19 activation of Clopidogrel, reducing antiplatelet protection.' },
      { drug: 'Aspirin', severity: 'WARNING', detail: 'Dual antiplatelet therapy increases bleeding risk; monitor closely.' }
    ]
  },
  {
    name: 'Ciprofloxacin',
    class: 'Fluoroquinolone Antibiotic',
    indications: 'Complicated UTI, Bacterial gastroenteritis, Bone infections',
    contraindications: 'History of tendonitis or tendon rupture associated with fluoroquinolones',
    interactions: [
      { drug: 'Antacids (Calcium/Magnesium)', severity: 'CAUTION', detail: 'Chelates antibiotic, reducing gastrointestinal absorption by up to 90%.' },
      { drug: 'Theophylline', severity: 'WARNING', detail: 'Inhibits metabolism, causing elevated blood levels and seizure risks.' }
    ]
  }
];

export function checkDrugPairInteraction(drugA, drugB) {
  if (!drugA || !drugB) return null;
  const cleanA = drugA.trim().toLowerCase();
  const cleanB = drugB.trim().toLowerCase();

  const matchA = drugDatabase.find(d => d.name.toLowerCase() === cleanA);
  if (matchA) {
    const directHit = matchA.interactions.find(i => i.drug.toLowerCase() === cleanB);
    if (directHit) return { drug1: matchA.name, drug2: directHit.drug, severity: directHit.severity, detail: directHit.detail };
  }

  const matchB = drugDatabase.find(d => d.name.toLowerCase() === cleanB);
  if (matchB) {
    const reverseHit = matchB.interactions.find(i => i.drug.toLowerCase() === cleanA);
    if (reverseHit) return { drug1: matchB.name, drug2: reverseHit.drug, severity: reverseHit.severity, detail: reverseHit.detail };
  }

  return null;
}
