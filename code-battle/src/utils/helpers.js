// Contains small reusable helper functions (e.g., format dates, sanitize input).

function normalizeOutput(str = "") {
  const s = String(str);
  return s.replace(/\r\n/g, '\n').split('\n').map(line => line.trimEnd()).join('\n').trim();
}

function safeEq(a, b) {
  return normalizeOutput(a) === normalizeOutput(b);
}

function formatTime(secondsOrMs) {
  const num = Number(secondsOrMs);
  if (Number.isNaN(num)) return '-';
  const ms = num < 1 ? num * 1000 : num; 
  return `${ms.toFixed(1)} ms`;
}

function formatMemory(kb) {
  const n = Number(kb);
  if (Number.isNaN(n)) return '-';
  if (n >= 1024) return `${(n / 1024).toFixed(1)} MB`;
  return `${n.toFixed(0)} KB`;
}

export { safeEq, normalizeOutput, formatMemory, formatTime }