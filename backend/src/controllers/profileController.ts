import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import Profile from '../models/Profile';
import AptitudeAttempt from '../models/AptitudeAttempt';
import DsaProgress from '../models/DsaProgress';
import ResumeAnalysis from '../models/ResumeAnalysis';
import InterviewSession from '../models/InterviewSession';
import StudyPlan from '../models/StudyPlan';
import { CustomError } from '../utils/CustomError';

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate('user', 'username email role');
    if (!profile) {
      return next(new CustomError('Profile not found', 404));
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { skills, targetCompanies, graduationYear, bio, contactNumber, experience, education, projects } = req.body;

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return next(new CustomError('Profile not found', 404));
    }

    if (skills !== undefined) profile.skills = skills;
    if (targetCompanies !== undefined) profile.targetCompanies = targetCompanies;
    if (graduationYear !== undefined) profile.graduationYear = graduationYear;
    if (bio !== undefined) profile.bio = bio;
    if (contactNumber !== undefined) profile.contactNumber = contactNumber;
    if (experience !== undefined) profile.experience = experience;
    if (education !== undefined) profile.education = education;
    if (projects !== undefined) profile.projects = projects;

    await profile.save();

    res.status(200).json({ success: true, profile, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user._id;

    // 1. Profile and Streak
    const profile = await Profile.findOne({ user: userId });
    const streak = profile ? profile.streak : 0;
    const skillsCount = profile?.skills?.length || 0;

    // 2. Aptitude stats
    const aptitudeAttempts = await AptitudeAttempt.find({ user: userId });
    const totalAptitudeTests = aptitudeAttempts.length;
    const avgAptitudeScore =
      totalAptitudeTests > 0
        ? Math.round(aptitudeAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) / totalAptitudeTests)
        : 0;

    // 3. DSA progress
    const dsaSolved = await DsaProgress.countDocuments({ user: userId, status: 'solved' });
    const dsaRevision = await DsaProgress.countDocuments({ user: userId, status: 'revision_needed' });

    // 4. Resume Score
    const latestResume = await ResumeAnalysis.findOne({ user: userId }).sort({ analyzedAt: -1 });
    const resumeScore = latestResume ? latestResume.atsScore : 0;

    // 5. Mock Interview Score
    const latestInterview = await InterviewSession.findOne({ user: userId, status: 'completed' }).sort({ endedAt: -1 });
    const interviewScore = latestInterview ? latestInterview.scores?.final || 0 : 0;

    const interviewAttempts = await InterviewSession.countDocuments({ user: userId });

    // 6. Study Plan Upcoming Goals
    const activePlan = await StudyPlan.findOne({ user: userId }).sort({ createdAt: -1 });
    const upcomingGoal = activePlan
      ? activePlan.dailyTasks.find(task => !task.completed)
      : null;

    // 7. Activity History (Last 7 Days activity for line charts/heatmaps)
    // We'll return the weekly activity logged in the profile
    const weeklyActivity = profile?.weeklyActivity || [];

    // Let's also compute a breakdown of solved DSA topics for UI charts
    const dsaBreakdown = await DsaProgress.aggregate([
      { $match: { user: userId, status: 'solved' } },
      { $lookup: { from: 'dsaquestions', localField: 'question', foreignField: '_id', as: 'questionInfo' } },
      { $unwind: '$questionInfo' },
      { $group: { _id: '$questionInfo.topic', count: { $sum: 1 } } }
    ]);

    // Let's compute average aptitude score per category
    const aptitudeBreakdown = await AptitudeAttempt.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', avgScore: { $avg: '$score' }, totalQuestions: { $avg: '$totalQuestions' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        streak,
        aptitude: {
          totalTests: totalAptitudeTests,
          avgScore: avgAptitudeScore,
          breakdown: aptitudeBreakdown.map(item => ({
            category: item._id || 'Mixed',
            percentage: Math.round((item.avgScore / (item.totalQuestions || 10)) * 100)
          }))
        },
        dsa: {
          solved: dsaSolved,
          revisionNeeded: dsaRevision,
          breakdown: dsaBreakdown.map(item => ({
            topic: item._id,
            count: item.count
          }))
        },
        resume: {
          score: resumeScore,
          analyzedCount: await ResumeAnalysis.countDocuments({ user: userId })
        },
        interview: {
          score: interviewScore,
          totalInterviews: interviewAttempts
        },
        upcomingGoal,
        weeklyActivity,
      }
    });
  } catch (error) {
    next(error);
  }
}

// Help utility to increment user's daily activity count and streak tracking
export async function trackUserDailyActivity(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return;

    // Handle streak
    if (!profile.lastActiveDate) {
      profile.streak = 1;
    } else {
      const lastActive = new Date(profile.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        profile.streak += 1;
      } else if (diffDays > 1) {
        profile.streak = 1; // streak reset
      }
    }
    profile.lastActiveDate = today;

    // Handle weekly activity array
    const activityIndex = profile.weeklyActivity.findIndex(act => act.date === today);
    if (activityIndex > -1) {
      profile.weeklyActivity[activityIndex].count += 1;
    } else {
      profile.weeklyActivity.push({ date: today, count: 1 });
      // Keep only last 14 days activity to limit space
      if (profile.weeklyActivity.length > 14) {
        profile.weeklyActivity.shift();
      }
    }

    await profile.save();
  } catch (error) {
    console.error('Failed to track daily activity streak:', error);
  }
}
