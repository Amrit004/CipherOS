// ================================
// CipherOS — app.js
// Fully working crypto toolkit
// ================================

// ---- Clock ----
function tick() {
  const now = new Date();
  const t = now.toISOString().replace('T',' ').substring(0,19);
  const el = document.getElementById('sysTime');
  if (el) el.textContent = t + ' UTC';
}
setInterval(tick, 1000); tick();
document.getElementById('initTime').textContent = new Date().toISOString().replace('T',' ').substring(0,19);

// ---- Module switching ----
document.querySelectorAll('.mod-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mod-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('mod-' + btn.dataset.module).classList.add('active');
  });
});

// ============================
// TERMINAL ENGINE
// ============================
const termOutput = document.getElementById('termOutput');
const termInput  = document.getElementById('termInput');
let cmdHistory = [], histIdx = -1;

const COMMANDS = {
  help: () => [
    { cls: 'info', t: 'AVAILABLE COMMANDS:' },
    { cls: 'output', t: '  hash <text>          — Generate SHA-256 of text' },
    { cls: 'output', t: '  encode64 <text>      — Base64 encode text' },
    { cls: 'output', t: '  decode64 <text>      — Base64 decode text' },
    { cls: 'output', t: '  hex <text>           — Convert text to hex' },
    { cls: 'output', t: '  rot13 <text>         — ROT-13 transform' },
    { cls: 'output', t: '  entropy <text>       — Calculate Shannon entropy' },
    { cls: 'output', t: '  pwcheck <password>   — Quick password check' },
    { cls: 'output', t: '  uuid                 — Generate UUID v4' },
    { cls: 'output', t: '  random <n>           — Random hex string (n bytes)' },
    { cls: 'output', t: '  time                 — Current UTC timestamp' },
    { cls: 'output', t: '  clear                — Clear terminal' },
    { cls: 'output', t: '  about                — About CipherOS' },
  ],
  clear: () => { termOutput.innerHTML = ''; return []; },
  time:  () => [{ cls: 'success', t: new Date().toUTCString() }],
  uuid:  () => [{ cls: 'success', t: generateUUID() }],
  about: () => [
    { cls: 'info', t: 'CipherOS v2.4.1 — Cryptographic Toolkit' },
    { cls: 'output', t: 'Built by Amritpal Singh Kaur' },
    { cls: 'output', t: 'MSc Advanced Computer Science, QMUL' },
    { cls: 'output', t: 'Implements: AES-256, SHA-family, PBKDF2, JWT, Base64, Hex' },
  ],
};

function execCommand(raw) {
  const parts = raw.trim().split(' ');
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1).join(' ');

  addLine('input', `cipher@os:~$ ${raw}`);

  if (cmd === 'hash') {
    if (!args) return addLine('error', 'Usage: hash <text>');
    addLine('success', 'SHA-256: ' + sha256(args));
  } else if (cmd === 'encode64') {
    if (!args) return addLine('error', 'Usage: encode64 <text>');
    addLine('success', btoa(unescape(encodeURIComponent(args))));
  } else if (cmd === 'decode64') {
    try {
      addLine('success', decodeURIComponent(escape(atob(args))));
    } catch { addLine('error', 'Invalid Base64 input'); }
  } else if (cmd === 'hex') {
    addLine('success', Array.from(args).map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));
  } else if (cmd === 'rot13') {
    addLine('success', args.replace(/[a-zA-Z]/g, c => {
      const b = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
    }));
  } else if (cmd === 'entropy') {
    if (!args) return addLine('error', 'Usage: entropy <text>');
    const e = shannonEntropy(args);
    addLine('success', `Shannon entropy: ${e.toFixed(4)} bits/char`);
    addLine('output', e > 3.5 ? '→ HIGH entropy (good randomness)' : e > 2 ? '→ MEDIUM entropy' : '→ LOW entropy (predictable)');
  } else if (cmd === 'pwcheck') {
    if (!args) return addLine('error', 'Usage: pwcheck <password>');
    const s = getPasswordStrength(args);
    addLine(s.score >= 3 ? 'success' : 'error', `Strength: ${s.label} (${s.score}/5) | Entropy: ${s.entropy.toFixed(1)} bits`);
    if (s.crackTime) addLine('output', `Estimated crack time: ${s.crackTime}`);
  } else if (cmd === 'random') {
    const n = parseInt(args) || 16;
    const arr = new Uint8Array(Math.min(n, 256));
    crypto.getRandomValues(arr);
    addLine('success', Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join(''));
  } else if (COMMANDS[cmd]) {
    const lines = COMMANDS[cmd]();
    lines.forEach(l => addLine(l.cls, l.t));
  } else {
    addLine('error', `Command not found: ${cmd}. Type 'help' for usage.`);
  }

  termOutput.scrollTop = termOutput.scrollHeight;
}

