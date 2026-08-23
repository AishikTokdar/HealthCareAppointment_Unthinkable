export function cleanText(str) {
  if (!str || typeof str !== 'string') return str || '';
  return str
    .replace(/^\s*[\*\-]\s+\*\*(.*?)\*\*/gm, '• $1')
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .trim();
}
