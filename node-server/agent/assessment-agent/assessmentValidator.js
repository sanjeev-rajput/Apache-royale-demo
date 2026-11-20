const REQUIRED_QUESTION_COUNT = 5;
const REQUIRED_OPTION_COUNT = 4;
const OPTION_IDS = new Set(["A", "B", "C", "D"]);

function requireText(value, label, maxLength = 1200) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new Error(`${label} exceeds ${maxLength} characters.`);
  }
  return normalized;
}

/**
 * Validate and normalize the model-produced assessment before it can become
 * an attempt. Correct answers are retained only in the server-side object.
 */
export function validateAssessmentPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Assessment output must be a JSON object.");
  }

  const title = requireText(payload.title, "title", 160);
  const instructions = requireText(payload.instructions, "instructions", 500);

  if (!Array.isArray(payload.questions) ||
      payload.questions.length !== REQUIRED_QUESTION_COUNT) {
    throw new Error(`Assessment must contain exactly ${REQUIRED_QUESTION_COUNT} questions.`);
  }

  const seenQuestionIds = new Set();
  const questions = payload.questions.map((question, index) => {
    if (!question || typeof question !== "object" || Array.isArray(question)) {
      throw new Error(`Question ${index + 1} is invalid.`);
    }

    const id = requireText(question.id, `Question ${index + 1} id`, 40);
    if (seenQuestionIds.has(id)) {
      throw new Error(`Duplicate question id: ${id}`);
    }
    seenQuestionIds.add(id);

    const prompt = requireText(question.prompt, `Question ${index + 1} prompt`, 1000);
    const explanation = requireText(
      question.explanation,
      `Question ${index + 1} explanation`,
      1000
    );

    if (!Array.isArray(question.options) ||
        question.options.length !== REQUIRED_OPTION_COUNT) {
      throw new Error(`Question ${index + 1} must contain exactly four options.`);
    }

    const seenOptionIds = new Set();
    const options = question.options.map((option, optionIndex) => {
      if (!option || typeof option !== "object" || Array.isArray(option)) {
        throw new Error(`Question ${index + 1}, option ${optionIndex + 1} is invalid.`);
      }

      const optionId = requireText(option.id, "Option id", 5).toUpperCase();
      if (!OPTION_IDS.has(optionId) || seenOptionIds.has(optionId)) {
        throw new Error(`Question ${index + 1} must use unique option IDs A, B, C and D.`);
      }
      seenOptionIds.add(optionId);

      return {
        id: optionId,
        text: requireText(option.text, `Question ${index + 1}, option ${optionId}`, 300)
      };
    });

    if (seenOptionIds.size !== REQUIRED_OPTION_COUNT ||
        [...OPTION_IDS].some(id => !seenOptionIds.has(id))) {
      throw new Error(`Question ${index + 1} must include options A, B, C and D.`);
    }

    const correctOptionId = requireText(
      question.correctOptionId,
      `Question ${index + 1} correctOptionId`,
      5
    ).toUpperCase();

    if (!seenOptionIds.has(correctOptionId)) {
      throw new Error(`Question ${index + 1} has an invalid correct option.`);
    }

    return { id, prompt, options, correctOptionId, explanation };
  });

  return { title, instructions, questions };
}

export function toLearnerAssessment(assessment) {
  return {
    title: assessment.title,
    instructions: assessment.instructions,
    questions: assessment.questions.map(({ id, prompt, options }) => ({
      id,
      prompt,
      options
    }))
  };
}