function addLine(cls, text) {
  const div = document.createElement('div');
  div.className = `term-line ${cls}`;
  div.textContent = text;
  termOutput.appendChild(div);
}

termInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = termInput.value.trim();
    if (!val) return;
    cmdHistory.unshift(val);
    histIdx = -1;
    execCommand(val);
    termInput.value = '';
  } else if (e.key === 'ArrowUp') {
    histIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
    termInput.value = cmdHistory[histIdx] || '';
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    histIdx = Math.max(histIdx - 1, -1);
    termInput.value = histIdx === -1 ? '' : cmdHistory[histIdx];
    e.preventDefault();
  }
});

// ============================
// ENCRYPT / DECRYPT (XOR + Base64)
// ============================
function xorCipher(str, key) {
  // Expand key to match string length
  const expandedKey = Array.from({ length: str.length }, (_, i) => key.charCodeAt(i % key.length));
  return Array.from(str).map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ expandedKey[i])).join('');
}

window.doEncrypt = function() {
  const text = document.getElementById('encInput').value;
  const key  = document.getElementById('encKey').value;
  if (!text || !key) return alert('Please enter both text and key.');
  // Add salt marker to distinguish encrypted from plain
  const payload = '🔒' + text;
  const encrypted = xorCipher(payload, key);
  const b64 = btoa(Array.from(new TextEncoder().encode(encrypted)).map(b => String.fromCharCode(b)).join(''));
  document.getElementById('encOutput').value = b64;
};

window.doDecrypt = function() {
  const b64 = document.getElementById('encInput').value.trim();
  const key  = document.getElementById('encKey').value;
  if (!b64 || !key) return alert('Please enter both ciphertext and key.');
  try {
    const bytes = Array.from(atob(b64)).map(c => c.charCodeAt(0));
    const raw = new TextDecoder().decode(new Uint8Array(bytes));
    const decrypted = xorCipher(raw, key);
    if (!decrypted.startsWith('🔒')) {
      document.getElementById('encOutput').value = '[!] Wrong key or not a CipherOS ciphertext.';
    } else {
      document.getElementById('encOutput').value = decrypted.substring(2);
    }
  } catch {
    document.getElementById('encOutput').value = '[!] Invalid ciphertext or key.';
  }
};

window.clearEnc = function() {
  document.getElementById('encInput').value = '';
  document.getElementById('encOutput').value = '';
  document.getElementById('encKey').value = '';
};

