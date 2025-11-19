import { User } from "../models/Users.js";
import logger from "../logger.js";
import { Session } from "../models/Session.js";
import mongoose from 'mongoose';

export async function checkAvailability({ username, email }) {
    try {
        logger.info("Checking availability for username: %s, email: %s", username, email);
        let usernameAvailable = true;
        let emailAvailable = true;

        if (typeof username === 'string' && username.trim().length > 0) {
            const existingUserByUsername = await User.findOne({ username });
            usernameAvailable = !existingUserByUsername;
        }

        if (typeof email === 'string' && email.trim().length > 0) {
            const existingUserByEmail = await User.findOne({ email });
            emailAvailable = !existingUserByEmail;
        }

        return { usernameAvailable, emailAvailable };
    } catch (e) {
        logger.error("Error checking availability: %s", e.message);
        throw new Error("Error checking availability: " + e.message);
    }
}

export async function createUser(userData) {
    try {
        ///logger.info("Creating user with data: %j", userData);
        if (!userData._id || typeof userData._id !== 'string') {
            throw new Error("Invalid user ID format");
        }
        if (!userData.username || typeof userData.username !== 'string') {
            throw new Error("Invalid username format");
        }

        userData.username = userData.username.trim();
        if(userData.username.length < 3){
            throw new Error("Invalid username format");
        }

        if (!userData.email || typeof userData.email !== 'string') {
            throw new Error("Invalid email format");
        }
        
        // Check if username already exists -- ignore casing
        const existingUserByUsername = await User.findOne({username: new RegExp(`^${userData.username}$`, "i")});
        if (existingUserByUsername) {
            throw new Error("Username already taken");
        }
        
        // Check if email already exists -- ignore casing
        const existingUserByEmail = await User.findOne({ email: new RegExp(`^${userData.email}$`, "i") });
        if (existingUserByEmail) {
            throw new Error("Email already registered");
        }
        
        const newUser = new User(userData);
        const savedUser = await newUser.save();
        ///logger.info("User created with id: %s", savedUser._id);
        return savedUser;
    } catch(e) {
        if (e.message === "Invalid user ID format") {
            logger.error("Invalid user ID format: %s", userData._id);
            throw e;
        }
        if (e.message === "Invalid username format") {
            logger.error("Invalid username format: %s", userData.username);
            throw e;
        }
        if (e.message === "Invalid email format") {
            logger.error("Invalid email format: %s", userData.email);
            throw e;
        }
        if (e.message === "Username already taken") {
            logger.error("Username already taken: %s", userData.username);
            throw e;
        }
        if (e.message === "Email already registered") {
            logger.error("Email already registered: %s", userData.email);
            throw e;
        }
        if (e instanceof mongoose.Error.ValidationError) {
            logger.error("Validation error creating user: %s", e.message);
            throw new Error("Invalid user data: " + e.message);
        }
        if (e.code === 11000) {
            // Handle MongoDB duplicate key error
            const field = Object.keys(e.keyPattern)[0];
            if (field === 'username') {
                throw new Error("Username already taken");
            } else if (field === 'email') {
                throw new Error("Email already registered");
            }
            logger.error("Duplicate key error creating user: %s", e.message);
            throw new Error("User already exists");
        }
        logger.error("Error creating user: %s", e.message);
        throw new Error("Error creating user: " + e.message);
    }
}

export async function getAllUsers() {
    try {
        logger.info("Getting all users");
        const users = await User.find({});
        logger.info("Found %d users", users.length);
        return users;
    } catch(e) {
        logger.error("Error getting all users: %s", e.message);
        throw new Error("Error getting all users: " + e.message);
    }
}

export async function getUserById(uid) {
    try {
        logger.info("Getting user by id: %s", uid);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        const user = await User.findById(uid);
        if (!user) {
            throw new Error("User not found");
        }
        logger.info("Found user: %j", user);
        return user;
    } catch(e) {
        if (e.message === "Invalid user ID format") {
            logger.error("Invalid user ID format: %s", uid);
            throw e;
        }
        if (e.message === "User not found") {
            logger.error("User not found with id: %s", uid);
            throw e;
        }
        logger.error("Error getting user by id: %s", e.message);
        throw new Error("Error getting user by id: " + e.message);
    }
}

