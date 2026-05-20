# Design Specification: B2B Lead Finder & Audit Studio

## 1. Executive Summary
The B2B Lead Finder & Audit Studio is an autonomous money-making tool integrated into the KoivuLabs Admin Hub (`koivulabs-hub`). It enables the automated scanning, technical auditing, and high-conversion PDF pitch generation for Finnish B2B businesses—specifically targeting restaurants, catering companies, and event venues.

The primary objective is to identify critical, revenue-losing flaws in local businesses' websites (slow speeds, non-responsive PDF menus, and lack of lead-capturing chatbots) and automatically present them with a personalized, high-fidelity sales pitch outlining their estimated "Lost Euros" and offering a direct solution: custom web development and Call2u chatbot systems.

---

## 2. Technical Architecture & Data Flow

### 2.1 Search Stage (Google Maps API & Scraping)
* **Goal:** Locate businesses in specific Finnish cities (Helsinki, Espoo, Tampere, Oulu, etc.) under targeted niches (e.g., "catering", "ravintola", "juhlatila").
* **Endpoint:** `POST /api/admin/audit-studio/search`
* **Mechanics:**
  * Uses the **Google Text Search API (New)** or **Google Places API** via a secure server-side call.
  * Inputs: `city` (e.g., "Oulu") and `niche` (e.g., "catering").
  * Parses and maps results to extract: Name, Website, Address, Formatted Phone, Place ID, and Rating.
  * Filters out businesses without websites.

### 2.2 Audit Stage (Multi-Dimensional Scan)
* **Goal:** Scan each website for technical and visual flaws in parallel.
* **Endpoint:** `POST /api/admin/audit-studio/audit`
* **Parallel Tasks:**
  1. **PageSpeed Scan:** Use Google's PageSpeed Insights API (mobile version) to retrieve:
     * Overall Mobile Performance Score (0-100).
     * Largest Contentful Paint (LCP) in seconds.
     * Speed Index in seconds.
  2. **PDF Menu & Mobile Responsiveness Scan:**
     * Crawl the homepage HTML using `cheerio` or regex to locate viewport tags (`width=device-width`).
     * Search for links matching `.pdf` file endings with anchor text indicating menu/pricelist terms (e.g., `menu`, `lista`, `hinnasto`, `ruokalista`, `pdf`).
  3. **FAQ & Lead Capture Scan:**
     * Crawl for existing high-speed messaging widgets, chat windows, or lead captures (e.g., Call2u, HubSpot, Intercom, Facebook Messenger script tags).
     * Determine if they have a direct call-to-action or contact form on the home page.

### 2.3 Financial Calculation (Lost Euros Calculator)
* **Formula:** To drive instant sales urgency, we calculate a monthly "Lost Euros" figure based on known benchmarks:
  $$\text{Estimated Monthly Loss} = (\text{Monthly Traffic} \times 0.15 \text{ [Mobile PDF Dropoff]}) \times \text{Average Booking/Order Value} \times 0.20 \text{ [Conversion Gap]}$$
* **Default Values:**
  * **Monthly Traffic:** Est. 1,500 visitors (conservative for restaurants/local catering).
  * **Average Value:** €150 (catering event or group booking value).
  * **Conversion Gap:** 20% friction due to slow speeds, annoying PDF menus, and lack of immediate automated chat/form responsiveness.
  * **Result:** $\text{Estimated Monthly Loss} = (1500 \times 0.15) \times 150 \times 0.20 = \text{€6,750}$ per month.

---

## 3. Database Schema (Firestore)

All generated leads are saved in a `leads` collection to maintain historical audits and progress:

```typescript
interface Lead {
  id: string; // Auto-generated Firestore ID or Google Place ID
  name: string;
  website: string;
  city: string;
  niche: string;
  phone?: string;
  address?: string;
  status: 'discovered' | 'audited' | 'pitch_ready' | 'sent';
  createdAt: number; // timestamp
  auditData?: {
    pageSpeedScore: number; // 0-100
    lcpSeconds: number;
    pdfMenusDetected: boolean;
    pdfUrls: string[];
    mobileResponsive: boolean;
    hasChatbot: boolean;
    chatbotType?: string;
    auditedAt: number;
  };
  pitchData?: {
    estimatedLostRevenue: number;
    draftEmailSubject: string;
    draftEmailBody: string;
    pdfReportUrl?: string; // Stored in Firebase Storage or client-generated
  };
}
```

---

## 4. UI/UX Interface Design: "Lab Control Studio"

The UI resides securely at `/admin/audit-studio` and uses a three-column premium responsive glassmorphism studio design:

1. **Left Panel: Search & Discovery (Width: ~25%)**
   * Sticky search controls: City select + Niche input.
   * "Run Search" trigger.
   * Vertical scroller list of found businesses with quick indicators (color-coded dots for audit status).

2. **Center Panel: Technical Audit Workspace (Width: ~45%)**
   * Detailed breakdown of the selected business's audit results.
   * Circular progress gauges for **PageSpeed** (Red/Orange/Green transitions).
   * Interactive **Flaw Checklist**:
     * Viewport/Responsiveness warning card.
     * Detected PDF menu URL tree (shows preview link).
     * Missing Instant Lead Capture status.
   * **Lost Euros Interactive Calculator**: Editable sliders for Average Booking Value and Traffic so the user can tweak the numbers live.

3. **Right Panel: PDF Pitch Preview & Sales Generator (Width: ~30%)**
   * A premium, real-time updated CSS-rendered preview of the high-fidelity PDF sales pitch.
   * Features:
     * Modern minimalist styling (Dark theme or Print-friendly Light layout).
     * Big call-out showing **€X,XXX Menetät joka kuukausi**.
     * Bullet points showing identified fixes.
     * Immediate PDF export button (`window.print()` friendly print-only styled sheet, or client-side PDF renderer).
     * "Generate Email Draft" copy-to-clipboard button.

---

## 5. Security & Auth Guards
* Access to `/admin/audit-studio` is governed by `/src/middleware.ts` which decodes the `__koivu_session` cookie and verifies custom claims (`admin: true`).
* Server API routes (`/api/admin/audit-studio/*`) will perform similar server-side checkouts or check if the session cookie is valid via Firebase Admin.

---

## 6. Implementation Stages
1. **API Setup:** Build Google Places/Text Search scraper routes + website parsing worker (cheerio, viewport, pdf detector).
2. **PageSpeed Integration:** Write PageSpeed PSI API caller with proper caching.
3. **Firestore Interface:** Implement database save/update operations in client actions and API routes.
4. **Front-End Dashboard Layout:** Code `/admin/audit-studio/page.tsx` with Framer Motion animations.
5. **Pitch & Print Design:** Design the printable HTML-to-PDF invoice-style sales pitch with custom layout.
