import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import StudyPlan from '../models/StudyPlan';
import { generateStudyPlan } from '../services/gemini';
import { trackUserDailyActivity } from './profileController';
import { CustomError } from '../utils/CustomError';

export async function generateUserStudyPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { targetCompany, currentSkillLevel, availableTime, placementDate } = req.body;

    if (!targetCompany || !currentSkillLevel || !availableTime || !placementDate) {
      return next(new CustomError('All inputs (targetCompany, currentSkillLevel, availableTime, placementDate) are required', 400));
    }

    // Call Gemini API to generate custom plan
    const rawPlan = await generateStudyPlan(
      targetCompany,
      currentSkillLevel,
      availableTime,
      placementDate
    );

    // Map tasks to database schema
    const dailyTasks = (rawPlan.dailyTasks || []).map((t: any, idx: number) => ({
      id: t.id || `task-${idx}`,
      day: t.day || Math.floor(idx / 2) + 1,
      title: t.title || 'Practice Aptitude or DSA',
      category: t.category || 'dsa',
      completed: false
    }));

    const weeklyGoals = (rawPlan.weeklyGoals || []).map((w: any, idx: number) => ({
      week: w.week || idx + 1,
      goal: w.goal || 'Master DSA Topics',
      completed: false
    }));

    const mockTestSchedule = (rawPlan.mockTestSchedule || []).map((m: any, idx: number) => ({
      testName: m.testName || `Placement Mock Test ${idx + 1}`,
      date: m.date || 'Weekend',
      completed: false
    }));

    const studyPlan = await StudyPlan.create({
      user: req.user._id,
      targetCompany,
      currentSkillLevel,
      availableTime,
      placementDate: new Date(placementDate),
      dailyTasks,
      weeklyGoals,
      revisionPlan: rawPlan.revisionPlan || [],
      mockTestSchedule
    });

    // Track daily activity
    await trackUserDailyActivity(req.user._id);

    res.status(201).json({
      success: true,
      studyPlan
    });
  } catch (error) {
    next(error);
  }
}

export async function getActiveStudyPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studyPlan = await StudyPlan.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!studyPlan) {
      return res.status(200).json({ success: true, studyPlan: null, message: 'No active study plan found.' });
    }
    res.status(200).json({ success: true, studyPlan });
  } catch (error) {
    next(error);
  }
}

export async function toggleTaskCompletion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { planId, taskId } = req.params;
    const plan = await StudyPlan.findOne({ _id: planId, user: req.user._id });

    if (!plan) {
      return next(new CustomError('Study plan not found', 404));
    }

    const task = plan.dailyTasks.find(t => t.id === taskId);
    if (!task) {
      return next(new CustomError('Task not found in study plan', 404));
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;

    // Track daily activity streak on task completion
    if (task.completed) {
      await trackUserDailyActivity(req.user._id);
    }

    await plan.save();

    res.status(200).json({
      success: true,
      studyPlan: plan,
      message: task.completed ? 'Task marked as completed' : 'Task marked as incomplete'
    });
  } catch (error) {
    next(error);
  }
}