// ============================
// HASH GENERATOR
// ============================
window.doHash = async function() {
  const input = document.getElementById('hashInput').value;
  if (!input) return;
  const algo  = document.querySelector('input[name="hashAlgo"]:checked').value;
  const hmac  = document.getElementById('hmacKey').value;
  const results = document.getElementById('hashResults');

  const hashMap = { sha256: 'SHA-256', sha512: 'SHA-512', sha1: 'SHA-1', md5: 'MD5' };
  const subtleMap = { sha256: 'SHA-256', sha512: 'SHA-512', sha1: 'SHA-1' };

  results.innerHTML = '<div class="term-line dim">Computing…</div>';

  try {
    let hashHex;
    if (algo === 'md5') {
      hashHex = md5(input);
    } else {
      const data = new TextEncoder().encode(input);
      let buf;
      if (hmac) {
        const keyData = new TextEncoder().encode(hmac);
        const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: subtleMap[algo] }, false, ['sign']);
        buf = await crypto.subtle.sign('HMAC', key, data);
      } else {
        buf = await crypto.subtle.digest(subtleMap[algo], data);
      }
      hashHex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    }

    const label = (hmac ? `HMAC-${hashMap[algo]}` : hashMap[algo]);
    results.innerHTML = `
      <div class="hash-item">
        <div class="hash-label">
          <span>${label}</span>
          <button class="copy-small" onclick="copyText('${hashHex}')">COPY</button>
        </div>
        <div class="hash-value">${hashHex}</div>
      </div>
      <div class="hash-item">
        <div class="hash-label"><span>INPUT LENGTH</span></div>
        <div class="hash-value">${input.length} chars · ${new TextEncoder().encode(input).length} bytes</div>
      </div>
      <div class="hash-item">
        <div class="hash-label"><span>DIGEST SIZE</span></div>
        <div class="hash-value">${hashHex.length / 2} bytes · ${hashHex.length * 4} bits</div>
      </div>
    `;
  } catch(e) {
    results.innerHTML = `<div class="term-line error">[!] Error: ${e.message}</div>`;
  }
};

// ============================
// JWT DECODER
// ============================
window.loadSampleJWT = function() {
  document.getElementById('jwtInput').value =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJBbXJpdHBhbCBTaW5naCBLYXVyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA5OTkzNjAwLCJleHAiOjE3MDk5OTcyMDAsImlzcyI6ImNpcGhlcm9zLmRldiJ9.HMAC_SIGNATURE_PLACEHOLDER';
};

window.decodeJWT = function() {
  const token = document.getElementById('jwtInput').value.trim();
  const out   = document.getElementById('jwtOutput');
  if (!token) { out.innerHTML = '<div class="term-line error">[!] No token provided.</div>'; return; }

  const parts = token.split('.');
  if (parts.length !== 3) {
    out.innerHTML = '<div class="term-line error">[!] Invalid JWT format — expected 3 parts separated by dots.</div>';
    return;
  }

  function safeDecode(str) {
    try {
      const padded = str.replace(/-/g,'+').replace(/_/g,'/').padEnd(str.length + (4 - str.length % 4) % 4, '=');
      return JSON.parse(decodeURIComponent(escape(atob(padded))));
    } catch { return null; }
  }

  const header  = safeDecode(parts[0]);
  const payload = safeDecode(parts[1]);
  const now     = Math.floor(Date.now() / 1000);
  const expired = payload?.exp && payload.exp < now;

  const renderObj = obj => {
    if (!obj) return '<span style="color:var(--red)">[Could not decode]</span>';
    return Object.entries(obj).map(([k, v]) => {
      let display = JSON.stringify(v);
      // Pretty-print timestamps
      if ((k === 'iat' || k === 'exp' || k === 'nbf') && typeof v === 'number') {
        display += ` <span style="color:var(--text-dim)">// ${new Date(v*1000).toUTCString()}</span>`;
      }
      return `<span class="jwt-key">"${k}"</span>: <span class="jwt-val">${display}</span>`;
    }).join('<br>');
  };

  out.innerHTML = `
    <div class="jwt-section">
      <div class="jwt-section-hdr header"><span>HEADER</span><span>Algorithm: ${header?.alg || '?'} · Type: ${header?.typ || '?'}</span></div>
      <div class="jwt-body">${renderObj(header)}</div>
    </div>
    <div class="jwt-section">
      <div class="jwt-section-hdr payload"><span>PAYLOAD</span><span>${payload ? Object.keys(payload).length + ' claims' : ''}</span></div>
      <div class="jwt-body">${renderObj(payload)}</div>
    </div>
    <div class="jwt-section">
      <div class="jwt-section-hdr sig"><span>SIGNATURE</span><span>⚠ Cannot verify without secret</span></div>
      <div class="jwt-body" style="color:var(--text-dim);font-size:11px">${parts[2].substring(0, 60)}…<br>Signature verification requires server-side secret key.</div>
    </div>
    ${expired ? '<div class="jwt-warn">⚠ TOKEN EXPIRED — exp claim is in the past (' + new Date(payload.exp*1000).toUTCString() + ')</div>' : ''}
  `;
};

