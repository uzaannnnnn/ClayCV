import { writingRequestSchema } from "@/lib/ai/schemas/writing.schema";
import { executeWritingAssistant } from "@/lib/ai/services/writing.service";
import { handleAIRouteRequest } from "@/lib/ai/utils/route-helper";

export async function POST(request: Request) {
  return handleAIRouteRequest(
    request,
    "ai-writing",
    writingRequestSchema,
    (input) => executeWritingAssistant(input)
  );
}

