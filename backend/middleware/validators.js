import { body, param, query, validationResult } from 'express-validator';

// Validation result middleware
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// User validation schemas
export const userValidators = {
    checkAvailability: [
        // At least one of username or email must be present
        query('username')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage('Username must be a non-empty string'),
        query('email')
            .optional()
            .isEmail()
            .withMessage('Email must be valid')
            .normalizeEmail(),
        (req, res, next) => {
            const { username, email } = req.query;
            if (!username && !email) {
                return res.status(400).json({
                    error: 'Validation Error',
                    details: 'Provide username and/or email to check availability'
                });
            }
            next();
        },
        validate
    ],
    createUser: [
        body('_id')
            .isString()
            .withMessage('User ID is required'),
        body('username')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Username must be between 2 and 50 characters'),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('preferences')
            .optional()
            .isObject()
            .withMessage('Preferences must be an object'),
        body('preferences.dietaryValue')
            .optional()
            .isString()
            .withMessage('Dietary preference must be a string'),
        body('preferences.priceValue')
            .optional()
            .isString()
            .withMessage('Price preference must be a string'),
        body('preferences.cuisineValue')
            .optional()
            .isString()
            .withMessage('Cuisine preference must be a string'),
        body('preferences.includeParking')
            .optional()
            .isBoolean()
            .withMessage('Include parking must be a boolean'),
        body('preferences.includeTransport')
            .optional()
            .isBoolean()
            .withMessage('Include transport must be a boolean'),
        body('locations')
            .optional()
            .isArray()
            .withMessage('Locations must be an array'),
        body('locations.*.latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('locations.*.longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),
        body('pushToken')
            .optional()
            .isString()
            .withMessage('Push token must be a string'),
        validate
    ],
    
    updateUser: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        body('username')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Username must be between 2 and 50 characters'),
        body('email')
            .optional()
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('preferences')
            .optional()
            .isObject()
            .withMessage('Preferences must be an object'),
        body('preferences.dietaryValue')
            .optional()
            .isString()
            .withMessage('Dietary preference must be a string'),
        body('preferences.priceValue')
            .optional()
            .isString()
            .withMessage('Price preference must be a string'),
        body('preferences.cuisineValue')
            .optional()
            .isString()
            .withMessage('Cuisine preference must be a string'),
        body('preferences.includeParking')
            .optional()
            .isBoolean()
            .withMessage('Include parking must be a boolean'),
        body('preferences.includeTransport')
            .optional()
            .isBoolean()
            .withMessage('Include transport must be a boolean'),
        body('pushToken')
            .optional()
            .isString()
            .withMessage('Push token must be a string'),
        validate
    ],

    removeUser: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        validate
    ],

    searchUsers: [
        query('q')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage('Search query must be at least 1 character'),
        validate
    ],

    addLocation: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),

        body('address')
            .isObject()
            .withMessage('Address must be an object'),

        body('address.street')
            .trim()
            .isLength({ min: 5, max: 100 })
            .withMessage('Street address must be between 5 and 100 characters'),

        body('address.city')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('City must be between 2 and 50 characters'),

        body('address.state')
            .trim()
            .isLength({ min: 2, max: 2 })
            .withMessage('State must be a 2-letter code'),

        body('address.zipCode')
            .trim()
            .matches(/^\d{5}(-\d{4})?$/)
            .withMessage('Invalid ZIP code format'),

        body('coordinates')
            .isObject()
            .withMessage('Coordinates must be an object'),

        body('coordinates.latitude')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),

        body('coordinates.longitude')
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),

        body('isDefault')
            .optional()
            .isBoolean()
            .withMessage('isDefault must be a boolean'),

        validate
    ],

    updateLocation: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        param('locationId')
            .isString()
            .withMessage('Invalid location ID'),
        
        body('address')
            .optional()
            .isObject()
            .withMessage('Address must be an object'),

        body('address.street')
            .optional()
            .trim()
            .isLength({ min: 5, max: 100 })
            .withMessage('Street address must be between 5 and 100 characters'),

        body('address.city')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('City must be between 2 and 50 characters'),

        body('address.state')
            .optional()
            .trim()
            .isLength({ min: 2, max: 2 })
            .withMessage('State must be a 2-letter code'),

        body('address.zipCode')
            .optional()
            .trim()
            .matches(/^\d{5}(-\d{4})?$/)
            .withMessage('Invalid ZIP code format'),

        body('coordinates')
            .optional()
            .isObject()
            .withMessage('Coordinates must be an object'),

        body('coordinates.latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),

        body('coordinates.longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),

        body('isDefault')
            .optional()
            .isBoolean()
            .withMessage('isDefault must be a boolean'),
        validate
    ],

    removeLocation: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        param('locationId')
            .isString()
            .withMessage('Invalid location ID'),
        validate
    ],

    setDefaultLocation: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        param('locationId')
            .isString()
            .withMessage('Invalid location ID'),
        validate
    ],

    updatePreferences: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        body('preferences')
            .isObject()
            .withMessage('Preferences must be an object'),
        body('preferences.dietaryValue')
            .optional()
            .isString()
            .withMessage('Dietary preference must be a string'),
        body('preferences.priceValue')
            .optional()
            .isString()
            .withMessage('Price preference must be a string'),
        body('preferences.cuisineValue')
            .optional()
            .isString()
            .withMessage('Cuisine preference must be a string'),
        body('preferences.includeParking')
            .optional()
            .isBoolean()
            .withMessage('Include parking must be a boolean'),
        body('preferences.includeTransport')
            .optional()
            .isBoolean()
            .withMessage('Include transport must be a boolean'),
        validate
    ],

    updatePushToken: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        body('pushToken')
            .isString()
            .withMessage('Push token is required'),
        validate
    ],

    getUserById: [
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        validate
    ]
};

