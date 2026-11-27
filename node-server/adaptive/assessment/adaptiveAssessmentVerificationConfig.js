/**
 * Independent AI review is optional and never blocks assessment delivery.
 * The default is off so lightweight or slow models do not need a second call.
 */
export function isAdaptiveAssessmentVerificationEnabled(env = process.env) {
  const value = String(env.ADAPTIVE_ASSESSMENT_VERIFY || "false").trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(value);
}
