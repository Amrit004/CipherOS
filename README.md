# 🔒 CipherOS — Cryptography Toolkit

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Web Crypto API](https://img.shields.io/badge/Web_Crypto_API-1E3A5F?style=for-the-badge&logo=npm&logoColor=white)

**Browser-Based Cryptographic Toolkit with Retro Terminal Aesthetic**

[Live Demo](https://cipheros.vercel.app) · [View Code](https://github.com/Amrit004/cipheros)

</div>

---

A browser-based cryptographic toolkit with a retro CRT terminal aesthetic. Built entirely with vanilla HTML, CSS, and JavaScript using the **Web Crypto API** — no external libraries, no backend, fully client-side.

## 🚀 Features

| Module | Capabilities |
|--------|--------------|
| **Interactive Terminal** | Command history (↑/↓), 10 commands (`hash`, `encode64`, `decode64`, `hex`, `rot13`, `entropy`, `pwcheck`, `uuid`, `random`, `clear`) |
| **AES-256 Encrypt/Decrypt** | XOR-based symmetric cipher with passphrase key derivation |
| **Hash Generator** | SHA-256, SHA-512, SHA-1, MD5 (pure JS), HMAC support |
| **JWT Decoder** | Header/Payload/Signature parsing with human-readable timestamps |
| **Password Analyser** | Real-time entropy, 8 security checks, crack time estimation |
| **Encoder/Decoder** | Base64, URL, Hex, Binary, ROT-13 |
| **Key Generator** | Hex keys (configurable bits), UUID v4, secure passwords, JWT secrets |

## 🔐 Security Notes

- **All operations are client-side** — no data leaves your browser
- The XOR cipher is for educational demonstration; production use should use AES-GCM via SubtleCrypto
- MD5 and SHA-1 are included for legacy/compatibility; use SHA-256+ for security

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

## ⚡ Quick Start

```bash
git clone https://github.com/Amrit004/cipheros.git
cd cipheros
open index.html   # No server required
```

---

<div align="center">

**Built by Amritpal Singh Kaur**

[LinkedIn](https://linkedin.com/in/amritpal-singh-kaur-b54b9a1b1) · [GitHub](https://github.com/Amrit004) · [Portfolio](https://apsk-dev.vercel.app)

</div>
