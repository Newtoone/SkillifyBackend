// const express = require('express');
// const Challenge = require('../models/Challenge');
// const { auth, admin } = require('../middleware/auth');
// const { validateChallenge } = require('../middleware/validation');

// const router = express.Router();

// // Get all published challenges
// // Updated GET route for debugging
// // router.get('/', async (req, res) => {
// //   try {
// //     const { difficulty, category, tag, search } = req.query;
    
// //     // Build query
// //     const query = { isPublished: true };
    
// //     if (difficulty) {
// //       query.difficulty = difficulty;
// //     }
    
// //     if (category) {
// //       query.category = category;
// //     }
    
// //     if (tag) {
// //       query.tags = tag;
// //     }
    
// //     if (search) {
// //       query.$or = [
// //         { title: { $regex: search, $options: 'i' } },
// //         { description: { $regex: search, $options: 'i' } }
// //       ];
// //     }
    
// //     console.log('Query:', query); // Log the query for debugging
    
// //     const challenges = await Challenge.find(query)
// //       .select('title slug difficulty category tags submitCount acceptCount pointsAwarded createdAt')
// //       .sort({ createdAt: -1 });
    
// //     console.log(`Found ${challenges.length} challenges`); // Log the count
    
// //     // If no challenges found, check if any exist without the query
// //     if (challenges.length === 0) {
// //       const totalCount = await Challenge.countDocuments();
// //       console.log(`Total challenges in DB (ignoring query): ${totalCount}`);
      
// //       if (totalCount === 0) {
// //         console.log('No challenges exist in the database at all');
// //       } else {
// //         // Check which query parameter might be causing the issue
// //         const allChallenges = await Challenge.find({});
// //         console.log('Sample challenge from DB:', JSON.stringify(allChallenges[0]));
// //       }
// //     }
    
// //     res.json(challenges);
// //   } catch (error) {
// //     console.error('Challenge route error:', error);
// //     res.status(500).json({ message: 'Server error', error: error.message });
// //   }
// // });

// //Working one
// // router.get('/', async (req, res) => {
// //   try {
// //     const challenges = await Challenge.find(); // Fetch all challenges
// //     console.log(`Total challenges found: ${challenges.length}`);
// //     res.json(challenges);
// //   } catch (error) {
// //     console.error('Error:', error);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // });


// router.get('/', async (req, res) => {
//   try {
//     const { difficulty, category, tag, search } = req.query;
    
//     // Build query
//     const query = { isPublished: true };

//     if (difficulty) {
//       query.difficulty = difficulty;
//       console.log('Filtering by difficulty:', difficulty);
//     }
    
//     if (category) {
//       query.category = category;
//       console.log('Filtering by category:', category);
//     }
    
//     if (tag) {
//       query.tags = tag;
//       console.log('Filtering by tag:', tag);
//     }
    
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//       console.log('Searching by:', search);
//     }

//     console.log('Final Query:', JSON.stringify(query)); // Log the final query

//     const challenges = await Challenge.find(query)
//       .select('title slug difficulty category tags submitCount acceptCount pointsAwarded createdAt')
//       .sort({ createdAt: -1 });

//     console.log(`Found ${challenges.length} challenges`);

//     res.json(challenges);
//   } catch (error) {
//     console.error('Challenge route error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


// // Get a single challenge by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const challenge = await Challenge.findById(req.params.id);
    
//     if (!challenge) {
//       return res.status(404).json({ message: 'Challenge not found' });
//     }
    
//     // Don't return hidden test cases or solutions to regular users
//     const challengeResponse = challenge.toObject();
    
//     // Remove solution and hidden test cases if not authenticated as admin
//     if (!req.user || req.user.role !== 'admin') {
//       delete challengeResponse.solution;
//       challengeResponse.testCases = challengeResponse.testCases.filter(tc => !tc.isHidden);
//     }
    
//     res.json(challengeResponse);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Create a new challenge (admin only)
// router.post('/', [auth, admin, validateChallenge], async (req, res) => {
//   try {
//     const challenge = new Challenge({
//       ...req.body,
//       createdBy: req.user._id
//     });
    
