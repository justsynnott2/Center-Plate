import {
    createUser,
    checkAvailability,
    getAllUsers,
    getUserById,
    updateUser,
    removeUser,
    addLocation,
    updateLocation,
    removeLocation,
    updatePreferences,
    updatePushToken,
    searchUsers,
    acceptInvite,
    rejectInvite,
    setDefaultLocation
} from '../services/userService.js';
import logger from '../logger.js';

export async function checkAvailabilityController(req, res) {
    try {
        const { username = '', email = '' } = req.query;
        const result = await checkAvailability({ username, email });
        return res.status(200).json(result);
    } catch (e) {
        logger.error("Error in checkAvailabilityController: %s", e.message);
        return res.status(500).json({
            error: "Internal Server Error",
            details: e.message
        });
    }
}

export async function createUserController(req, res) {
    try {
        const userData = req.body;
        const user = await createUser(userData);
        res.status(201).json(user);
    } catch (e) {
        logger.error("Error in createUserController: %s", e.message);
        if (e.message === "Username already taken" || e.message === "Email already registered") {
            return res.status(409).json({ 
                error: "Conflict",
                details: e.message 
            });
        }
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function getAllUsersController(req, res) {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (e) {
        logger.error("Error in getAllUsersController: %s", e.message);
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function getUserByIdController(req, res) {
    try {
        const { uid } = req.params;
        const user = await getUserById(uid);
        if (!user) {
            return res.status(404).json({ 
                error: "Not Found",
                details: "User not found" 
            });
        }
        res.status(200).json(user);
    } catch (e) {
        logger.error("Error in getUserByIdController: %s", e.message);
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function updateUserController(req, res) {
    try {
        const { uid } = req.params;
        const updateData = req.body;
        const user = await updateUser(uid, updateData);
        if (!user) {
            return res.status(404).json({ 
                error: "Not Found",
                details: "User not found" 
            });
        }
        res.status(200).json(user);
    } catch (e) {
        logger.error("Error in updateUserController: %s", e.message);
        if (e.message === "Username already taken" || e.message === "Email already registered") {
            return res.status(409).json({ 
                error: "Conflict",
                details: e.message 
            });
        }
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function removeUserController(req, res) {
    try {
        const { uid } = req.params;
        const user = await removeUser(uid);
        if (!user) {
            return res.status(404).json({ 
                error: "Not Found",
                details: "User not found" 
            });
        }
        res.status(200).json(user);
    } catch (e) {
        logger.error("Error in removeUserController: %s", e.message);
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function updateLocationController(req, res) {
    try {
        const { uid, locationId } = req.params;
        const locationData = req.body;
        const user = await updateLocation(uid, locationId, locationData);
        res.status(200).json(user);
    } catch (e) {
        logger.error("Error in updateLocationController: %s", e.message);
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function addLocationController(req, res) {
    try {
        const { uid } = req.params;
        const locationData = req.body;
        logger.info("locationData", locationData);  

        const user = await addLocation(uid, locationData);
        res.status(201).json(user);
    } catch (e) {
        logger.error("Error in addLocationController: %s", e.message);
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function removeLocationController(req, res) {
    try {
        const { uid, locationId } = req.params;
        const user = await removeLocation(uid, locationId);
        res.status(200).json(user);
    } catch (e) {
        logger.error("Error in removeLocationController: %s", e.message);
        if (e.message === "Cannot delete default location") {
            return res.status(400).json({ 
                error: "Cannot delete default location",
                details: e.message 
            });
        }
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function updatePreferencesController(req, res) {
    try {
        const { uid } = req.params;
        const { preferences } = req.body;
        console.log('Received preferences:', preferences);
        const user = await updatePreferences(uid, preferences);
        if (!user) {
            return res.status(404).json({ 
                error: "Not Found",
                details: "User not found" 
            });
        }
        res.status(200).json(user);
    } catch (e) {
        logger.error("Error in updatePreferencesController: %s", e.message);
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function updatePushTokenController(req, res) {
    try {
        const { uid } = req.params;
        const { pushToken } = req.body;
        const user = await updatePushToken(uid, pushToken);
        if (!user) {
            return res.status(404).json({ 
                error: "Not Found",
                details: "User not found" 
            });
        }
        res.status(200).json(user);
    } catch (e) {
        logger.error("Error in updatePushTokenController: %s", e.message);
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function searchUsersController(req, res) {
    try {
        const { query } = req.query;
        
        const users = await searchUsers(query);
        res.status(200).json(users);
    } catch (e) {
        logger.error("Error in searchUsersController: %s", e.message);
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function acceptInviteController(req, res) {
    try {
        const { sessionId, uid } = req.params;
        const session = await acceptInvite(sessionId, uid);
        if (!session) {
            return res.status(404).json({ 
                error: "Not Found",
                details: "Session not found" 
            });
        }
        req.io.to(sessionId).emit('participantAccepted', session);
        res.status(200).json(session);
    } catch (e) {
        logger.error("Error in acceptInviteController: %s", e.message);
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function rejectInviteController(req, res) {
    try {
        const { sessionId, uid } = req.params;
        const session = await rejectInvite(sessionId, uid);
        if (!session) {
            return res.status(404).json({ 
                error: "Not Found",
                details: "Session not found" 
            });
        }
        res.status(200).json(session);
    } catch (e) {
        logger.error("Error in rejectInviteController: %s", e.message);
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}

export async function setDefaultLocationController(req, res) {
    try {
        const { uid, locationId } = req.params;
        const user = await setDefaultLocation(uid, locationId);
        res.status(200).json(user);
    } catch (e) {
        logger.error("Error in setDefaultLocationController: %s", e.message);
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation Error",
                details: e.message 
            });
        }
        res.status(500).json({ 
            error: "Internal Server Error",
            details: e.message 
        });
    }
}