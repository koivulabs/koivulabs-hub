# Koivu Labs Hub — Changelog

All notable changes to this project are documented here.

---

## [2.1.0] — 2026-03-28

### Added
- **Telegram bot preview & approval flow** — Bot no longer publishes automatically. Voice/text messages now show an inline preview with Julkaise/Muokkaa/Hylkaa buttons before publishing.
- **Callback query handler** — Webhook handles Telegram inline keyboard button clicks (publish, edit, cancel).
- **Edit mode** — Users can re-record or retype content. Bot re-refines and shows updated preview.
- **Pending posts in Firestore** — Draft posts stored in `pendingPosts` collection with full state tracking. User editing state tracked in `userState` collection.
- **Image support** — Photos sent with caption are processed as logbook posts with images. Images committed to `public/logbook/images/` via GitHub API and referenced in markdown.
- **Telegram photo downloader** — New `telegramPhoto.ts` module downloads photos from Telegram API as base64.
- **GitHub multi-file commits** — `githubCommit.ts` refactored to support committing images alongside markdown via reusable `commitFile` helper.
- **Logbook markdown rendering** — `[slug]/page.tsx` now renders markdown images (`![alt](url)` to `<img>`), h2 and h3 headings instead of treating all content as plain text paragraphs.

### Changed
- **Webhook architecture** — `route.ts` refactored from linear pipeline to interactive state machine with separate handlers for messages, edits, and callback queries.
- **sendMessage helper** — Extended to support `reply_markup` (inline keyboards). New `sendTelegramMessage` returns message ID for later reference.
- **PendingPost type** — Extends `LogbookPost` with `pendingId`, `chatId`, `messageId`, `status`, `imageFileIds`.

### New files
- `src/lib/pendingPost.ts` — Firestore CRUD for pending posts and user state.
- `src/lib/telegramPhoto.ts` — Telegram photo download helper.

### Infrastructure
- Firestore security rules updated: added `pendingPosts` and `userState` collection permissions.

---

## [2.0.0] — 2026-03-06

### Added
- **RSS feed** — Live Logbook RSS feed at `/rss.xml`. Reads published entries from Firestore via REST API. Includes title, excerpt, pub date, and permalink per entry.
- **BrainBuffer case study** — Full case study page at `/case-study/brainbuffer`. Covers problem, solution, dual-model architecture, build timeline (6 phases), tech stack, and key learnings.
- **Contact form** — Replaced mailto CTA on Services page with a functional contact form. Fields: name, email, subject (dropdown by service type), message. Posts to `/api/contact`. Shows success state on submit.
- **Social placeholder links** — GitHub, X/Twitter, LinkedIn icons added to Navbar (desktop) and homepage footer. Currently `#` — ready to swap in real URLs.
- **RSS icon** — RSS link added to homepage footer alongside social icons.

### Changed
- **Services page** — CTA section redesigned from centered button to left-aligned form with header context.
- **Sitemap** — Added `/case-study/brainbuffer` route.
- **BrainBuffer project page** — "Read Case Study →" link added below "Launch Instance" CTA.

---

## [1.9.0] — 2026-03-06

### Added
- **OG image** — Auto-generated branded Open Graph image via Next.js ImageResponse. Shown when links are shared on X, LinkedIn, Slack etc.
- **Favicon** — Custom branded "K" favicon in teal, generated via Next.js edge runtime.
- **Page transitions** — Subtle fade+slide animation between all pages via `template.tsx`.
- **PWA manifest** — `manifest.ts` makes the site installable to mobile home screen.
- **ScrollProgress** — Thin teal progress bar at the top of the page, visible on all pages.
- **BackToTop** — Floating button appears after scrolling 500px. Smooth scroll back to top.
- **ShareButtons** — X/Twitter, LinkedIn, Copy Link on individual logbook post pages.
- **CopyEmail** — Click-to-copy email address on About page. Shows "✓ Copied!" feedback.
- **HeroTyping** — Typewriter animation for the tagline on the homepage hero.
- **TechBadge** — Color-coded technology badges per tech on project detail pages. Each technology has its own brand color accent.
- **`/now` page** — Living snapshot: what's being built, learned, and where. Classic indie dev tradition.
- **Journey Timeline** — Visual timeline on About page showing the studio's progress from Jan 2026 to now.
- **Skeleton loading** — Logbook list shows animated skeleton cards while Firebase fetches data.
- **`prefers-reduced-motion`** — All animations respect OS accessibility setting.
- **Print stylesheet** — Blog posts print cleanly without navigation chrome.

### Changed
- **Navbar** — Added `/now` link.
- **Footer** — Added `/now` link.
- **Sitemap** — Added `/now` and `/privacy` routes.

