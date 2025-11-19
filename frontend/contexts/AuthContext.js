import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig.js';
import { login, signup, logout, remove, updateUsername, sendPasswordReset } from '../firebase/authService.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Debug: Check AsyncStorage on mount
	useEffect(() => {
		console.log('[AuthContext] Component mounted, checking AsyncStorage...');
		AsyncStorage.getAllKeys()
			.then(keys => {
				console.log('[AuthContext] AsyncStorage keys:', keys);
				// Look for Firebase-related keys
				const firebaseKeys = keys.filter(k => k.includes('firebase') || k.includes('auth'));
				console.log('[AuthContext] Firebase-related keys:', firebaseKeys);
			})
			.catch(err => {
				console.error('[AuthContext] Failed to read AsyncStorage:', err);
			});
	}, []);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
			console.log('[AuthContext] onAuthStateChanged triggered');
			console.log('[AuthContext] User state:', authUser ? {
				uid: authUser.uid,
				email: authUser.email,
				displayName: authUser.displayName
			} : 'null (logged out)');
			setUser(authUser);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const refreshUser = useCallback(async () => {
		if (!auth.currentUser) return;

		try {
			setLoading(true);
			await auth.currentUser.reload();
			setUser(auth.currentUser);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleSignup = useCallback(async (username, email, password) => {
		try {
			setLoading(true);
			setError(null);
			await signup(email, password, username);
		} catch (error) {
			setError(error.message);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const handleLogin = useCallback(async (email, password) => {
		try {
			setLoading(true);
			setError(null);
			const loggedInUser = await login(email, password);
			setUser(loggedInUser);
		} catch (error) {
			setError(error.message);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const handleLogout = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			await logout();
		} catch (error) {
			setError(error.message);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const handleUpdateUsername = useCallback(async (username) => {
		try {
			setLoading(true);
			setError(null);
			await updateUsername(username);
			await refreshUser();
		} catch (error) {
			setError(error.message);
			throw error;
		} finally {
			setLoading(false);
		}
	}, [refreshUser]);

	const handleDeleteUser = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			await remove();
			setUser(null);
		} catch (error) {
			setError(error.message);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const handleSendPasswordReset = useCallback(async (email) => {
		try {
			setLoading(true);
			setError(null);
			await sendPasswordReset(email);
		} catch (error) {
			setError(error.message);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	return (
		<AuthContext.Provider 
			value={{ 
				user, 
				loading,
				error,
				handleSignup, 
				handleLogin, 
				handleLogout, 
				handleUpdateUsername, 
				handleDeleteUser, 
				handleSendPasswordReset, 
				refreshUser
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
export const useAuth = () => useContext(AuthContext);
