import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'admin']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createAptitudeQuestionSchema = z.object({
  body: z.object({
    category: z.enum(['quantitative', 'logical', 'verbal', 'data_interpretation']),
    questionText: z.string().min(5, 'Question text must be at least 5 characters'),
    options: z.array(z.string()).min(2, 'At least 2 options are required'),
    correctAnswerIndex: z.number().int().nonnegative('Correct answer index must be non-negative'),
    explanation: z.string().min(1, 'Explanation is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.array(z.string()).optional(),
  }),
});

export const createDsaQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    topic: z.enum([
      'arrays',
      'strings',
      'linked_lists',
      'stacks',
      'queues',
      'trees',
      'graphs',
      'dynamic_programming',
      'greedy',
      'backtracking',
    ]),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    constraints: z.string().optional(),
    inputFormat: z.string().optional(),
    outputFormat: z.string().optional(),
    sampleInput: z.string().optional(),
    sampleOutput: z.string().optional(),
    companyTags: z.array(z.string()).optional(),
    solutionUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  }),
});

export const startInterviewSchema = z.object({
  body: z.object({
    type: z.enum(['software_engineer', 'frontend_developer', 'backend_developer', 'full_stack_developer', 'data_analyst']),
  }),
});

export const answerInterviewSchema = z.object({
  body: z.object({
    answer: z.string().min(1, 'Answer is required'),
  }),
});

export const generateStudyPlanSchema = z.object({
  body: z.object({
    targetCompany: z.string().min(2, 'Target company is required'),
    currentSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    availableTime: z.number().int().min(1, 'Available time must be at least 1 week'),
    placementDate: z.string().datetime('Invalid placement date format (ISO datetime required)'),
  }),
});
