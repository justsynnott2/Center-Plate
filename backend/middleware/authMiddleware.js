import { auth } from '../config/firebase.js';
import { getUserById, createUser } from '../services/userService.js';
import logger from '../logger.js';

/**
 * Middleware to verify Firebase token and ensure user exists in database
 */
export const authenticateFirebaseToken = async (req, res, next) => {
    try {
        logger.info('[authMiddleware] Authentication attempt for: %s %s', req.method, req.path);
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('[authMiddleware] No token provided in request');
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        logger.info('[authMiddleware] Token received (length: %d)', token.length);
        
        // Verify Firebase token
        const decodedToken = await auth.verifyIdToken(token);
        const firebaseUid = decodedToken.uid;
        logger.info('[authMiddleware] Token verified for uid: %s', firebaseUid);
        
        // Get user from database; if not found, auto-create silently
        let user = null;
        try {
            user = await getUserById(firebaseUid);
        } catch (_) {
            user = null;
        }

        if (!user) {
            logger.warn('[authMiddleware] User not found in DB, attempting auto-create for uid: %s', firebaseUid);
            try {
                // Fetch profile from Firebase Admin to seed user record
                const firebaseUser = await auth.getUser(firebaseUid);
                const email = firebaseUser.email || 'unknown@example.com';
                const displayName = firebaseUser.displayName || (email ? email.split('@')[0] : null);

                // Generate a candidate username and ensure uniqueness by retrying with suffix
                const base = (displayName || `user_${firebaseUid.slice(-6)}`)
                    .toString()
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9._-]/g, '');

                let candidate = base || `user_${firebaseUid.slice(-6)}`;
                let attempts = 0;
                const maxAttempts = 5;
                while (attempts < maxAttempts) {
                    try {
                        user = await createUser({ _id: firebaseUid, username: candidate, email });
                        logger.info('[authMiddleware] Auto-created user %s for uid: %s', candidate, firebaseUid);
                        break;
                    } catch (e) {
                        if ((e.message || '').includes('Username already taken')) {
                            attempts += 1;
                            const suffix = Math.floor(1000 + Math.random() * 9000); // 4 digits
                            candidate = `${base}-${suffix}`;
                            continue;
                        }
                        // For any other creation error, log and stop auto-create
                        logger.error('[authMiddleware] Failed to auto-create user: %s', e.message);
                        break;
                    }
                }

                if (!user) {
                    logger.warn('[authMiddleware] Auto-create did not complete for uid: %s', firebaseUid);
                    return res.status(401).json({ error: 'User not found' });
                }
            } catch (e) {
                logger.error('[authMiddleware] Error during auto-create: %s', e.message);
                return res.status(401).json({ error: 'User not found' });
            }
        }

        // Add user to request
        req.user = user;
        logger.info('[authMiddleware] User authenticated: %s (uid: %s)', user.email, user._id);
        next();
    } catch (error) {
        logger.error('[authMiddleware] Authentication failed: %s', error.message);
        logger.error('[authMiddleware] Error details:', error);
        return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
}; 