import { questionBankRepository } from './questionBankRepository.js';
import { questionBankAttemptManager } from './questionBankAttemptManager.js';

const MAX_QUESTION_COUNT = 30;

function badRequest(message, code = 'INVALID_QUESTION_BANK_REQUEST') {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = code;
  return error;
}

function normalizeSelection(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('Assessment selection must be an object.');
  }
  const classId = String(input.classId || '').trim();
  const subjectId = String(input.subjectId || '').trim();
  const topicId = String(input.topicId || '').trim();
  const questionCount = Number(input.questionCount);
  if (!classId || !subjectId || !topicId) throw badRequest('Class, subject and topic are required.');
  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > MAX_QUESTION_COUNT) {
    throw badRequest(`questionCount must be an integer between 1 and ${MAX_QUESTION_COUNT}.`);
  }
  return { classId, subjectId, topicId, questionCount };
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function listQuestionBankTopics() {
  return { classes: await questionBankRepository.listTopics() };
}

export async function startQuestionBankAssessment(input) {
  const selection = normalizeSelection(input);
  const topic = await questionBankRepository.getTopicQuestions(selection);
  if (selection.questionCount > topic.questions.length) {
    throw badRequest(`Only ${topic.questions.length} scored questions are available for this topic.`, 'QUESTION_COUNT_EXCEEDS_AVAILABLE');
  }

  const selected = shuffle(topic.questions).slice(0, selection.questionCount);
  const assessment = {
    title: `${topic.classification?.topic || selection.topicId} — Question Bank Practice`,
    instructions: 'Choose one answer for each question, then submit your answers.',
    questions: selected.map((sourceQuestion, index) => {
      const options = sourceQuestion.options.map((text, optionIndex) => ({
        id: String.fromCharCode(65 + optionIndex),
        text
      }));
      return {
        id: sourceQuestion.id,
        prompt: sourceQuestion.question,
        options,
        correctOptionId: String.fromCharCode(64 + sourceQuestion.correctOption),
        score: sourceQuestion.score,
        feedback: sourceQuestion.feedback || { correct: null, wrong: null }
      };
    })
  };

  const attempt = questionBankAttemptManager.create({
    assessment,
    context: { ...selection, publisher: topic.publisher || null }
  });

  return {
    attemptId: attempt.attemptId,
    expiresAt: attempt.expiresAt,
    assessment: {
      title: assessment.title,
      instructions: assessment.instructions,
      totalMarks: assessment.questions.reduce((sum, question) => sum + question.score, 0),
      questions: assessment.questions.map(({ id, prompt, options }) => ({ id, prompt, options }))
    }
  };
}

function evaluateQuestionBankAnswers(assessment, submittedAnswers) {
  if (!Array.isArray(submittedAnswers)) throw badRequest('answers must be an array.');
  const questionById = new Map(assessment.questions.map(question => [question.id, question]));
  const submittedById = new Map();

  for (const answer of submittedAnswers) {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) throw badRequest('Each answer must be an object.');
    const questionId = String(answer.questionId || '').trim();
    if (!questionById.has(questionId)) throw badRequest(`Unknown question id: ${questionId || '(empty)'}`);
    if (submittedById.has(questionId)) throw badRequest(`Duplicate answer for question: ${questionId}`);
    const selectedOptionId = answer.selectedOptionId == null ? null : String(answer.selectedOptionId).trim().toUpperCase();
    const question = questionById.get(questionId);
    if (selectedOptionId !== null && !question.options.some(option => option.id === selectedOptionId)) {
      throw badRequest(`Invalid selected option for question: ${questionId}`);
    }
    submittedById.set(questionId, selectedOptionId);
  }

  if (submittedById.size !== assessment.questions.length) {
    throw badRequest(`Submit one answer for each of the ${assessment.questions.length} questions. Use null for unanswered questions.`);
  }

  let score = 0;
  let total = 0;
  const questionResults = assessment.questions.map(question => {
    const selectedOptionId = submittedById.get(question.id);
    const isCorrect = selectedOptionId === question.correctOptionId;
    total += question.score;
    if (isCorrect) score += question.score;
    const correctOption = question.options.find(option => option.id === question.correctOptionId);
    const feedbackText = isCorrect ? question.feedback?.correct : question.feedback?.wrong;
    return {
      questionId: question.id,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect,
      correctAnswer: correctOption?.text || '',
      score: isCorrect ? question.score : 0,
      totalMarks: question.score,
      feedback: feedbackText || null
    };
  });

  return {
    score,
    total,
    percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    questionResults
  };
}

export function submitQuestionBankAssessment({ attemptId, answers }) {
  const id = String(attemptId || '').trim();
  if (!id || id.length > 80) throw badRequest('A valid attemptId is required.');
  const attempt = questionBankAttemptManager.get(id);
  if (!attempt) {
    const error = new Error('This question-bank assessment attempt was not found or has expired. Please start a new assessment.');
    error.statusCode = 404;
    error.code = 'ASSESSMENT_ATTEMPT_NOT_FOUND';
    throw error;
  }
  if (attempt.submitted) {
    const error = new Error('This question-bank assessment has already been submitted.');
    error.statusCode = 409;
    error.code = 'ATTEMPT_ALREADY_SUBMITTED';
    throw error;
  }
  const result = evaluateQuestionBankAnswers(attempt.assessment, answers);
  questionBankAttemptManager.markSubmitted(id, result);
  return { attemptId: id, ...result };
}
