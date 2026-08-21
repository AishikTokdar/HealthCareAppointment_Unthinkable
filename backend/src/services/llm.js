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

async function generatePreVisitSummary(symptoms) {
  const promptText = `Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Return valid JSON only with keys "urgency", "chiefComplaint", and "suggestedQuestions". Symptoms: ${symptoms}`;

  const geminiRes = await callGemini(promptText);
  if (geminiRes) return geminiRes;

  const groqRes = await callGroq(promptText);
  if (groqRes) return groqRes;

  return {
    status: 'FAILED',
    data: {
      urgency: 'Medium',
      chiefComplaint: symptoms.slice(0, 100),
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

module.exports = {
  generatePreVisitSummary,
  generatePostVisitSummary
};
