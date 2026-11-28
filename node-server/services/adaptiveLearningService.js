import { randomUUID } from "node:crypto";
import { getLearningCatalogueResources, getLearningExplanationGuidance, getLearningProfileGuidance, getLearningVideos } from "./learningResourceService.js";
import { generateText } from "./llmProvider.js";
import { isAdaptiveIntelligenceEnabled } from "./adaptiveIntelligenceConfig.js";
import { buildAdaptiveRecommendations, getAdaptiveLearningPolicy } from "./adaptiveLearningPolicy.js";
import { createAdaptiveAssessment, submitAdaptiveAssessment } from "../adaptive/assessment/adaptiveAssessmentService.js";
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

function selectedInstructionProfileId(session) {
  const firstActivity = session.content.activities[0] || {};
  return String(firstActivity.instructionProfileId || "").trim();
}

function assessmentContext(session) {
  const firstActivity = session.content.activities[0] || {};
  return {
    topic: session.topic,
    topicVersion: session.topicVersion,
    explanationStatus: session.explanationStatus,
    grade: session.grade,
    subject: session.subject || firstActivity.subject || "",
    language: session.language,
    instructionProfileId: selectedInstructionProfileId(session),
    learningContext: String(session.content.explanation || learningRequest(session)).slice(0, 1000)
  };
}


async function generateAdaptiveExplanation(session, result) {
  const evidence = (result.questions || []).map((question, index) => {
    const options = Array.isArray(question.options) ? question.options : [];
    const selected = options.find(option => option.id === question.selectedOptionId);
    const correct = options.find(option => option.id === question.correctOptionId);
    return {
      questionNumber: index + 1,
      prompt: question.prompt || "",
      answered: question.answered === true,
      correct: question.isCorrect,
      selectedAnswer: selected?.text || "",
      correctAnswer: correct?.text || question.correctAnswer || "",
      feedback: question.feedback || ""
    };
  });
  // Use the same selected profile that was supplied to AI assessment generation.
  // Do not re-search the catalogue and accidentally combine unrelated profiles.
  const guidance = await getLearningProfileGuidance(selectedInstructionProfileId(session));
  const response = await generateText({
    messages: [
      {
        role: "system",
        content: `You are continuing a K-12 learning session. Keep the learner on the same topic: ${session.topic}. Use the assessment evidence to identify what may need reinforcement. Distinguish unanswered questions from answered-but-incorrect questions: an unanswered question is not evidence of a misconception. Do not claim a specific misconception unless the question feedback explicitly supports it. Do not infer a concept-level weakness from a single unsupported signal. Adapt the explanation style, examples and challenge level. Do not generate marks, alter answer keys, or change assessment results. ${guidance || ""}`
      },
      {
        role: "user",
        content: `Topic: ${session.topic}
Class: ${session.grade || "Not specified"}
Subject: ${session.subject || "Not specified"}
Assessment source: ${result.source}
Score: ${result.score}/${result.total} (${result.percentage}%)
Question-level evidence (answered=false means the learner left the question unanswered):
${JSON.stringify(evidence)}
Write the next teaching response. Address only the gaps supported by the evidence, explain with a fresh simple example, and keep the response focused on the same topic.`
      }
    ],
    temperature: 0.4,
    maxTokens: 650
  });
  return response;
}

function recommendationsFor(session) {
  return buildAdaptiveRecommendations(session, getAdaptiveLearningPolicy());
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
    completedAssessmentCount: (session.assessmentHistory || []).length,
    assessmentHistory: (session.assessmentHistory || []).map(item => ({ ...item })),
    latestResult: session.latestResult
  };
}

