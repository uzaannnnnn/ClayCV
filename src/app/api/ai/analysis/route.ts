import { analysisRequestSchema } from "@/lib/ai/schemas/analysis.schema";
import { executeCVAnalysis } from "@/lib/ai/services/analysis.service";
import { handleAIRouteRequest } from "@/lib/ai/utils/route-helper";

export async function POST(request: Request) {
  return handleAIRouteRequest(
    request,
    "ai-analysis",
    analysisRequestSchema,
    (input) => executeCVAnalysis(input)
  );
}

