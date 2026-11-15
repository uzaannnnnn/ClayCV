import { matchingRequestSchema } from "@/lib/ai/schemas/matching.schema";
import { executeJobMatching } from "@/lib/ai/services/matching.service";
import { handleAIRouteRequest } from "@/lib/ai/utils/route-helper";

export async function POST(request: Request) {
  return handleAIRouteRequest(
    request,
    "ai-matching",
    matchingRequestSchema,
    (input) => executeJobMatching(input)
  );
}

