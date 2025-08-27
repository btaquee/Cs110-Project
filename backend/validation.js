const { body, query, param, validationResult } = require('express-validator');

// Middleware to check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: errors.array() 
    });
  }
  next();
};

// Validation rules for user registration
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .escape(),
  handleValidationErrors
];

// Validation rules for user login
const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username is required')
    .escape(),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
    .escape(),
  handleValidationErrors
];

// Validation rules for search queries
const validateSearch = [
  query('query')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape(),
  handleValidationErrors
];

// Validation rules for user retrieval
const validateUserRetrieve = [
  query('username')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Username must be between 1 and 30 characters')
    .escape(),
  handleValidationErrors
];

// Validation rules for review creation
const validateReviewCreation = [
  body('restaurantId')
    .isInt({ min: 1 })
    .withMessage('Restaurant ID must be a positive integer'),
  body('restaurantName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Restaurant name must be between 1 and 100 characters')
    .escape(),
  body('username')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Username must be between 1 and 30 characters')
    .escape(),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .escape(),
  handleValidationErrors
];

// Validation rules for review updates
const validateReviewUpdate = [
  param('reviewId')
    .isInt({ min: 1 })
    .withMessage('Review ID must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .escape(),
  handleValidationErrors
];

// Validation rules for review deletion
const validateReviewDeletion = [
  param('reviewId')
    .isInt({ min: 1 })
    .withMessage('Review ID must be a positive integer'),
  handleValidationErrors
];

// Validation rules for restaurant ID parameters
const validateRestaurantId = [
  param('restaurantId')
    .isInt({ min: 1 })
    .withMessage('Restaurant ID must be a positive integer'),
  handleValidationErrors
];

// Validation rules for username parameters
const validateUsername = [
  param('username')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Username must be between 1 and 30 characters')
    .escape(),
  handleValidationErrors
];

// Validation rules for friend username parameters
const validateFriendUsername = [
  param('friend')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Friend username must be between 1 and 30 characters')
    .escape(),
  handleValidationErrors
];

// Validation rules for user profile updates
const validateProfileUpdate = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Username must be between 1 and 30 characters')
    .escape(),
  body('favRestaurant')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Favorite restaurant must be less than 100 characters')
    .escape(),
  body('favCuisine')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Favorite cuisine must be less than 50 characters')
    .escape(),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateSearch,
  validateUserRetrieve,
  validateReviewCreation,
  validateReviewUpdate,
  validateReviewDeletion,
  validateRestaurantId,
  validateUsername,
  validateFriendUsername,
  validateProfileUpdate,
  handleValidationErrors
};
