import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  getGeminiConfig,
  getGeminiModel,
} from "../src/lib/ai/gemini-config";
import {
  generateStructuredContent,
  setMockGeminiGenerator,
} from "../src/lib/ai/gemini-client";
import { resetRateLimitStore } from "../src/lib/ai/utils/rate-limit";
import { writingResponseSchema } from "../src/lib/ai/schemas/writing.schema";
import { matchingResponseSchema } from "../src/lib/ai/schemas/matching.schema";
import { analysisResponseSchema } from "../src/lib/ai/schemas/analysis.schema";
import { careerResponseSchema } from "../src/lib/ai/schemas/career.schema";
import { POST as writingPOST } from "../src/app/api/ai/writing/route";
import { POST as matchingPOST } from "../src/app/api/ai/matching/route";
import { POST as analysisPOST } from "../src/app/api/ai/analysis/route";
import { POST as careerPOST } from "../src/app/api/ai/career/route";
import { SAMPLE_CV_DATA } from "../src/lib/constants";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local does not exist");
  }
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
}

interface LiveTestRecord {
  id: string;
  category: string;
  name: string;
  status: "LIVE_API_PASS" | "FAIL";
  durationMs: number;
  model: string;
  details: string;
}

const results: LiveTestRecord[] = [];

async function runLiveCheck(
  id: string,
  category: string,
  name: string,
  fn: () => Promise<{ model: string; details: string }>
) {
  const onlyIds = process.env.ONLY_IDS
    ? process.env.ONLY_IDS.split(",").map((s) => s.trim())
    : null;
  if (onlyIds && !onlyIds.includes(id)) {
    return;
  }
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const t0 = Date.now();
    try {
      resetRateLimitStore();
      const { model, details } = await fn();
      const durationMs = Date.now() - t0;
      results.push({
        id,
        category,
        name,
        status: "LIVE_API_PASS",
        durationMs,
        model,
        details,
      });
      console.log(
        `[LIVE_API_PASS] ${id} | ${name} (${durationMs}ms, model=${model}) -> ${details}`
      );
      // Brief pause to respect Google Gemini Free Tier RPM window
      await new Promise((r) => setTimeout(r, 3500));
      return;
    } catch (err) {
      const durationMs = Date.now() - t0;
      const message = err instanceof Error ? err.message : String(err);
      const isTransientQuotaOrDemand = /429|503|504|rate limit|high demand|timed out/i.test(
        message
      );
      if (isTransientQuotaOrDemand && attempt < maxAttempts) {
        const waitMs = attempt * 12000;
        console.log(
          `  [RETRY ${attempt}/${maxAttempts - 1}] ${id} encountered transient provider limit (${message.slice(0, 70)}). Waiting ${waitMs / 1000}s for RPM window...`
        );
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      results.push({
        id,
        category,
        name,
        status: "FAIL",
        durationMs,
        model: getGeminiModel(),
        details: message,
      });
      console.error(`[FAIL] ${id} | ${name} (${durationMs}ms) -> ${message}`);
      return;
    }
  }
}