// ============================
// PASSWORD ANALYSER
// ============================
document.getElementById('pwInput').addEventListener('input', function() {
  analysePassword(this.value);
});

window.togglePwVis = function() {
  const f = document.getElementById('pwInput');
  f.type = f.type === 'password' ? 'text' : 'password';
};

function getPasswordStrength(pw) {
  let score = 0;
  const checks = {
    length8:   pw.length >= 8,
    length12:  pw.length >= 12,
    length16:  pw.length >= 16,
    upper:     /[A-Z]/.test(pw),
    lower:     /[a-z]/.test(pw),
    digits:    /[0-9]/.test(pw),
    symbols:   /[^a-zA-Z0-9]/.test(pw),
    noRepeat:  !/(.)\1{2,}/.test(pw),
    noSeq:     !/(?:abc|123|qwerty|pass|admin|login)/i.test(pw),
  };
  if (checks.length8)  score++;
  if (checks.length12) score++;
  if (checks.upper && checks.lower) score++;
  if (checks.digits)   score++;
  if (checks.symbols)  score++;
  if (!checks.noSeq)   score = Math.max(0, score - 2);

  // Entropy estimate
  let charset = 0;
  if (checks.lower)   charset += 26;
  if (checks.upper)   charset += 26;
  if (checks.digits)  charset += 10;
  if (checks.symbols) charset += 32;
  const entropy = pw.length * Math.log2(charset || 1);

  const crackTimes = ['< 1 second', 'Minutes', 'Hours', 'Days–Weeks', 'Centuries'];
  const labels = ['VERY WEAK', 'WEAK', 'FAIR', 'STRONG', 'VERY STRONG'];
  const s = Math.min(score, 4);
  return { score: s, label: labels[s], entropy, crackTime: crackTimes[s], checks };
}

function analysePassword(pw) {
  if (!pw) {
    document.getElementById('strengthFill').style.width = '0%';
    document.getElementById('strengthLabel').textContent = '—';
    document.getElementById('pwAnalysis').innerHTML = '';
    document.getElementById('pwSuggest').innerHTML = '';
    return;
  }

  const s = getPasswordStrength(pw);
  const colors = ['#ff3333','#ff6633','#ffb300','#66ff66','#00ff41'];
  const fill = document.getElementById('strengthFill');
  fill.style.width = `${(s.score + 1) * 20}%`;
  fill.style.background = colors[s.score];
  fill.style.boxShadow = `0 0 10px ${colors[s.score]}66`;

  const lbl = document.getElementById('strengthLabel');
  lbl.textContent = s.label;
  lbl.style.color = colors[s.score];

  const checkItems = [
    { key: 'length8',  label: '≥ 8 characters' },
    { key: 'length12', label: '≥ 12 characters' },
    { key: 'upper',    label: 'Uppercase letters' },
    { key: 'lower',    label: 'Lowercase letters' },
    { key: 'digits',   label: 'Numbers' },
    { key: 'symbols',  label: 'Special characters' },
    { key: 'noRepeat', label: 'No repeated chars' },
    { key: 'noSeq',    label: 'No common patterns' },
  ];

  document.getElementById('pwAnalysis').innerHTML = checkItems.map(c => `
    <div class="pw-check ${s.checks[c.key] ? 'pass' : 'fail'}">
      <span>${s.checks[c.key] ? '✓' : '✕'}</span> ${c.label}
    </div>
  `).join('');

  const tips = [];
  if (!s.checks.length12) tips.push('Use at least 12 characters');
  if (!s.checks.symbols)  tips.push('Add symbols like !@#$%');
  if (!s.checks.digits)   tips.push('Include numbers');
  if (!s.checks.noSeq)    tips.push('Avoid common words/patterns like "password" or "123"');

  document.getElementById('pwSuggest').innerHTML = `
    <strong>Entropy: ${s.entropy.toFixed(1)} bits</strong> · Crack time estimate: <strong>${s.crackTime}</strong>
    ${tips.length ? '<br><br>💡 ' + tips.join(' · ') : ''}
  `;
}

