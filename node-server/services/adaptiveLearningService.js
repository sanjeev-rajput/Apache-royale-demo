import { randomUUID } from "node:crypto";
import { getLearningCatalogueResources, getLearningExplanationGuidance, getLearningVideos } from "./learningResourceService.js";
import { generateText } from "./llmProvider.js";
import { createAssessment, submitAssessment } from "../agent/assessment-agent/assessmentService.js";
import { listQuestionBankTopics, submitQuestionBankAssessment } from "./questionBank/questionBankAssessmentService.js";
import { questionBankRepository } from "./questionBank/questionBankRepository.js";
import { questionBankAttemptManager } from "./questionBank/questionBankAttemptManager.js";

const SESSION_TTL_MS = 60 * 60 * 1000;
const sessions = new Map();

function serviceError(message, statusCode = 400, code = "ADAPTIVE_REQUEST_INVALID") {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function pruneSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(id);
  }
}

function requireSession(sessionId) {
  pruneSessions();
  const session = sessions.get(String(sessionId || ""));
  if (!session) throw serviceError("This learning session has expired. Start a new session.", 404, "SESSION_NOT_FOUND");
  return session;
}

function learningRequest(session) {
  const parts = ["Teach me about", session.topic];
  if (session.grade) parts.push(`for ${session.grade}`);
  if (session.subject) parts.push(`in ${session.subject}`);
  return parts.join(" ");
}

function learningResourceRequest(session) {
  const parts = ["I want to learn", session.topic];
  if (session.grade) parts.push(`for ${session.grade}`);
  // The shared deterministic parser recognizes a trailing subject token;
  // "in English" leaves a dangling "for" and suppresses matching activities.
  if (session.subject) parts.push(session.subject);
  return parts.join(" ");
}

async function generateExplanation(session) {
  const request = learningRequest(session);
  const guidance = await getLearningExplanationGuidance(request);
  return generateText({
    messages: [
      {
        role: "system",
        content: `You are a friendly, age-appropriate K-12 tutor. Explain the learner's requested topic clearly, in short sections, with one simple example. Do not invent catalogue activities or links.${guidance ? `\n\n${guidance}` : ""}`
      },
      {
        role: "user",
        content: `Topic: ${session.topic}\nGrade: ${session.grade || "Not specified"}\nSubject: ${session.subject || "Not specified"}\nLanguage: ${session.language}\nPlease teach this topic.`
      }
    ],
    temperature: 0.4,
    maxTokens: 750
  });
}

function assessmentContext(session) {
  const firstActivity = session.content.activities[0] || {};
  return {
    topic: session.topic,
    grade: session.grade,
    subject: session.subject || firstActivity.subject || "",
    language: session.language,
    instructionProfileId: firstActivity.instructionProfileId || "",
    learningContext: String(session.content.explanation || learningRequest(session)).slice(0, 1000)
  };
}


async function generateAdaptiveExplanation(session, result) {
  const evidence = (result.questions || []).map((question, index) => ({
    question: index + 1,
    correct: question.isCorrect,
    selectedOptionId: question.selectedOptionId,
    correctOptionId: question.correctOptionId,
    feedback: question.feedback || ""
  }));
  const guidance = await getLearningExplanationGuidance(learningRequest(session));
  const response = await generateText({
    messages: [
      {
        role: "system",
        content: `You are continuing a K-12 learning session. Keep the learner on the same topic: ${session.topic}. Use the assessment evidence to identify what needs reinforcement. Do not claim a specific misconception unless the question feedback supports it. Adapt the explanation style, examples and challenge level. Do not generate marks or change assessment results. ${guidance || ""}`
      },
      {
        role: "user",
        content: `Topic: ${session.topic}
Class: ${session.grade || "Not specified"}
Subject: ${session.subject || "Not specified"}
Assessment source: ${result.source}
Score: ${result.score}/${result.total} (${result.percentage}%)
Question-level evidence:
${JSON.stringify(evidence)}
Write the next teaching response. Address the demonstrated gaps, explain with a fresh simple example, and keep the response focused on the same topic.`
      }
    ],
    temperature: 0.4,
    maxTokens: 650
  });
  return response;
}

