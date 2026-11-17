# ClayCV (v3.1)

ClayCV is a local-first, tactile Claymorphism CV builder and AI career platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Zustand**, **`@react-pdf/renderer`**, and the **Google Gemini API** (`@google/genai`).

---

## 1. Product Overview

ClayCV helps job seekers, engineers, and professionals create, audit, tailor, and export ATS-friendly resumes in English and Bahasa Indonesia without requiring an account or cloud database.

Core workflows run locally in the browser by default. Optional server-side Google Gemini AI tools assist with resume writing, job description matching, ATS evaluation, and interview/career preparation once explicit user consent is granted.

---

## 2. Key Features

### CV Creation, Templates & Export
- **Three ATS-Friendly A4 Templates**: Switch at any time between `ATS Modern`, `ATS Classic`, and `ATS Minimal` single-column layouts.
- **1:1 Live A4 Preview & Vector PDF Export**: Real-time A4 pagination and vector PDF generation powered by `@react-pdf/renderer`, including clickable contact, portfolio, project, and credential hyperlinks.
- **Bilingual CV Support (`en` & `id`)**: Full document localization and date formatting in English and Bahasa Indonesia.
- **Drag-and-Drop Section Reordering**: Reorder core CV sections (`Experience`, `Education`, `Skills`, `Projects`, `Certifications`) via `@dnd-kit` while preserving ATS structure.
- **Structured Editors & Validation**: Guided forms for Personal Info, Summary, Work Experience, Education (with GPA and thesis formatting), Skills, Projects, and Certifications (with local `PDF`/`PNG`/`JPG` attachment storage).

### Google Gemini AI Workspaces
1. **AI Writing Assistant (`/api/ai/writing`)**:
   - **Professional Summary Generator**: Generates Short, Professional, and Detailed summaries grounded in the user's actual CV data.
   - **Work Experience Writer**: Rewrites role descriptions into action-verb bullet points across `Professional`, `Concise`, and `Achievement-Oriented` styles without fabricating metrics.
   - **Achievement Statement Generator**: Builds structured impact statements from user-supplied tasks, actions, and outcomes.
   - **Project Description Generator**: Creates Short, Detailed, and Bullet-Point project descriptions.
   - **Skills Suggestions**: Recommends categorized Technical Skills, Programming Languages, Frameworks, Tools, and Soft Skills for user review.
   - **Grammar & Tone Improver**: Bilingual copyediting in English and Bahasa Indonesia.
   - **Bilingual AI Translation (`en` <-> `id`)**: Translates CV text while preserving proper nouns, company names, programming languages, and technical terms.
2. **Job Matcher (`/api/ai/matching`)**:
   - Compares the active CV against a target Job Description.
   - Computes a weighted score combining **50% deterministic keyword & requirement coverage**, **30% Gemini semantic alignment**, and **20% experience & education fit**.
   - Categorizes keywords into **Explicitly Present**, **Reasonably Inferred**, and **Not Found in CV**, with preview-and-apply section recommendations.
3. **CV Analyzer (`/api/ai/analysis`)**:
   - Evaluates core ATS and content dimensions: Contact Information, Professional Summary, Work Experience, Education, Skills, Projects & Certifications, and ATS Formatting.
   - Combines deterministic structural checks (always available offline) with Gemini qualitative review and an interactive **"Fix with AI"** approval flow.
4. **Career Assistant (`/api/ai/career`)**:
   - **Cover Letter Generator**: Generates tailored cover letters with live editing, clipboard copy, and standalone **A4 PDF export**.
   - **Interview Question Generator**: Produces General, Behavioral, Technical, and Experience-Based questions with preparation tips.
   - **STAR Interview Answer Coach**: Structures real CV experiences into Situation, Task, Action, and Result format.
   - **LinkedIn Summary Generator**: Generates Headline and About variants in English or Bahasa Indonesia.
   - **Job Position Recommendations**: Suggests matching career roles with fit levels, reasoning, and skill development paths.

### Local-First Profile & Storage Management
- **Multiple CV Profiles**: Create, switch, rename, duplicate, and delete isolated CV profiles for different target roles.
- **Version History**: Save named snapshots of any CV and restore previous states in one click.
- **JSON Backup & Restore**: Export the active CV to a portable `.json` file and validate/import backups across browsers or devices.

---

## 3. UI & Responsive Experience (v3.1)

