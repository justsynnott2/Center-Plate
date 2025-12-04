import express from 'express';
import {
  createUserController,
  checkAvailabilityController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  removeUserController,
  updateLocationController,
  addLocationController,
  removeLocationController,
  updatePreferencesController,
  updatePushTokenController,
  searchUsersController,
  setDefaultLocationController
} from '../controllers/userControllers.js';

import {
  getAllAcceptedSessionsByUserController,
  getAllPendingSessionsByUserController,
  getAllSessionsByUserController
} from '../controllers/sessionControllers.js';

import { authenticateFirebaseToken } from '../middleware/authMiddleware.js';
import { userValidators } from '../middleware/validators.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/availability', userValidators.checkAvailability, checkAvailabilityController);
router.post('/', userValidators.createUser, createUserController);

// Apply auth middleware to all routes after this point
router.use(authenticateFirebaseToken);


// Search users
router.get('/search', userValidators.searchUsers, searchUsersController);

// User management routes
router.get('/', getAllUsersController);
router.get('/:uid', userValidators.getUserById, getUserByIdController);
router.patch('/:uid', userValidators.updateUser, updateUserController);
router.delete('/:uid', userValidators.removeUser, removeUserController);

// Location management routes
router.post('/:uid/locations', userValidators.addLocation, addLocationController);
router.patch('/:uid/locations/:locationId', userValidators.updateLocation, updateLocationController);
router.delete('/:uid/locations/:locationId', userValidators.removeLocation, removeLocationController);
router.patch('/:uid/locations/:locationId/default', userValidators.setDefaultLocation, setDefaultLocationController);

// User preferences and settings
router.patch('/:uid/preferences', userValidators.updatePreferences, updatePreferencesController);
router.patch('/:uid/pushToken', userValidators.updatePushToken, updatePushTokenController);

// User sessions
router.get('/:uid/sessions', getAllSessionsByUserController);
router.get('/:uid/sessions/accepted', getAllAcceptedSessionsByUserController);
router.get('/:uid/sessions/pending', getAllPendingSessionsByUserController);


export default router;