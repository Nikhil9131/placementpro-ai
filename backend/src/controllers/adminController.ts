import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ResumeAnalysis from '../models/ResumeAnalysis';
import InterviewSession from '../models/InterviewSession';
import DsaQuestion from '../models/DsaQuestion';
import DsaProgress from '../models/DsaProgress';
import AptitudeQuestion from '../models/AptitudeQuestion';
import Roadmap from '../models/Roadmap';
import { CustomError } from '../utils/CustomError';

export async function getPlatformAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalResumes = await ResumeAnalysis.countDocuments();
    const totalInterviews = await InterviewSession.countDocuments();

    // Most solved DSA questions
    const solvedStats = await DsaProgress.aggregate([
      { $match: { status: 'solved' } },
      { $group: { _id: '$question', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'dsaquestions', localField: '_id', foreignField: '_id', as: 'questionDetails' } },
      { $unwind: '$questionDetails' },
      {
        $project: {
          _id: 1,
          count: 1,
          title: '$questionDetails.title',
          topic: '$questionDetails.topic',
          difficulty: '$questionDetails.difficulty'
        }
      }
    ]);

    // Average interview score
    const avgInterview = await InterviewSession.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgFinal: { $avg: '$scores.final' },
          avgTech: { $avg: '$scores.technical' },
          avgComm: { $avg: '$scores.communication' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        users: totalUsers,
        resumesAnalyzed: totalResumes,
        interviewsCompleted: totalInterviews,
        mostSolvedDsa: solvedStats,
        avgInterviewScores: avgInterview.length > 0 ? avgInterview[0] : { avgFinal: 0, avgTech: 0, avgComm: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
}

export async function createAptitudeQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const question = await AptitudeQuestion.create(req.body);
    res.status(201).json({ success: true, question, message: 'Aptitude question created' });
  } catch (error) {
    next(error);
  }
}

export async function createDsaQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const question = await DsaQuestion.create(req.body);
    res.status(201).json({ success: true, question, message: 'DSA question created' });
  } catch (error) {
    next(error);
  }
}

export async function createOrUpdateRoadmap(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyName } = req.body;
    const roadmap = await Roadmap.findOneAndUpdate(
      { companyName },
      req.body,
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, roadmap, message: 'Roadmap saved successfully' });
  } catch (error) {
    next(error);
  }
}
