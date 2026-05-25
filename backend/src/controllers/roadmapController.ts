import { Request, Response, NextFunction } from 'express';
import Roadmap from '../models/Roadmap';
import { CustomError } from '../utils/CustomError';

// Mock/Standard templates to seed dynamically if not exists
const getPredefinedRoadmap = (company: string) => {
  const companyLower = company.toLowerCase();
  
  if (['google', 'microsoft', 'amazon'].includes(companyLower)) {
    return {
      companyName: company,
      aptitudeTopics: ['Probability & Permutations', 'Time & Work', 'Puzzles & Logic', 'Data Sufficiency'],
      dsaTopics: ['Dynamic Programming', 'Graph Algorithms', 'Trees & BSTs', 'Heap & Priority Queue', 'Arrays & Slidng Window'],
      interviewQuestions: [
        'LRU Cache Implementation',
        'Find median from data stream',
        'Word Search II',
        'Merge k sorted lists',
        'Design TinyURL / System Design basics'
      ],
      resources: [
        { title: 'Leetcode Top Interview Questions', url: 'https://leetcode.com/problemset/all/', type: 'article' as const },
        { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'documentation' as const },
        { title: 'Dynamic Programming playlist', url: 'https://www.youtube.com', type: 'video' as const }
      ],
      estimatedTimeline: '8 - 12 Weeks',
      dailyTasks: [
        'Study Binary Trees & solve 3 medium questions',
        'Practice timed logical reasoning on Puzzles',
        'Review standard sliding window template',
        'Code up Trie Node insertion and search'
      ]
    };
  } else {
    // Service-based companies like TCS, Wipro, Infosys, Accenture, Cognizant, Capgemini
    return {
      companyName: company,
      aptitudeTopics: ['Averages & Percentages', 'Profit & Loss', 'Logical Deductions', 'Reading Comprehension', 'Coding-Decoding'],
      dsaTopics: ['Array Manipulation', 'String searching', 'Linked List operations', 'Hashing', 'Sorting & Searching'],
      interviewQuestions: [
        'Find duplicate in an array',
        'Check for balanced parentheses',
        'Reverse words in a string',
        'Prime numbers, Fibonacci and factorials optimization',
        'Object-Oriented Programming (OOP) concepts'
      ],
      resources: [
        { title: 'Aptitude Practice - IndiaBIX', url: 'https://www.indiabix.com/', type: 'article' as const },
        { title: 'Top 50 DSA for Service-based placements', url: 'https://www.geeksforgeeks.org/', type: 'documentation' as const }
      ],
      estimatedTimeline: '4 - 6 Weeks',
      dailyTasks: [
        'Practice Quantitative Aptitude (Percentages & Ratios) on IndiaBIX',
        'Solve 5 basic String problems on Leetcode/GFG',
        'Revise OOP concepts (Inheritance, Polymorphism, Encapsulation)',
        'Take a mock placement aptitude assessment'
      ]
    };
  }
};

export async function getCompanyRoadmaps(req: Request, res: Response, next: NextFunction) {
  try {
    const roadmaps = await Roadmap.find();
    res.status(200).json({ success: true, count: roadmaps.length, roadmaps });
  } catch (error) {
    next(error);
  }
}

export async function getCompanyRoadmapDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyName } = req.params;
    let roadmap = await Roadmap.findOne({ companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } });

    if (!roadmap) {
      // Dynamic seeding if missing for UX convenience
      const defaultData = getPredefinedRoadmap(companyName);
      roadmap = await Roadmap.create(defaultData);
    }

    res.status(200).json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
}