---

## [1.8.0] — 2026-03-06

### Added
- **Navbar** — Fixed top navigation bar with mobile hamburger menu. Links: Projects, Logbook, Services, About, Contact. Hidden on admin pages.
- **Services page** (`/services`) — Three-pillar studio offering: Build, Consult, Experiment. Full capabilities list and contact CTA.
- **Privacy Policy** (`/privacy`) — GDPR-compliant privacy policy. Covers Firebase Auth, Firestore, Vercel, OpenAI data handling. Finnish data controller.
- **Custom 404 page** — Branded "Lost in the Forest" error page with return link.
- **Logbook individual post pages** (`/logbook/[slug]`) — Each log entry now has its own shareable URL. List page shows excerpts with "Read Entry" links.
- **Server-side admin auth** — `middleware.ts` protects `/admin/*` at the edge. Session cookie set via `/api/auth/session` route on login. httpOnly, secure, strict SameSite.
- **Homepage stats bar** — 7 Projects / Est. 2026 / Saarijärvi / AI-First
- **Homepage "What We Build" section** — Three-pillar summary with link to full Services page.
- **Footer links** — Added Services and Privacy Policy.
- **`llms.txt`** — AI bot discovery file at `/llms.txt`
- **`robots.txt`** — Blocks `/admin` from indexing, points to sitemap.
- **`sitemap.xml`** — Auto-generated. Includes all static routes and project pages.
- **JSON-LD Organization schema** — Structured data in layout for Google rich results.
- **Per-page metadata** — Unique title and description for About, Logbook, Services, Privacy, and all project pages.

### Changed
- **AI Refine system prompt** — Rewritten for studio voice. Direct, precise, results-focused. Nordic restraint. Removed personal identifiers.
- **AI Refine default narrative** — Updated to studio-centric framing.
- **AI Refine rate limiting** — Max 10 requests per IP per minute. Returns 429 on breach.
- **Logbook** — List page now shows excerpt + "Read Entry" link instead of full content.
- **Admin logout** — Now clears session cookie and redirects to homepage.
- **`logService`** — Added `getLog(id)` method for individual post fetching.

### Fixed
- **Tree node positions** — Restored correct coordinates matching original birch tree image layout.
- **Firestore composite index** — Log draft filtering moved client-side. Eliminates silent query failures.

---

## [1.7.0] — 2026-03-06

### Added
- **Firebase Auth login** — `/admin/login` with email/password authentication.
- **Admin seed button** — "SEED FROM STATIC" imports all 7 static projects into Firestore in one click.
- **Admin logout** — EXIT button in admin panel header.
- **"Lab Access" footer link** — Points to `/admin/login`.
- **Editable AI narrative** — LogForm includes a textarea to customize the AI refinement voice per entry.

### Changed
- **Admin auth** — onAuthStateChanged check added. Unauthenticated users redirected to login.
- **AI narrative default** — More specific studio voice descriptor.

---

## [1.6.0] — 2026-03-06

### Added
- **Firebase integration** — `firebase.ts`, `projectService.ts`, `logService.ts`
- **Admin portal** (`/admin`) — Full CRUD for projects and dev logs.
- **ProjectForm** — Includes interactive click-to-position tree placement tool.
- **LogForm** — Markdown editor with "Refine with AI" button.
- **AI Refinery** — `/api/refine` route using OpenAI GPT-4o. Falls back to mock if no API key.
- **Founder's Log** (`/logbook`) — Public blog powered by Firestore.
- **`@tailwindcss/typography`** — Prose styles for logbook content.
- **`currentMission` field** — Shown in project info panel on hover.
- **`vercel.json` headers** — CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy.
- **SEO metadata** — OpenGraph tags in `layout.tsx`.

### Changed
- **`treePosition`** — Project positions now data-driven via `projects.ts`, not hardcoded in component.
- **BirchTree + InteractiveProjectTree** — Both load from Firestore with static fallback.

---

## [1.5.0] — 2026-03-06

### Added
- **Birch Tech-Tree** — Interactive SVG/image-based project tree on homepage.
- **`/registry`** — Full project grid with status badges.
- **`/logbook`** — Static founder's log (pre-Firebase).
- **`/[projectId]`** — Dynamic project detail pages.
- **LeafNode component** — Animated tree node for BirchTree.

---

## [1.0.0] — 2026-03-06

### Added
- Initial deployment. Next.js 15, TypeScript, Tailwind CSS v4.
- Homepage with hero section.
- `/about` — Manifesto page.
- Static project data in `constants/projects.ts`.
- Firebase config boilerplate.
