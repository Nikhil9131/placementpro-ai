import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import DsaQuestion from '../models/DsaQuestion';
import DsaProgress from '../models/DsaProgress';
import { trackUserDailyActivity } from './profileController';
import { CustomError } from '../utils/CustomError';

export async function getDsaQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user._id;
    const { topic, difficulty, company, search, status } = req.query;

    const filter: any = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (company) filter.companyTags = company;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 1. Fetch filtered questions
    const questions = await DsaQuestion.find(filter);

    // 2. Fetch user progress for these questions
    const userProgress = await DsaProgress.find({ user: userId });

    // 3. Map progress into questions response
    const questionsWithProgress = questions.map(question => {
      const progress = userProgress.find(p => p.question.toString() === question._id.toString());
      return {
        ...question.toObject(),
        progress: progress
          ? {
              status: progress.status,
              notes: progress.notes,
              solvedAt: progress.solvedAt
            }
          : null
      };
    });

    // 4. If status filter is active, filter in memory
    let finalQuestions = questionsWithProgress;
    if (status) {
      if (status === 'solved') {
        finalQuestions = questionsWithProgress.filter(q => q.progress?.status === 'solved');
      } else if (status === 'revision') {
        finalQuestions = questionsWithProgress.filter(q => q.progress?.status === 'revision_needed');
      } else if (status === 'unsolved') {
        finalQuestions = questionsWithProgress.filter(q => !q.progress);
      }
    }

    res.status(200).json({ success: true, count: finalQuestions.length, questions: finalQuestions });
  } catch (error) {
    next(error);
  }
}

export async function toggleDsaProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user._id;
    const { questionId } = req.params;
    const { status, notes } = req.body;

    if (!status || !['solved', 'revision_needed', 'unsolved'].includes(status)) {
      return next(new CustomError('Invalid progress status', 400));
    }

    const question = await DsaQuestion.findById(questionId);
    if (!question) {
      return next(new CustomError('DSA Question not found', 404));
    }

    if (status === 'unsolved') {
      // Remove progress entry
      await DsaProgress.findOneAndDelete({ user: userId, question: questionId });
      res.status(200).json({ success: true, message: 'Question progress reset' });
    } else {
      // Upsert progress entry
      const progress = await DsaProgress.findOneAndUpdate(
        { user: userId, question: questionId },
        { status: status as 'solved' | 'revision_needed', notes },
        { new: true, upsert: true }
      );

      // Track daily activity streak on solution
      if (status === 'solved') {
        await trackUserDailyActivity(userId);
      }

      res.status(200).json({
        success: true,
        progress,
        message: status === 'solved' ? 'Question marked as Solved' : 'Question marked for Revision'
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getDsaStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user._id;

    const totalQuestions = await DsaQuestion.countDocuments();
    const solvedCount = await DsaProgress.countDocuments({ user: userId, status: 'solved' });
    const revisionCount = await DsaProgress.countDocuments({ user: userId, status: 'revision_needed' });

    // Difficulty breakdown of solved problems
    const solvedQuestionsProgress = await DsaProgress.find({ user: userId, status: 'solved' }).populate('question');
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    solvedQuestionsProgress.forEach((p: any) => {
      if (p.question && p.question.difficulty) {
        difficultyCounts[p.question.difficulty as 'easy' | 'medium' | 'hard'] += 1;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalQuestions,
        solved: solvedCount,
        revision: revisionCount,
        unsolved: Math.max(0, totalQuestions - solvedCount),
        percentage: totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0,
        byDifficulty: difficultyCounts
      }
    });
  } catch (error) {
    next(error);
  }
}
