/**
 * Controls only the optional post-assessment Adaptive Intelligence response.
 * It does not disable AI calls required by other learning workflows.
 * Missing, empty, or unrecognised values are safely treated as OFF.
 */
export function isAdaptiveIntelligenceEnabled(env = process.env) {
  return String(env.ADAPTIVE_INTELLIGENCE_ENABLED || "").trim().toLowerCase() === "true";
}
