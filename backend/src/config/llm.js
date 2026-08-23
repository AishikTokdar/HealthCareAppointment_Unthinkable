const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
  throw new Error('Mandatory environment variable missing: Please provide GEMINI_API_KEY or GROQ_API_KEY in backend/.env');
}

const geminiClient = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const groqClient = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

module.exports = {
  geminiClient,
  groqClient
};