//     await challenge.save();
    
//     res.status(201).json(challenge);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Update a challenge (admin only)
// router.put('/:id', [auth, admin, validateChallenge], async (req, res) => {
//   try {
//     const challenge = await Challenge.findById(req.params.id);
    
//     if (!challenge) {
//       return res.status(404).json({ message: 'Challenge not found' });
//     }
    
//     // Update challenge fields
//     Object.keys(req.body).forEach(key => {
//       challenge[key] = req.body[key];
//     });
    
//     await challenge.save();
    
//     res.json(challenge);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Delete a challenge (admin only)
// router.delete('/:id', [auth, admin], async (req, res) => {
//   try {
//     const challenge = await Challenge.findById(req.params.id);
    
//     if (!challenge) {
//       return res.status(404).json({ message: 'Challenge not found' });
//     }
    
//     await challenge.remove();
    
//     res.json({ message: 'Challenge deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get categories and tags for filtering
// router.get('/filters/options', async (req, res) => {
//   try {
//     const categories = await Challenge.distinct('category', { isPublished: true });
//     const tags = await Challenge.distinct('tags', { isPublished: true });
    
//     res.json({ categories, tags });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;

const express = require('express');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission'); // Add this for user challenge queries
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');
const { validateChallenge } = require('../middleware/validation');

const router = express.Router();

