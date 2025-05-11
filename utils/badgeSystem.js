const User = require('../models/User');
const Badge = require('../models/Badge');
const Submission = require('../models/Submission');

// Check for badges after submission
const checkBadges = async (userId) => {
  const user = await User.findById(userId);
  const newBadges = [];
  
  // Get all submissions for the user
  const submissions = await Submission.find({ 
    user: userId,
    status: 'Accepted'
  }).populate('challenge');
  
  // Get all badges
  const badges = await Badge.find();
  
  // Check first submission badge
  if (submissions.length === 1) {
    const firstBadge = badges.find(b => b.name === 'First Blood');
    if (firstBadge && !user.badges.some(b => b.name === 'First Blood')) {
      user.badges.push({
        name: firstBadge.name,
        description: firstBadge.description,
        earnedAt: new Date()
      });
      newBadges.push(firstBadge.name);
    }
  }
  
  // Check problem count badges
  const problemCounts = {
    total: user.problemsSolved.total,
    easy: user.problemsSolved.easy,
    medium: user.problemsSolved.medium,
    hard: user.problemsSolved.hard
  };
  
  const countBadges = [
    { name: 'Rookie', count: 5, type: 'total' },
    { name: 'Coder', count: 25, type: 'total' },
    { name: 'Veteran', count: 100, type: 'total' },
    { name: 'Easy Master', count: 50, type: 'easy' },
    { name: 'Medium Master', count: 30, type: 'medium' },
    { name: 'Hard Master', count: 10, type: 'hard' }
  ];
  
  for (const countBadge of countBadges) {
    if (
      problemCounts[countBadge.type] >= countBadge.count &&
      !user.badges.some(b => b.name === countBadge.name)
    ) {
      const badge = badges.find(b => b.name === countBadge.name);
      if (badge) {
        user.badges.push({
          name: badge.name,
          description: badge.description,
          earnedAt: new Date()
        });
        newBadges.push(badge.name);
      }
    }
  }
  
  // Check streak badges
  const streakBadges = [
    { name: 'Persistent', count: 3 },
    { name: 'Dedicated', count: 7 },
    { name: 'Unstoppable', count: 30 }
  ];
  
  for (const streakBadge of streakBadges) {
    if (
      user.streak.longest >= streakBadge.count &&
      !user.badges.some(b => b.name === streakBadge.name)
    ) {
      const badge = badges.find(b => b.name === streakBadge.name);
      if (badge) {
        user.badges.push({
          name: badge.name,
          description: badge.description,
          earnedAt: new Date()
        });
        newBadges.push(badge.name);
      }
    }
  }
  
  // Save user with new badges
  await user.save();
  
  return newBadges;
};

// Update user streak
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  
  const now = new Date();
  const lastSubmission = user.streak.lastSubmission;
  
  // Check if this is the first submission or if it's a new day
  if (!lastSubmission) {
    user.streak.current = 1;
    user.streak.longest = 1;
    user.streak.lastSubmission = now;
  } else {
    const lastDate = new Date(lastSubmission);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if submission was yesterday
    if (
      lastDate.getFullYear() === yesterday.getFullYear() &&
      lastDate.getMonth() === yesterday.getMonth() &&
      lastDate.getDate() === yesterday.getDate()
    ) {
      // Streak continues
      user.streak.current += 1;
      user.streak.longest = Math.max(user.streak.current, user.streak.longest);
      user.streak.lastSubmission = now;
    } 
    // Check if submission is from today
    else if (
      lastDate.getFullYear() === now.getFullYear() &&
      lastDate.getMonth() === now.getMonth() &&
      lastDate.getDate() === now.getDate()
    ) {
      // Already solved today, streak unchanged
    } 
    // Otherwise the streak is broken
    else {
      user.streak.current = 1;
      user.streak.lastSubmission = now;
    }
  }
  
  await user.save();
  return user.streak;
};

module.exports = { checkBadges, updateStreak };