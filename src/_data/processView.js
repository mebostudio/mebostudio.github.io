// Numbers the process steps across phases (used by the About and Service process chart).
import fs from "node:fs";
import path from "node:path";

export default function () {
  const data = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "process.json"), "utf8"));
  const pad = (n) => String(n).padStart(2, "0");
  const steps = [];
  const phases = (data.phases || []).map((ph, pi) => {
    const out = { ...ph, steps: [] };
    for (const st of ph.steps || []) {
      const n = steps.length + 1;
      const s = { ...st, n, num: pad(n), phase: pad(pi + 1) };
      steps.push(s);
      out.steps.push(s);
    }
    return out;
  });
  steps.forEach((s, i) => {
    s.prev = steps[(i - 1 + steps.length) % steps.length].n;
    s.next = steps[(i + 1) % steps.length].n;
  });
  return { phases, steps, total: steps.length };
}