// Session validation schemas
export const sessionValidators = {
    createSession: [
        body('name')
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage('Name must be between 3 and 100 characters'),
        body('created_by')
            .optional()
            .isString()
            .withMessage('Creator ID is required'),
        body('participants')
            .optional()
            .isArray()
            .withMessage('Participants must be an array'),
        body('participants.*.user')
            .optional()
            .isString()
            .withMessage('Participant user ID is required'),
        body('participants.*.invitation')
            .optional()
            .isIn(['pending', 'accepted', 'rejected'])
            .withMessage('Invalid invitation status'),
        body('participants.*.role')
            .optional()
            .isIn(['admin', 'participant'])
            .withMessage('Invalid participant role'),   
        body('participants.*.location')
            .optional()
            .isObject()
            .withMessage('Location must be an object'),
        body('participants.*.location.latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('participants.*.location.longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),
        body('status')
            .optional()
            .isIn(['waiting', 'voting', 'finished'])
            .withMessage('Invalid session status'),
        body('preferences')
            .optional()
            .isObject()
            .withMessage('Preferences must be an object'),
        body('preferences.dietaryValue')
            .optional()
            .isString()
            .withMessage('Dietary preference must be a string'),
        body('preferences.priceValue')
            .optional()
            .isString()
            .withMessage('Price preference must be a string'),
        body('preferences.cuisineValue')
            .optional()
            .isString()
            .withMessage('Cuisine preference must be a string'),
        body('preferences.includeParking')
            .optional()
            .isBoolean()
            .withMessage('Include parking must be a boolean'),
        body('preferences.includeTransport')
            .optional()
            .isBoolean()
            .withMessage('Include transport must be a boolean'),
        validate
    ],
    
    updateSession: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage('Name must be between 3 and 100 characters'),
        body('participants')
            .optional()
            .isArray()
            .withMessage('Participants must be an array'),
        body('participants.*.user')
            .optional()
            .isString()
            .withMessage('Participant user ID is required'),
        body('participants.*.invitation')
            .optional()
            .isIn(['pending', 'accepted', 'rejected'])
            .withMessage('Invalid invitation status'),
        body('participants.*.role')
            .optional()
            .isIn(['admin', 'participant'])
            .withMessage('Invalid participant role'),
        body('participants.*.location')
            .optional()
            .isObject()
            .withMessage('Location must be an object'),
        body('participants.*.location.latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('participants.*.location.longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),  
        body('status')
            .optional()
            .isIn(['waiting', 'voting', 'finished'])
            .withMessage('Invalid session status'),
        body('preferences')
            .optional()
            .isObject()
            .withMessage('Preferences must be an object'),
        body('preferences.dietaryValue')
            .optional()
            .isString()
            .withMessage('Dietary preference must be a string'),
        body('preferences.priceValue')
            .optional()
            .isString()
            .withMessage('Price preference must be a string'),
        body('preferences.cuisineValue')
            .optional()
            .isString()
            .withMessage('Cuisine preference must be a string'),
        body('preferences.includeParking')
            .optional()
            .isBoolean()
            .withMessage('Include parking must be a boolean'),
        body('preferences.includeTransport')
            .optional()
            .isBoolean()
            .withMessage('Include transport must be a boolean'),
        validate
    ],

    removeSession: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        validate
    ],

    updateSessionStatus: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        body('status')
            .isIn(['waiting', 'voting', 'finished'])
            .withMessage('Invalid session status'),
        validate
    ],

    addParticipant: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        body('location')
            .optional()
            .isObject()
            .withMessage('Location must be an object'),
        body('location.latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('location.longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),
        body('role')
            .optional()
            .isIn(['admin', 'participant'])
            .withMessage('Invalid participant role'),
        validate
    ],

    removeParticipant: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        validate
    ],

    updateParticipantRole: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),

        body('role')
            .isIn(['admin', 'participant'])
            .withMessage('Invalid participant role'),
        validate
    ],

    updateParticipantLocation: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        body('location')
            .isObject()
            .withMessage('Location must be an object'),
        body('location.latitude')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('location.longitude')
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),
        validate
    ],

    updateSessionPreference: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        body('preferences')
            .isObject()
            .withMessage('Preferences must be an object'),
        body('preferences.dietaryValue')
            .optional()
            .isString()
            .withMessage('Dietary preference must be a string'),
        body('preferences.priceValue')
            .optional()
            .isString()
            .withMessage('Price preference must be a string'),
        body('preferences.cuisineValue')
            .optional()
            .isString()
            .withMessage('Cuisine preference must be a string'),
        body('preferences.includeParking')
            .optional()
            .isBoolean()
            .withMessage('Include parking must be a boolean'),
        body('preferences.includeTransport')
            .optional()
            .isBoolean()
            .withMessage('Include transport must be a boolean'),
        validate
    ],
    addRestaurants: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        body('restaurants')
            .isArray()
            .withMessage('Restaurants must be an array'),
        body('restaurants.*.rid')
            .isString()
            .withMessage('Restaurant ID is required'),
        body('restaurants.*.name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Restaurant name must be between 2 and 100 characters'),
        body('restaurants.*.address')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Restaurant address must be between 2 and 100 characters'),
        body('restaurants.*.images')
            .optional()
            .isArray()
            .withMessage('Images must be an array'),
        body('restaurants.*.images.*')
            .optional()
            .isString()
            .isURL()
            .withMessage('Image URL must be a valid URL'),
        body('restaurants.*.coordinates')
            .isArray()
            .withMessage('Coordinates must be an array'),
        body('restaurants.*.coordinates.*')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('restaurants.*.categories')
            .optional()
            .isArray()
            .withMessage('Categories must be an array'),
        body('restaurants.*.categories.*')
            .optional()
            .isString()
            .withMessage('Category must be a string'),  
        body('restaurants.*.votes')
            .optional()
            .isArray()
            .withMessage('Votes must be an array'),
        body('restaurants.*.votes.*')
            .optional()
            .isString()
            .withMessage('Vote must be a string'),
        validate
    ],

    addRestaurant: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        body('rid')
            .isString()
            .withMessage('Restaurant ID is required'),
        body('name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Restaurant name must be between 2 and 100 characters'),
        body('address')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Restaurant address must be between 2 and 100 characters'),
        body('images')
            .optional()
            .isArray()
            .withMessage('Images must be an array'),
        body('images.*')
            .optional()
            .isString()
            .isURL()
            .withMessage('Image URL must be a valid URL'),
        body('coordinates')
            .isArray()
            .withMessage('Coordinates must be an array'),
        body('coordinates.*')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('categories')
            .optional()
            .isArray()
            .withMessage('Categories must be an array'),
        body('categories.*')
            .optional()
            .isString()
            .withMessage('Category must be a string'),
        body('votes')
            .optional()
            .isArray()
            .withMessage('Votes must be an array'),
        body('votes.*')
            .optional()
            .isString()
            .withMessage('Vote must be a string'),
    
        validate
    ],

    voteOnRestaurant: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        param('rid')
            .isString()
            .withMessage('Invalid restaurant ID'),
        body('uid')
            .isString()
            .withMessage('User ID is required'),
        validate
    ],

    handleInvite: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        param('uid')
            .isString()
            .withMessage('Invalid user ID'),
        validate
    ],

    getSessionById: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        validate
    ],

    updateMidpoint: [
        param('sessionId')
            .isString()
            .withMessage('Invalid session ID'),
        body('midpoint')
            .isObject() 
            .withMessage('Midpoint must be an object'),
        body('midpoint.latitude')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('midpoint.longitude')
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),
        validate
    ]

};

// Midpoint validation schemas
export const midpointValidators = {
    calculateMidpoint: [
        body('coordinates')
            .isArray({ min: 2 })
            .withMessage('At least 2 coordinates are required'),
        body('coordinates.*')
            .isArray()
            .withMessage('Each coordinate must be an array'),
        body('coordinates.*.0')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),
        body('coordinates.*.1')
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),
        body('filters')
            .optional()
            .isArray()
            .withMessage('Filters must be an array'),
        body('filters.*')
            .optional()
            .isArray()
            .withMessage('Each filter must be an array'),
        body('options')
            .optional()
            .isObject()
            .withMessage('Options must be an object'),
        body('options.minAcceptableScore')
            .optional()
            .isInt({ min: 0, max: 100 })
            .withMessage('Minimum acceptable score must be between 0 and 100'),
        body('options.minRestaurantCount')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Minimum restaurant count must be at least 1'),
        validate
    ],

    getPlaceImages: [
        param('id')
            .isString()
            .withMessage('Invalid place ID'),
        validate
    ]
}; 