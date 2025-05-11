const express = require('express');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validateSubmission } = require('../middleware/validation');
const { executeCode } = require('../utils/codeExecutor');
const { checkBadges, updateStreak } = require('../utils/badgeSystem');

const router = express.Router();

// Submit a solution
// router.post('/', [auth, validateSubmission], async (req, res) => {
//   try {
//     const { challengeId, code, language } = req.body;
//     console.log('➡️  Incoming request:', req.body);
//     console.log('👤 Authenticated user:', req.user);

//     // Get the challenge
//     const challenge = await Challenge.findById(challengeId);
//     if (!challenge) {
//       return res.status(404).json({ message: 'Challenge not found' });
//     }
//     if (!challenge.testCases || challenge.testCases.length === 0) {
//       return res.status(400).json({ message: 'Challenge does not have any test cases' });
//     }

//     let result;

//     // Execute the code against test cases (Ensure executeCode is awaited)
//     // result = await executeCode(code, challenge.testCases, language); // Assuming this is asynchronous
//     // console.log("🚀 Execution Result:", result);
//     try {
//       result = executeCode(code, challenge.testCases, language);
//     } catch (error) {
//       console.error('Execution error:', error);
//       return res.status(500).json({ message: 'Code execution failed', details: error.message });
//     }
    
//     if (!result || !result.testResults) {
//       return res.status(500).json({ message: 'Invalid execution result' });
//     }

//     // Check if the submission passed all test cases
//     const allTestsPassed = result.every(r => r.passed);
    
//     // Create the submission record
//     const submission = new Submission({
//       user: req.user._id,
//       challenge: challengeId,
//       code,
//       language,
//       testResults: result,
//       status: allTestsPassed ? 'accepted' : 'rejected',
//     });
    
//     await submission.save();
    
//     // If all tests passed, update challenges and user stats
//     if (allTestsPassed) {
//       // Check if user has already solved this challenge
//       const previousAccepted = await Submission.findOne({
//         user: req.user._id,
//         challenge: challengeId,
//         status: 'accepted'
//       });
      
//       // Only update first time stats if this is their first accepted solution
//       if (!previousAccepted) {
//         // Update challenge stats
//         challenge.acceptCount += 1;
//         await challenge.save();
        
//         // Update user stats
//         const user = await User.findById(req.user._id);
//         user.solvedChallenges.push(challengeId);
//         user.totalPoints += challenge.pointsAwarded;
        
//         // Update user streak
//         await updateStreak(user);
        
//         // Check if user earned any new badges
//         const newBadges = await checkBadges(user);
        
//         await user.save();
        
//         // Add badges to the response if any were earned
//         if (newBadges && newBadges.length > 0) {
//           submission.badgesEarned = newBadges;
//         }
//       }
//     }
    
//     // Always increment submit count
//     challenge.submitCount += 1;
//     await challenge.save();
    
//     res.status(201).json(submission);
//   } catch (error) {
//     console.error("Submission error:", error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

router.post('/', [auth, validateSubmission], async (req, res) => {
  try {
    const challengeId = req.body.challengeId || req.body.id;
    const { code, language } = req.body;
    console.log('➡️  Incoming request:', req.body);
    console.log('👤 Authenticated user:', req.user);

    // Ensure challengeId is provided
    if (!challengeId || !code || !language) {
      return res.status(400).json({ message: 'Missing required fields (challengeId, code, language)' });
    }

    // Get the challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if the challenge has test cases
    if (!challenge.testCases || challenge.testCases.length === 0) {
      return res.status(400).json({ message: 'Challenge does not have test cases' });
    }
    
    // Assuming executeCode is asynchronous
    let result = await executeCode(code, challenge.testCases, language);
    console.log("🚀 Execution Result (Raw):", result);

    if (!result || !result.testResults || !Array.isArray(result.testResults) || result.testResults.length === 0) {
      console.log(`Results returned: ${JSON.stringify(result)}`);
      return res.status(500).json({ message: 'Invalid or empty result array' });
    }    
    
    // Now you can safely use .every()
    const allTestsPassed = result.status === 'Accepted';

    // Create the submission record
    const submission = new Submission({
      user: req.user._id,
      challenge: challengeId,
      code,
      language,
      testResults: result.testResults,  // Updated to use testResults
      status: result.status,
    });

    // If all tests passed, update challenge and user stats
    if (allTestsPassed) {
      // Check if the user has already solved this challenge
      const previousAccepted = await Submission.findOne({
        user: req.user._id,
        challenge: challengeId,
        status: 'accepted'
      });

      // Only update stats the first time the solution is accepted
      if (!previousAccepted) {
        // Update challenge stats
        challenge.acceptCount += 1;
        await challenge.save();
        
        // Update user stats
        const user = await User.findById(req.user._id);
        user.solvedChallenges.push(challengeId);
        user.totalPoints += challenge.pointsAwarded;

        // Update user streak
        await updateStreak(user);

        // Check if user earned any new badges
        const newBadges = await checkBadges(user);
        await user.save();

        // Add badges to the response if any were earned
        if (newBadges && newBadges.length > 0) {
          submission.badgesEarned = newBadges;
        }
      }
    }

    // Always increment submit count
    challenge.submitCount += 1;
    await challenge.save();

    res.status(201).json(submission);
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get all submissions for the current user
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('challenge', 'title difficulty slug')
      .sort({ createdAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific submission by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('challenge', 'title description difficulty testCases');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Only allow users to view their own submissions or admins
    if (submission.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent public submissions (for a leaderboard)
router.get('/recent/public', async (req, res) => {
  try {
    const submissions = await Submission.find({ status: 'accepted' })
      .populate('user', 'username profileImage')
      .populate('challenge', 'title difficulty slug')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get submissions stats for a specific challenge
router.get('/stats/challenge/:challengeId', async (req, res) => {
  try {
    const challengeId = req.params.challengeId;
    
    // Get total submissions and accepted submissions
    const totalSubmissions = await Submission.countDocuments({ challenge: challengeId });
    const acceptedSubmissions = await Submission.countDocuments({ 
      challenge: challengeId,
      status: 'accepted'
    });
    
    // Get language distribution
    const languageStats = await Submission.aggregate([
      { $match: { challenge: challengeId, status: 'accepted' } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Calculate acceptance rate
    const acceptanceRate = totalSubmissions > 0 
      ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) 
      : 0;
    
    res.json({
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
      languageStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;