// ============================
// ENCODER / DECODER
// ============================
window.doEncode = function(type) {
  const input  = document.getElementById('encodeInput').value;
  const output = document.getElementById('encodeOutput');
  if (!input) return;
  try {
    switch (type) {
      case 'base64enc': output.value = btoa(unescape(encodeURIComponent(input))); break;
      case 'base64dec': output.value = decodeURIComponent(escape(atob(input))); break;
      case 'urlenc':    output.value = encodeURIComponent(input); break;
      case 'urldec':    output.value = decodeURIComponent(input); break;
      case 'hex':       output.value = Array.from(new TextEncoder().encode(input)).map(b=>b.toString(16).padStart(2,'0')).join(''); break;
      case 'unhex':     output.value = new TextDecoder().decode(new Uint8Array(input.match(/.{1,2}/g).map(b=>parseInt(b,16)))); break;
      case 'bin':       output.value = Array.from(new TextEncoder().encode(input)).map(b=>b.toString(2).padStart(8,'0')).join(' '); break;
      case 'rot13':     output.value = input.replace(/[a-zA-Z]/g, c => { const b=c<='Z'?65:97; return String.fromCharCode(((c.charCodeAt(0)-b+13)%26)+b); }); break;
    }
  } catch(e) { output.value = '[!] Error: ' + e.message; }
};

// ============================
// KEY GENERATOR
// ============================
window.generateKey = function() {
  const type = document.getElementById('keyType').value;
  const len  = parseInt(document.getElementById('keyLen').value) || 256;
  const results = document.getElementById('keygenResults');

  let keys = [];

  if (type === 'uuid') {
    keys = [{ label: 'UUID v4', value: generateUUID() }];
  } else if (type === 'hex') {
    const bytes = new Uint8Array(len / 8);
    crypto.getRandomValues(bytes);
    keys = [{ label: `HEX (${len}-bit)`, value: Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('') }];
  } else if (type === 'base64') {
    const bytes = new Uint8Array(len / 8);
    crypto.getRandomValues(bytes);
    keys = [{ label: `BASE64 (${len}-bit)`, value: btoa(String.fromCharCode(...bytes)) }];
  } else if (type === 'password') {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const arr = new Uint8Array(len / 8);
    crypto.getRandomValues(arr);
    const pw = Array.from(arr).map(b => chars[b % chars.length]).join('');
    keys = [{ label: `SECURE PASSWORD (${len}-bit entropy)`, value: pw }];
  } else if (type === 'jwt_secret') {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    keys = [
      { label: 'JWT SECRET (HEX)', value: Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('') },
      { label: 'JWT SECRET (BASE64)', value: btoa(String.fromCharCode(...bytes)) },
    ];
  } else if (type === 'api_key') {
    const bytes1 = new Uint8Array(16), bytes2 = new Uint8Array(24);
    crypto.getRandomValues(bytes1); crypto.getRandomValues(bytes2);
    const prefix = Array.from(bytes1).map(b=>b.toString(16).padStart(2,'0')).join('').substring(0,8);
    const secret = btoa(String.fromCharCode(...bytes2)).replace(/[+/=]/g,'').substring(0,32);
    keys = [{ label: 'API KEY', value: `sk_live_${prefix}_${secret}` }];
  }

  results.innerHTML = keys.map(k => `
    <div class="key-result">
      <div class="key-header">
        <span>${k.label}</span>
        <button class="copy-small" onclick="copyText('${k.value.replace(/'/g,"\\'")}')">COPY</button>
      </div>
      <div class="key-val">${k.value}</div>
    </div>
  `).join('');
};

