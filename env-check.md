# 🛠️ Dependency & Environment Check

> **Goal**: Ensure running environment is robust and all necessary modules are installed.

## 📦 Missing Dependencies (Auto-Detected)

- [ ] **dotenv**: Required for running local Node management scripts.
- [ ] **date-fns**: Required for safe Date manipulation (TimeZone issues).
- [ ] **uuid**: Useful for client-side ID generation if needed.

## ✅ Action Plan

- [x] Install `dotenv` and `date-fns` (Running...)
- [ ] Verify Supabase Connection via Script.
- [ ] Fix Calendar Logic using `date-fns`.

## 🧪 Verification Script

Run `node scripts/check-env.js` after installation.
