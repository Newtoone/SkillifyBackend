const Joi = require('joi');

// Validate user registration
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

// Validate user login
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

// Validate challenge creation
const validateChallenge = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    constraints: Joi.array().items(Joi.string()),
    examples: Joi.array().items(Joi.object({
      input: Joi.string().required(),
      output: Joi.string().required(),
      explanation: Joi.string()
    })),
    testCases: Joi.array().items(Joi.object({
      input: Joi.string().required(),
      output: Joi.string().required(),
      isHidden: Joi.boolean()
    })),
    starterCode: Joi.object({
      javascript: Joi.string(),
      python: Joi.string(),
      java: Joi.string()
    }),
    solution: Joi.object({
      javascript: Joi.string(),
      python: Joi.string(),
      java: Joi.string()
    }),
    timeComplexity: Joi.string(),
    spaceComplexity: Joi.string(),
    hints: Joi.array().items(Joi.string()),
    isPublished: Joi.boolean()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

// Validate submission
const validateSubmission = (req, res, next) => {
  const schema = Joi.object({
    challengeId: Joi.string().required(),
    code: Joi.string().required(),
    language: Joi.string().valid('javascript', 'python', 'java').required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChallenge,
  validateSubmission
};