function recommendationsFor(session) {
  const afterAssessment = session.latestResult != null;
  const lowScore = afterAssessment && session.latestResult.percentage < 60;
  const items = [];
  if (afterAssessment) {
    if (lowScore) {
      items.push({ id: "repeat_explanation", label: "Review the explanation" });
      items.push({ id: "show_activities", label: "Try a catalogue activity" });
      items.push({ id: "show_videos", label: "Watch a learning video" });
      items.push({ id: "choose_question_bank", label: "Practise these ideas" });
      items.push({ id: "start_ai_assessment", label: "Try the assessment again" });
    } else {
      items.push({ id: "show_videos", label: "Explore another explanation" });
      items.push({ id: "show_activities", label: "Explore catalogue activities" });
      items.push({ id: "start_ai_assessment", label: "Try another AI assessment" });
      items.push({ id: "choose_question_bank", label: "Practise with the Question Bank" });
      items.push({ id: "repeat_explanation", label: "Review the explanation" });
    }
  } else {
    items.push({ id: "show_activities", label: "Explore catalogue activities" });
    items.push({ id: "show_videos", label: "Watch learning videos" });
    items.push({ id: "start_ai_assessment", label: "Check your understanding" });
    items.push({ id: "choose_question_bank", label: "Practise with the Question Bank" });
  }
  if (!session.content.explanation) items.unshift({ id: "repeat_explanation", label: "Try the AI explanation again" });
  return items;
}

function publicSession(session) {
  return {
    sessionId: session.sessionId,
    topic: session.topic,
    grade: session.grade,
    subject: session.subject,
    status: session.status,
    createdAt: session.createdAt,
    expiresAt: new Date(session.expiresAt).toISOString(),
    completedActions: session.completedActions.length,
    assessmentCount: session.assessmentCount,
    latestResult: session.latestResult
  };
}

export function normalizeAdaptiveAssessmentResult(source, attemptId, result, topic) {
  const questions = (Array.isArray(result.questionResults) ? result.questionResults : []).map(item => ({
    questionId: item.questionId,
    selectedOptionId: item.selectedOptionId ?? null,
    correctOptionId: item.correctOptionId,
    isCorrect: item.isCorrect === true,
    earnedMarks: source === "question_bank" ? Number(item.score || 0) : (item.isCorrect === true ? 1 : 0),
    availableMarks: source === "question_bank" ? Number(item.totalMarks || 0) : 1,
    feedback: source === "question_bank" ? (item.feedback || "") : (item.explanation || "")
  }));
  return {
    source,
    attemptId,
    topic,
    score: Number(result.score || 0),
    total: Number(result.total || 0),
    percentage: Number(result.percentage || 0),
    completedAt: new Date().toISOString(),
    questions
  };
}

export function selectUnseenQuestionBankQuestions(questions, seenIds = [], requestedCount = 5) {
  const seen = new Set(seenIds);
  const count = Math.max(1, Math.min(5, Number(requestedCount) || 5));
  return (Array.isArray(questions) ? questions : [])
    .filter(question => !seen.has(question.id))
    .slice(0, count);
}

