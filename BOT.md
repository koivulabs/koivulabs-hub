# Koivu Voice — Telegram Bot Documentation

Personal Telegram bot for KoivuLabs. Handles logbook publishing, time tracking, invoicing, and Now-page management through voice and text messages.

**Bot:** @koivulabs_bot
**Runtime:** Vercel serverless (Next.js API route)
**Data:** Firebase Firestore (REST API, no SDK)
**AI:** OpenAI GPT-4o (transcription via Whisper, content refinement & parsing)

## Architecture

```
Telegram → Webhook (POST /api/webhooks/telegram) → Route handler
  ├── Message handler (voice/text/photo)
  │     ├── Menu button routing
  │     └── User state machine (idle/editing/time_input/now_input/setup)
  └── Callback query handler (inline button clicks)
        ├── Post actions (publish/edit/cancel)
        ├── Time entry actions (save/cancel)
        ├── Invoice actions (detail/pdf/close)
        ├── Now-page actions (publish/cancel/restore)
        ├── Tools menu routing
        └── Delete log actions
```

All state is persisted in Firestore because Vercel serverless functions have no persistent memory between invocations.

## Main Menu (Persistent Keyboard)

```
📝 Uusi postaus  |  📋 Draftit
⏱ Kirjaa työ    |  ⚙️ Työkalut
📊 Status        |  ❓ Ohje
```

## Features

### 📝 Uusi postaus — Logbook Publishing

Send voice, text, or photo message → AI refines into structured blog post → preview with approve/edit/reject buttons → publishes to GitHub (markdown) + Firestore simultaneously.

**Flow:** Input → Whisper transcription (if voice) → GPT-4o refinement → PendingPost in Firestore → Preview message with inline buttons → Publish on approval

**Images:** Photos are downloaded from Telegram, committed to `public/logbook/images/` on GitHub, and markdown references injected into post content before both GitHub and Firestore saves.

### 📋 Draftit — Draft Management

Lists all pending posts with their preview and action buttons. Each draft can be published, edited, or cancelled.

### ⏱ Kirjaa työ — Time Tracking

Voice/text input describing work done → GPT-4o parses into structured time entry → preview → saves to open invoice.

**AI parses from natural language:**
- Client name
- Work description
- Location
- Date (defaults to today)
- Hours worked
- Pricing model (hourly/fixed/none) and amounts

**Example inputs:**
- "Tein tänään 4h nettisivuja Hautsalolle Saarijärvellä, satanen tunti"
- "Logo design for BrainBuffer, 500€ fixed price"
- "3h palaveri ilman hintaa"

**Auto-client:** If client doesn't exist, creates one automatically. If client exists, uses their default pricing when no price mentioned.

**Auto-invoice:** Entries are added to the client's open invoice. New invoice created automatically if none exists.

### ⚙️ Työkalut — Tools Submenu (Inline Buttons)

Opens an inline keyboard with secondary features:

| Button | Function |
|--------|----------|
| 📌 Now-sivu | Update koivulabs.com/now page via voice/text |
| 🗑 Poista postaus | Delete published logbook posts from Firestore |
| 🧾 Laskut | View open invoices, see entries, generate HTML invoice, close invoice |
| 📇 Asiakkaat | List saved clients with their pricing defaults |
| 👤 Omat tiedot | Setup wizard for company/invoicing details |

### 📌 Now-sivu — Now Page Update

Voice/text → GPT-4o parses into sections (Building, Learning, Reading, Not Doing, Location) → preview → saves to Firestore `siteContent/now`. Previous version backed up automatically with restore button.

### 🧾 Laskut — Invoice Management

- Lists open invoices per client with entry count, hours, and total
- **📋 Rivit** — Shows all time entries on an invoice
- **📄 Luo PDF** — Generates and sends an HTML invoice file to Telegram chat
- **🔒 Sulje lasku** — Closes invoice; next entry for same client creates new one

Invoice includes: sender details, recipient details, itemized entries, totals, IBAN, due date.

### 👤 Omat tiedot — Company Settings

Step-by-step wizard that collects:
1. Company name
2. Y-tunnus (business ID)
3. Address
4. IBAN
5. Email
6. Phone (optional)
7. Default hourly rate (optional)

Stored in Firestore `siteContent/invoiceSettings`. Used when generating invoices.

### 📊 Status

Shows published post count, pending drafts count, and links to koivulabs.com.

## Firestore Collections

| Collection | Purpose | Key fields |
|-----------|---------|------------|
| `logs/{slug}` | Published logbook posts | title, content, tags, publishedAt |
| `pendingPosts/{id}` | Draft posts & temp data | content, status, chatId, imageFileIds |
| `userState/{id}` | User state machine | mode, pendingId |
| `siteContent/now` | Now page content | building[], learning[], reading[], notDoing[], location |
| `siteContent/now_backup` | Previous Now page | same as above |
| `siteContent/invoiceSettings` | Own company details | companyName, businessId, iban, etc. |
| `clients/{id}` | Client information | name, businessId, pricingModel, defaultHourlyRate |
| `invoices/{id}` | Invoices (open/closed) | client, clientId, status, entries[], totalHours, totalPrice |
| `timeEntries/{id}` | Individual work entries | invoiceId, client, description, hours, pricing |

## Files

| File | Purpose |
|------|---------|
| `src/app/api/webhooks/telegram/route.ts` | Main webhook handler, all bot logic |
| `src/lib/firestoreRest.ts` | Firestore REST API helpers for all collections |
| `src/lib/koivuVoice.ts` | GPT-4o logbook post refinement |
| `src/lib/transcribeVoice.ts` | Whisper voice transcription |
| `src/lib/telegramPhoto.ts` | Telegram photo download helper |
| `src/lib/githubCommit.ts` | GitHub Contents API for committing files |
| `src/lib/pendingPost.ts` | PendingPost & UserState Firestore helpers |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot API token |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook verification |
| `MY_TELEGRAM_USER_ID` | Owner auth (only this user can use the bot) |
| `OPENAI_API_KEY` | GPT-4o & Whisper |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firestore project |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firestore REST API key |
| `GITHUB_TOKEN` | GitHub Contents API |
| `GITHUB_OWNER` | GitHub repo owner |
| `GITHUB_REPO` | GitHub repo name |

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /logs/{logId} { allow read, write: if true; }
    match /projects/{projectId} { allow read, write: if true; }
    match /pendingPosts/{document} { allow read, write: if true; }
    match /userState/{document} { allow read, write: if true; }
    match /siteContent/{document} { allow read, write: if true; }
    match /clients/{document} { allow read, write: if true; }
    match /invoices/{document} { allow read, write: if true; }
    match /timeEntries/{document} { allow read, write: if true; }
    match /{document=**} { allow read, write: if request.auth != null; }
  }
}
```