// Get all published challenges
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, tag, search } = req.query;
    
    // Build query
    const query = { isPublished: true };

    if (difficulty) {
      query.difficulty = difficulty;
      console.log('Filtering by difficulty:', difficulty);
    }
    
    if (category) {
      query.category = category;
      console.log('Filtering by category:', category);
    }
    
    if (tag) {
      query.tags = tag;
      console.log('Filtering by tag:', tag);
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      console.log('Searching by:', search);
    }

    console.log('Final Query:', JSON.stringify(query)); // Log the final query

    const challenges = await Challenge.find(query)
      .select('title slug difficulty category tags submitCount acceptCount pointsAwarded createdAt')
      .sort({ createdAt: -1 });

    console.log(`Found ${challenges.length} challenges`);

    res.json(challenges);
  } catch (error) {
    console.error('Challenge route error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get challenges completed by the current user
router.get('/completed', auth, async (req, res) => {
  try {
    // Find all successful submissions by the user
    const submissions = await Submission.find({ 
      userId: req.user.id, 
      status: 'success' 
    }).distinct('challengeId');
    
    // Get the challenge details for each completed challenge
    const completedChallenges = await Challenge.find({
      _id: { $in: submissions },
      isPublished: true
    }).select('title slug difficulty category tags pointsAwarded');
    
    res.json(completedChallenges);
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get challenges in progress by the current user
router.get('/in-progress', auth, async (req, res) => {
  try {
    // Find all challenges that have submissions but no successful submission
    const allSubmissions = await Submission.find({ userId: req.user.id });
    
    // Group submissions by challengeId
    const submissionsByChallenge = {};
    allSubmissions.forEach(sub => {
      if (!submissionsByChallenge[sub.challengeId]) {
        submissionsByChallenge[sub.challengeId] = [];
      }
      submissionsByChallenge[sub.challengeId].push(sub);
    });
    
    // Find challenges with submissions but no success
    const inProgressChallengeIds = Object.keys(submissionsByChallenge).filter(challengeId => {
      return !submissionsByChallenge[challengeId].some(sub => sub.status === 'success');
    });
    
    // Get the challenge details
    const inProgressChallenges = await Challenge.find({
      _id: { $in: inProgressChallengeIds },
      isPublished: true
    }).select('title slug difficulty category tags pointsAwarded');
    
    res.json(inProgressChallenges);
  } catch (error) {
    console.error('Error fetching in-progress challenges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recommended challenges for the user
router.get('/recommended', auth, async (req, res) => {
  try {
    // Get user's skill level based on completed challenges
    const user = await User.findById(req.user.id);
    
    // Find completed challenge IDs
    const completedChallenges = await Submission.find({
      userId: req.user.id,
      status: 'success'
    }).distinct('challengeId');
    
    // Build a query for recommended challenges
    // This is a simple implementation - you can enhance this based on user behavior
    const query = {
      _id: { $nin: completedChallenges }, // Not already completed
      isPublished: true
    };
    
    // Adjust difficulty based on user performance
    if (user.rank === 'beginner') {
      query.difficulty = { $in: ['easy', 'medium'] };
    } else if (user.rank === 'intermediate') {
      query.difficulty = { $in: ['medium', 'hard'] };
    } else {
      query.difficulty = 'hard';
    }
    
    // Get recent categories user has worked on
    const recentSubmissions = await Submission.find({
      userId: req.user.id
    }).sort({ createdAt: -1 }).limit(5);
    
    const recentChallengeIds = recentSubmissions.map(sub => sub.challengeId);
    const recentChallenges = await Challenge.find({
      _id: { $in: recentChallengeIds }
    });
    
    const recentCategories = [...new Set(recentChallenges.map(c => c.category))];
    
    if (recentCategories.length > 0) {
      // Prioritize challenges from categories user recently worked on
      query.category = { $in: recentCategories };
    }
    
    const recommendedChallenges = await Challenge.find(query)
      .select('title slug difficulty category tags pointsAwarded')
      .limit(5);
    
    res.json(recommendedChallenges);
  } catch (error) {
    console.error('Error fetching recommended challenges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single challenge by ID or slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const idOrSlug = req.params.idOrSlug;
    let challenge;
    
    // Check if the parameter is an ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    
    if (isObjectId) {
      challenge = await Challenge.findById(idOrSlug);
    } else {
      challenge = await Challenge.findOne({ slug: idOrSlug });
    }
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Don't return hidden test cases or solutions to regular users
    const challengeResponse = challenge.toObject();
    
    // Remove solution and hidden test cases if not authenticated as admin
    if (!req.user || req.user.role !== 'admin') {
      delete challengeResponse.solution;
      challengeResponse.testCases = challengeResponse.testCases.filter(tc => !tc.isHidden);
    }
    
    res.json(challengeResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's progress on a specific challenge
router.get('/:challengeId/progress', auth, async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    // Find all submissions for this challenge by the user
    const submissions = await Submission.find({
      userId: req.user.id,
      challengeId
    }).sort({ createdAt: -1 });
    
    // Calculate progress statistics
    const totalSubmissions = submissions.length;
    const successfulSubmission = submissions.find(sub => sub.status === 'success');
    const latestSubmission = submissions[0]; // Most recent submission
    
    // Get test case results from latest submission
    let testCasesPassed = 0;
    let totalTestCases = 0;
    
    if (latestSubmission && latestSubmission.results) {
      totalTestCases = latestSubmission.results.length;
      testCasesPassed = latestSubmission.results.filter(result => result.passed).length;
    }
    
    const progress = {
      isCompleted: !!successfulSubmission,
      totalSubmissions,
      testCasesPassed,
      totalTestCases,
      progressPercentage: totalTestCases > 0 ? (testCasesPassed / totalTestCases) * 100 : 0,
      latestSubmission: latestSubmission ? {
        status: latestSubmission.status,
        code: latestSubmission.code,
        createdAt: latestSubmission.createdAt
      } : null
    };
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching challenge progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new challenge (admin only)
router.post('/', [auth, admin, validateChallenge], async (req, res) => {
  try {
    const challenge = new Challenge({
      ...req.body,
      createdBy: req.user.id
    });
    
    await challenge.save();
    
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a challenge (admin only)
router.put('/:id', [auth, admin, validateChallenge], async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Update challenge fields
    Object.keys(req.body).forEach(key => {
      challenge[key] = req.body[key];
    });
    
    await challenge.save();
    
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a challenge (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get categories and tags for filtering
router.get('/filters/options', async (req, res) => {
  try {
    const categories = await Challenge.distinct('category', { isPublished: true });
    const tags = await Challenge.distinct('tags', { isPublished: true });
    
    res.json({ categories, tags });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;