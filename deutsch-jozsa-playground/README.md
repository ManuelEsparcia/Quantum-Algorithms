# Deutsch–Jozsa Playground

A single-file interactive introduction to the **Deutsch–Jozsa algorithm** — the first quantum algorithm with a proven exponential speedup over any classical deterministic algorithm.

**Live version:** open `index.html` in any modern browser. No build step, no server, no dependencies beyond Google Fonts.

This is entry №01 in an ongoing series of interactive explainers for foundational quantum algorithms.

## What's inside

A scroll-driven narrative in six acts:

1. **The Promise** — what "constant" and "balanced" functions actually are, with shufflable truth tables.
2. **Play It Classically** — a mystery box with 3-bit inputs. Query it, track your certainty, commit to an answer and see whether you were actually right, or just lucky.
3. **The Scaling Curse** — a log-scale chart showing the exponential worst-case classical query complexity.
4. **The Quantum Trick** — press a button to apply H⊗³ to a register and see a uniform superposition appear.
5. **The Algorithm, Step by Step** — an animated player of the full Deutsch–Jozsa circuit for n = 3. Step through each gate, watch signed amplitudes flip and interfere, pick different oracles.
6. **Sandbox** — free play with n from 1 to 5, constant or balanced oracles, any secret string b, randomize at will.

## Under the hood

Everything runs in your browser. The quantum state is a real `Float64Array` of 2^(n+1) amplitudes, and the gates (X, H, CNOT) are pure JavaScript operations on pairs of indices. There is no Qiskit dependency, no WebAssembly, no WebGL — just math.

For Deutsch–Jozsa every amplitude stays real, so `Float64Array` suffices. For algorithms later in the series we'll introduce complex amplitudes.

### The balanced oracle

The balanced oracles in this playground implement `f(x) = b · x (mod 2)` using one CNOT per bit where `b_i = 1`. This is balanced for every non-zero `b`. A pleasant side-effect: the Deutsch–Jozsa measurement on this oracle returns exactly the string `b`, so the quantum advantage becomes visceral — the algorithm literally prints the oracle's signature in one shot.

(Readers who notice this is the Bernstein–Vazirani oracle are correct. BV is the subject of entry №02.)

## Validation

`test_simulator.js` runs 12 end-to-end cases covering both oracle kinds for n ∈ {1, 2, 3, 4, 5}. Run with:

```
node test_simulator.js
```

All cases check that constant oracles give P(|0…0⟩) = 1 and that balanced oracles give P(|0…0⟩) = 0.

## Hosting

The entire site is a single `index.html`. Drop it on GitHub Pages, Netlify, Vercel, or any static host. Works offline once loaded (fonts come from Google Fonts CDN).

## The series

1. **Deutsch–Jozsa** — you are here
2. Bernstein–Vazirani
3. Simon's algorithm
4. Grover's search
5. Quantum Phase Estimation
6. Shor's factoring

## License

MIT.
