const LANGUAGE_ID = 63;

const env = k =>
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[k]) ||
  (typeof process !== 'undefined' && process.env && process.env[k]) || '';

function sanitizeBase(u) {
  return String(u || '').replace(/\/$/, '');
}

async function createSubmission(sourceCode) {
  const base = sanitizeBase(env('VITE_JUDGE0_BASE'));
  const url = `${base}/submissions?base64_encoded=false&wait=true`;
  const headers = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': env('VITE_JUDGE0_KEY'),
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  };
  const body = JSON.stringify({ source_code: sourceCode, language_id: LANGUAGE_ID, stdin: '' });
  const res = await fetch(url, { method: 'POST', headers, body });
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`Judge0 HTTP ${res.status}${detail ? `: ${detail}` : ''}`);
  }
  return res.json();
}

function normalizeCases(tests) {
  if (!Array.isArray(tests)) return [];
  if (tests.length === 0) return [];
  if ('args' in tests[0] || 'expected' in tests[0]) return tests;
  if ('input' in tests[0] || 'expected_output' in tests[0]) {
    return tests.map(t => ({ args: [t.input], expected: t.expected_output }));
  }
  return [];
}

function guessFunctionName(src) {
  const patterns = [
    /function\s+([A-Za-z_$][\w$]*)\s*\(/,
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/,
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*function\s*\(/
  ];
  for (const re of patterns) {
    const m = src.match(re);
    if (m && m[1]) return m[1];
  }
  return '';
}

function buildHarness(userCode, cases) {
  const guessed = guessFunctionName(userCode);
  return `
${userCode}
const cases = ${JSON.stringify(cases)};
function pickSolution(){
  let fn = null;
  try { if (typeof solution !== 'undefined') fn = solution; } catch {}
  if (!fn && typeof globalThis !== 'undefined' && typeof globalThis.solution === 'function') fn = globalThis.solution;
  if (!fn && typeof module !== 'undefined' && typeof module.exports === 'function') fn = module.exports;
  if (!fn && typeof module !== 'undefined' && module.exports && typeof module.exports.solution === 'function') fn = module.exports.solution;
  if (!fn && typeof exports !== 'undefined' && typeof exports.solution === 'function') fn = exports.solution;
  if (!fn && typeof module !== 'undefined' && module.exports && typeof module.exports.default === 'function') fn = module.exports.default;
  if (!fn && typeof exports !== 'undefined' && typeof exports.default === 'function') fn = exports.default;
  ${guessed ? `if (!fn && typeof ${guessed} === 'function') fn = ${guessed};` : ''}
  return fn;
}
const FN = pickSolution();
const __origLog = console.log;
console.log = function(){};
function run() {
  const out = [];
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    let passed = false, got = null, err = null, t0 = Date.now();
    try {
      if (!FN) throw new Error("solution is not defined");
      const a = Array.isArray(c.args) ? c.args : [c.args];
      got = FN(...(a || []));
      passed = JSON.stringify(got) === JSON.stringify(c.expected);
    } catch (e) {
      err = String(e && e.message ? e.message : e);
    }
    out.push({ i, passed, got, expected: c.expected, time_ms: Date.now() - t0, error: err });
  }
  const passedCount = out.filter(x => x.passed).length;
  return { passed: passedCount, total: out.length, results: out };
}
const res = run();
console.log = __origLog;
console.log(JSON.stringify(res));
`;
}

export async function runTests({ userCode, tests = [] }) {
  const cases = normalizeCases(tests);
  const harness = buildHarness(userCode || '', cases);
  const res = await createSubmission(harness);
  let parsed = null;
  try { parsed = JSON.parse(res?.stdout || '{}'); } catch {}
  const results = parsed?.results || [];
  const allPassed = parsed && parsed.total > 0 && parsed.passed === parsed.total;
  return { allPassed, results, summary: { passed: parsed?.passed || 0, total: parsed?.total || 0 } };
}

export { createSubmission };
