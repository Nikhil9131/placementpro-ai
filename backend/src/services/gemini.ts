import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY || '';
const hasApiKey = apiKey && apiKey !== 'your_gemini_api_key_here';
const genAI = hasApiKey ? new GoogleGenerativeAI(apiKey) : null;

// Return a mocked analysis when no API Key is provided
const getMockResumeAnalysis = (text: string) => {
  const atsScore = Math.floor(Math.random() * 20) + 65; // 65 to 85
  return {
    atsScore,
    skillGap: ['Docker', 'Kubernetes', 'TypeScript', 'GraphQL'],
    strengths: [
      'Strong React and Node.js foundational knowledge',
      'Good project experience demonstrating full-stack integrations',
      'Clear work history and educational timeline'
    ],
    weaknesses: [
      'Lack of cloud deployments (AWS/GCP) listed',
      'No metrics or quantification in project details (e.g. "improved speed by 20%")',
      'Resume description lacks keywords related to backend systems design'
    ],
    improvementSuggestions: [
      'Add a dedicated devops/cloud technologies subsection',
      'Rewrite project details using the STAR method (Situation, Task, Action, Result) with quantitative metrics',
      'Include links to active GitHub projects or hosted demo links'
    ]
  };
};

const getMockStudyPlan = (targetCompany: string, skillLevel: string, timeWeeks: number) => {
  const dailyTasks = [];
  const weeklyGoals = [];
  const revisionPlan = [];
  const mockTestSchedule = [];

  const totalDays = timeWeeks * 7;
  for (let d = 1; d <= Math.min(totalDays, 28); d++) {
    let category: 'aptitude' | 'dsa' | 'resume' | 'mock_interview' | 'revision' = 'dsa';
    let title = `Practice DSA Array Questions - Day ${d}`;
    if (d % 4 === 0) {
      category = 'aptitude';
      title = `Aptitude: Solve Quantitative Ability Questions on Percentages/Ratios`;
    } else if (d % 7 === 0) {
      category = 'revision';
      title = `Weekly Revision and Solve Mock Assessment`;
    } else if (d === 2) {
      category = 'resume';
      title = `Analyze and refine Resume using the PlacementPro Analyzer`;
    } else if (d === 15) {
      category = 'mock_interview';
      title = `Practice AI Mock Interview for the Software Developer role`;
    }
    dailyTasks.push({
      id: `task-${d}`,
      day: d,
      title,
      category,
      completed: false
    });
  }

  for (let w = 1; w <= timeWeeks; w++) {
    weeklyGoals.push({
      week: w,
      goal: `Master ${w % 2 === 0 ? 'Advanced Data Structures & Mock Tests' : 'Foundational Topics & Aptitude'}`,
      completed: false
    });
    mockTestSchedule.push({
      testName: `Aptitude & DSA Mock Test - Week ${w}`,
      date: `Week ${w} Weekend`,
      completed: false
    });
  }

  revisionPlan.push('Review dynamic programming and graph algorithms formulas.');
  revisionPlan.push('Go over previous aptitude mistakes on Logical Reasoning.');

  return {
    dailyTasks,
    weeklyGoals,
    revisionPlan,
    mockTestSchedule
  };
};

export async function analyzeResume(resumeText: string) {
  if (!genAI) {
    console.warn('GEMINI_API_KEY is not set. Returning mock resume analysis.');
    return getMockResumeAnalysis(resumeText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) parser and technical recruiter.
      Analyze the following resume text. Return a JSON object with:
      - atsScore: A number from 0 to 100 representing how optimized the resume is for standard software engineering positions.
      - skillGap: Array of strings representing missing skills commonly expected for modern software developer jobs.
      - strengths: Array of strings highlighting the best parts of the resume.
      - weaknesses: Array of strings indicating weak areas or formatting flaws.
      - improvementSuggestions: Array of strings suggesting direct actionable improvements.

      Resume text:
      """
      ${resumeText}
      """
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error with Gemini analyzeResume, falling back to mock:', error.message);
    return getMockResumeAnalysis(resumeText);
  }
}

