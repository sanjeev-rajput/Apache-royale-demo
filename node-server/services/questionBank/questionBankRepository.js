import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), 'question-bank-data', 'repository-v2');

function normalizeText(value) {
  return String(value ?? '').trim();
}

function resolveInside(root, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath.trim() || path.isAbsolute(relativePath)) {
    throw new Error('Question-bank manifest contains an invalid output path.');
  }
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Question-bank manifest output path escapes the repository directory.');
  }
  return resolved;
}

function isEligibleQuestion(question) {
  if (!question || typeof question !== 'object' || Array.isArray(question)) return false;
  if (typeof question.id !== 'string' || !question.id.trim()) return false;
  if (typeof question.question !== 'string' || !question.question.trim()) return false;
  if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 4) return false;
  if (question.options.some(option => typeof option !== 'string' || !option.trim())) return false;
  if (!Number.isInteger(question.correctOption) || question.correctOption < 1 || question.correctOption > question.options.length) return false;
  // Publisher-defined scoring is mandatory. Do not invent a default mark.
  if (typeof question.score !== 'number' || !Number.isFinite(question.score) || question.score <= 0) return false;
  return true;
}

export class QuestionBankRepository {
  constructor({ dataDir = process.env.QUESTION_BANK_DATA_DIR || DEFAULT_DATA_DIR } = {}) {
    this.dataDir = path.resolve(dataDir);
    this.manifestPromise = null;
  }

  async getManifest() {
    if (!this.manifestPromise) {
      this.manifestPromise = fs.readFile(path.join(this.dataDir, 'manifest.json'), 'utf8')
        .then(raw => JSON.parse(raw))
        .then(manifest => {
          if (manifest?.version !== 2 || !manifest.classes || typeof manifest.classes !== 'object') {
            throw new Error('Question-bank repository must contain a valid v2 manifest.json.');
          }
          return manifest;
        })
        .catch(error => {
          this.manifestPromise = null;
          throw error;
        });
    }
    return this.manifestPromise;
  }

  async readTopic(entry) {
    const filePath = resolveInside(this.dataDir, entry.output);
    const document = JSON.parse(await fs.readFile(filePath, 'utf8'));
    if (document?.schemaVersion !== 2 || !Array.isArray(document.questions)) {
      throw new Error(`Invalid v2 question-bank topic file: ${entry.output}`);
    }
    return document;
  }

  async listTopics() {
    const manifest = await this.getManifest();
    const classes = [];

    for (const [classId, classEntry] of Object.entries(manifest.classes)) {
      const subjects = [];
      for (const [subjectId, subjectEntry] of Object.entries(classEntry.subjects || {})) {
        const topics = [];
        for (const [topicId, topicEntry] of Object.entries(subjectEntry.topics || {})) {
          if (!topicEntry.output || !Number.isInteger(topicEntry.questionCount) || topicEntry.questionCount <= 0) continue;
          try {
            const document = await this.readTopic(topicEntry);
            const eligibleCount = document.questions.filter(isEligibleQuestion).length;
            if (eligibleCount === 0) continue;
            topics.push({
              topicId,
              topicName: normalizeText(document.classification?.topic) || topicId,
              questionType: document.questionType || 'MCQ',
              questionCount: eligibleCount
            });
          } catch (error) {
            console.warn(`[Question Bank] Skipping topic '${topicId}': ${error.message}`);
          }
        }
        if (topics.length) {
          topics.sort((a, b) => a.topicName.localeCompare(b.topicName));
          subjects.push({ subjectId, subjectName: subjectEntry.name || subjectId, topics });
        }
      }
      if (subjects.length) {
        subjects.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
        classes.push({ classId, className: classEntry.name || classId, subjects });
      }
    }
    classes.sort((a, b) => a.className.localeCompare(b.className));
    return classes;
  }

  async getTopicQuestions({ classId, subjectId, topicId }) {
    const manifest = await this.getManifest();
    const classEntry = manifest.classes?.[classId];
    const subjectEntry = classEntry?.subjects?.[subjectId];
    const topicEntry = subjectEntry?.topics?.[topicId];
    if (!topicEntry || !topicEntry.output || topicEntry.questionCount <= 0) {
      const error = new Error('The selected question-bank topic is not available.');
      error.statusCode = 404;
      error.code = 'QUESTION_BANK_TOPIC_NOT_FOUND';
      throw error;
    }

    const document = await this.readTopic(topicEntry);
    const questions = document.questions.filter(isEligibleQuestion);
    if (!questions.length) {
      const error = new Error('This topic has no questions with valid publisher-defined marks.');
      error.statusCode = 409;
      error.code = 'QUESTION_BANK_NO_SCORED_QUESTIONS';
      throw error;
    }
    return {
      classification: document.classification,
      publisher: document.publisher,
      questions
    };
  }
}

export const questionBankRepository = new QuestionBankRepository();