export function normalizeAdaptiveAssessmentResult(source, attemptId, result, topic) {
  const questions = (Array.isArray(result.questionResults) ? result.questionResults : []).map(item => ({
    questionId: item.questionId,
    selectedOptionId: item.selectedOptionId ?? null,
    answered: item.selectedOptionId != null,
    correctOptionId: item.correctOptionId,
    isCorrect: item.isCorrect === true,
    score: source === "question_bank" ? Number(item.score || 0) : (item.isCorrect === true ? 1 : 0),
    totalMarks: source === "question_bank" ? Number(item.totalMarks || 0) : 1,
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

export function attachAssessmentQuestionDetails(normalized, attempt = {}) {
  const questionDetails = new Map((attempt.questions || []).map(question => [question.questionId, question]));
  return {
    ...normalized,
    title: attempt.title || normalized.title || `${normalized.topic} — ${normalized.source === "ai" ? "AI" : "Question Bank"} Practice`,
    context: { ...(attempt.context || {}), topic: normalized.topic },
    questions: (normalized.questions || []).map(question => {
      const detail = questionDetails.get(question.questionId) || {};
      const options = Array.isArray(detail.options) ? detail.options : [];
      const selected = options.find(option => option.id === question.selectedOptionId);
      const correct = options.find(option => option.id === question.correctOptionId);
      return {
        ...question,
        prompt: detail.prompt || "",
        options,
        selectedAnswer: selected?.text || "",
        correctAnswer: correct?.text || question.correctAnswer || ""
      };
    })
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

function saveTopicSnapshot(session) {
  const version = String(session.topicVersion);
  session.topicHistory ||= {};
  session.topicHistory[version] = {
    topic: session.topic,
    grade: session.grade,
    subject: session.subject,
    language: session.language,
    content: {
      explanation: "",
      activities: [...(session.content.activities || [])],
      videos: [...(session.content.videos || [])],
      availability: { ...(session.content.availability || {}) }
    },
    explanationStatus: "pending",
    explanation: ""
  };

  const versions = Object.keys(session.topicHistory).map(Number).sort((a, b) => a - b);
  while (versions.length > 20) {
    delete session.topicHistory[String(versions.shift())];
  }
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
    explanationStatus: "pending",
    topicVersion: 1,
    topicHistory: {},
    activityOffset: 0,
    videoOffset: 0,
    completedActions: [], assessmentCount: 0, latestResult: null,
    assessmentHistory: [],
    seenQuestionIds: {}, activeAttempt: null
  };
  sessions.set(session.sessionId, session);

  const request = learningResourceRequest(session);
  const [catalogue, videos] = await Promise.allSettled([
    Promise.resolve().then(() => getLearningCatalogueResources(request)),
    getLearningVideos(request)
  ]);

  if (catalogue.status === "fulfilled") {
    session.content.activities = catalogue.value.results || [];
    session.content.availability.catalogue = catalogue.value.availability?.catalogue === true;
  }
  if (videos.status === "fulfilled") {
    session.content.videos = videos.value.videos || [];
    session.content.availability.youtube = videos.value.availability?.youtube === true;
  }

  session.content.explanationAvailable = false;
  session.explanationStatus = "pending";
  saveTopicSnapshot(session);

  return {
    session: publicSession(session),
    content: {
      ...session.content,
      explanationStatus: session.explanationStatus,
      topicVersion: session.topicVersion,
      activities: session.content.activities.slice(0, 10)
    },
    recommendations: recommendationsFor(session),
    message: ""
  };
}

function topicKey(input) {
  return [input.classId, input.subjectId, input.topicId].map(value => String(value || "").trim()).join("|");
}

function comparableLearningValue(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/^class\\s+/, "")
    .replace(/\\s+/g, " ")
    .trim()
    .replace(/s$/, "");
  if (["math", "maths", "mathematic"].includes(normalized)) return "mathematics";
  if (["ev", "environmental studies"].includes(normalized)) return "evs";
  return normalized;
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
  const manifest = await questionBankRepository.getManifest();
  const classEntry = manifest.classes?.[selection.classId];
  const subjectEntry = classEntry?.subjects?.[selection.subjectId];
  const selectedTopicName = String(topic.classification?.topic || selection.topicId);
  const selectedGrade = String(classEntry?.name || topic.classification?.class || session.grade || "");
  const selectedSubject = String(subjectEntry?.name || topic.classification?.subject || session.subject || "");

  // The UI asks for confirmation and creates a fresh session before reaching
  // this action. Keep the API boundary consistent with that session contract.
  const contextChanged =
    (session.grade && selectedGrade && comparableLearningValue(session.grade) !== comparableLearningValue(selectedGrade)) ||
    (session.subject && selectedSubject && comparableLearningValue(session.subject) !== comparableLearningValue(selectedSubject)) ||
    comparableLearningValue(session.topic) !== comparableLearningValue(selectedTopicName);
  if (contextChanged) {
    throw serviceError(
      "This Question Bank topic differs from your current learning session. Confirm the topic change and start a new session first.",
      409,
      "ADAPTIVE_TOPIC_CHANGE_REQUIRED"
    );
  }

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
  session.activeAttempt = {
    source: "question_bank",
    attemptId: attempt.attemptId,
    title: assessment.title,
    context: {
      classId: selection.classId,
      subjectId: selection.subjectId,
      topicId: selection.topicId,
      grade: topic.classification?.class || selection.classId,
      subject: topic.classification?.subject || selection.subjectId,
      topic: topic.classification?.topic || selection.topicId
    },
    questions: assessment.questions.map(question => ({
      questionId: question.id,
      prompt: question.prompt,
      options: question.options.map(option => ({ id: option.id, text: option.text }))
    }))
  };
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


/**
 * Generate the current topic explanation independently from resource retrieval.
 * The topic version prevents a slow response for an older topic overwriting a newer one.
 */
export async function generateAdaptiveSessionExplanation(sessionId, expectedTopicVersion) {
  const session = requireSession(sessionId);
  const version = Number(expectedTopicVersion);
  if (!Number.isInteger(version)) {
    throw serviceError("A valid learning topic version is required.", 400, "INVALID_TOPIC_VERSION");
  }

  const topicRecord = session.topicHistory?.[String(version)];
  if (!topicRecord) {
    throw serviceError("This topic's explanation is no longer available. Please select the topic again.", 409, "TOPIC_HISTORY_EXPIRED");
  }

  if (topicRecord.explanationStatus === "ready" && topicRecord.explanation) {
    return {
      available: true, stale: false, cached: true,
      topic: topicRecord.topic, topicVersion: version,
      explanation: topicRecord.explanation
    };
  }

  try {
    const topicSnapshot = {
      ...session,
      topic: topicRecord.topic,
      grade: topicRecord.grade,
      subject: topicRecord.subject,
      language: topicRecord.language,
      content: topicRecord.content
    };
    const explanation = await generateExplanation(topicSnapshot);
    const current = sessions.get(session.sessionId);
    const savedRecord = current?.topicHistory?.[String(version)];
    if (!current || !savedRecord) {
      return { available: false, stale: true, topic: topicRecord.topic, topicVersion: version };
    }

    savedRecord.explanation = explanation;
    savedRecord.explanationStatus = "ready";
    return {
      available: true, stale: false, cached: false,
      topic: savedRecord.topic, topicVersion: version, explanation
    };
  } catch (error) {
    const current = sessions.get(session.sessionId);
    const savedRecord = current?.topicHistory?.[String(version)];
    if (savedRecord) savedRecord.explanationStatus = "unavailable";
    console.warn("[Adaptive Learning] Topic explanation unavailable:", error.message);
    throw error;
  }
}

export async function performAdaptiveAction(sessionId, action, input = {}) {
  const session = requireSession(sessionId);
  let result = {};
  switch (String(action || "")) {
    case "repeat_explanation": {
      try {
        session.content.explanation = await generateExplanation(session);
        session.content.explanationAvailable = true;
        session.explanationStatus = "ready";
      } catch {
        session.content.explanationAvailable = false;
        session.explanationStatus = "unavailable";
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
      const assessment = await createAdaptiveAssessment(assessmentContext(session));
      if (!assessment || !assessment.attemptId || !assessment.assessment ||
          !Array.isArray(assessment.assessment.questions) ||
          assessment.assessment.questions.length === 0) {
        throw serviceError("AI practice questions are not available for this topic right now. Please choose another learning activity or try again later.", 503, "AI_ASSESSMENT_UNAVAILABLE");
      }
      session.activeAttempt = {
        source: "ai",
        attemptId: assessment.attemptId,
        title: assessment.assessment.title || `${session.topic} — AI Practice`,
        context: {
          grade: session.grade,
          subject: session.subject,
          topic: session.topic
        },
        questions: (assessment.assessment.questions || []).map(question => ({
          questionId: question.id,
          prompt: question.prompt,
          options: (question.options || []).map(option => ({ id: option.id, text: option.text }))
        }))
      };
      result = { ...assessment, source: "ai" };
      break;
    }
    case "choose_question_bank":
      result = { questionBankTopics: await listQuestionBankTopics() };
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
      const activeAttempt = session.activeAttempt;
      const submitted = source === "ai"
        ? submitAdaptiveAssessment({ attemptId, answers: input.answers })
        : source === "question_bank"
          ? submitQuestionBankAssessment({ attemptId, answers: input.answers })
          : null;
      if (!submitted) throw serviceError("Unsupported assessment type.");

      const normalized = attachAssessmentQuestionDetails(
        normalizeAdaptiveAssessmentResult(source, attemptId, submitted, session.topic),
        activeAttempt
      );

      session.latestResult = normalized;
      session.assessmentHistory ||= [];
      session.assessmentHistory.push(normalized);
      session.assessmentCount = session.assessmentHistory.length;
      session.activeAttempt = null;
      session.completedActions.push("assessment_completed");
      const adaptiveIntelligenceEnabled = isAdaptiveIntelligenceEnabled();
      let adaptiveExplanation = "";
      let adaptiveIntelligenceStatus = adaptiveIntelligenceEnabled ? "unavailable" : "disabled";
      if (adaptiveIntelligenceEnabled) {
        try {
          // One bounded post-assessment request. The attempt is already consumed,
          // so a repeated submission cannot process the same evidence again.
          adaptiveExplanation = await generateAdaptiveExplanation(session, normalized);
          adaptiveIntelligenceStatus = adaptiveExplanation ? "generated" : "unavailable";
        } catch (error) {
          console.warn("[Adaptive Learning] Adaptive Intelligence follow-up unavailable:", error.message);
        }
      }
      result = {
        assessmentResult: normalized,
        adaptiveIntelligence: {
          enabled: adaptiveIntelligenceEnabled,
          status: adaptiveIntelligenceStatus
        },
        content: adaptiveExplanation ? { explanation: adaptiveExplanation } : null,
        message: adaptiveExplanation
          ? ""
          : adaptiveIntelligenceStatus === "disabled"
            ? "Your assessment was evaluated successfully. Adaptive Intelligence is disabled for this deployment."
            : "Your assessment was evaluated successfully, but the optional Adaptive Intelligence follow-up is unavailable right now."
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
