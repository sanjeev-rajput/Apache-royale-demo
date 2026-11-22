import { randomUUID } from 'node:crypto';

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 500;

export class QuestionBankAttemptManager {
  constructor({ ttlMs = DEFAULT_TTL_MS, maxAttempts = DEFAULT_MAX_ATTEMPTS, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.maxAttempts = maxAttempts;
    this.now = now;
    this.attempts = new Map();
  }

  pruneExpired() {
    const now = this.now();
    for (const [id, attempt] of this.attempts) {
      if (attempt.expiresAt <= now) this.attempts.delete(id);
    }
  }

  create({ assessment, context }) {
    this.pruneExpired();
    if (this.attempts.size >= this.maxAttempts) {
      const error = new Error('Question-bank assessment capacity is temporarily full. Please try again later.');
      error.statusCode = 503;
      throw error;
    }
    const attemptId = randomUUID();
    const createdAt = this.now();
    const attempt = {
      attemptId,
      assessment,
      context,
      createdAt,
      expiresAt: createdAt + this.ttlMs,
      submitted: false,
      result: null
    };
    this.attempts.set(attemptId, attempt);
    return { attemptId, expiresAt: new Date(attempt.expiresAt).toISOString() };
  }

  get(attemptId) {
    this.pruneExpired();
    return this.attempts.get(attemptId) || null;
  }

  markSubmitted(attemptId, result) {
    const attempt = this.get(attemptId);
    if (!attempt) return null;
    if (attempt.submitted) {
      const error = new Error('This question-bank assessment has already been submitted.');
      error.statusCode = 409;
      error.code = 'ATTEMPT_ALREADY_SUBMITTED';
      throw error;
    }
    attempt.submitted = true;
    attempt.result = result;
    return attempt;
  }
}

export const questionBankAttemptManager = new QuestionBankAttemptManager();
