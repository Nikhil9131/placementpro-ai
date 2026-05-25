import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import ResumeAnalysis from '../models/ResumeAnalysis';
import { extractTextFromPdf } from '../services/pdf';
import { analyzeResume } from '../services/gemini';
import { trackUserDailyActivity } from './profileController';
import { CustomError } from '../utils/CustomError';

export async function analyzeUserResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return next(new CustomError('Please upload a PDF file', 400));
    }

    if (req.file.mimetype !== 'application/pdf') {
      return next(new CustomError('Only PDF files are supported', 400));
    }

    const pdfBuffer = req.file.buffer;
    const resumeText = await extractTextFromPdf(pdfBuffer);

    if (!resumeText || resumeText.trim().length === 0) {
      return next(new CustomError('Could not extract text from the PDF. Ensure it contains selectable text.', 400));
    }

    // Call Gemini API service
    const rawAnalysis = await analyzeResume(resumeText);

    // Save to database
    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      atsScore: rawAnalysis.atsScore || 70,
      skillGap: rawAnalysis.skillGap || [],
      strengths: rawAnalysis.strengths || [],
      weaknesses: rawAnalysis.weaknesses || [],
      improvementSuggestions: rawAnalysis.improvementSuggestions || [],
      extractedText: resumeText,
    });

    // Update streak activity
    await trackUserDailyActivity(req.user._id);

    res.status(201).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
}

export async function getResumeHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const history = await ResumeAnalysis.find({ user: req.user._id }).sort({ analyzedAt: -1 });
    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
}

export async function getResumeAnalysisDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const analysis = await ResumeAnalysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!analysis) {
      return next(new CustomError('Resume analysis not found', 404));
    }
    res.status(200).json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
}
