// Accessibility audit via axe-core injected through CDP.
import fs from 'node:fs';
const axeSource = await (await fetch('https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js')).text();
const width = parseInt(process.argv[2] || '1440', 10);
const height = parseInt(process.argv[3] || '1000', 10);
const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
await send('Page.navigate', { url: 'file:///Users/yuga/Downloads/Makara/index.html' });
await new Promise(r => setTimeout(r, 2500));
await send('Runtime.evaluate', { expression: axeSource });
const res = await send('Runtime.evaluate', {
  expression: `axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'] }, resultTypes: ['violations','incomplete'] }).then(r => JSON.stringify({
    violations: r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0,4).map(n => n.target.join(' ')), summary: v.nodes[0].failureSummary })),
    incomplete: r.incomplete.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
  }))`,
  awaitPromise: true, returnByValue: true
});
const out = JSON.parse(res.result.value);
console.log(JSON.stringify({ viewport: `${width}x${height}`, violations: out.violations, incomplete: out.incomplete }, null, 2));
fs.writeFileSync(`/tmp/axe-${width}.json`, JSON.stringify(out, null, 2));
ws.close();
