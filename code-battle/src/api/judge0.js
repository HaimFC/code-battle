// Function for sending code to Judge0 API for execution.

export async function createSubmission(sourceCode, languageId, stdin = "") {
  const url = `${import.meta.env.VITE_JUDGE0_BASE}/submissions?base64_encoded=false&wait=true`;

  const headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": import.meta.env.VITE_JUDGE0_KEY,
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
  };

  const body = JSON.stringify({
    source_code: sourceCode,
    language_id: languageId,
    stdin
  });

  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`Judge0 error: HTTP ${res.status}`);
  return res.json(); // => { stdout, stderr, status, time, memory, ... }
}
