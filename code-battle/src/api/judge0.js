// Function for sending code to Judge0 API for execution.

import { safeEq } from '../utils/helpers'

async function createSubmission(sourceCode, languageId, stdin = "") {
  const url = `${import.meta.env.VITE_JUDGE0_BASE}/submissions?base64_encoded=false&wait=true`

  const headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": import.meta.env.VITE_JUDGE0_KEY,
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
  }

  const body = JSON.stringify({
    source_code: sourceCode,
    language_id: languageId,
    stdin
  })

  const res = await fetch(url, { method: "POST", headers, body })
  if (!res.ok) throw new Error(`Judge0 error: HTTP ${res.status}`)
  return res.json()
}

async function runTests({ languageId, sourceCode, tests = [] }) {
  const results = []

  for (const t of tests) {
    const res = await createSubmission(sourceCode, languageId, t.input ?? '')
    const { stdout = '', stderr = '', status = {} } = res || {}
    const passed = status?.description === 'Accepted' && safeEq(stdout, t.expected_output)

    results.push({
      input: t.input ?? '',
      expected: t.expected_output ?? '',
      stdout,
      stderr,
      status: status?.description || 'Unknown',
      passed
    })
  }

  const allPassed = results.length > 0 && results.every(r => r.passed)
  return { allPassed, results }
}

export { createSubmission, runTests }
