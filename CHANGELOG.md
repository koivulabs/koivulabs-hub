# Koivu Labs Hub — Changelog

All notable changes to this project are documented here.

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
