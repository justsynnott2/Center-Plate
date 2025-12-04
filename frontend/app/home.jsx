import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Icon from 'react-native-vector-icons/FontAwesome';
import UserService from '../services/userService';
import { useSocket } from '../hooks/useSocket';

export default function Home() {
	const router = useRouter();
	const { user } = useAuth();
	const { subscribe, joinRoom, leaveRoom, isConnected, isInitialized } = useSocket();
	const [sessions, setSessions] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [refreshing, setRefreshing] = useState(true);
	const [error, setError] = useState(null);

	// Socket event handlers
	useEffect(() => {
		if (!user || !isInitialized) {
			console.log('Waiting for user or socket initialization...');
			return;
		}

		if (!isConnected) {
			console.log('Waiting for socket connection...');
			return;
		}

		console.log('Setting up socket events for user:', user.uid);

		// Join user's room for personal updates
		joinRoom(user.uid);
		console.log('Joined user room:', user.uid);

		// Subscribe to session events
		const unsubscribeNewSession = subscribe('sessionCreated', (newSession) => {
			console.log('Received sessionCreated event:', newSession._id);
			// Check if the user is a participant in the new session
			if (newSession.participants?.some(p => p.user._id === user.uid)) {
				console.log('User is a participant in new session');
				setSessions(prevSessions => {
					// Check if session already exists
					if (prevSessions.some(s => s._id === newSession._id)) {
						console.log('Session already exists, skipping');
						return prevSessions;
					}
					console.log('Adding new session to list');
					return [newSession, ...prevSessions];
				});
			} else {
				console.log('User is not a participant in new session');
			}
		});

		const unsubscribeSessionRemoved = subscribe('sessionDeleted', (removedSession) => {
			console.log('Received sessionDeleted event:', removedSession._id);
			setSessions(prevSessions => 
				prevSessions.filter(session => session._id !== removedSession._id)
			);
		});

		// Cleanup subscriptions and room when component unmounts
		return () => {
			console.log('Cleaning up socket subscriptions');
			leaveRoom(user.uid);
			unsubscribeNewSession();
			unsubscribeSessionRemoved();
		};
	}, [user, subscribe, joinRoom, leaveRoom, isConnected, isInitialized]);

	const fetchSessions = useCallback(async () => {
		try {
			const sessions = await UserService.getSessions(user.uid);
			setSessions(sessions);
		} catch (error) {
			console.error('Error fetching sessions:', error.message);
			// Suppress "User not found" errors - backend will auto-create user on next request
			if (error.message && error.message.toLowerCase().includes('user not found')) {
				console.warn('[Home] User not found error suppressed, setting empty sessions');
				setSessions([]);
			} else {
				setError(error.message);
			}
		} finally {
			setRefreshing(false);
		}
	}, [user]);

	useEffect(() => {
		if (!user) return;
		fetchSessions();
	}, [fetchSessions, user]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchSessions();
	}, [fetchSessions]);

	
	const filteredSessions = useMemo(() => {
		if (!searchText.trim()) {
			return sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
		}

		const searchLower = searchText.toLowerCase();
		return sessions
			.filter(session => 
				session.name.toLowerCase().includes(searchLower) ||
				session.participants?.some(participant => 
					participant.name?.toLowerCase().includes(searchLower)
				)
			)
			.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	}, [searchText, sessions]);

	const handleCreateSession = useCallback(() => {
		router.push('/session/create');
	}, [router]);

	const handleSessionPress = useCallback((sessionId) => {
		router.push(`/session/${sessionId}`);
	}, [router]);

	const handleClearSearch = useCallback(() => {
		setSearchText('');
	}, []);

	const SessionCard = useCallback(({ session, onPress }) => (
		<Pressable
			key={session._id}
			onPress={() => onPress(session._id)}
			style={({ pressed }) => [
				styles.sessionCard,
				pressed && styles.sessionCardPressed
			]}
		>
			<View style={styles.sessionInfo}>
				<Text style={styles.sessionName}>
					{session.name}
				</Text>
				<View style={styles.sessionDetails}>
					<View style={styles.detailItem}>
						<Icon name="users" size={16} color={theme.colors.text.secondary} />
						<Text style={styles.detailText}>
							{session.participants?.length || 0} participants
						</Text>
					</View>
					<View style={styles.detailItem}>
						<Icon name="clock-o" size={16} color={theme.colors.text.secondary} />
						<Text style={styles.detailText}>
							{new Date(session.created_at).toLocaleDateString()}
						</Text>
					</View>
				</View>
			</View>
			<Icon
				name="chevron-right"
				size={20}
				color={theme.colors.text.secondary}
				style={styles.chevron}
			/>
		</Pressable>
	), []);

	if (refreshing && !sessions.length) {
		return <Loading fullScreen />;
	}

	if (error) {
		return (
			<View style={styles.container}>
				<Header
					title="Error"
					variant="secondary"
					style={styles.header}
				/>
				<View style={styles.errorContainer}>
					<Icon name="exclamation-circle" size={48} color={theme.colors.status.error} />
					<Text style={styles.errorText}>{error}</Text>
					<Button
						title="Try Again"
						onPress={() => router.replace('/home')}
						variant="primary"
					/>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Header
				title="My Sessions"
				variant="primary"
				style={styles.header}
			/>

			<View style={styles.content}>
				<ScrollView 
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					stickyHeaderIndices={[1]}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							colors={[theme.colors.primary.main]}
							progressBackgroundColor={theme.colors.background.paper}
						/>
					}
				>
					<View style={styles.actionsContainer}>
						<Button
							title="Create Session"
							onPress={handleCreateSession}
							icon="plus"
							variant="primary"
							fullWidth
							style={styles.createButton}
						/>
					</View>

					<View style={styles.stickyHeader}>
						<View style={styles.headerContent}>
							<View style={styles.sectionHeader}>
								<Icon name="users" size={24} color={theme.colors.primary.main} />
								<Text style={styles.sectionTitle}>All Sessions</Text>
							</View>

							<View style={styles.searchContainer}>
								<Icon name="search" size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
								<TextInput
									style={styles.searchInput}
									placeholder="Search sessions..."
									value={searchText}
									onChangeText={setSearchText}
									placeholderTextColor={theme.colors.text.secondary}
								/>
								{searchText.length > 0 && (
									<Pressable onPress={handleClearSearch} style={styles.clearButton}>
										<Icon name="times-circle" size={20} color={theme.colors.text.secondary} />
									</Pressable>
								)}
							</View>
						</View>
					</View>

					{filteredSessions?.length > 0 ? (
						<View style={styles.sessionsList}>
							{filteredSessions.map((session) => (
								<SessionCard
									key={session._id}
									session={session}
									onPress={handleSessionPress}
								/>
							))}
						</View>
					) : (
						<View style={styles.emptyContainer}>
							<Icon 
								name={searchText ? "search" : "users"} 
								size={48} 
								color={theme.colors.text.secondary} 
							/>
							<Text style={styles.emptyText}>
								{searchText 
									? "No sessions found matching your search."
									: "No sessions yet. Create or join a session to get started!"
								}
							</Text>
						</View>
					)}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background.default,
	},
	header: {
		borderBottomLeftRadius: theme.borderRadius.lg,
		borderBottomRightRadius: theme.borderRadius.lg,
		...theme.shadows.md,
	},
	content: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: theme.spacing.lg,
		paddingBottom: 80,
	},
	actionsContainer: {
		marginBottom: theme.spacing.lg,
	},
	createButton: {
		...theme.shadows.md,
	},
	stickyHeader: {
		backgroundColor: theme.colors.background.default,
		paddingBottom: theme.spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border.light,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: theme.spacing.sm,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.sm,
		paddingVertical: theme.spacing.sm,
		flex: 1,
	},
	sectionTitle: {
		fontSize: theme.typography.fontSize.lg,
		fontWeight: theme.typography.fontWeight.bold,
		color: theme.colors.text.primary,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.background.paper,
		borderRadius: theme.borderRadius.lg,
		paddingHorizontal: theme.spacing.md,
		height: 40,
		width: 200,
		borderWidth: 1,
		borderColor: theme.colors.border.light,
		...theme.shadows.sm,
	},
	searchIcon: {
		marginRight: theme.spacing.sm,
	},
	searchInput: {
		flex: 1,
		color: theme.colors.text.primary,
		fontSize: theme.typography.fontSize.md,
	},
	clearButton: {
		padding: theme.spacing.xs,
	},
	sessionsList: {
		gap: theme.spacing.md,
	},
	sessionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.background.paper,
		borderRadius: theme.borderRadius.lg,
		borderWidth: 1,
		borderColor: theme.colors.border.light,
		...theme.shadows.md,
	},
	sessionCardPressed: {
		backgroundColor: theme.colors.background.hover,
		transform: [{ scale: 0.98 }],
		borderColor: theme.colors.primary.light,
	},
	sessionInfo: {
		flex: 1,
		marginRight: theme.spacing.md,
	},
	sessionName: {
		fontSize: theme.typography.fontSize.lg,
		fontWeight: theme.typography.fontWeight.bold,
		color: theme.colors.text.primary,
		marginBottom: theme.spacing.sm,
	},
	sessionDetails: {
		flexDirection: 'row',
		gap: theme.spacing.lg,
	},
	detailItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.xs,
	},
	detailText: {
		color: theme.colors.text.secondary,
		fontSize: theme.typography.fontSize.sm,
	},
	chevron: {
		marginLeft: theme.spacing.sm,
	},
	emptyContainer: {
		alignItems: 'center',
		padding: theme.spacing.xl,
		gap: theme.spacing.md,
	},
	emptyText: {
		color: theme.colors.text.secondary,
		fontSize: theme.typography.fontSize.md,
		textAlign: 'center',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: theme.spacing.lg,
		gap: theme.spacing.lg,
	},
	errorText: {
		color: theme.colors.status.error,
		fontSize: theme.typography.fontSize.md,
		textAlign: 'center',
	},
});