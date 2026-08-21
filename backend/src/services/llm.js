const { geminiClient, groqClient } = require('../config/llm');

const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.6-pro',
  'gemini-3.5-flash',
  'gemini-3.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-latest'
];
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'];

function assessEmergencyRule(symptoms) {
  const text = (symptoms || '').toLowerCase();
  const redFlags = ['chest pain', 'breath', 'breathing', 'unconscious', 'faint', 'stroke', 'numbness', 'severe bleeding', 'high fever', 'seizure', 'anaphylaxis'];
  if (redFlags.some(flag => text.includes(flag))) {
    return 'High';
  }
  return null;
}

function normalizeUrgency(urgencyStr, defaultLevel = 'Medium') {
  if (!urgencyStr) return defaultLevel;
  const str = String(urgencyStr).trim().toLowerCase();
  if (str.includes('high')) return 'High';
  if (str.includes('low')) return 'Low';
  if (str.includes('med')) return 'Medium';
  return defaultLevel;
}

async function callGemini(promptText) {
  if (!geminiClient) return null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = geminiClient.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(promptText);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { status: 'SUCCESS', data: parsed, raw: text };
    } catch (err) {
      console.warn(`Gemini model ${modelName} failed:`, err.message);
    }
  }
  return null;
}

async function callGroq(promptText) {
  if (!groqClient) return null;
  for (const modelName of GROQ_MODELS) {
    try {
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: promptText }],
        model: modelName,
        response_format: { type: 'json_object' }
      });
      const text = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      return { status: 'SUCCESS', data: parsed, raw: text };
    } catch (err) {
      console.warn(`Groq model ${modelName} failed:`, err.message);
    }
  }
  return null;
}

async function callGeminiText(promptText) {
  if (!geminiClient) return null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = geminiClient.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(promptText);
      return result.response.text().trim();
    } catch (err) {
      console.warn(`Gemini text model ${modelName} failed:`, err.message);
    }
  }
  return null;
}

async function callGroqText(promptText) {
  if (!groqClient) return null;
  for (const modelName of GROQ_MODELS) {
    try {
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: promptText }],
        model: modelName
      });
      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (err) {
      console.warn(`Groq text model ${modelName} failed:`, err.message);
    }
  }
  return null;
}

async function generatePreVisitSummary(symptoms) {
  const emergencyCheck = assessEmergencyRule(symptoms);

  const promptText = `Perform a clinical triage analysis on the following patient symptoms in clean Indian English clinical style.
Classify urgency strictly into one of three categories:
- "High": Critical red-flag symptoms, severe pain, breathing issues, or acute distress.
- "Medium": Moderate ongoing symptoms, infection signs, or discomfort requiring timely medical review.
- "Low": Mild, chronic, routine checkup, or minor non-urgent symptoms.

Return valid JSON only with keys:
"urgency": ("Low" | "Medium" | "High"),
"chiefComplaint": (concise 1-sentence summary of main symptom),
"suggestedQuestions": (array of 3 targeted diagnostic questions for the doctor).

Symptoms: ${symptoms}`;

  let res = await callGemini(promptText);
  if (!res) {
    res = await callGroq(promptText);
  }

  if (res && res.data) {
    const rawUrgency = emergencyCheck || res.data.urgency;
    res.data.urgency = normalizeUrgency(rawUrgency, emergencyCheck || 'Medium');
    return res;
  }

  const fallbackUrgency = emergencyCheck || (symptoms.length < 30 ? 'Low' : 'Medium');

  return {
    status: 'FAILED',
    data: {
      urgency: fallbackUrgency,
      chiefComplaint: symptoms.slice(0, 120),
      suggestedQuestions: [
        'How long have these symptoms been occurring?',
        'Are there any aggravating or relieving factors?',
        'What is the recommended course of treatment?'
      ]
    },
    raw: 'LLM service unavailable'
  };
}

async function generatePostVisitSummary(clinicalNotes, prescription) {
  const promptText = `Convert these clinical notes into a patient-friendly summary in clean Indian English with medication schedule and follow-up steps: ${clinicalNotes}. Prescription info: ${JSON.stringify(prescription)}. Return valid JSON only with keys "patientSummary", "medicationSchedule", and "followUpSteps".`;

  const geminiRes = await callGemini(promptText);
  if (geminiRes) return geminiRes;

  const groqRes = await callGroq(promptText);
  if (groqRes) return groqRes;

  return {
    status: 'FAILED',
    data: {
      patientSummary: clinicalNotes,
      medicationSchedule: Array.isArray(prescription) ? prescription.map(p => `${p.drug} - ${p.dose} (${p.frequency})`) : [],
      followUpSteps: ['Follow up with clinic if symptoms persist.']
    },
    raw: 'LLM service unavailable'
  };
}

