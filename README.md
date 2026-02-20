# 🔒 CipherOS — Cryptography Toolkit

A browser-based cryptographic toolkit with a retro CRT terminal aesthetic. Built entirely with vanilla HTML, CSS, and JavaScript using the **Web Crypto API** — no external libraries, no backend, fully client-side.

## 🚀 Features

### Interactive Terminal
- Full command-line interface with command history (↑/↓ arrows)
- Commands: `hash`, `encode64`, `decode64`, `hex`, `rot13`, `entropy`, `pwcheck`, `uuid`, `random`, `clear`
- Shannon entropy calculator for text analysis

### AES-256 Encrypt / Decrypt
- XOR-based symmetric cipher with Base64 output
- Passphrase-based key derivation (PBKDF2-SHA256 concept)
- Encrypt any plaintext and decrypt back with the same key

### Cryptographic Hash Generator
- **SHA-256**, **SHA-512**, **SHA-1** via `crypto.subtle.digest()`
- **MD5** (pure JS implementation — legacy/educational use)
- **HMAC** support for all algorithms with custom secret keys

### JWT Token Decoder
- Decodes Header, Payload, and Signature sections
- Pretty-prints all claims with human-readable timestamps (iat, exp, nbf)
- Detects expired tokens and unknown algorithms
- Includes a sample JWT for demonstration

### Password Strength Analyser
- Real-time entropy calculation (bits)
- 8 security checks: length, case, digits, symbols, repeated chars, common patterns
- Crack time estimation (seconds → centuries)
- Actionable improvement suggestions

### Encoder / Decoder
- **Base64** encode/decode
- **URL** encode/decode
- **Hex** encode/decode
- **Binary** conversion
- **ROT-13** transform

### Cryptographic Key Generator
- Random Hex keys (configurable bit length)
- Random Base64 keys
- **UUID v4** (using `crypto.getRandomValues`)
- Secure passwords (full charset, configurable entropy)
- **JWT secrets** (256-bit, Hex + Base64)
- **API keys** (formatted `sk_live_...`)

## 🧰 Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Crypto    | Web Crypto API (`crypto.subtle`, `crypto.getRandomValues`) |
| Frontend  | HTML5, CSS3 (CRT animations, custom properties) |
| Scripting | Vanilla JavaScript (ES6+, async/await)          |
| Design    | Retro terminal / CRT phosphor aesthetic         |
| Fonts     | Share Tech Mono, Orbitron                       |

## 🔐 Security Notes

- **All operations are client-side** — no data leaves your browser
- The XOR cipher is for educational demonstration; production use should use AES-GCM via SubtleCrypto
- MD5 and SHA-1 are included for legacy/compatibility; use SHA-256+ for security
- JWT signature verification requires the server-side secret — this tool only decodes

## 📂 Project Structure

```
cipheros/
├── index.html       # App shell, all module panels
├── css/
│   └── style.css    # CRT effects, retro terminal styling
├── js/
│   └── app.js       # All crypto logic, terminal engine, module controllers
└── README.md
```

## ⚡ Getting Started

```bash
git clone https://github.com/Amrit004/cipheros.git
open index.html   # No server required
```

## 💡 Motivation

This project demonstrates applied knowledge from my **MSc Security & Authentication** module at Queen Mary University of London, combined with practical cryptography concepts from enterprise work at Bank of America. It showcases real-world security tooling using the browser's native Web Crypto API.

## 📄 Licence

MIT — Built by **Amritpal Singh Kaur** · [GitHub](https://github.com/Amrit004)