function normalizeTopic(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractSessionInput(input = {}) {
  const prompt = String(input.prompt || input.learningPrompt || "").trim();
  let grade = String(input.grade || "").trim();
  let subject = String(input.subject || "").trim();
  let topic = String(input.topic || "").trim();

  if (!grade && prompt) {
    const gradeMatch = prompt.match(/\b(?:class|grade)\s*[-:]?\s*(\d{1,2})\b/i);
    if (gradeMatch) grade = `Class ${gradeMatch[1]}`;
  }

  if (!subject && prompt) {
    const subjectMatch = prompt.match(/\b(?:subject\s*[:=]\s*|in\s+)(English|Mathematics|Maths?|Science|EVS|Environmental Studies|Social Science|Computer Science|Hindi)\b/i);
    if (subjectMatch) subject = subjectMatch[1];
  }

  if (!topic && prompt) {
    topic = prompt
      .replace(/^\s*(?:hi[,! ]*)?(?:i am a student[, ]*)?(?:and\s+)?/i, "")
      .replace(/^\s*(?:i\s+)?(?:would\s+like|want|wants|wish|need)\s+to\s+learn\s+/i, "")
      .replace(/^\s*(?:please\s+)?teach\s+me\s+(?:about\s+)?/i, "")
      .replace(/^\s*(?:explain|learn)\s+/i, "")
      .replace(/\b(?:for|in)\s+(?:class|grade)\s*\d{1,2}\b.*$/i, "")
      .replace(/\b(?:class|grade)\s*\d{1,2}\b.*$/i, "")
      .replace(/\b(?:in\s+)?(?:English|Mathematics|Maths?|Science|EVS|Environmental Studies|Social Science|Computer Science|Hindi)\b\s*$/i, "")
      .replace(/[?.!,;:]+$/g, "")
      .trim();
  }

  return { topic, grade, subject, language: String(input.language || "English").trim() };
}

export async function createAdaptiveSession(input = {}) {
  pruneSessions();
  const normalizedInput = extractSessionInput(input);
  const topic = normalizeTopic(normalizedInput.topic);
  const grade = normalizedInput.grade;
  const subject = normalizedInput.subject;
  const language = normalizedInput.language;
  if (!topic || topic.length > 160) throw serviceError("Enter a topic of 1 to 160 characters.");

  const now = Date.now();
  const session = {
    sessionId: randomUUID(), topic, grade, subject, language,
    status: "active", createdAt: new Date(now).toISOString(), expiresAt: now + SESSION_TTL_MS,
    content: { explanation: "", activities: [], videos: [], availability: {} },
    activityOffset: 0,
    videoOffset: 0,
    completedActions: [], assessmentCount: 0, latestResult: null,
    seenQuestionIds: {}, activeAttempt: null
  };
  sessions.set(session.sessionId, session);

  const request = learningResourceRequest(session);
  const [catalogue, videos, explanation] = await Promise.allSettled([
    Promise.resolve().then(() => getLearningCatalogueResources(request)),
    getLearningVideos(request),
    generateExplanation(session)
  ]);

  if (catalogue.status === "fulfilled") {
    session.content.activities = catalogue.value.results || [];
    session.content.availability.catalogue = catalogue.value.availability?.catalogue === true;
  }
  if (videos.status === "fulfilled") {
    session.content.videos = videos.value.videos || [];
    session.content.availability.youtube = videos.value.availability?.youtube === true;
  }
  if (explanation.status === "fulfilled") session.content.explanation = explanation.value;
  session.content.explanationAvailable = explanation.status === "fulfilled";

  return {
    session: publicSession(session),
    content: {
      ...session.content,
      activities: session.content.activities.slice(0, 10)
    },
    recommendations: recommendationsFor(session),
    message: explanation.status === "rejected" ? "AI explanation is unavailable right now. Other learning activities may still be available." : ""
  };
}

function topicKey(input) {
  return [input.classId, input.subjectId, input.topicId].map(value => String(value || "").trim()).join("|");
}

async function startQuestionBank(session, input = {}) {
  if (session.activeAttempt) {
    throw serviceError("Submit or finish your current practice before starting another assessment.", 409, "ADAPTIVE_ATTEMPT_ACTIVE");
  }
  const selection = {
    classId: String(input.classId || "").trim(),
    subjectId: String(input.subjectId || "").trim(),
    topicId: String(input.topicId || "").trim()
  };
  if (!selection.classId || !selection.subjectId || !selection.topicId) {
    throw serviceError("Choose a class, subject, and Question Bank topic.");
  }
  const topic = await questionBankRepository.getTopicQuestions(selection);
  const key = topicKey(selection);
  const seenIds = session.seenQuestionIds[key] || [];
  const requestedCount = 5;
  const selected = selectUnseenQuestionBankQuestions(topic.questions, seenIds, requestedCount);
  if (selected.length < requestedCount) {
    throw serviceError(
      selected.length === 0
        ? "You have practised all available questions for this topic in this session. Choose another next step."
        : `Only ${selected.length} unseen questions remain for this topic. Five new questions are required, so please choose another topic or learning activity.`,
      409,
      "INSUFFICIENT_UNSEEN_QUESTIONS"
    );
  }
  const assessment = {
    title: `${topic.classification?.topic || selection.topicId} — Adaptive Question Bank Practice`,
    instructions: "Choose one answer for each question, then submit your answers.",
    questions: selected.map(question => ({
      id: question.id,
      prompt: question.question,
      options: question.options.map((text, index) => ({ id: String.fromCharCode(65 + index), text })),
      correctOptionId: String.fromCharCode(64 + question.correctOption),
      score: question.score,
      feedback: question.feedback || { correct: null, wrong: null }
    }))
  };
  const attempt = questionBankAttemptManager.create({ assessment, context: { ...selection, publisher: topic.publisher || null } });
  session.seenQuestionIds[key] = [...seenIds, ...selected.map(question => question.id)];
  session.activeAttempt = { source: "question_bank", attemptId: attempt.attemptId };
  session.assessmentCount++;
  return {
    attemptId: attempt.attemptId,
    expiresAt: attempt.expiresAt,
    source: "question_bank",
    assessment: {
      title: assessment.title,
      instructions: assessment.instructions,
      totalMarks: assessment.questions.reduce((sum, question) => sum + question.score, 0),
      questions: assessment.questions.map(({ id, prompt, options }) => ({ id, prompt, options }))
    }
  };
}


async function switchLearningTopic(session, nextTopic) {
  const topic = normalizeTopic(nextTopic);
  if (!topic || topic.length > 160) {
    throw serviceError("Choose a valid learning topic.", 400, "INVALID_TOPIC");
  }
  if (session.activeAttempt) {
    throw serviceError("Complete or finish the current practice before changing topics.", 409, "ADAPTIVE_ATTEMPT_ACTIVE");
  }

  const previousTopic = session.topic;
  const previousResult = session.latestResult;
  session.topic = topic;
  session.activityOffset = 0;
  session.videoOffset = 0;

  const request = learningResourceRequest(session);
  const guidance = await getLearningExplanationGuidance(learningRequest(session));
  const priorEvidence = previousResult ? {
    previousTopic: previousResult.topic || previousTopic,
    score: previousResult.score,
    total: previousResult.total,
    percentage: previousResult.percentage,
    questionEvidence: (previousResult.questions || []).map((question, index) => ({
      question: index + 1,
      correct: question.isCorrect,
      feedback: question.feedback || ""
    }))
  } : null;

  const [catalogue, videos, explanation] = await Promise.allSettled([
    getLearningCatalogueResources(request),
    getLearningVideos(request),
    generateText({
      messages: [
        {
          role: "system",
          content: `You are a friendly, age-appropriate K-12 adaptive tutor. The learner has selected a new topic. Teach ONLY the new topic: ${topic}. Use prior assessment evidence only to adapt the explanation style and level; do not carry misconceptions from the previous topic into this topic. Do not invent catalogue activities or video links.${guidance ? `\\n\\n${guidance}` : ""}`
        },
        {
          role: "user",
          content: `New topic: ${topic}
Class: ${session.grade || "Not specified"}
Subject: ${session.subject || "Not specified"}
Language: ${session.language}
Previous learning topic: ${previousTopic}
Previous assessment evidence: ${JSON.stringify(priorEvidence)}
Explain the new topic clearly with examples suitable for the learner. Adapt complexity and explanation style using the previous performance as general learning evidence, but keep all teaching content about the new topic.`
        }
      ],
      temperature: 0.4,
      maxTokens: 750
    })
  ]);

  session.content.activities = catalogue.status === "fulfilled" ? (catalogue.value.results || []) : [];
  session.content.videos = videos.status === "fulfilled" ? (videos.value.videos || []) : [];
  session.content.availability = {
    catalogue: catalogue.status === "fulfilled" && catalogue.value.availability?.catalogue === true,
    youtube: videos.status === "fulfilled" && videos.value.availability?.youtube === true
  };
  session.content.explanation = explanation.status === "fulfilled" ? explanation.value : "";
  session.content.explanationAvailable = explanation.status === "fulfilled";

  return {
    topicSwitched: true,
    previousTopic,
    topic,
    content: {
      explanation: session.content.explanation,
      activities: session.content.activities.slice(0, 10),
      videos: session.content.videos.slice(0, 5),
      availability: session.content.availability
    },
    message: explanation.status === "rejected"
      ? "The new topic is selected, but its AI explanation is temporarily unavailable. You can still explore the available resources."
      : ""
  };
}

export async function performAdaptiveAction(sessionId, action, input = {}) {
  const session = requireSession(sessionId);
  let result = {};
  switch (String(action || "")) {
    case "repeat_explanation": {
      try {
        session.content.explanation = await generateExplanation(session);
        session.content.explanationAvailable = true;
      } catch {
        session.content.explanationAvailable = false;
        throw serviceError("The AI explanation is unavailable right now. Try another next step.", 502, "AI_EXPLANATION_UNAVAILABLE");
      }
      result = { content: { explanation: session.content.explanation } };
      break;
    }
    case "show_activities": {
      const start = session.activityOffset || 10;
      const end = Math.min(start + 10, session.content.activities.length);
      result = { activities: session.content.activities.slice(start, end), hasMore: end < session.content.activities.length };
      session.activityOffset = end;
      break;
    }
    case "show_videos": {
      const start = session.videoOffset || 5;
      const end = Math.min(start + 5, session.content.videos.length);
      result = { videos: session.content.videos.slice(start, end), hasMore: end < session.content.videos.length };
      session.videoOffset = end;
      break;
    }
    case "start_ai_assessment": {
      if (session.activeAttempt) {
        throw serviceError("Submit or finish your current practice before starting another assessment.", 409, "ADAPTIVE_ATTEMPT_ACTIVE");
      }
      const assessment = await createAssessment(assessmentContext(session));
      if (!assessment || !assessment.attemptId || !assessment.assessment ||
          !Array.isArray(assessment.assessment.questions) ||
          assessment.assessment.questions.length === 0) {
        throw serviceError("AI practice questions are not available for this topic right now. Please choose another learning activity or try again later.", 503, "AI_ASSESSMENT_UNAVAILABLE");
      }
      session.activeAttempt = { source: "ai", attemptId: assessment.attemptId };
      session.assessmentCount++;
      result = { ...assessment, source: "ai" };
      break;
    }
    case "choose_question_bank":
      result = { questionBankTopics: await listQuestionBankTopics() };
      break;
    case "switch_topic":
      result = await switchLearningTopic(session, input.topic);
      break;
    case "start_question_bank":
      result = await startQuestionBank(session, input);
      break;
    case "submit_assessment": {
      const source = String(input.source || "");
      const attemptId = String(input.attemptId || "");
      if (!session.activeAttempt || session.activeAttempt.source !== source || session.activeAttempt.attemptId !== attemptId) {
        throw serviceError("This assessment attempt is no longer active. Start a new practice assessment.", 409, "ADAPTIVE_ATTEMPT_NOT_ACTIVE");
      }
      const submitted = source === "ai"
        ? submitAssessment({ attemptId, answers: input.answers })
        : source === "question_bank"
          ? submitQuestionBankAssessment({ attemptId, answers: input.answers })
          : null;
      if (!submitted) throw serviceError("Unsupported assessment type.");
      const normalized = normalizeAdaptiveAssessmentResult(source, attemptId, submitted, session.topic);
      session.latestResult = normalized;
      session.activeAttempt = null;
      session.completedActions.push("assessment_completed");
      let adaptiveExplanation = "";
      try {
        adaptiveExplanation = await generateAdaptiveExplanation(session, normalized);
      } catch (error) {
        console.warn("[Adaptive Learning] Follow-up explanation unavailable:", error.message);
      }
      result = {
        assessmentResult: normalized,
        content: adaptiveExplanation ? { explanation: adaptiveExplanation } : null,
        message: adaptiveExplanation ? "" : "Your assessment was evaluated, but the next AI explanation is temporarily unavailable."
      };
      break;
    }
    default:
      throw serviceError("Choose one of the available learning actions.");
  }

  session.completedActions.push(String(action));
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return {
    ...result,
    session: publicSession(session),
    recommendations: recommendationsFor(session)
  };
}

export function endAdaptiveSession(sessionId) {
  const id = String(sessionId || "");
  const existed = sessions.delete(id);
  return { ended: existed };
}

export function resetAdaptiveSessionsForTests() {
  sessions.clear();
}