export async function updateUser(uid, updateData) {
    try {
        logger.info("Updating user with id: %s & updateData: %j", uid, updateData);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        if (updateData.username && typeof updateData.username !== 'string') {
            throw new Error("Invalid username format");
        }
        if (updateData.email && typeof updateData.email !== 'string') {
            throw new Error("Invalid email format");
        }
        
        // Check if username is being updated and if it's already taken by another user
        if (updateData.username) {
            const existingUserByUsername = await User.findOne({ 
                username: updateData.username,
                _id: { $ne: uid } // Exclude current user
            });
            if (existingUserByUsername) {
                throw new Error("Username already taken");
            }
        }
        
        // Check if email is being updated and if it's already taken by another user
        if (updateData.email) {
            const existingUserByEmail = await User.findOne({ 
                email: updateData.email,
                _id: { $ne: uid } // Exclude current user
            });
            if (existingUserByEmail) {
                throw new Error("Email already registered");
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(uid, updateData, { new: true });
        if (!updatedUser) {
            throw new Error("User not found");
        }
        logger.info("User updated: %j", updatedUser);
        return updatedUser;
    } catch(e) {
        if (e.message === "Invalid user ID format") {
            logger.error("Invalid user ID format: %s", uid);
            throw e;
        }
        if (e.message === "Invalid username format") {
            logger.error("Invalid username format: %s", updateData.username);
            throw e;
        }
        if (e.message === "Invalid email format") {
            logger.error("Invalid email format: %s", updateData.email);
            throw e;
        }
        if (e.message === "Username already taken") {
            logger.error("Username already taken: %s", updateData.username);
            throw e;
        }
        if (e.message === "Email already registered") {
            logger.error("Email already registered: %s", updateData.email);
            throw e;
        }
        if (e.message === "User not found") {
            logger.error("User not found with id: %s", uid);
            throw e;
        }
        if (e instanceof mongoose.Error.ValidationError) {
            logger.error("Validation error updating user: %s", e.message);
            throw new Error("Invalid user data: " + e.message);
        }
        if (e.code === 11000) {
            // Handle MongoDB duplicate key error
            const field = Object.keys(e.keyPattern)[0];
            if (field === 'username') {
                throw new Error("Username already taken");
            } else if (field === 'email') {
                throw new Error("Email already registered");
            }
            throw new Error("Duplicate value for unique field");
        }
        logger.error("Error updating user: %s", e.message);
        throw new Error("Error updating user: " + e.message);
    }
}

export async function removeUser(uid) {
    try {
        logger.info("Deleting user with id: %s", uid);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        const deletedUser = await User.findByIdAndDelete(uid);
        if (!deletedUser) {
            throw new Error("User not found");
        }
        logger.info("User deleted: %j", deletedUser);
        return deletedUser;
    } catch(e) {
        if (e.message === "Invalid user ID format") {
            logger.error("Invalid user ID format: %s", uid);
            throw e;
        }
        if (e.message === "User not found") {
            logger.error("User not found with id: %s", uid);
            throw e;
        }
        logger.error("Error deleting user: %s", e.message);
        throw new Error("Error deleting user: " + e.message);
    }
}

export async function addLocation(uid, locationData) {
    try {
        logger.info("locationData", locationData);  

        logger.info("Adding location for user with id: %s", uid);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        if (!locationData || typeof locationData !== 'object') {
            throw new Error("Invalid location data format");
        }
        if (!locationData.coordinates || !locationData.coordinates.latitude || !locationData.coordinates.longitude) {
            throw new Error("Coordinates are required");
        }
        if (!locationData.address || !locationData.address.street || !locationData.address.city || !locationData.address.state || !locationData.address.zipCode) {
            throw new Error("Complete address is required");
        }
        if (locationData.coordinates.latitude < -90 || locationData.coordinates.latitude > 90) {
            throw new Error("Invalid latitude value");
        }
        if (locationData.coordinates.longitude < -180 || locationData.coordinates.longitude > 180) {
            throw new Error("Invalid longitude value");
        }

        const user = await User.findById(uid);
        if (!user) {
            throw new Error("User not found");
        }

        // Create new location object
        const newLocation = {
            coordinates: locationData.coordinates,
            address: locationData.address,
            isDefault: locationData.isDefault || false,
        };

        // If setting as default, unset other default locations
        if (newLocation.isDefault) {
            user.locations.forEach(loc => {
                if (loc.isDefault) {
                    loc.isDefault = false;
                }
            });
        }


        user.locations.push(newLocation);
        const updatedUser = await user.save();
        logger.info("Location added: %j", updatedUser);
        return updatedUser;
    } catch(e) {
        logger.error("Error adding location: %s", e.message);
        throw new Error("Error adding location: " + e.message);
    }
}

export async function updateLocation(uid, locationId, locationData) {
    try {
        logger.info("Updating location for user with id: %s", uid);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        if (!locationId || typeof locationId !== 'string') {
            throw new Error("Invalid location ID format");
        }
        if (!locationData || typeof locationData !== 'object') {
            throw new Error("Invalid location data format");
        }

        const user = await User.findById(uid);
        if (!user) {
            throw new Error("User not found");
        }

        const locationIndex = user.locations.findIndex(loc => loc.id === locationId);
        if (locationIndex === -1) {
            throw new Error("Location not found");
        }

        // If setting as default, unset other default locations
        if (locationData.isDefault) {
            user.locations.forEach(loc => {
                if (loc.isDefault) {
                    loc.isDefault = false;
                }
            });
        }

        // Update location while preserving existing values
        user.locations[locationIndex] = {
            ...user.locations[locationIndex],
            ...locationData,
            id: locationId, // Preserve the original ID
            createdAt: user.locations[locationIndex].createdAt // Preserve original creation date
        };

        const updatedUser = await user.save();
        logger.info("Location updated: %j", updatedUser);
        return updatedUser;
    } catch(e) {
        logger.error("Error updating location: %s", e.message);
        throw new Error("Error updating location: " + e.message);
    }
}

export async function removeLocation(uid, locationId) {
    try {
        logger.info("Removing location for user with id: %s", uid);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        if (!locationId || typeof locationId !== 'string') {
            throw new Error("Invalid location ID format");
        }

        const user = await User.findById(uid);
        if (!user) {
            throw new Error("User not found");
        }

        const locationIndex = user.locations.findIndex(loc => loc.id === locationId);
        if (locationIndex === -1) {
            throw new Error("Location not found");
        }

        // Check if the location is default
        if (user.locations[locationIndex].isDefault) {
            throw new Error("Cannot delete default location");
        }

        user.locations.splice(locationIndex, 1);
        const updatedUser = await user.save();
        logger.info("Location removed: %j", updatedUser);
        return updatedUser;
    } catch(e) {
        logger.error("Error removing location: %s", e.message);
        throw new Error("Error removing location: " + e.message);
    }
}

export async function setDefaultLocation(uid, locationId) {
    try {
        logger.info("Setting default location for user with id: %s", uid);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        if (!locationId || typeof locationId !== 'string') {
            throw new Error("Invalid location ID format");
        }

        const user = await User.findById(uid);
        if (!user) {
            throw new Error("User not found");
        }

        const locationIndex = user.locations.findIndex(loc => loc.id === locationId);
        if (locationIndex === -1) {
            throw new Error("Location not found");
        }

        // Unset all default locations
        user.locations.forEach(loc => {
            loc.isDefault = false;
        });

        // Set the new default location
        user.locations[locationIndex].isDefault = true;

        const updatedUser = await user.save();
        logger.info("Default location set: %j", updatedUser);
        return updatedUser;
    } catch(e) {
        logger.error("Error setting default location: %s", e.message);
        throw new Error("Error setting default location: " + e.message);
    }
}

export async function updatePreferences(uid, preferences) {
    try {
        logger.info("Updating preferences for user with id: %s", uid);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        if (!preferences || typeof preferences !== 'object') {
            throw new Error("Invalid preferences format");
        }
        const user = await User.findById(uid);
        if (!user) {
            throw new Error("User not found");
        }
        console.log('Received preferences:', preferences);
        user.preferences = preferences;
        const updatedUser = await user.save();
        logger.info("Preferences updated: %j", updatedUser);
        return updatedUser;
    } catch(e) {
        if (e.message === "Invalid user ID format") {
            logger.error("Invalid user ID format: %s", uid);
            throw e;
        }
        if (e.message === "Invalid preferences format") {
            logger.error("Invalid preferences format: %j", preferences);
            throw e;
        }
        if (e.message === "User not found") {
            logger.error("User not found with id: %s", uid);
            throw e;
        }
        if (e instanceof mongoose.Error.ValidationError) {
            logger.error("Validation error updating preferences: %s", e.message);
            throw new Error("Invalid preferences data: " + e.message);
        }
        logger.error("Error updating preferences: %s", e.message);
        throw new Error("Error updating preferences: " + e.message);
    }
}

export async function updatePushToken(uid, pushToken) {
    try {
        logger.info("Updating push token for user with id: %s", uid);
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        if (!pushToken || typeof pushToken !== 'string') {
            throw new Error("Invalid push token format");
        }
        const user = await User.findById(uid);
        if (!user) {
            throw new Error("User not found");
        }
        user.pushToken = pushToken;
        const updatedUser = await user.save();
        logger.info("Push token updated: %j", updatedUser);
        return updatedUser;
    } catch(e) {
        if (e.message === "Invalid user ID format") {
            logger.error("Invalid user ID format: %s", uid);
            throw e;
        }
        if (e.message === "Invalid push token format") {
            logger.error("Invalid push token format: %s", pushToken);
            throw e;
        }
        if (e.message === "User not found") {
            logger.error("User not found with id: %s", uid);
            throw e;
        }
        logger.error("Error updating push token: %s", e.message);
        throw new Error("Error updating push token: " + e.message);
    }
}

export async function searchUsers(query) {
    try {
        logger.info("Searching users with query: %s", query);
        if (!query || typeof query !== 'string') {
            throw new Error("Invalid search query format");
        }
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        });
        logger.info("Found %d users", users.length);
        return users;
    } catch(e) {
        if (e.message === "Invalid search query format") {
            logger.error("Invalid search query format: %s", query);
            throw e;
        }
        logger.error("Error searching users: %s", e.message);
        throw new Error("Error searching users: " + e.message);
    }
}

