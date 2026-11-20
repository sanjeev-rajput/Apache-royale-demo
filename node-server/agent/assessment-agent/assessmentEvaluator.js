/**
 * Score learner answers deterministically on the server.
 * The LLM never receives the submitted answers and never calculates marks.
 */
export function evaluateAnswers(assessment, submittedAnswers) {
  if (!Array.isArray(submittedAnswers)) {
    throw new Error("answers must be an array.");
  }

  const questionById = new Map(assessment.questions.map(question => [question.id, question]));
  const submittedById = new Map();

  for (const answer of submittedAnswers) {
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) {
      throw new Error("Each answer must be an object.");
    }
    const questionId = String(answer.questionId || "").trim();
    if (!questionById.has(questionId)) {
      throw new Error(`Unknown question id: ${questionId || "(empty)"}`);
    }
    if (submittedById.has(questionId)) {
      throw new Error(`Duplicate answer for question: ${questionId}`);
    }

    const selectedOptionId = answer.selectedOptionId == null
      ? null
      : String(answer.selectedOptionId).trim().toUpperCase();

    const question = questionById.get(questionId);
    if (selectedOptionId !== null &&
        !question.options.some(option => option.id === selectedOptionId)) {
      throw new Error(`Invalid selected option for question: ${questionId}`);
    }

    submittedById.set(questionId, selectedOptionId);
  }

  if (submittedById.size !== assessment.questions.length) {
    throw new Error(`Submit one answer for each of the ${assessment.questions.length} questions. Use null for unanswered questions.`);
  }

  let score = 0;
  const questionResults = assessment.questions.map(question => {
    const selectedOptionId = submittedById.get(question.id);
    const isCorrect = selectedOptionId === question.correctOptionId;
    if (isCorrect) score += 1;

    const correctOption = question.options.find(
      option => option.id === question.correctOptionId
    );

    return {
      questionId: question.id,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect,
      explanation: question.explanation,
      correctAnswer: correctOption.text
    };
  });

  const total = assessment.questions.length;
  return {
    score,
    total,
    percentage: Math.round((score / total) * 100),
    questionResults
  };
}