export async function generateInterviewQuestion(
  role: string,
  chatHistory: { role: 'interviewer' | 'candidate'; content: string }[],
  isFirst: boolean
): Promise<string> {
  if (!genAI) {
    if (isFirst) {
      return `Welcome to your AI Mock Interview for the ${role} position. Let's start with a basic question: Can you explain the difference between synchronous and asynchronous execution, and how it is managed in your stack of choice?`;
    }
    return `That's an interesting explanation. Can you elaborate on how you handle error mitigation in that scenario, and how you would test it?`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const formattedHistory = chatHistory.map(c => 
      `${c.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${c.content}`
    ).join('\n');

    let prompt = '';
    if (isFirst) {
      prompt = `
        You are a senior engineering manager conducting a technical mock interview for the position of "${role}".
        Generate the first interview question. It should be relevant, professional, and clear.
        Avoid greeting the user too much. Simply start the interview with the first question.
      `;
    } else {
      prompt = `
        You are a senior engineering manager conducting a technical mock interview for the position of "${role}".
        Here is the chat history so far:
        ${formattedHistory}

        Generate the next follow-up question or technical scenario based on their previous answers.
        If the interview has reached 4-5 rounds of questions, or the candidate is struggling heavily and you want to close the question phase, respond with the exact word: "FINISHED".
        Keep questions brief, conversational, and direct.
      `;
    }

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error: any) {
    console.error('Error generating interview question:', error.message);
    return `Can you explain the main principles of designing RESTful APIs and how you enforce security on endpoint access?`;
  }
}

export async function evaluateInterview(
  role: string,
  chatHistory: { role: 'interviewer' | 'candidate'; content: string }[]
) {
  const mockEvaluation = {
    overallFeedback: `Good effort! You demonstrated basic comprehension of ${role} paradigms. Focus more on solid design metrics, explaining edge-cases, and refining technical jargon to sound more professional.`,
    scores: {
      technical: 75,
      communication: 80,
      confidence: 70,
      final: 75
    },
    evaluations: chatHistory
      .filter((_, i) => i % 2 === 0 && i + 1 < chatHistory.length)
      .map(h => ({
        questionText: h.content,
        candidateAnswer: chatHistory[chatHistory.indexOf(h) + 1]?.content || 'No response',
        feedback: 'Demonstrated average clarity. Could have elaborated on security and testing parameters.',
        scores: { technical: 75, communication: 80, confidence: 70 }
      }))
  };

  if (!genAI) {
    console.warn('GEMINI_API_KEY is not set. Returning mock interview evaluation.');
    return mockEvaluation;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const formattedHistory = chatHistory.map(c => 
      `${c.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${c.content}`
    ).join('\n');

    const prompt = `
      You are a technical interviewer evaluating a mock interview for the "${role}" role.
      Below is the complete transcript of the interview:
      ${formattedHistory}

      Perform an evaluation of the candidate. Return a JSON object with:
      - overallFeedback: String providing a summary of how the candidate performed, their strengths, and where they should study.
      - scores: Object containing:
        - technical: Number (0-100)
        - communication: Number (0-100)
        - confidence: Number (0-100)
        - final: Number (0-100)
      - evaluations: Array of items for each question-answer pair containing:
        - questionText: String
        - candidateAnswer: String
        - feedback: Specific feedback on this answer.
        - scores: Object containing technical (0-100), communication (0-100), and confidence (0-100).
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error with Gemini evaluateInterview, falling back to mock:', error.message);
    return mockEvaluation;
  }
}

export async function generateStudyPlan(
  targetCompany: string,
  skillLevel: string,
  timeWeeks: number,
  placementDate: string
) {
  if (!genAI) {
    console.warn('GEMINI_API_KEY is not set. Returning mock study plan.');
    return getMockStudyPlan(targetCompany, skillLevel, timeWeeks);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      Create a highly structured study plan for a placement preparation candidate.
      Inputs:
      - Target Company: ${targetCompany}
      - Current Skill Level: ${skillLevel}
      - Time Available: ${timeWeeks} weeks
      - Placement Date: ${placementDate}

      Generate a JSON object matching this structure:
      {
        "dailyTasks": [
          {
            "id": "task-unique-string",
            "day": 1,
            "title": "Specific, actionable task title",
            "category": "aptitude" | "dsa" | "resume" | "mock_interview" | "revision"
          }
        ],
        "weeklyGoals": [
          {
            "week": 1,
            "goal": "Week 1 goal description"
          }
        ],
        "revisionPlan": [
          "Actionable revision item 1",
          "Actionable revision item 2"
        ],
        "mockTestSchedule": [
          {
            "testName": "Name of mock test",
            "date": "Timeline/Date for test"
          }
        ]
      }

      Provide up to 28 daily tasks (spread over days) or adjust to fit the available time. Make them extremely company-specific.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error with Gemini generateStudyPlan, falling back to mock:', error.message);
    return getMockStudyPlan(targetCompany, skillLevel, timeWeeks);
  }
}
