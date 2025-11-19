import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext.js';
import { theme } from '../styles/theme.js';
import Header from '../components/common/Header.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import TextInput from '../components/common/TextInput.jsx';
import UserInfo from '../components/common/UserInfo';
import Modal from '../components/common/Modal';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Profile() {
  const router = useRouter();
    const { user, handleUpdateUsername, handleLogout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
    });
    const [errors, setErrors] = useState({
        displayName: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const handleUpdateProfile = async () => {
    try {
            setLoading(true);
            setErrors({ displayName: '', email: '' });
            
            // Only update username if it changed
            if (formData.displayName !== user?.displayName) {
                await handleUpdateUsername(formData.displayName);
            }
            
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
            // Check for specific error types
            if (error.message.includes('username is already taken') || error.message.includes('Username already taken')) {
                setErrors(prev => ({ 
                    ...prev, 
                    displayName: 'This username is already taken. Please choose another.'
                }));
                Alert.alert('Username Taken', 'This username is already taken. Please choose a different username.');
            } else if (error.message.includes('email is already registered') || error.message.includes('Email already registered')) {
                setErrors(prev => ({ 
                    ...prev, 
                    email: 'This email is already registered.'
                }));
                Alert.alert('Email Registered', 'This email is already registered. Please use a different email.');
            } else {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
    }
  };

    const handleDeleteAccount = async () => {
    try {
            setLoading(true);
            await deleteAccount();
            router.replace('/auth/login');
    } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
    }
  };

    const onLogout = async () => {
        try {
            await handleLogout();
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
        }
    };

  if (!user) return null;

  return (
        <View style={styles.container}>
            <Header
                title="Profile"
                variant="primary"
                rightIcon={isEditing ? 'check' : 'edit'}
                onRightPress={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                style={styles.header}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <Card style={styles.profileCard}>
                    <UserInfo
                        user={user}
                        size="large"
                        style={styles.userInfo}
                    />
                </Card>

                <Card style={styles.settingsCard}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    
                    <TextInput
                        label="Display Name"
                        value={formData.displayName}
                            onChangeText={(text) => {
                                setFormData(prev => ({ ...prev, displayName: text }));
                                setErrors(prev => ({ ...prev, displayName: '' }));
                            }}
                        placeholder="Enter your display name"
                        leftIcon={<Icon name="user" size={20} color={theme.colors.text.secondary} />}
                            error={errors.displayName}
                        editable={isEditing}
                    />

        <TextInput
                        label="Email"
                        value={formData.email}
                            onChangeText={(text) => {
                                setFormData(prev => ({ ...prev, email: text }));
                                setErrors(prev => ({ ...prev, email: '' }));
                            }}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon={<Icon name="envelope" size={20} color={theme.colors.text.secondary} />}
                            error={errors.email}
                        editable={isEditing}
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Change Password"
                            onPress={() => router.push('/auth/change-password')}
                            variant="outlined"
                            icon="lock"
                        />

                        <Button
                            title="Delete Account"
                            onPress={() => setShowDeleteModal(true)}
                            variant="secondary"
                            icon="trash"
                        />

                        <Button
                            title="Logout"
                            onPress={onLogout}
                            variant="outlined"
                            icon="sign-out"
                        />
                    </View>
                </Card>
            </ScrollView>

            <Modal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                variant="secondary"
            >
                <Text style={styles.modalTitle}>Delete Account</Text>
                <Text style={styles.modalText}>
                    Are you sure you want to delete your account? This action cannot be undone.
                </Text>
                <View style={styles.modalButtons}>
                    <Button
                        title="Cancel"
                        onPress={() => setShowDeleteModal(false)}
                        variant="outlined"
                    />
                    <Button
                        title="Delete"
                        onPress={handleDeleteAccount}
                        variant="secondary"
                        loading={loading}
                    />
      </View>
            </Modal>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    profileCard: {
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.lg,
    },
    userInfo: {
    alignItems: 'center',
    },
    settingsCard: {
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
  },
    modalTitle: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.light,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    modalText: {
        color: theme.colors.text.light,
        fontSize: theme.typography.fontSize.md,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
  },
});
  