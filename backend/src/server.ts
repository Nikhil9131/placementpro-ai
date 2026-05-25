import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';
import AptitudeQuestion from './models/AptitudeQuestion';
import DsaQuestion from './models/DsaQuestion';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placementpro';

// Seed initial questions if database is empty
async function seedDatabase() {
  try {
    const aptCount = await AptitudeQuestion.countDocuments();
    if (aptCount === 0) {
      console.log('Seeding initial Aptitude questions...');
      await AptitudeQuestion.create([
        {
          category: 'quantitative',
          questionText: 'A train 125 m long passes a man, running at 5 km/hr in the same direction in which the train is going, in 10 seconds. The speed of the train is:',
          options: ['45 km/hr', '50 km/hr', '54 km/hr', '55 km/hr'],
          correctAnswerIndex: 1,
          explanation: 'Relative speed = (125/10) * (18/5) = 45 km/hr. Since they are going in the same direction, Relative Speed = Speed of train - Speed of man. Therefore, Speed of train = 45 + 5 = 50 km/hr.',
          difficulty: 'medium',
          tags: ['Time & Distance', 'Trains']
        },
        {
          category: 'logical',
          questionText: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
          options: ['1/3', '1/8', '2/8', '1/16'],
          correctAnswerIndex: 1,
          explanation: 'This is a simple division series; each number is one-half of the previous number.',
          difficulty: 'easy',
          tags: ['Number Series']
        },
        {
          category: 'verbal',
          questionText: 'Choose the word that is most nearly opposite in meaning to: EPHEMERAL',
          options: ['Transient', 'Permanent', 'Fragile', 'Elusive'],
          correctAnswerIndex: 1,
          explanation: 'Ephemeral means lasting for a very short time. Permanent means lasting or intended to last or remain unchanged indefinitely, which is the opposite.',
          difficulty: 'medium',
          tags: ['Antonyms']
        },
        {
          category: 'data_interpretation',
          questionText: 'If the total sales of a company in 2025 was $500,000 and the sales grew by 15% in 2026, what were the sales in 2026?',
          options: ['$550,000', '$575,000', '$600,000', '$525,000'],
          correctAnswerIndex: 1,
          explanation: 'Sales in 2026 = 500,000 * 1.15 = $575,000.',
          difficulty: 'easy',
          tags: ['Percentages', 'Sales Chart']
        }
      ]);
    }

    const dsaCount = await DsaQuestion.countDocuments();
    if (dsaCount === 0) {
      console.log('Seeding initial DSA questions...');
      await DsaQuestion.create([
        {
          title: 'Two Sum',
          difficulty: 'easy',
          topic: 'arrays',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
          constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
          inputFormat: 'Line 1: space separated integers representing the array nums\nLine 2: Target integer',
          outputFormat: 'Array indices [i, j]',
          sampleInput: '2 7 11 15\n9',
          sampleOutput: '0 1',
          companyTags: ['Amazon', 'Google', 'Microsoft', 'TCS'],
          solutionUrl: 'https://leetcode.com/problems/two-sum/'
        },
        {
          title: 'Reverse Linked List',
          difficulty: 'easy',
          topic: 'linked_lists',
          description: 'Given the head of a singly linked list, reverse the list, and return its head.',
          constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
          inputFormat: 'Space separated integers representing nodes of the list',
          outputFormat: 'Reversed space separated integers list',
          sampleInput: '1 2 3 4 5',
          sampleOutput: '5 4 3 2 1',
          companyTags: ['Amazon', 'Microsoft', 'Infosys'],
          solutionUrl: 'https://leetcode.com/problems/reverse-linked-list/'
        },
        {
          title: 'Longest Palindromic Substring',
          difficulty: 'medium',
          topic: 'strings',
          description: 'Given a string s, return the longest palindromic substring in s.',
          constraints: '1 <= s.length <= 1000\ns consists of only digits and English letters.',
          inputFormat: 'String s',
          outputFormat: 'Longest palindrome string',
          sampleInput: 'babad',
          sampleOutput: 'bab',
          companyTags: ['Google', 'Amazon', 'Wipro'],
          solutionUrl: 'https://leetcode.com/problems/longest-palindromic-substring/'
        },
        {
          title: 'Edit Distance',
          difficulty: 'hard',
          topic: 'dynamic_programming',
          description: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character.',
          constraints: '0 <= word1.length, word2.length <= 500\nword1 and word2 consist of lowercase English letters.',
          inputFormat: 'Line 1: word1\nLine 2: word2',
          outputFormat: 'Minimum operations count',
          sampleInput: 'horse\nros',
          sampleOutput: '3',
          companyTags: ['Google', 'Microsoft'],
          solutionUrl: 'https://leetcode.com/problems/edit-distance/'
        }
      ]);
    }
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
}

// Connect to MongoDB and start Server
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
