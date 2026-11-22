import express from 'express';
import {
  listQuestionBankTopics,
  startQuestionBankAssessment,
  submitQuestionBankAssessment
} from '../services/questionBank/questionBankAssessmentService.js';

const router = express.Router();

router.get('/topics', async (req, res) => {
  try {
    const result = await listQuestionBankTopics();
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('[Question Bank API] Topic listing failed:', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.code || 'QUESTION_BANK_UNAVAILABLE',
      message: error.statusCode ? error.message : 'The question bank is not available right now.'
    });
  }
});

router.post('/assessment/start', async (req, res) => {
  try {
    const result = await startQuestionBankAssessment(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('[Question Bank API] Assessment start failed:', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.code || 'QUESTION_BANK_START_FAILED',
      message: error.statusCode ? error.message : 'The question-bank assessment could not be started.'
    });
  }
});

router.post('/assessment/submit', (req, res) => {
  try {
    const result = submitQuestionBankAssessment({
      attemptId: req.body?.attemptId,
      answers: req.body?.answers
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      errorCode: error.code || 'QUESTION_BANK_SUBMISSION_FAILED',
      message: error.message || 'The question-bank assessment could not be submitted.'
    });
  }
});

export default router;
