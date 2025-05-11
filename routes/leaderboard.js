const express = require('express');
const router = express.Router();

// Get all leaderboard entries
router.get('/', async (req, res) => {
  try {
    // This is a placeholder - replace with actual database query
    // when you have your database set up
    const leaderboardEntries = [
      { userId: '1', username: 'coder123', score: 2500, rank: 1 },
      { userId: '2', username: 'devmaster', score: 2350, rank: 2 },
      { userId: '3', username: 'jsNinja', score: 2200, rank: 3 },
      { userId: '4', username: 'webWizard', score: 2100, rank: 4 },
      { userId: '5', username: 'techGuru', score: 2000, rank: 5 }
    ];
    
    res.json(leaderboardEntries);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's position on leaderboard
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // This is a placeholder - replace with actual database query
    const userRank = {
      userId,
      username: 'currentUser',
      score: 1800,
      rank: 12
    };
    
    res.json(userRank);
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard for a specific category/challenge
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // This is a placeholder - replace with actual database query
    const categoryLeaderboard = [
      { userId: '1', username: 'coder123', score: 500, rank: 1 },
      { userId: '2', username: 'devmaster', score: 450, rank: 2 },
      { userId: '3', username: 'jsNinja', score: 400, rank: 3 }
    ];
    
    res.json(categoryLeaderboard);
  } catch (error) {
    console.error('Error fetching category leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;