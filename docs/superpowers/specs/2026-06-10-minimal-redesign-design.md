# KoivuLabs.com — Minimal redesign (Editorial noir)

Date: 2026-06-10
Status: Approved by Keijo (chat, 2026-06-10)

## Goal

Strip the site to real, verifiable content only. Hide every in-progress/hobby
project and the KoivuChat product page. Elevate the visual design to an
editorial, typography-driven minimalism ("Direction A — Nordic editorial noir",
chosen from three mockups).

## Decisions (from Q&A)

1. **Hidden pages are removed completely** — routes return 404. Code stays in
   git history and in branch `backup/pre-uplift-20260610`.
2. **References open up** — both client cases (Mystical La Luna, Karhun
   Kattila) lose the "To Be Released" overlay; Visit Site links go live.
3. **Structure: 5 links** — Nav: Work (/references) · Services · Logbook ·
   About + logo→home. Now, Privacy, Lab Access move to the footer.
4. **Design direction A** — dark editorial: slate-950 base stays, glass cards
   and glows go, hairline rules + whitespace + one teal accent per view.
   Serif italic display accents.

## Removals

- Routes: `/[projectId]`, `/koivuchat`, `/registry`, `/case-study/brainbuffer`
- Components: EcosystemSection, InteractiveProjectTree, RootSystem,
  ProjectIndex, BirchTree, LeafNode, ProjectCard, TechBadge, HeroTyping
- Lib: `analytics.ts` (only used by deleted components; also resolves the
  privacy-page "no tracking" contradiction)
- Assets: `public/images/birch_tech_tree.png`, `birch_tech_roots.png`
- `constants/projects.ts` STAYS — admin (admin/page, sync-projects,
  ProjectForm, projectService) depends on it. No public imports remain.

## New homepage (top to bottom)

1. Hero — eyebrow "Software studio — Saarijärvi, Finland", display headline
   with one serif-italic teal accent, short honest subline. Dot-grid texture.
   No typewriter effect, no stats bar, no tree imagery.
2. Selected work — two hairline-divided rows (Mystical La Luna, Karhun
   Kattila) linking to /references.
3. Services — three numbered rows (Build / Consult / Experiment), no cards.
4. Contact CTA — one sentence + hello@koivulabs.com.

## Content corrections

- layout.tsx: remove KoivuChat JSON-LD offer; clean keywords
- llms.txt: rewrite — studio, services, client work only
- about timeline: replace "KoivuChat MVP live in production" with real client
  work milestone
- sitemap: home, references, logbook, services, about, now, privacy only

## Out of scope

Admin UI, API routes, Telegram webhook, logbook functionality, now page
content. Earlier bug fixes (OG image, shared footer, focus styles) remain.

## Verification

`npx tsc --noEmit` 0 errors → `next build` passes → preview: all remaining
routes render, removed routes 404, no console errors, no horizontal scroll at
375 px, mobile menu works, desktop 1440 px checked.

---

## Addendum 2026-06-10: "Killer package" (approved in chat)

Interactive WebGL layer on top of the editorial-noir base:

- **AuroraBackground** — raw-WebGL fbm aurora shader, cursor-warp + glow trail,
  60 % render scale, tab-visibility pause. Modes: `animated` (default desktop),
  `still` (prefers-reduced-motion → ONE frozen rich frame, zero movement),
  `static` (coarse pointer / no WebGL → CSS gradient). Mounted via AuroraRoute:
  home intensity 1.0, other pages 0.4, admin off.
- **Magnetic** — cursor-pull wrapper (hero CTA, contact email, navbar Contact).
- **CustomCursor** — trailing teal ring, augments (never replaces) native cursor.
- **Reveal** — framer-motion whileInView; reduced-motion handled ONLY via
  MotionProvider (MotionConfig reducedMotion="user") — branching the tree on
  useReducedMotion causes SSR hydration mismatches (learned the hard way).
- **SmoothScroll** — Lenis (autoRaf, anchors), skipped for touch/reduced/admin.
  Global CSS scroll-behavior removed in favor of Lenis anchors.
- Page mains lost their opaque bg so the fixed canvas shows through;
  #main-content wrapper is relative z-10.
- Note: this Windows machine has OS animations off → prefers-reduced-motion is
  on in every browser here → 'still' mode shows. Flip Windows
  Settings → Accessibility → Visual effects → Animation effects to see the
  living aurora locally.
