const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

const geminiClient = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const groqClient = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

module.exports = {
  geminiClient,
  groqClient
};
