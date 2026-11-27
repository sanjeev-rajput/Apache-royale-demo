/** Keep retry policy explicit and bounded to protect latency and model-request budgets. */
export const MAX_GENERATION_ATTEMPTS = 2;

export function decideAssessment(verification, attemptNumber) {
  if (verification?.accepted === true) return { action: "accept" };
  if (attemptNumber < MAX_GENERATION_ATTEMPTS) {
    return {
      action: "regenerate",
      retryHint: `The previous assessment did not pass independent verification. Correct these issues without changing the topic or grade: ${(verification?.failures || []).join("; ")}.`
    };
  }
  return { action: "reject", reason: "The generated assessment did not pass independent verification after the permitted attempts." };
}
