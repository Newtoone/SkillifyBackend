const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
      },
      password: {
        type: String,
        required: true,
        minlength: 6
      },
      bio: {
        type: String,
        maxlength: 200,
        default: ''
      },
      avatarUrl: {
        type: String,
        default: ''
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
      },
      points: {
        type: Number,
        default: 0
      },
      rank: {
        type: Number,
        default: 0
      },
      problemsSolved: {
        easy: {
          type: Number,
          default: 0
        },
        medium: {
          type: Number,
          default: 0
        },
        hard: {
          type: Number,
          default: 0
        },
        total: {
          type: Number,
          default: 0
        }
      },
      streak: {
        current: {
          type: Number,
          default: 0
        },
        longest: {
          type: Number,
          default: 0
        },
        lastSubmission: {
          type: Date,
          default: null
        }
      },
      badges: [{
        name: String,
        description: String,
        earnedAt: Date
      }],
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }, {
      timestamps: true
    });
    
    // Hash password before saving
    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error);
      }
    });
    
    // Method to compare passwords
    userSchema.methods.comparePassword = async function(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    };
    
    // Serialize user data for JWT and responses
    userSchema.methods.toJSON = function() {
      const user = this.toObject();
      delete user.password;
      return user;
    };
    
    const User = mongoose.model('User', userSchema);
    
module.exports = User;