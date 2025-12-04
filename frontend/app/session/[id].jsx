import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext.js';
import { useSocket } from '../../hooks/useSocket.js';
import { theme } from '../../styles/theme.js';
import Header from '../../components/common/Header.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import SessionMap from '../../components/map/SessionMap';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location';
import OverviewTab from '../../components/session/tabs/OverviewTab.jsx';
import ParticipantsTab from '../../components/session/tabs/ParticipantsTab.jsx';
import RestaurantsTab from '../../components/session/tabs/RestaurantsTab.jsx';
import LocationsTab from '../../components/session/tabs/LocationsTab.jsx';
import SettingsTab from '../../components/session/tabs/SettingsTab.jsx';
import SessionService from '../../services/sessionService';
import LocationService from '../../services/locationService';
import UserService from '../../services/userService';

const SessionDetails = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();

    const [userData, setUserData] = useState(null);
    const [loadingUserData, setLoadingUserData] = useState(true);
    const [currentSession, setCurrentSession] = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const { subscribe, joinRoom, leaveRoom, isConnected, isInitialized } = useSocket();

    const [currentLocation, setCurrentLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);

    const [midpoint, setMidpoint] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [loadingMidpointandRestaurants, setLoadingMidpointandRestaurants] = useState(true);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTabs, setShowTabs] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Clear 'User not found' errors automatically
    useEffect(() => {
        if (error && error.toLowerCase().includes('user not found')) {
            setError(null);
        }
    }, [error]);

    useEffect(() => {
        if (loadingUserData || loadingSession || loadingLocation || loadingMidpointandRestaurants) {
            return;
        }
        setLoading(false);
    }, [loadingUserData, loadingSession, loadingLocation, loadingMidpointandRestaurants]);

    useEffect(() => {
        if (currentSession) {
            if (currentSession.status === 'voting') {
                router.push(`/session/vote/${id}`);
            }
            if (currentSession.status === 'finished') {
                router.push(`/session/results/${id}`);
            }
        }
    }, [currentSession]);

    // Socket event handlers
	useEffect(() => {
		if (!id || !isInitialized) {
			console.log('Waiting for session or socket initialization...');
			return;
		}

		if (!isConnected) {
			console.log('Waiting for socket connection...');
			return;
		}

		console.log('Setting up socket events for session:', id);

		// Join user's room for personal updates
		joinRoom(id);
		console.log('Joined session room:', id);

		// Subscribe to session events
		const unsubscribeNewSession = subscribe('sessionUpdated', (updatedSession) => {
			if (updatedSession._id === id) {
				setCurrentSession(updatedSession);
			}
		});

		const unsubscribeSessionRemoved = subscribe('sessionDeleted', (removedSession) => {
			if (removedSession._id === id) {
				router.replace('/home');
			}
		});

		// Cleanup subscriptions and room when component unmounts
		return () => {
			console.log('Cleaning up socket subscriptions');
			leaveRoom(id);
			unsubscribeNewSession();
			unsubscribeSessionRemoved();
		};
	}, [id, subscribe, joinRoom, leaveRoom, isConnected, isInitialized]);

    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoadingUserData(true);
                const userData = await UserService.getUser(user.uid);
                if (!userData) {
                    // Suppress 'User not found' error after signup, just handle silently
                    setUserData(null);
                    return;
                }
                setUserData(userData);
            } catch (error) {
                if (error.message && error.message.toLowerCase().includes('user not found')) {
                    // Suppress error page for 'User not found' after signup - don't set error state
                    console.warn('[Session] User not found error suppressed:', error.message);
                    setUserData(null);
                } else {
                    setError(error.message);
                    console.error('Error fetching user data:', error.message);
                }
            } finally {
                setLoadingUserData(false);
            }
        };
        if (user) {
            fetchUserData();
        }
    }, [user]);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                setLoadingSession(true);
                const session = await SessionService.getSession(id);
                if (!session) {
                throw new Error('Session not found');
                }
                setCurrentSession(session);
            } catch (error) {
                if (error.message && error.message.toLowerCase().includes('user not found')) {
                    // Suppress error page for 'User not found' - don't set error state
                    console.warn('[Session] User not found error in session fetch suppressed:', error.message);
                } else {
                    setError(error.message);
                    console.error('Error fetching session:', error.message);
                }
            } finally {
                setLoadingSession(false);
            }
        };
        if (id) {
            fetchSession();
        }
    }, [id]);

    useEffect(() => {
        const fetchCurrentLocation = async () => {
            try {
                setLoadingLocation(true);
                const response = await getCurrentLocation();
                if (!response) {
                    throw new Error('Failed to fetch current location');
                }
                setCurrentLocation({
                    latitude: response.latitude,
                    longitude: response.longitude
                }); 
            } catch (error) {
                setError(error.message);
                console.error('Error fetching current location:', error.message);
            } finally {
                setLoadingLocation(false);
            }
        };
        
        fetchCurrentLocation();
    }, []);

    useEffect(() => {

        const calculateMidpoint = async () => {
            setLoadingMidpointandRestaurants(true);
            try{
                const response = await calculateMidpointandRestaurants();
                if (!response) {
                    console.log('No response from calculateMidpointandRestaurants');
                    setMidpoint(null);
                    setRestaurants([]);
                    return;
                }
                await SessionService.updateMidpoint(id, response.midpoint)    
                const session = await SessionService.addRestaurants(id, response.restaurants)

                setMidpoint(session.midpoint);
                setRestaurants(session.restaurants);
            } catch (error) {
                setError(error.message);
                console.error('Error calculating midpoint and restaurants:', error.message);
            } finally {
                setLoadingMidpointandRestaurants(false);
            }
        };

        if (currentSession && currentSession.status === 'waiting') {
            calculateMidpoint();
        }
    }, [currentSession]);

    const calculateMidpointandRestaurants = async () => {
        try {    
            const activeParticipants = currentSession.participants.filter(
                p => p.invitation === 'accepted' && 
                p.location && 
                p.location.latitude && 
                p.location.longitude
            );
    
            if (activeParticipants.length < 2){
                console.log('Not enough participants to calculate midpoint and restaurants');
                return;
            }
    
            const locations = activeParticipants.map(p => [
                p.location.latitude, 
                p.location.longitude
            ]);
    
            // Collect all preferences
            const filters = new Set();
            const preferenceKeys = ['dietaryValues', 'priceRange', 'cuisineValue'];
            const booleanKeys = {
                includeParking: 'parking',
                includeTransport: 'transportation',
            };

            // Add participant and session preferences
            [...activeParticipants, { preferences: currentSession.preferences }].forEach(
                participant => {
                    if (participant.preferences) {
                        preferenceKeys.forEach(key => {
                            if (participant.preferences[key]) {
                                filters.add(participant.preferences[key]);
                            }
                        });

                        Object.entries(booleanKeys).forEach(([key, value]) => {
                            if (participant.preferences[key]) {
                                filters.add(value);
                            }
                        });
                    }
                }
            );
    
            const response = await LocationService.findOptimalLocation(
                locations, 
                Array.from(filters)
            );

            if (!response) {
                throw new Error("No optimal location found");
            }
    
            return {
                midpoint: {
                    latitude: response.bestScore.location[0],
                    longitude: response.bestScore.location[1]
                },
                restaurants: response.bestScore.bestRestaurants.map(restaurant => ({
                    rid: restaurant.fsq_id,
                    name: restaurant.name,
                    coordinates: restaurant.coordinates,
                    address: restaurant.address,
                    images: restaurant.images,
                    categories: restaurant.categories,      
                }))
            };
        } catch (error) {
            setError(error.message);
            console.error('Error calculating midpoint:', error.message);
            throw error;
        }
    };

    const handleInvite = async (action) => {
        try {
            let session = null;
            if (action === 'accept') {
                session = await SessionService.acceptInvite(id, user.uid);
            } else {
                session = await SessionService.rejectInvite(id, user.uid);
            }
            if (!session) {
                throw new Error('Failed to update session');
            }
            setCurrentSession(session);
        } catch (error) {
            setError(error.message);
            console.error('Error updating session:', error.message);
        }
    };

    const handleLeaveSession = async () => {
        try {
            const session = await SessionService.removeParticipant(id, user.uid);
            if (!session) {
                throw new Error('Failed to leave session');
            }
            setCurrentSession(session);
        } catch (error) {
            setError(error.message);
            console.error('Error leaving session:', error.message);
        }
    };

    const handleUpdateSessionStatus = async (status) => {
        try {
            const session = await SessionService.updateSessionStatus(id, status);
            if (!session) {
                throw new Error('Failed to update session status');
            }
            setCurrentSession(session);
        } catch (error) {
            setError(error.message);
            console.error('Error updating session status:', error.message);
        }
    };

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Location permission is required to update your location.');
            return;
        }
       
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        return { latitude, longitude };    
    }   

    const handleLocationSelect = async (location, isCurrentLocation=false) => {
        setLoadingLocation(true);
        try { 
            if (isCurrentLocation) {
                location = await getCurrentLocation();    
                if (!location) {
                    return;
                }
            } else {
                location = {
                    latitude: location.coordinates.latitude,
                    longitude: location.coordinates.longitude
                }
            }
            const session = await SessionService.updateParticipantLocation(id, user.uid, {
                latitude: location.latitude,
                longitude: location.longitude
            });
            if (!session) {
                throw new Error('Failed to update location');
            }
            setCurrentSession(session);
        } catch (error) {
            setError(error.message);
            console.error('Error updating location:', error.message);
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleEditSession = async (newName) => {
        try {
            const updatedSession = await SessionService.updateSession(id, { name: newName.trim() });
            if (!updatedSession) {
                const err = new Error('Failed to update session');
                console.error(err);
                throw err;
            }

            setCurrentSession(updatedSession);
            setError(null);
            console.log(updatedSession)
            return updatedSession;
        } catch (error) {
            console.error('Error updating session name:', error?.message || error);
            throw error;
        }
    };

    const handleManagePreferences = async (updatedPreferences) => {
        try {
            const session = await SessionService.updateSession(id, {preferences: updatedPreferences});
            if (!session) {
                throw new Error('Failed to update preferences');
            }
            setCurrentSession(session);
        } catch (error) {
            setError(error.message);
            console.error('Error updating preferences:', error.message);
        }
    };

    const handleDeleteSession = async () => {
        try {
            const session = await SessionService.deleteSession(id);
            if (!session) {
                throw new Error('Failed to delete session');
            }
            Alert.alert('Success', 'Session deleted successfully');
            router.replace('/home');
        } catch (error) {
            setError(error.message);
            console.error('Error deleting session:', error.message);
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleRemoveParticipant = async (participantId) => {
        try {
            const session = await SessionService.removeParticipant(id, participantId);
            if (!session) {
                throw new Error('Failed to remove participant');
            }
            setCurrentSession(session);
            Alert.alert('Success', 'Participant removed successfully');
        } catch (error) {
            setError(error.message);
            console.error('Error removing participant:', error.message);
        }
    };

    const handlePromoteParticipant = async (participantId) => {
        try {
            const session = await SessionService.updateParticipantRole(id, participantId, 'admin');
            if (!session) {
                throw new Error('Failed to promote participant');
            }
            setCurrentSession(session);
            Alert.alert('Success', 'Participant promoted to admin');
        } catch (error) {
            setError(error.message);
            console.error('Error promoting participant:', error.message);
        }
    };

    const handleDemoteParticipant = async (participantId) => {
        try {
            const session = await SessionService.updateParticipantRole(id, participantId, 'participant');
            if (!session) {
                throw new Error('Failed to demote participant');
            }
            setCurrentSession(session);
            Alert.alert('Success', 'Participant demoted to participant');
        } catch (error) {
            setError(error.message);
            console.error('Error demoting participant:', error.message);
        }
    };

    const handleStartVoting = async () => {
        if (currentSession.status !== 'voting') {
            try {
                const session = await SessionService.updateSessionStatus(id, 'voting');
                if (!session) {
                    throw new Error('Failed to update session status');
                }
                setCurrentSession(session);
                router.push(`/session/vote/${id}`);
            } catch (error) {
                setError(error.message);
                console.error('Error starting voting:', error.message);
            }
        } else {
            Alert.alert('Error', 'Voting has already started');
        }
    }

    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.y;
        setShowTabs(scrollPosition > 350);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'info-circle' },
        { id: 'participants', label: 'Participants', icon: 'users' },
        { id: 'restaurants', label: 'Restaurants', icon: 'cutlery' },
        { id: 'locations', label: 'Locations', icon: 'map-marker' },
        { id: 'settings', label: 'Settings', icon: 'cog' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewTab
                        currentSession={currentSession}
                        currentParticipant={currentSession?.participants?.find(p => p?.user?._id === user?.uid)}
                        handleInvite={handleInvite}
                        handleLeaveSession={handleLeaveSession}
                        handleUpdateSessionStatus={handleUpdateSessionStatus}
                        handleDeleteSession={handleDeleteSession}
                    />
                );
            case 'participants':
                return (
                    <ParticipantsTab
                        currentSession={currentSession}
                        user={user}
                        handleRemoveParticipant={handleRemoveParticipant}
                        handlePromoteParticipant={handlePromoteParticipant}
                        handleDemoteParticipant={handleDemoteParticipant}

                    />
                );
            case 'restaurants':
                return (
                    <RestaurantsTab
                        restaurants={restaurants}
                        handleStartVoting={handleStartVoting}
                    />
                );
            case 'locations':
                return (
                    <LocationsTab
                        currentParticipant={currentSession?.participants?.find(p => p?.user?._id === user?.uid)}
                        loadingLocation={loadingLocation}
                        handleLocationSelect={handleLocationSelect}
                    />
                );
            case 'settings':
                return (
                    <SettingsTab
                        handleDeleteSession={handleDeleteSession}
                        handleEditSession={handleEditSession}
                        handleManagePreferences={handleManagePreferences}
                        currentSessionName={currentSession?.name}
                        user={user}
                        sessionPreferences={currentSession?.preferences}
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header
                    title="Loading..."
                    variant="secondary"
                    style={styles.header}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
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
                    <Icon name="exclamation-triangle" size={48} color={theme.colors.status.error} />
                    <Text style={styles.errorText}>{error}</Text>
                    <Button
                        title="Try Again"
                        onPress={() => router.replace(`/session/${id}`)}
                        variant="primary"
                    />
                    <Button
                        title="Delete Session"
                        onPress={() => Alert.alert('Delete Session', 'Are you sure you want to delete this session?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', onPress: handleDeleteSession, style: 'destructive' }])}
                        variant="danger"
                    />
                </View>
            </View>
        );
    }

    const currentParticipant = currentSession?.participants?.find(p => p?.user?._id === user?.uid);

    if (currentParticipant?.invitation === 'pending') {
        return (
            <Card style={styles.inviteCard}>
                <Text style={styles.inviteTitle}>You've been invited to this session!</Text>
                <Text style={styles.inviteMessage}>
                    Please accept or decline the invitation to continue.
                </Text>
                <View style={styles.inviteActions}>
                    <Button
                        title="Accept"
                        onPress={() => handleInvite('accept')}
                        variant="primary"
                        fullWidth
                    />
                    <Button
                        title="Decline"
                        onPress={() => handleInvite('decline')}
                        variant="danger"
                        fullWidth
                    />
                </View>
            </Card>
        );
    }

    if (!currentParticipant) {
        return (
            <View style={styles.container}>
                <Header
                    title="Session Details"
                    variant="primary"
                    onLeftPress={() => router.back()}
                    style={styles.header}
                />
                <ScrollView 
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.cardsContainer}>
                        <Text style={styles.title}>{currentSession?.name || 'Unnamed Session'}</Text>
                        {renderTabContent()}
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
            <View style={styles.container}>
                <Header
                    title="Session Details"
                    variant="primary"
                    style={styles.header}
                />
                <ScrollView 
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    snapToOffsets={[0, 700]}
                    decelerationRate="fast"
                    snapToEnd={false}
                    scrollEventThrottle={16}
                    onScroll={handleScroll}
                >
                    <View style={styles.mapContainer}>
                        <SessionMap
                            participants={currentSession?.participants}
                            midpoint={midpoint}
                            restaurants={restaurants}
                            currentLocation={currentLocation}
                            loading={loadingMidpointandRestaurants || loadingSession}
                        />
                    </View>
                    
                    <View style={styles.cardsContainer}>
                        <Text style={styles.title}>{currentSession?.name || 'Unnamed Session'}</Text>

                        <View style={styles.tabBarContainer}>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tabBar}
                            >
                                {tabs.map((tab) => (
                                    <TouchableOpacity 
                                        key={tab.id}
                                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                                        onPress={() => setActiveTab(tab.id)}
                                    >
                                        <Icon 
                                            name={tab.icon} 
                                            size={20} 
                                            color={activeTab === tab.id ? theme.colors.primary.main : theme.colors.text.secondary} 
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {renderTabContent()}
                    </View>
                </ScrollView>

                <Modal
                    visible={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Delete Session"
                    message="Are you sure you want to delete this session? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={handleDeleteSession}
                    variant="danger"
                />
            </View>
    );
};

export default SessionDetails;

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
    scrollContent: {
        flexGrow: 1,
    },
    mapContainer: {
        height: 500,    // Adjusted height so it is viewable on samsung galaxy s25 & iphone 14
        backgroundColor: theme.colors.background.default,
        position: 'relative',
    },
    mapActions: {
        position: 'absolute',
        bottom: theme.spacing.lg,
        right: theme.spacing.lg,
        ...theme.shadows.md,
    },
    cardsContainer: {
        backgroundColor: theme.colors.background.default,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        minHeight: '100%',
        marginTop: -24,
        ...theme.shadows.lg,
    },
    title: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
    },
    tabBarContainer: {
        marginBottom: theme.spacing.lg,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
        gap: theme.spacing.xs,
    },
    tab: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
        backgroundColor: theme.colors.primary + '15',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
    },
    infoCard: {
        marginBottom: theme.spacing.lg,
    },
    participantsCard: {
        marginBottom: theme.spacing.lg,
    },
    restaurantsCard: {
        marginBottom: theme.spacing.lg,
    },
    settingsCard: {
        marginBottom: theme.spacing.lg,
    },
    infoContainer: {
        gap: theme.spacing.md,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    infoText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.md,
    },
    participantsList: {
        gap: theme.spacing.md,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xs,
    },
    participantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    participantName: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.md,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
    },
    participantStatusText: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
    },
    restaurantsList: {
        gap: theme.spacing.md,
    },
    restaurantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xs,
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.medium,
    },
    restaurantVotes: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.sm,
        marginTop: theme.spacing.xs,
    },
    settingsContainer: {
        gap: theme.spacing.md,
    },
    inviteCard: {
        marginBottom: theme.spacing.lg,
    },
    inviteTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    inviteActions: {
        gap: theme.spacing.md,
    },
    locationList: {
        gap: theme.spacing.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    errorText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.md,
        textAlign: 'center',
    },
    locationsCard: {
        marginBottom: theme.spacing.lg,
    },
    locationsContainer: {
        gap: theme.spacing.md,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xs,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    locationTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.md,
    },
    savedLocations: {
        marginTop: theme.spacing.md,
        gap: theme.spacing.md,
    },
    savedLocationsTitle: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        marginBottom: theme.spacing.xs,
    }
});
