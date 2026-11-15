import { careerRequestSchema } from "@/lib/ai/schemas/career.schema";
import { executeCareerAssistant } from "@/lib/ai/services/career.service";
import { handleAIRouteRequest } from "@/lib/ai/utils/route-helper";

export async function POST(request: Request) {
  return handleAIRouteRequest(
    request,
    "ai-career",
    careerRequestSchema,
    (input) => executeCareerAssistant(input)
  );
}