export async function acceptInvite(sessionId, uid) {
    try {
        logger.info("Accepting invite for session: %s, user: %s", sessionId, uid);
        if (!sessionId || typeof sessionId !== 'string') {
            throw new Error("Invalid session ID format");
        }
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        const session = await Session.findById(sessionId);
        if (!session) {
            throw new Error("Session not found");
        }
        const participant = session.participants.find(p => p.user === uid);
        if (!participant) {
            throw new Error("Participant not found in session");
        }
        participant.invitation = 'accepted';
        const updatedSession = await session.save();
        await updatedSession.populate('participants.user');
        logger.info("Invite accepted: %j", updatedSession);
        return updatedSession;
    } catch(e) {
        if (e.message === "Invalid session ID format") {
            logger.error("Invalid session ID format: %s", sessionId);
            throw e;
        }
        if (e.message === "Invalid user ID format") {
            logger.error("Invalid user ID format: %s", uid);
            throw e;
        }
        if (e.message === "Session not found") {
            logger.error("Session not found with id: %s", sessionId);
            throw e;
        }
        if (e.message === "Participant not found in session") {
            logger.error("Participant not found in session: %s", uid);
            throw e;
        }
        logger.error("Error accepting invite: %s", e.message);
        throw new Error("Error accepting invite: " + e.message);
    }
}

