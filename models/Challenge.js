const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String
}, { _id: false });

// const testCaseSchema = new mongoose.Schema({
//   input: Array,
//   output: Array,
//   isHidden: {
//     type: Boolean,
//     default: false
//   }
// }, { _id: false });

const testCaseSchema = new mongoose.Schema({
  input: {
    type: [mongoose.Schema.Types.Mixed],
    required: false
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  category: {
    type: String,
    required: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  constraints: [{
    type: String
  }],
  examples: [exampleSchema],
  testCases: [testCaseSchema],
  starterCode: {
    javascript: String,
    python: String,
    java: String
  },
  solution: {
    javascript: String,
    python: String,
    java: String
  },
  timeComplexity: String,
  spaceComplexity: String,
  hints: [String],
  submitCount: {
    type: Number,
    default: 0
  },
  acceptCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  pointsAwarded: {
    type: Number,
    default: function() {
      switch(this.difficulty) {
        case 'Easy': return 10;
        case 'Medium': return 20;
        case 'Hard': return 30;
        default: return 10;
      }
    }
  }
}, {
  timestamps: true
});

// Create a slug from the title before saving
challengeSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  next();
});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;