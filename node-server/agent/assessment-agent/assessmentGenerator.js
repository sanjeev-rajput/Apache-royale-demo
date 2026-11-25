import { generateStructuredResponse } from "../../services/llmProvider.js";
import { getConfigPath } from "../../services/configPath.js";
import fs from "node:fs/promises";
import { validateAssessmentPayload } from "./assessmentValidator.js";

async function resolveProfileGuidance(context) {
  const profileId = String(context.instructionProfileId || "").trim();
  if (!/^[a-z0-9_-]+$/i.test(profileId)) return "";

  try {
    const file = getConfigPath("profiles", `${profileId}.json`);
    const profile = JSON.parse(await fs.readFile(file, "utf8"));
    const language = profile?.responseGuidelines?.language;
    const level = profile?.responseGuidelines?.languageLevel;
    return [
      language ? `Language: ${language}` : "",
      level ? `Language level: ${level}` : "",
      ...(Array.isArray(profile?.qualityGuidelines)
        ? profile.qualityGuidelines.map(item => `Quality guideline: ${item}`)
        : []),
      ...(Array.isArray(profile?.assessmentGuidelines)
        ? profile.assessmentGuidelines.map(item => `Assessment guideline: ${item}`)
        : [])
    ].filter(Boolean).join("\n");
  } catch (error) {
    console.warn(`[Assessment Agent] SME profile '${profileId}' could not be read: ${error.message}`);
    return "";
  }
}

export async function generateAssessment(context) {
  const profileGuidance = await resolveProfileGuidance(context);
  const language = String(context.language || "English").trim();

  const systemPrompt = `
You are an assessment-question writer for a K-12 learning platform.
Create a short, age-appropriate multiple-choice assessment using only the
supplied topic, grade and subject context.

Return one JSON object with exactly this structure:
{
  "title": "Short assessment title",
  "instructions": "One short instruction for the learner",
  "questions": [
    {
      "id": "q1",
      "prompt": "Question text",
      "options": [
        {"id": "A", "text": "Option A"},
        {"id": "B", "text": "Option B"},
        {"id": "C", "text": "Option C"},
        {"id": "D", "text": "Option D"}
      ],
      "correctOptionId": "A",
      "explanation": "A short explanation of the correct answer"
    }
  ]
}

Mandatory rules:
- Produce exactly five questions.
- Every question must have exactly four distinct options with IDs A, B, C and D.
- Exactly one option must be correct for each question.
- Use exactly one correctOptionId from A, B, C or D.
- Do not reveal the correct answer in the prompt or option wording.
- Follow the supplied SME profile guidance for educational quality and grade-band expectations.
- Output language: ${language}.
- Return valid JSON only. No Markdown fences or commentary.
${context.assessmentRetryHint ? `\nRETRY CORRECTION:\n${context.assessmentRetryHint}` : ""}
  ${profileGuidance ? `\nSME PROFILE GUIDANCE:\n${profileGuidance}` : ""}
`;

  const userPayload = {
    topic: context.topic,
    grade: context.grade || "Not specified",
    subject: context.subject || "Not specified",
    language,
    learningContext: context.learningContext || ""
  };

  const raw = await generateStructuredResponse({
    systemPrompt,
    userPayload,
    temperature: 0.2,
    maxTokens: 2200,
    timeoutMs: Number(process.env.ASSESSMENT_AI_TIMEOUT_MS || 90000)
  });

  return validateAssessmentPayload(raw);
}
