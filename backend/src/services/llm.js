const { geminiClient, groqClient } = require('../config/llm');

async function generatePreVisitSummary(symptoms) {
  const promptText = `Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Return valid JSON only with keys "urgency", "chiefComplaint", and "suggestedQuestions". Symptoms: ${symptoms}`;

  if (geminiClient) {
    try {
      const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(promptText);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { status: 'SUCCESS', data: parsed, raw: text };
    } catch (geminiErr) {
      console.warn('Gemini LLM failed, attempting Groq fallback:', geminiErr.message);
    }
  }

  if (groqClient) {
    try {
      const completion = await groqClient.chat.completions.create({
        messages: [
          { role: 'user', content: promptText }
        ],
        model: 'llama-3.1-70b-instant',
        response_format: { type: 'json_object' }
      });
      const text = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      return { status: 'SUCCESS', data: parsed, raw: text };
    } catch (groqErr) {
      console.warn('Groq LLM fallback failed:', groqErr.message);
    }
  }

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

  if (geminiClient) {
    try {
      const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(promptText);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { status: 'SUCCESS', data: parsed, raw: text };
    } catch (geminiErr) {
      console.warn('Gemini LLM failed for visit summary, trying Groq:', geminiErr.message);
    }
  }

  if (groqClient) {
    try {
      const completion = await groqClient.chat.completions.create({
        messages: [
          { role: 'user', content: promptText }
        ],
        model: 'llama-3.1-70b-instant',
        response_format: { type: 'json_object' }
      });
      const text = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      return { status: 'SUCCESS', data: parsed, raw: text };
    } catch (groqErr) {
      console.warn('Groq LLM failed for visit summary:', groqErr.message);
    }
  }

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
