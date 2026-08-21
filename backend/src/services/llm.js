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

  const promptText = `Perform a clinical triage analysis on the following patient symptoms.
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
  const promptText = `Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: ${clinicalNotes}. Prescription info: ${JSON.stringify(prescription)}. Return valid JSON only with keys "patientSummary", "medicationSchedule", and "followUpSteps".`;

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
Refine the following rough doctor notes/draft into an empathetic, highly professional, clear, and clinically precise response to send to the patient.

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

module.exports = {
  generatePreVisitSummary,
  generatePostVisitSummary,
  refineDoctorMessage
};
