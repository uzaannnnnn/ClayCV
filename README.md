# ClayCV — AI-Powered CV Platform

**Build Smarter. Apply Better. Get Noticed.**

ClayCV is a local-first, tactile Claymorphism CV & Career Platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Zustand**, **@react-pdf/renderer**, and powered exclusively by the **Google Gemini API** (`@google/genai`, default model `gemini-3.5-flash`, configurable via `GEMINI_MODEL`).

---

## 1. AI Feature Overview

ClayCV integrates a complete suite of server-side Google Gemini AI capabilities alongside its existing 3 ATS-friendly A4 resume templates (`ATS Modern`, `ATS Classic`, `ATS Minimal`):

1. **AI Writing Assistant (`/api/ai/writing`)**:
   - **Professional Summary Generator**: Generates Short, Professional, and Detailed summaries grounded strictly in actual user data.
   - **Work Experience Writer**: Rewrites role descriptions into strong action-verb bullet points across `Professional`, `Concise`, and `Achievement-Oriented` styles without fabricating metrics.
   - **Achievement Statement Generator**: Formulates impact statements from user-supplied tasks, problems solved, technologies, and actual outcomes.
   - **Project Description Generator**: Produces Short, Detailed, and Bullet-Point project descriptions.
   - **Skills Suggestions**: Recommends categorized Technical Skills, Programming Languages, Frameworks, Tools, and Soft Skills (never added automatically).
   - **Grammar & Tone Improver**: Bilingual copyediting in English and Bahasa Indonesia.
   - **Bilingual AI Translation (`en` ↔ `id`)**: Preserves proper nouns, company names, programming languages, and technical terms.
2. **AI Job Description Matcher (`/api/ai/matching`)**:
   - Compares the active CV against a target Job Description.
   - Combines **50% Deterministic Keyword & Requirement Coverage**, **30% Gemini Semantic Alignment**, and **20% Experience & Education Fit**.
   - Distinguishes between **Explicitly Present**, **Reasonably Inferred**, and **Not Found in CV** keywords, with one-click preview & approval for section recommendations.
3. **AI ATS & CV Analyzer (`/api/ai/analysis`)**:
   - Evaluates 7–8 core dimensions: Contact Information, Professional Summary, Work Experience, Education, Skills, Projects & Certifications, and ATS Formatting.
   - Combines deterministic structural checks with Gemini qualitative content evaluation and includes a **"Fix with AI"** approval modal.
4. **AI Career Assistant (`/api/ai/career`)**:
   - **Cover Letter Generator**: Generates tailored cover letters with live editing, clipboard copy, and **A4 PDF export**.
   - **Interview Question Generator**: Produces General, Behavioral, Technical, and Experience-Based questions with preparation tips.
   - **STAR Interview Answer Coach**: Helps structure real CV experiences into Situation, Task, Action, and Result format.
   - **LinkedIn Summary Generator**: Generates 3 Headline & About variants in English or Bahasa Indonesia.
   - **Job Position Recommendations**: Suggests relevant career roles with fit levels, reasoning, and skill development paths.
5. **Platform Enhancements (Local-First)**:
   - **Multiple CV Profiles** & **Duplicate CV**.
   - **CV Version History** (named snapshots & one-click restore).
   - **Local JSON Backup & Restore**.
   - **AI Usage History & Explicit Privacy Consent Manager**.

---

## 2. Technology Stack

- **Framework**: Next.js `16.4.5` (App Router, Server Route Handlers)
- **UI & Styling**: React `19.3.0`, Tailwind CSS v4 (`@tailwindcss/turbopack`), Custom Claymorphism Design System
- **AI SDK**: Official Google Gen AI SDK (`@google/genai`)
- **Default AI Model**: `gemini-3.5-flash` (configurable via `GEMINI_MODEL`)
- **Validation**: Zod `^4.6.7` (`safeParse` + `z.toJSONSchema` structured outputs)
- **State & Persistence**: Zustand `^5.0.16` (`localStorage` key `claycv-storage` v3) + IndexedDB (`claycv_attachments_db` for local certificate files)
- **PDF Generation**: `@react-pdf/renderer` `^4.9.0` (1:1 Live A4 Preview & PDF export parity)

---