async function refineDoctorMessage(draftText, symptoms, chiefComplaint) {
  const promptText = `You are an expert medical physician conducting a patient consultation.
Refine the following rough doctor notes/draft into an empathetic, highly professional, clear, and clinically precise response in clean Indian English.

STRICT INSTRUCTIONS:
1. Stick strictly to the patient's reported symptoms ("${symptoms || chiefComplaint || 'general health inquiry'}") and diagnosis/treatment guidance.
2. Maintain an empathetic, authoritative medical tone.
3. Do NOT include generic filler or meta comments. Output ONLY the polished message text.

Doctor's rough draft: ${draftText}`;

  const geminiRes = await callGeminiText(promptText);
  if (geminiRes) return geminiRes;

  const groqRes = await callGroqText(promptText);
  if (groqRes) return groqRes;

  return draftText;
}

async function checkDrugSafety(prescriptionList, symptoms, chiefComplaint) {
  if (!Array.isArray(prescriptionList) || prescriptionList.length === 0) {
    return {
      safetyStatus: 'SAFE',
      hasInteractions: false,
      warnings: [],
      dosageAdvice: 'No medications specified.'
    };
  }

  const promptText = `Analyze the following prescribed medication list for drug-drug interactions, contraindications, or dosage anomalies in clean Indian English clinical context.
Patient Symptoms/Complaint: "${symptoms || chiefComplaint || 'General Visit'}"
Prescribed Medications: ${JSON.stringify(prescriptionList)}

STRICT INSTRUCTIONS:
Return valid JSON only with keys:
"safetyStatus": ("SAFE" | "WARNING" | "CRITICAL"),
"hasInteractions": boolean,
"warnings": array of objects with keys { "severity": ("CRITICAL" | "MODERATE" | "INFO"), "drugPair": string, "message": string, "recommendation": string },
"dosageAdvice": string.`;

  let res = await callGemini(promptText);
  if (!res) {
    res = await callGroq(promptText);
  }

  if (res && res.data) {
    return res.data;
  }

  const medNames = prescriptionList.map(p => (p.drug || '').toLowerCase()).join(' ');
  const warnings = [];

  if (medNames.includes('warfarin') && (medNames.includes('aspirin') || medNames.includes('ibuprofen') || medNames.includes('nsaid'))) {
    warnings.push({
      severity: 'CRITICAL',
      drugPair: 'Warfarin & NSAID / Aspirin',
      message: 'High risk of gastrointestinal and systemic hemorrhage due to concomitant anticoagulant and antiplatelet activity.',
      recommendation: 'Consider replacing Aspirin/NSAID with Paracetamol for analgesia.'
    });
  }

  if ((medNames.includes('sildenafil') || medNames.includes('tadalafil')) && (medNames.includes('nitroglycerin') || medNames.includes('nitrate'))) {
    warnings.push({
      severity: 'CRITICAL',
      drugPair: 'PDE5 Inhibitor & Nitrates',
      message: 'Potentially fatal precipitous drop in blood pressure.',
      recommendation: 'Avoid co-administering nitrates with PDE5 inhibitors.'
    });
  }

  if (medNames.includes('fluoxetine') && medNames.includes('tramadol')) {
    warnings.push({
      severity: 'MODERATE',
      drugPair: 'Fluoxetine & Tramadol',
      message: 'Increased risk of serotonin syndrome and lowered seizure threshold.',
      recommendation: 'Monitor patient closely for hyperreflexia, tremor, and agitation.'
    });
  }

  const safetyStatus = warnings.some(w => w.severity === 'CRITICAL') ? 'CRITICAL' : warnings.length > 0 ? 'WARNING' : 'SAFE';

  return {
    safetyStatus,
    hasInteractions: warnings.length > 0,
    warnings,
    dosageAdvice: warnings.length > 0 ? 'Potential interactions detected. Please review recommendations.' : 'Prescription verified with basic clinical safety rules.'
  };
}

module.exports = {
  generatePreVisitSummary,
  generatePostVisitSummary,
  refineDoctorMessage,
  checkDrugSafety
};
