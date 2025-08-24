// src/utils/complexity.js
function guessName(src) {
  const ps = [
    /function\s+([A-Za-z_$][\w$]*)\s*\(/,
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/,
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*function\s*\(/
  ];
  for (const re of ps) { const m = src.match(re); if (m && m[1]) return m[1]; }
  return "";
}

function pickFn(src) {
  let fn = null;
  try {
    fn = new Function(`${src}; return (typeof solution!=='undefined'&&solution)||(typeof globalThis!=='undefined'&&globalThis.solution)||(typeof module!=='undefined'&&module&&((typeof module.exports==='function'&&module.exports)||module.exports?.solution||module.exports?.default));`)();
  } catch {}
  if (!fn) {
    const n = guessName(src);
    if (n) { try { fn = new Function(`${src}; return ${n};`)(); } catch {} }
  }
  return typeof fn === "function" ? fn : null;
}

function isTrivialSource(code) {
  if (!code) return true;
  const src = String(code);
  if (/\/\/\s*your\s*code/i.test(src)) return true;

  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();
  if (stripped === "") return true;

  if (/function\s+[A-Za-z_$][\w$]*\s*\([^)]*\)\s*{\s*}/m.test(stripped)) return true;
  if (/\([^)]*\)\s*=>\s*{\s*}/m.test(stripped)) return true;

  return false;
}

function measureArg(x) {
  if (x == null) return 0;
  if (typeof x === "string") return x.length;
  if (typeof x === "number") return Math.max(1, Math.abs(x)|0);
  if (Array.isArray(x)) return x.length + x.reduce((a, b) => a + measureArg(b), 0);
  if (typeof x === "object") return Object.values(x).reduce((a, b) => a + measureArg(b), 0);
  return 1;
}

function makeScaler(exampleArgs) {
  const a = Array.isArray(exampleArgs) ? exampleArgs : [exampleArgs];
  return function gen(size) {
    return a.map(t => {
      if (Array.isArray(t)) return Array.from({ length: size }, () => 1);
      if (typeof t === "string") return "x".repeat(size);
      if (typeof t === "number") return size;
      if (typeof t === "object" && t) {
        const o = {}; for (let i=0;i<size;i++) o["k"+i]=i; return o;
      }
      return size;
    });
  };
}

function sizesFromTests(tests) {
  if (!Array.isArray(tests) || tests.length === 0) return [32,64,128,256,512,1024,2048];
  const base = tests[0]?.args;
  const n0 = measureArg(base);
  const start = Math.max(16, n0 || 16);
  const arr = [];
  let v = start;
  for (let i=0;i<7;i++) { arr.push(v); v = Math.floor(v*2); }
  return arr;
}

function fitScale(x, y, f) {
  let num = 0, den = 0;
  for (let i=0;i<x.length;i++) { const fx=f(x[i]); num+=fx*y[i]; den+=fx*fx; }
  return den===0?0:num/den;
}
function modelError(x, y, f) {
  const a = fitScale(x,y,f);
  let se=0,c=0;
  for (let i=0;i<x.length;i++){ const e=y[i]-(a*f(x[i])); se+=e*e; c++; }
  return c===0?Infinity:se/c;
}

function pickBigO(ns, ys) {
  const n = ns.map(v => Math.max(1, v));
  const models = [
    { label:"O(1)", f:(x)=>1 },
    { label:"O(log n)", f:(x)=>Math.log2(x+1) },
    { label:"O(n)", f:(x)=>x },
    { label:"O(n log n)", f:(x)=>x*Math.log2(x+1) },
    { label:"O(n^2)", f:(x)=>x*x },
    { label:"O(n^3)", f:(x)=>x*x*x }
  ];
  let best=models[0], bestErr=Infinity;
  for (const m of models){ const e=modelError(n, ys, m.f); if (e<bestErr){ bestErr=e; best=m; } }
  return best.label;
}

function msNow() { return (typeof performance!=="undefined"&&performance.now)?performance.now():Date.now(); }

function estimateTimeComplexityFromCode(code, tests) {
  if (isTrivialSource(code)) return { label:"N/A" };

  const fn = pickFn(code);
  if (!fn) return { label:"N/A" };

  const sizes = sizesFromTests(tests);
  const scaler = makeScaler(tests?.[0]?.args ?? [sizes[0]]);
  const times = [];
  for (const s of sizes) {
    const args = scaler(s);
    let reps = 1, t0, t1, total;
    do {
      reps *= 2;
      t0 = msNow();
      for (let i=0;i<reps;i++) fn(...args);
      t1 = msNow();
      total = t1 - t0;
      if (reps > 1<<20) break;
    } while (total < 4);
    times.push(total / reps);
  }
  const label = pickBigO(sizes, times);
  return { label, sizes, times };
}

function estimateSpaceComplexityFromCode(code, tests) {
  if (isTrivialSource(code)) return { label:"N/A" };

  const fn = pickFn(code);
  if (!fn) return { label:"N/A" };
  const sizes = sizesFromTests(tests);
  const scaler = makeScaler(tests?.[0]?.args ?? [sizes[0]]);
  const ys = [];
  for (const s of sizes) {
    const args = scaler(s);
    let out;
    try { out = fn(...args); } catch { out = null; }
    let m = 0;
    try { m = JSON.stringify(out)?.length || 0; } catch { m = 0; }
    ys.push(m);
  }
  const label = pickBigO(sizes, ys);
  return { label, sizes, usage: ys };
}

export { estimateTimeComplexityFromCode, estimateSpaceComplexityFromCode };