## 3. Google Gemini API Setup & Environment Variables

### 3.1 Obtain a Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Create an API key for your project.

### 3.2 Local Environment Setup
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure `.env.local` with your server-side credentials:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
```

> **Security Requirement**: Never prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`. ClayCV strictly enforces server-side execution and will reject requests if `NEXT_PUBLIC_GEMINI_API_KEY` is detected. `.env.local` is ignored by `.gitignore`.

### 3.3 Vercel Environment Setup & Deployment
To deploy ClayCV on Vercel:
1. Push the repository to GitHub/GitLab/Bitbucket and import it into Vercel.
2. Navigate to **Vercel Dashboard → ClayCV → Settings → Environment Variables**.
3. Add the following variables for **Production**, **Preview**, and **Development**:
   - `GEMINI_API_KEY`: Your Google Gemini API key (Sensitive / Server-only).
   - `GEMINI_MODEL`: `gemini-3.5-flash` (or another supported Gemini model identifier if desired).
4. Trigger a deployment (`vercel --prod` or via Git push).

---

## 4. Privacy, Security & Cost Controls

- **Server-Side Only**: All Gemini calls execute exclusively in Next.js Route Handlers (`/api/ai/writing`, `/api/ai/matching`, `/api/ai/analysis`, `/api/ai/career`).
- **Explicit Privacy Consent**: No CV data is transmitted to Google Gemini API until the user explicitly grants consent via the Privacy Consent banner. Consent can be revoked at any time.
- **Google Gemini Data-Handling Policy**: When an AI feature is triggered, minimized CV text is sent to and processed by the Google Gemini API under Google's applicable Gemini API Terms of Service. Under Google's official policy, Free Tier API traffic may be reviewed and used by Google to improve products, whereas Paid Tier API traffic is not used to train Google models.
- **Data Minimization**: Only the CV fields required for the active operation are sent. IndexedDB certificate attachments (`PDF`/`PNG`/`JPG`) are never transmitted to Gemini.
- **Prompt Injection Defense**: All user-provided CV text and job descriptions are sanitized and isolated inside `<untrusted_user_data>` boundary tags.
- **Cost & Quota Controls**:
  - AI operations are strictly user-triggered (never called on keystrokes or background polling).
  - Input character limits (`12,000`–`15,000` chars), payload size limits (`65 KB`), output token caps (`4,096`), `30s` request timeouts, duplicate-request deduplication (`3s` window), and rate limiting (`15 req/min`) are enforced.
  - Gemini API usage may incur costs depending on your Google AI Studio / Vertex billing tier. Free-tier quotas are subject to Google's rate limits.

---

## 5. Development & Testing Instructions

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Run the automated Unit, Integration, and Template Regression Test Suite (uses mocked Gemini responses and does not require a live API key):

```bash
npm test
```

Run the Live Google Gemini API Verification Suite (requires a valid `GEMINI_API_KEY` in `.env.local`):

```bash
npx tsx scripts/verify-live-gemini.ts
```

Run ESLint, TypeScript check, and Next.js production build verification:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## 6. Known Limitations

1. **In-Memory Serverless Rate Limiting**: Default rate limiting and request deduplication in `src/lib/ai/utils/rate-limit.ts` use an in-memory `Map` scoped to a single Node.js process. In serverless deployments (such as Vercel), cold starts and horizontally scaled function instances do not share memory; high-traffic production deployments requiring global rate limiting should integrate a distributed store (e.g., Upstash Redis).
2. **Gemini Model High-Demand Spikes**: Certain preview or experimental Gemini models can experience upstream `HTTP 503 UNAVAILABLE` ("experiencing high demand") spikes on the Free Tier. ClayCV defaults to `gemini-3.5-flash` (configured centrally via `DEFAULT_GEMINI_MODEL`, verified live with ~1.2s–2.9s structured JSON latency) and allows overriding `GEMINI_MODEL` via environment variables without code changes.
3. **Browser-Local Storage Scope**: Because ClayCV is intentionally a local-first, zero-database platform, CV profiles, version snapshots, and IndexedDB certificate attachments are stored locally in the user's browser. Users should use the built-in **Export Active CV (`.json`)** feature in the Platform Manager tab to back up or transfer CVs across devices.