- **Refined Claymorphism Design System**: Soft warm-stone surfaces (`#F4F1EB`, `#FAF8F5`), tactile shadows, violet accents (`#6C5BD8`, `#8B7CF6`), and keyboard-accessible focus states.
- **Vertical Workspace Navigation**:
  - **Desktop (`>= 1024px`)**: Persistent left sidebar (`240px-260px`) stacking all 6 workspaces (`CV Builder`, `AI Writing Assistant`, `Job Matcher`, `CV Analyzer`, `Career Assistant`, `Profiles & Storage`).
  - **Tablet (`768px-1023px`)**: Compact icon-focused vertical rail with accessible labels.
  - **Mobile (`< 768px`)**: Slide-out navigation drawer with backdrop blur, focus trapping, and `Escape` key dismissal.
- **Dynamic Island-Style Live Preview**:
  - Protected vertical floating `Preview` toggle opens a right-side A4 preview overlay with smooth entrance/exit transitions.
  - Automatic `ResizeObserver` fit-to-viewport scaling fits the full `210mm x 297mm` A4 sheet inside the stage without internal scrollbars.
- **Standardized Dropdown & Select System**:
  - Custom `<Select>` and `<Combobox>` components replace all native `<select>` elements across the header, date pickers (`<MonthYearSelect>`), forms, and AI toolbars.
  - Supports viewport collision flipping, grouped options, search filtering, keyboard navigation (`ArrowUp`/`ArrowDown`, `Home`/`End`, `Enter`/`Space`, `Escape`, `Tab`), and screen-reader combobox semantics.
- **Mobile-First UX Simplifications**:
  - Streamlined mobile Home page and Footer focused on core product identity and primary `"Create My CV"` action without desktop promotional clutter.
  - Proportional horizontal scroll indicator (`<HorizontalScrollTabs>`) below scrollable AI action tabs on compact screens.
  - Content-driven workspace height with bottom-aligned AI privacy disclosure and a compact, zero-scroll `"AI Privacy Notice"` popup featuring a dedicated `"Privacy Details"` view.

---

## 4. Technology Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| Framework | Next.js (App Router, Route Handlers) | `16.4.5` |
| UI Library | React & React DOM | `19.3.0` |
| Language | TypeScript | `^5` |
| Styling | Tailwind CSS v4 (`@tailwindcss/turbopack`), `clsx`, `tailwind-merge` | `^4` |
| State Management | Zustand (`persist` middleware) | `^5.0.16` |
| Forms & Validation | React Hook Form, `@hookform/resolvers`, Zod | `^7.91.0`, `^4.6.7` |
| Drag and Drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | `^6.3.1`, `^10.0.0` |
| PDF Engine | `@react-pdf/renderer` | `^4.9.0` |
| AI SDK | Google Gen AI SDK (`@google/genai`) | `^2.32.0` |
| Icons | `lucide-react` | `^1.67.0` |

---

## 5. Getting Started

### Prerequisites
- **Node.js** `20.x` or later
- **npm** `10.x` or later

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build & Start

```bash
npm run build
npm run start
```

### Testing & Static Verification

Run the automated unit, integration, and regression test suite (`31` test suites using deterministic mocks; does not require a live API key):

```bash
npm test
```

Run TypeScript typechecking and ESLint:

```bash
npx tsc --noEmit
npm run lint
```

Run the optional live Google Gemini verification script (requires a valid `GEMINI_API_KEY` in `.env.local`):

```bash
npx tsx scripts/verify-live-gemini.ts
```

---

## 6. Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Configure the following server-side variables in `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_model
```

- `GEMINI_API_KEY` (**Required for AI features**, server-only): Your Google AI Studio API key.
- `GEMINI_MODEL` (**Optional**, server-only): Supported Gemini model identifier. Defaults to `gemini-3.5-flash` when unset.

> **Security Requirement**: Never prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`. ClayCV enforces server-only execution in `src/lib/ai/gemini-config.ts` and throws a security error if `NEXT_PUBLIC_GEMINI_API_KEY` is set. `.env.local` is excluded by `.gitignore`.

### Vercel Deployment Configuration
When deploying to Vercel, add `GEMINI_API_KEY` and `GEMINI_MODEL` under **Project Settings -> Environment Variables** for Production, Preview, and Development environments.

---

## 7. Privacy, Data Storage & Security

