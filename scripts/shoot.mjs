// Minimal CDP driver: screenshots + layout diagnostics without extra packages.
// usage: node scripts/shoot.mjs [url] [width] [height] [scrollY] [outfile]
import fs from 'node:fs';

const url = process.argv[2] || 'file:///Users/yuga/Downloads/Makara/index.html';
const width = parseInt(process.argv[3] || '1440', 10);
const height = parseInt(process.argv[4] || '1000', 10);
const scrollY = parseInt(process.argv[5] || '0', 10);
const out = process.argv[6] || 'out/shot.png';
const evalExpr = process.argv[7] || '';

const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = targets.find(t => t.type === 'page');
if (!page) throw new Error('no page target');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
const logs = [];
ws.onmessage = ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  } else if (msg.method === 'Runtime.exceptionThrown') {
    logs.push('EXCEPTION ' + JSON.stringify(msg.params.exceptionDetails).slice(0, 800));
  } else if (msg.method === 'Runtime.consoleAPICalled') {
    logs.push('CONSOLE ' + msg.params.type + ' ' + msg.params.args.map(a => a.value ?? a.description).join(' '));
  }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const mid = ++id;
  pending.set(mid, { resolve, reject });
  ws.send(JSON.stringify({ id: mid, method, params }));
});

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
await send('Page.navigate', { url });
await new Promise(r => setTimeout(r, 2600));

if (evalExpr) {
  await send('Runtime.evaluate', { expression: evalExpr, awaitPromise: true });
  await new Promise(r => setTimeout(r, 900));
}

if (scrollY) {
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scrollY}); 'ok'` });
  await new Promise(r => setTimeout(r, 1400));
}

const diag = await send('Runtime.evaluate', {
  expression: `(() => {
    const q = s => document.querySelector(s);
    const box = s => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; };
    const cs = s => { const e = q(s); if (!e) return null; const c = getComputedStyle(e); return {opacity:c.opacity, transform:c.transform, font:c.fontSize, display:c.display}; };
    return JSON.stringify({
      scrollY: window.scrollY,
      docH: document.documentElement.scrollHeight,
      vw: innerWidth, vh: innerHeight,
      reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
      hero: box('.hero'), top: box('.hero__top'), title: box('.title'),
      t1: box('#t1'), t2: box('#t2'), nav: box('.hero__nav'), dancer: box('#dancer'),
      halo: box('#haloWrap'), scene: box('#scene'), topStyles: cs('.hero__top'),
      navStyles: cs('.hero__nav'), titleReady: q('.hero__top').className,
      dancerStyles: cs('#dancer'), fontLoaded: document.fonts.check('400px Anton'),
      t1font: q('#t1') ? q('#t1').getAttribute('font-size') : null,
      t1y: q('#t1') ? q('#t1').getAttribute('y') : null,
      imgSizes: Array.from(document.images).map(i => [i.currentSrc.slice(0,30), i.complete, i.naturalWidth])
    }, null, 1);
  })()`,
  returnByValue: true
});
console.log(diag.result.value);

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('saved', out, 'logs:', logs.slice(0, 8));
ws.close();