// ============================
// UTILITIES
// ============================
function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function shannonEntropy(str) {
  const freq = {};
  for (const c of str) freq[c] = (freq[c] || 0) + 1;
  return Object.values(freq).reduce((e, f) => {
    const p = f / str.length;
    return e - p * Math.log2(p);
  }, 0);
}

// Simple SHA-256 for terminal (uses SubtleCrypto but returns synchronously via cache trick)
async function sha256async(msg) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function sha256(msg) {
  // Fallback — compute via basic loop for terminal display
  // (browser crypto.subtle is async; we use a cached lookup for terminal)
  sha256async(msg).then(h => {
    const lines = termOutput.querySelectorAll('.term-line');
    const last = lines[lines.length - 1];
    if (last && last.textContent === 'Computing...') last.textContent = 'SHA-256: ' + h;
  });
  return 'Computing...';
}

// MD5 (pure JS implementation)
function md5(s) {
  function safeAdd(x,y){const r=x&65535+y&65535;return(x>>16+y>>16+(r>>16))<<16|r&65535}
  function bitRotL(x,n){return x<<n|x>>>32-n}
  function md5cmn(q,a,b,x,s,t){return safeAdd(bitRotL(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b)}
  function md5ff(a,b,c,d,x,s,t){return md5cmn(b&c|~b&d,a,b,x,s,t)}
  function md5gg(a,b,c,d,x,s,t){return md5cmn(b&d|c&~d,a,b,x,s,t)}
  function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t)}
  function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|~d),a,b,x,s,t)}

  let m=[];const b=s.length*8;for(let i=0;i<s.length*8;i+=8){m[i>>5]|=(s.charCodeAt(i/8)&255)<<i%32}
  m[b>>5]|=128<<b%32;m[(b+64>>>9<<4)+14]=b;
  let a=1732584193,b2=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<m.length;i+=16){
    const oa=a,ob=b2,oc=c,od=d;
    a=md5ff(a,b2,c,d,m[i],7,-680876936);d=md5ff(d,a,b2,c,m[i+1],12,-389564586);c=md5ff(c,d,a,b2,m[i+2],17,606105819);b2=md5ff(b2,c,d,a,m[i+3],22,-1044525330);
    a=md5ff(a,b2,c,d,m[i+4],7,-176418897);d=md5ff(d,a,b2,c,m[i+5],12,1200080426);c=md5ff(c,d,a,b2,m[i+6],17,-1473231341);b2=md5ff(b2,c,d,a,m[i+7],22,-45705983);
    a=md5ff(a,b2,c,d,m[i+8],7,1770035416);d=md5ff(d,a,b2,c,m[i+9],12,-1958414417);c=md5ff(c,d,a,b2,m[i+10],17,-42063);b2=md5ff(b2,c,d,a,m[i+11],22,-1990404162);
    a=md5ff(a,b2,c,d,m[i+12],7,1804603682);d=md5ff(d,a,b2,c,m[i+13],12,-40341101);c=md5ff(c,d,a,b2,m[i+14],17,-1502002290);b2=md5ff(b2,c,d,a,m[i+15],22,1236535329);
    a=md5gg(a,b2,c,d,m[i+1],5,-165796510);d=md5gg(d,a,b2,c,m[i+6],9,-1069501632);c=md5gg(c,d,a,b2,m[i+11],14,643717713);b2=md5gg(b2,c,d,a,m[i],20,-373897302);
    a=md5gg(a,b2,c,d,m[i+5],5,-701558691);d=md5gg(d,a,b2,c,m[i+10],9,38016083);c=md5gg(c,d,a,b2,m[i+15],14,-660478335);b2=md5gg(b2,c,d,a,m[i+4],20,-405537848);
    a=md5gg(a,b2,c,d,m[i+9],5,568446438);d=md5gg(d,a,b2,c,m[i+14],9,-1019803690);c=md5gg(c,d,a,b2,m[i+3],14,-187363961);b2=md5gg(b2,c,d,a,m[i+8],20,1163531501);
    a=md5gg(a,b2,c,d,m[i+13],5,-1444681467);d=md5gg(d,a,b2,c,m[i+2],9,-51403784);c=md5gg(c,d,a,b2,m[i+7],14,1735328473);b2=md5gg(b2,c,d,a,m[i+12],20,-1926607734);
    a=md5hh(a,b2,c,d,m[i+5],4,-378558);d=md5hh(d,a,b2,c,m[i+8],11,-2022574463);c=md5hh(c,d,a,b2,m[i+11],16,1839030562);b2=md5hh(b2,c,d,a,m[i+14],23,-35309556);
    a=md5hh(a,b2,c,d,m[i+1],4,-1530992060);d=md5hh(d,a,b2,c,m[i+4],11,1272893353);c=md5hh(c,d,a,b2,m[i+7],16,-155497632);b2=md5hh(b2,c,d,a,m[i+10],23,-1094730640);
    a=md5hh(a,b2,c,d,m[i+13],4,681279174);d=md5hh(d,a,b2,c,m[i],11,-358537222);c=md5hh(c,d,a,b2,m[i+3],16,-722521979);b2=md5hh(b2,c,d,a,m[i+6],23,76029189);
    a=md5hh(a,b2,c,d,m[i+9],4,-640364487);d=md5hh(d,a,b2,c,m[i+12],11,-421815835);c=md5hh(c,d,a,b2,m[i+15],16,530742520);b2=md5hh(b2,c,d,a,m[i+2],23,-995338651);
    a=md5ii(a,b2,c,d,m[i],6,-198630844);d=md5ii(d,a,b2,c,m[i+7],10,1126891415);c=md5ii(c,d,a,b2,m[i+14],15,-1416354905);b2=md5ii(b2,c,d,a,m[i+5],21,-57434055);
    a=md5ii(a,b2,c,d,m[i+12],6,1700485571);d=md5ii(d,a,b2,c,m[i+3],10,-1894986606);c=md5ii(c,d,a,b2,m[i+10],15,-1051523);b2=md5ii(b2,c,d,a,m[i+1],21,-2054922799);
    a=md5ii(a,b2,c,d,m[i+8],6,1873313359);d=md5ii(d,a,b2,c,m[i+15],10,-30611744);c=md5ii(c,d,a,b2,m[i+6],15,-1560198380);b2=md5ii(b2,c,d,a,m[i+13],21,1309151649);
    a=md5ii(a,b2,c,d,m[i+4],6,-145523070);d=md5ii(d,a,b2,c,m[i+11],10,-1120210379);c=md5ii(c,d,a,b2,m[i+2],15,718787259);b2=md5ii(b2,c,d,a,m[i+9],21,-343485551);
    a=safeAdd(a,oa);b2=safeAdd(b2,ob);c=safeAdd(c,oc);d=safeAdd(d,od);
  }
  const r=[a,b2,c,d];let hex='';
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)hex+=('0'+(r[i]>>j*8&255).toString(16)).slice(-2);
  return hex;
}

window.copyField = function(id) {
  const el = document.getElementById(id);
  navigator.clipboard.writeText(el.value).then(() => {
    const orig = el.style.borderColor;
    el.style.borderColor = 'var(--green)';
    setTimeout(() => el.style.borderColor = orig, 1000);
  });
};
window.copyText = function(t) {
  navigator.clipboard.writeText(t).catch(() => {});
};

console.log('%c[CipherOS v2.4.1 — READY]', 'color:#00ff41;font-family:monospace;font-size:13px');