export async function rejectInvite(sessionId, uid) {
    try {
        logger.info("Rejecting invite for session: %s, user: %s", sessionId, uid);
        if (!sessionId || typeof sessionId !== 'string') {
            throw new Error("Invalid session ID format");
        }
        if (!uid || typeof uid !== 'string') {
            throw new Error("Invalid user ID format");
        }
        const session = await Session.findById(sessionId);
        if (!session) {
            throw new Error("Session not found");
        }
        const participant = session.participants.find(p => p.user === uid);
        if (!participant) {
            throw new Error("Participant not found in session");
        }
        participant.invitation = 'rejected';
        const updatedSession = await session.save();
        await updatedSession.populate('participants.user');
        logger.info("Invite rejected: %j", updatedSession);
        return updatedSession;
    } catch(e) {
        if (e.message === "Invalid session ID format") {
            logger.error("Invalid session ID format: %s", sessionId);
            throw e;
        }
        if (e.message === "Invalid user ID format") {
            logger.error("Invalid user ID format: %s", uid);
            throw e;
        }
        if (e.message === "Session not found") {
            logger.error("Session not found with id: %s", sessionId);
            throw e;
        }
        if (e.message === "Participant not found in session") {
            logger.error("Participant not found in session: %s", uid);
            throw e;
        }
        logger.error("Error rejecting invite: %s", e.message);
        throw new Error("Error rejecting invite: " + e.message);
    }
}