- **Browser-Local Storage by Default**:
  - CV profiles, document settings, version history snapshots, and AI consent state are persisted in browser `localStorage` (`claycv-storage` v3).
  - Uploaded certificate files (`PDF`, `PNG`, `JPG`) are stored locally in browser `IndexedDB` (`claycv_attachments_db`).
- **Explicit Consent & Gemini Data Transmission**:
  - No CV data is sent to Google Gemini until the user explicitly clicks **Agree & Continue** in the `AI Privacy Notice` dialog or workspace consent banner.
  - When an AI tool is triggered by the user, only the minimized CV text fields and job context required for that specific operation are sent through Next.js server route handlers (`/api/ai/*`) to the Google Gemini API.
  - Certificate attachments stored in `IndexedDB` and excluded contact fields are stripped by `minimizeCVData` and are never transmitted to AI endpoints.
  - Requests are processed by Google under the Google Gemini API Terms of Service (Free Tier and Paid Tier apply different data-retention policies).
- **User Control & Guardrails**:
  - Users can inspect full data-handling details via **Privacy Details** and revoke consent at any time via **Withdraw Consent**.
  - AI responses always appear in a preview card first and never overwrite CV fields without user confirmation.
  - All user inputs are sanitized and wrapped in `<untrusted_user_data>` tags to mitigate prompt injection, with payload size caps (`65 KB`), request timeouts (`30s`), deduplication (`3s`), and per-process rate limiting (`15 req/min`).

---

## 8. Project Structure

```text
.
├── scripts/
│   ├── test-ai-platform.tsx       # Automated unit, integration, and UI/SSR regression suite
│   ├── verify-live-gemini.ts      # Live Google Gemini endpoint verification script
│   └── verify-v3.tsx              # Template and store verification utilities
├── src/
│   ├── app/
│   │   ├── api/ai/                # Server-only Gemini route handlers (writing, matching, analysis, career)
│   │   ├── builder/page.tsx       # Main multi-workspace CV builder & AI application shell
│   │   ├── globals.css            # Tailwind v4 & Refined Claymorphism design tokens
│   │   ├── layout.tsx             # Root metadata and font configuration
│   │   └── page.tsx               # Responsive landing page
│   ├── components/
│   │   ├── ai/                    # AI workspaces, result cards, and compact AI Privacy Notice modal
│   │   ├── builder/               # BuilderHeader and responsive WorkspaceSidebar / mobile drawer
│   │   ├── editor/                # Structured CV section forms and drag-and-drop SectionCard
│   │   ├── landing/               # Hero, Features, HowItWorks, TemplatesSection, FinalCTA, Footer
│   │   ├── pdf/                   # @react-pdf/renderer A4 document & cover letter templates
│   │   ├── preview/               # DynamicIslandPreviewToggle & fit-to-viewport LivePreview stage
│   │   ├── templates/             # HTML/CSS ATS template renderers (Modern, Classic, Minimal)
│   │   └── ui/                    # Reusable Claymorphism primitives (Select, Combobox, Dialog, HorizontalScrollTabs, etc.)
│   ├── lib/
│   │   ├── ai/                    # Gemini client, Zod schemas, prompts, sanitization, rate limiting
│   │   ├── dates/                 # Bilingual date formatting helpers
│   │   ├── i18n/                  # English & Indonesian section/document labels
│   │   ├── pdf/                   # Client-side PDF generation and download helpers
│   │   ├── storage/               # IndexedDB certificate attachment storage
│   │   └── validations/           # Form validation schemas
│   ├── store/
│   │   └── cv-store.ts            # Zustand store (profiles, snapshots, consent, active workspace)
│   └── types/
│       └── cv.ts                  # Core TypeScript interfaces for CV data and profiles
├── .env.example                   # Safe environment variable template
└── package.json                   # Scripts and dependency manifest
```

---

## 9. Known Limitations

1. **In-Memory Rate Limiting**: `src/lib/ai/utils/rate-limit.ts` uses an in-memory `Map` per Node.js process. Multi-instance serverless deployments requiring shared global rate limits should use a distributed store such as Upstash Redis.
2. **Browser-Scoped Local Storage**: Because ClayCV operates without a cloud database, clearing browser site data removes local profiles and attachments unless exported via **Export Active CV (`.json`)** in `Profiles & Storage`.

---

## 10. License

This repository is currently configured as `"private": true` in `package.json` with no separate open-source license file declared. All rights reserved by the author unless otherwise specified.
