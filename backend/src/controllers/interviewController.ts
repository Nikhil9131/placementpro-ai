import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import InterviewSession from '../models/InterviewSession';
import { generateInterviewQuestion, evaluateInterview } from '../services/gemini';
import { trackUserDailyActivity } from './profileController';
import { CustomError } from '../utils/CustomError';

export async function startInterviewSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { type } = req.body; // e.g. software_engineer, frontend_developer, etc.

    if (!type) {
      return next(new CustomError('Interview type is required', 400));
    }

    // Terminate any active sessions first
    await InterviewSession.updateMany(
      { user: req.user._id, status: 'in_progress' },
      { status: 'completed', endedAt: new Date() }
    );

    // Call Gemini API to get the first question
    const firstQuestion = await generateInterviewQuestion(type, [], true);

    const session = await InterviewSession.create({
      user: req.user._id,
      type,
      status: 'in_progress',
      chatHistory: [
        {
          role: 'interviewer',
          content: firstQuestion,
          timestamp: new Date()
        }
      ],
      startedAt: new Date()
    });

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function answerInterviewQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;

    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return next(new CustomError('Interview session not found', 404));
    }

    if (session.status !== 'in_progress') {
      return next(new CustomError('Interview is already completed', 400));
    }

    // 1. Add student's response to history
    session.chatHistory.push({
      role: 'candidate',
      content: answer,
      timestamp: new Date()
    });

    // 2. Check if we should conclude the interview
    // Standard size of candidate responses = rounds count. If >= 4 candidate answers, conclude.
    const rounds = session.chatHistory.filter(h => h.role === 'candidate').length;
    let nextQuestionText = '';

    if (rounds >= 4) {
      nextQuestionText = 'FINISHED';
    } else {
      // Call Gemini for follow-up question
      nextQuestionText = await generateInterviewQuestion(session.type, session.chatHistory, false);
    }

    if (nextQuestionText.toUpperCase().includes('FINISHED') || nextQuestionText === 'FINISHED') {
      // Complete interview & evaluate using Gemini
      session.status = 'completed';
      session.endedAt = new Date();

      const evaluation = await evaluateInterview(session.type, session.chatHistory);
      session.overallFeedback = evaluation.overallFeedback;
      session.scores = evaluation.scores;
      session.evaluations = evaluation.evaluations;

      // Track daily activity
      await trackUserDailyActivity(req.user._id);
    } else {
      // Store next question
      session.chatHistory.push({
        role: 'interviewer',
        content: nextQuestionText,
        timestamp: new Date()
      });
    }

    await session.save();

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const history = await InterviewSession.find({ user: req.user._id }).sort({ startedAt: -1 });
    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return next(new CustomError('Interview session not found', 404));
    }
    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
}
