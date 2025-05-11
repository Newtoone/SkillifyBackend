// const express = require('express');
// const User = require('../models/User');
// const { auth } = require('../middleware/auth');

// const router = express.Router();

// // Register a new user
// router.post('/register', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if username or email already exists
//     const existingUser = await User.findOne({ $or: [{ username }, { email }] });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Username or email already taken' });
//     }

//     // Create a new user
//     const user = new User({
//       username,
//       email,
//       password, // Password should be hashed before saving (see below)
//     });

//     // Save the user
//     await user.save();

//     // Return the created user (usually you'd also return a token here)
//     res.status(201).json(user);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: `Server error`, error: error.message });
//   }
// });


// // Get current user profile
// router.get('/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Update user profile
// router.put('/profile', auth, async (req, res) => {
//   try {
//     const { username, bio, avatarUrl } = req.body;
    
//     // Check if username exists (if it's being updated)
//     if (username && username !== req.user.username) {
//       const existingUser = await User.findOne({ username });
//       if (existingUser) {
//         return res.status(400).json({ message: 'Username already taken' });
//       }
//     }
    
//     const user = await User.findById(req.user._id);
    
//     if (username) user.username = username;
//     if (bio !== undefined) user.bio = bio;
//     if (avatarUrl) user.avatarUrl = avatarUrl;
    
//     await user.save();
    
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get user's badges
// router.get('/badges', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     res.json(user.badges);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get user's stats
// router.get('/stats', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
    
//     const stats = {
//       problemsSolved: user.problemsSolved,
//       streak: user.streak,
//       rank: user.rank,
//       points: user.points,
//       badgeCount: user.badges.length
//     };
    
//     res.json(stats);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken(); // Assuming your User model has this method

    // Return the created user (excluding password) and token
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.generateAuthToken(); // Assuming your User model has this method

    // Return user info and token
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, avatarUrl } = req.body;
    
    // Check if username exists (if it's being updated)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's badges
router.get('/badges', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.badges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const stats = {
      problemsSolved: user.problemsSolved,
      streak: user.streak,
      rank: user.rank,
      points: user.points,
      badgeCount: user.badges.length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============== User Challenge Routes ==============

// Get all user completed challenges
router.get('/challenges', auth, async (req, res) => {
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
router.get('/challenges/in-progress', auth, async (req, res) => {
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
router.get('/challenges/recommended', auth, async (req, res) => {
  try {
    // Get user's skill level based on completed challenges
    const user = await User.findById(req.user.id);
    
    // Find completed challenge IDs
    const completedChallenges = await Submission.find({
      userId: req.user.id,
      status: 'success'
    }).distinct('challengeId');
    
    // Build a query for recommended challenges
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

// Get user progress for a specific challenge
router.get('/challenges/:challengeId/progress', auth, async (req, res) => {
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

module.exports = router;