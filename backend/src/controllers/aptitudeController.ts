import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import AptitudeQuestion from '../models/AptitudeQuestion';
import AptitudeAttempt from '../models/AptitudeAttempt';
import { trackUserDailyActivity } from './profileController';
import User from '../models/User';
import { CustomError } from '../utils/CustomError';

export async function getAptitudeQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { category, difficulty } = req.query;
    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await AptitudeQuestion.find(filter).select('-correctAnswerIndex');
    res.status(200).json({ success: true, questions });
  } catch (error) {
    next(error);
  }
}

export async function startAptitudeTest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { category, difficulty, limit = 10 } = req.body;
    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    // Fetch random questions
    const questions = await AptitudeQuestion.aggregate([
      { $match: filter },
      { $sample: { size: Number(limit) } },
      // Project fields excluding correctAnswerIndex for security during exam
      {
        $project: {
          category: 1,
          questionText: 1,
          options: 1,
          difficulty: 1,
          tags: 1,
        },
      },
    ]);

    if (questions.length === 0) {
      return next(new CustomError('No questions found for the selected options', 404));
    }

    res.status(200).json({
      success: true,
      questions,
      timeLimitSeconds: questions.length * 60, // 1 minute per question
    });
  } catch (error) {
    next(error);
  }
}

export async function submitAptitudeAttempt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { category, answers, timeTaken } = req.body;
    // answers is an array of { questionId: string, selectedAnswerIndex: number }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return next(new CustomError('Answers are required for test submission', 400));
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await AptitudeQuestion.find({ _id: { $in: questionIds } });

    let score = 0;
    const evaluatedQuestions = answers.map(userAnswer => {
      const dbQuestion = questions.find(q => q._id.toString() === userAnswer.questionId);
      if (!dbQuestion) {
        return {
          questionId: userAnswer.questionId,
          selectedAnswerIndex: userAnswer.selectedAnswerIndex,
          isCorrect: false,
        };
      }

      const isCorrect = dbQuestion.correctAnswerIndex === userAnswer.selectedAnswerIndex;
      if (isCorrect) score += 1;

      return {
        questionId: dbQuestion._id as any,
        selectedAnswerIndex: userAnswer.selectedAnswerIndex,
        isCorrect,
      };
    });

    const attempt = await AptitudeAttempt.create({
      user: req.user._id,
      category: category || 'mixed',
      questions: evaluatedQuestions,
      score,
      totalQuestions: questions.length,
      timeTaken: timeTaken || 0,
    });

    // Track daily activity & update streak
    await trackUserDailyActivity(req.user._id);

    // Fetch the correct answers list for detailed analytics in response
    const questionsWithAnswers = questions.map(q => ({
      id: q._id,
      questionText: q.questionText,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty,
    }));

    res.status(201).json({
      success: true,
      attempt,
      detailedAnalysis: {
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        questions: questionsWithAnswers,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAptitudeLeaderboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const leaderboard = await AptitudeAttempt.aggregate([
      {
        $group: {
          _id: '$user',
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          totalQuestions: { $sum: '$totalQuestions' },
          totalScore: { $sum: '$score' },
        },
      },
      { $sort: { avgScore: -1, totalAttempts: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          totalAttempts: 1,
          avgScore: 1,
          totalScore: 1,
          accuracy: {
            $cond: [
              { $gt: ['$totalQuestions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalScore', '$totalQuestions'] }, 100] }, 1] },
              0,
            ],
          },
          user: {
            id: '$userInfo._id',
            username: '$userInfo.username',
            email: '$userInfo.email',
          },
        },
      },
    ]);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
}
