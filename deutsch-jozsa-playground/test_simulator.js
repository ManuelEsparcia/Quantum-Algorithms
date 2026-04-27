"use strict";

const INV_SQRT2 = 1 / Math.sqrt(2);

function newState(numQubits) {
  const dim = 1 << numQubits;
  const amp = new Float64Array(dim);
  amp[0] = 1;
  return { numQubits, dim, amp };
}
function applyX(s, q) {
  const a = s.amp, mask = 1 << q;
  for (let i = 0; i < s.dim; i++) {
    if ((i & mask) === 0) {
      const j = i | mask;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
  }
}
function applyH(s, q) {
  const a = s.amp, mask = 1 << q;
  for (let i = 0; i < s.dim; i++) {
    if ((i & mask) === 0) {
      const j = i | mask;
      const ai = a[i], aj = a[j];
      a[i] = (ai + aj) * INV_SQRT2;
      a[j] = (ai - aj) * INV_SQRT2;
    }
  }
}
function applyCNOT(s, ctrl, tgt) {
  const a = s.amp, cMask = 1 << ctrl, tMask = 1 << tgt;
  for (let i = 0; i < s.dim; i++) {
    if ((i & cMask) && !(i & tMask)) {
      const j = i | tMask;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
  }
}
function inputAmplitudesMinus(s, nInputs) {
  const out = new Float64Array(1 << nInputs);
  const outMask = 1 << nInputs;
  for (let x = 0; x < out.length; x++) {
    out[x] = (s.amp[x] - s.amp[x | outMask]) * INV_SQRT2;
  }
  return out;
}
function constantOracleGates(n, value) {
  return value === 1 ? [["X", n]] : [];
}
function balancedOracleGates(n, b) {
  // f(x) = b . x (mod 2). Balanced iff b != 0...0.
  const gates = [];
  for (let i = 0; i < n; i++) {
    if (b[n - 1 - i] === "1") gates.push(["CNOT", i, n]);
  }
  return gates;
}
function applyGate(s, g) {
  if (g[0] === "X") applyX(s, g[1]);
  else if (g[0] === "H") applyH(s, g[1]);
  else if (g[0] === "CNOT") applyCNOT(s, g[1], g[2]);
}

function runDJ(n, kind, param) {
  const state = newState(n + 1);
  const gates = kind === "constant" ? constantOracleGates(n, param) : balancedOracleGates(n, param);
  applyX(state, n);
  for (let q = 0; q <= n; q++) applyH(state, q);
  for (const g of gates) applyGate(state, g);
  for (let q = 0; q < n; q++) applyH(state, q);
  return inputAmplitudesMinus(state, n);
}

function pad(x, n) { return x.toString(2).padStart(n, "0"); }

function check(label, amps, expected) {
  const probs = Array.from(amps).map(a => a * a);
  const n = Math.round(Math.log2(amps.length));
  const nonZero = probs.map((p, i) => [pad(i, n), p]).filter(pair => pair[1] > 1e-9);
  const total = probs.reduce((a, b) => a + b, 0);
  const pZero = probs[0];
  console.log(`${label}:`);
  console.log(`   P(|0...0>) = ${pZero.toFixed(4)}  | total = ${total.toFixed(4)}`);
  console.log(`   non-zero outcomes: ${JSON.stringify(nonZero.map(([k, p]) => `${k}=${p.toFixed(3)}`))}`);
  const isConstant = pZero > 0.99;
  const matches = (expected === "constant" && isConstant) || (expected === "balanced" && !isConstant);
  console.log(`   verdict: ${isConstant ? "CONSTANT" : "BALANCED"}  ${matches ? "CORRECT" : "WRONG"}`);
  console.log("");
  return matches;
}

let pass = 0, fail = 0;
function test(pred) { if (pred) pass++; else fail++; }

// Tests
test(check("n=3 constant f=0", runDJ(3, "constant", 0), "constant"));
test(check("n=3 constant f=1", runDJ(3, "constant", 1), "constant"));
test(check("n=3 balanced b=001", runDJ(3, "balanced", "001"), "balanced"));
test(check("n=3 balanced b=011", runDJ(3, "balanced", "011"), "balanced"));
test(check("n=3 balanced b=101", runDJ(3, "balanced", "101"), "balanced"));
test(check("n=3 balanced b=111", runDJ(3, "balanced", "111"), "balanced"));
test(check("n=1 constant f=0", runDJ(1, "constant", 0), "constant"));
test(check("n=1 balanced b=1", runDJ(1, "balanced", "1"), "balanced"));
test(check("n=5 constant f=1", runDJ(5, "constant", 1), "constant"));
test(check("n=5 balanced b=11010", runDJ(5, "balanced", "11010"), "balanced"));
test(check("n=4 balanced b=1111", runDJ(4, "balanced", "1111"), "balanced"));
test(check("n=2 balanced b=01", runDJ(2, "balanced", "01"), "balanced"));

console.log(`TOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