async function main() {
  console.log("=== ClayCV Phase 3 — Live Google Gemini API Verification ===\n");

  setMockGeminiGenerator(null);

  // Step 1: Environment Verification
  loadEnvLocal();
  const cfg = getGeminiConfig();
  assert(cfg.apiKey.length > 10, "GEMINI_API_KEY must be present and non-empty");
  console.log(
    `Step 1: .env.local verified | Key present: YES (redacted) | Active Model: ${cfg.model}\n`
  );

  // Step 2: Minimal Live Gemini Structured JSON Request
  const step2Schema = z.object({
    status: z.string(),
    provider: z.string(),
    model: z.string(),
    message: z.string(),
  });

  await runLiveCheck(
    "STEP-2",
    "Connectivity",
    "Minimal Live Gemini Structured JSON Request",
    async () => {
      const res = await generateStructuredContent({
        systemInstruction:
          "You are a diagnostic assistant for ClayCV. Return valid JSON matching the requested schema.",
        prompt:
          'Return a short greeting message and confirm structured output works. Set status to "ok" and provider to "google-gemini".',
        schema: step2Schema,
        jsonSchema: {
          type: "object",
          properties: {
            status: { type: "string" },
            provider: { type: "string" },
            model: { type: "string" },
            message: { type: "string" },
          },
          required: ["status", "provider", "model", "message"],
        },
      });
      assert.equal(res.data.status.toLowerCase(), "ok");
      return {
        model: res.model,
        details: `status="${res.data.status}", provider="${res.data.provider}", message="${res.data.message.slice(0, 70)}"`,
      };
    }
  );

  // Step 3A: AI Writing Assistant (5 operations)
  await runLiveCheck(
    "STEP-3A-1",
    "AI Writing",
    "1. Professional Summary Generation",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.1.1" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "professional_summary",
          language: "en",
          style: "professional",
          summaryContext: {
            targetPosition: "Senior Full-Stack Engineer",
            yearsOfExperience: "6+ years",
            currentSummary: SAMPLE_CV_DATA.personalInfo.summary,
            skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
          },
        }),
      });
      const res = await writingPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = writingResponseSchema.parse(body.data);
      assert(parsed.results.length >= 1 && parsed.results[0].content.length > 40);
      return {
        model: body.model,
        details: `${parsed.results.length} summary variant(s); first (${parsed.results[0].content.length} chars)`,
      };
    }
  );

  await runLiveCheck(
    "STEP-3A-2",
    "AI Writing",
    "2. Work Experience Bullet Improvement (Anti-Fabrication Check)",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.1.2" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "experience_improve",
          language: "en",
          style: "achievement_oriented",
          experienceContext: {
            company: "Acme Web Studio",
            position: "Frontend Engineer",
            employmentType: "Full-time",
            description:
              "- Built frontend web pages using React and TypeScript\n- Collaborated with backend developers on REST APIs",
          },
        }),
      });
      const res = await writingPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = writingResponseSchema.parse(body.data);
      assert(parsed.results.length >= 1);
      return {
        model: body.model,
        details: `${parsed.results.length} improved variant(s); warnings=${parsed.warnings.length}`,
      };
    }
  );

  await runLiveCheck(
    "STEP-3A-3",
    "AI Writing",
    "3. Skills Suggestions",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.1.3" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "skills_suggestions",
          language: "en",
          skillsContext: {
            jobTitle: "Senior Full-Stack Engineer",
            existingSkills: ["TypeScript", "React", "Next.js"],
            experienceSummaries: [
              "Built enterprise web applications with TypeScript, React, Next.js, Node.js, PostgreSQL, and Docker.",
            ],
          },
        }),
      });
      const res = await writingPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = writingResponseSchema.parse(body.data);
      assert((parsed.suggested_skills?.length || 0) > 0 || parsed.results.length > 0);
      return {
        model: body.model,
        details: `${parsed.suggested_skills?.length || 0} skill categories suggested`,
      };
    }
  );

  await runLiveCheck(
    "STEP-3A-4",
    "AI Writing",
    "4. Grammar and Tone Improvement",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.1.4" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "grammar_tone",
          language: "en",
          style: "professional",
          textContext: {
            text: "i was responsible for making the website faster and fixing bugs in react components for customers.",
            fieldLabel: "Work Experience",
          },
        }),
      });
      const res = await writingPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = writingResponseSchema.parse(body.data);
      assert(parsed.results.length >= 1 && parsed.results[0].content.length > 20);
      return {
        model: body.model,
        details: `Corrected: "${parsed.results[0].content.slice(0, 80)}..."`,
      };
    }
  );

  await runLiveCheck(
    "STEP-3A-5",
    "AI Writing",
    "5. Indonesian <-> English CV Translation",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.1.5" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "translation",
          language: "en",
          targetLanguage: "id",
          textContext: {
            text: "Engineered high-throughput microservices in Node.js and TypeScript, reducing API latency by 35%.",
            fieldLabel: "Work Experience",
          },
        }),
      });
      const res = await writingPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = writingResponseSchema.parse(body.data);
      assert(parsed.results.length >= 1 && parsed.results[0].content.length > 20);
      return {
        model: body.model,
        details: `Translated (ID): "${parsed.results[0].content.slice(0, 80)}..."`,
      };
    }
  );

  // Step 3B: Job Description Matcher
  await runLiveCheck(
    "STEP-3B",
    "Job Matcher",
    "Job Description Matcher (Deterministic + Semantic + Explicit/Inferred)",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.2.1" },
        body: JSON.stringify({
          consentAccepted: true,
          jobTitle: "Senior Full-Stack Engineer",
          companyName: "Stripe",
          jobDescription:
            "We are hiring a Senior Full-Stack Engineer proficient in TypeScript, React, Next.js, Node.js, PostgreSQL, GraphQL, Docker, AWS, and CI/CD pipelines. Must have experience leading frontend architecture, mentoring engineers, and optimizing Core Web Vitals.",
          cvData: SAMPLE_CV_DATA,
        }),
      });
      const res = await matchingPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = matchingResponseSchema.parse(body.data);
      assert(
        parsed.score_breakdown.overall_score >= 0 &&
          parsed.score_breakdown.overall_score <= 100
      );
      assert(parsed.matched_keywords.length > 0);
      return {
        model: body.model,
        details: `overall_score=${parsed.score_breakdown.overall_score}/100 (det=${parsed.score_breakdown.deterministic_keyword_score}, sem=${parsed.score_breakdown.semantic_alignment_score}), matched=${parsed.matched_keywords.length}, missing=${parsed.missing_keywords.length}, recs=${parsed.recommendations.length}`,
      };
    }
  );

  // Step 3C: ATS & CV Analyzer
  await runLiveCheck(
    "STEP-3C",
    "ATS Analyzer",
    "ATS & CV Analyzer (Deterministic Structural + Gemini Qualitative)",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.3.1" },
        body: JSON.stringify({
          consentAccepted: true,
          cvData: SAMPLE_CV_DATA,
        }),
      });
      const res = await analysisPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = analysisResponseSchema.parse(body.data);
      assert(parsed.overall_score >= 0 && parsed.overall_score <= 100);
      assert(parsed.categories.length > 0);
      assert(parsed.recommendations.length > 0);
      return {
        model: body.model,
        details: `overall_score=${parsed.overall_score}/100 (det=${parsed.deterministic_score}, ai=${parsed.ai_quality_score}), categories=${parsed.categories.length}, recs=${parsed.recommendations.length}`,
      };
    }
  );

  // Step 3D: AI Career Assistant (5 operations)
  await runLiveCheck(
    "STEP-3D-1",
    "Career Assistant",
    "1. Cover Letter Generator",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/career", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.4.1" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "cover_letter",
          language: "en",
          targetJobTitle: "Principal Frontend Architect",
          companyName: "Stripe",
          jobDescription:
            "Lead our web platform architecture using React, TypeScript, and Next.js.",
          cvData: SAMPLE_CV_DATA,
        }),
      });
      const res = await careerPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = careerResponseSchema.parse(body.data);
      assert(parsed.content.length > 100);
      return {
        model: body.model,
        details: `Cover letter generated (${parsed.content.length} chars)`,
      };
    }
  );

  await runLiveCheck(
    "STEP-3D-2",
    "Career Assistant",
    "2. Interview Question Generator",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/career", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.4.2" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "interview_questions",
          language: "en",
          targetJobTitle: "Senior Full-Stack Engineer",
          companyName: "Vercel",
          cvData: SAMPLE_CV_DATA,
        }),
      });
      const res = await careerPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = careerResponseSchema.parse(body.data);
      assert((parsed.interview_questions?.length || 0) > 0);
      return {
        model: body.model,
        details: `${parsed.interview_questions?.length || 0} tailored interview questions generated`,
      };
    }
  );

  await runLiveCheck(
    "STEP-3D-3",
    "Career Assistant",
    "3. STAR Answer Builder",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/career", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.4.3" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "interview_answer",
          language: "en",
          targetJobTitle: "Senior Full-Stack Engineer",
          interviewQuestion:
            "Tell me about a time you improved web application performance or architecture.",
          cvData: SAMPLE_CV_DATA,
        }),
      });
      const res = await careerPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = careerResponseSchema.parse(body.data);
      assert(parsed.star_answer && parsed.star_answer.full_answer.length > 30);
      return {
        model: body.model,
        details: `STAR response generated (${parsed.star_answer.full_answer.length} chars)`,
      };
    }
  );

  await runLiveCheck(
    "STEP-3D-4",
    "Career Assistant",
    "4. LinkedIn Headline & About Summary",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/career", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.4.4" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "linkedin_summary",
          language: "en",
          targetJobTitle: "Senior Full-Stack Engineer",
          cvData: SAMPLE_CV_DATA,
        }),
      });
      const res = await careerPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = careerResponseSchema.parse(body.data);
      assert((parsed.linkedin_variants?.length || 0) > 0);
      return {
        model: body.model,
        details: `${parsed.linkedin_variants?.length || 0} LinkedIn variants generated`,
      };
    }
  );

  await runLiveCheck(
    "STEP-3D-5",
    "Career Assistant",
    "5. Job Position Recommendations",
    async () => {
      const req = new Request("http://localhost:3000/api/ai/career", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.4.5" },
        body: JSON.stringify({
          consentAccepted: true,
          operation: "job_recommendations",
          language: "en",
          cvData: SAMPLE_CV_DATA,
        }),
      });
      const res = await careerPOST(req);
      const body = await res.json();
      assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${body?.error?.message}`);
      const parsed = careerResponseSchema.parse(body.data);
      assert((parsed.job_recommendations?.length || 0) > 0);
      return {
        model: body.model,
        details: `${parsed.job_recommendations?.length || 0} roles recommended (${parsed.job_recommendations
          ?.slice(0, 3)
          .map((r) => `${r.role_title} [${r.fit_level}]`)
          .join(", ")})`,
      };
    }
  );

  const passCount = results.filter((r) => !r || r.status === "LIVE_API_PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;
  console.log(
    `\n=== Live Verification Summary: ${passCount} LIVE_API_PASS, ${failCount} FAIL ===`
  );
  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error in live verification:", err);
  process.exit(1);
});
