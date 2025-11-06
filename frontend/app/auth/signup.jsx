import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext.js';
import { theme } from '../../styles/theme.js';
import Header from '../../components/common/Header.jsx';
import TextInput from '../../components/common/TextInput.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Signup() {
    const router = useRouter();
    const { handleSignup } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        general: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (field) => (value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    };

    const validateForm = () => {
        const newErrors = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            general: ''
        };
        let isValid = true;

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };
    
    const onSignup = async () => { 
        try {
            if (!validateForm()) return;
            
            setLoading(true);
            setErrors(prev => ({ ...prev, general: '' }));
        
            await handleSignup(formData.username, formData.email, formData.password);
            router.replace('/home');
        } catch (error) {
                // Check for specific error types and display them in the appropriate field
                if (error.message.includes('username is already taken') || error.message.includes('Username already taken')) {
                    setErrors(prev => ({ 
                        ...prev, 
                        username: 'This username is already taken. Please choose another.',
                        general: ''
                    }));
                } else if (error.message.includes('email is already registered') || error.message.includes('Email already registered')) {
                    setErrors(prev => ({ 
                        ...prev, 
                        email: 'This email is already registered. Please use a different email or login.',
                        general: ''
                    }));
                } else {
                    setErrors(prev => ({ ...prev, general: error.message }));
                }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Header
                title="Create Account"
                variant="primary"
                style={styles.header}
            />

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Card style={styles.formCard}>
                    <TextInput
                        label="Username"
                        value={formData.username}
                        onChangeText={handleChange('username')}
                        placeholder="Enter your username"
                        leftIcon={<Icon name="user" size={20} color={theme.colors.text.secondary} />}
                        error={errors.username}
                    />

                    <TextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={handleChange('email')}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon={<Icon name="envelope" size={20} color={theme.colors.text.secondary} />}
                        error={errors.email}
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            label="Password"
                            value={formData.password}
                            onChangeText={handleChange('password')}
                            placeholder="Create a password"
                            secureTextEntry={!showPassword}
                            leftIcon={<Icon name="lock" size={20} color={theme.colors.text.secondary} />}
                            error={errors.password}
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Icon 
                                name={showPassword ? "eye-slash" : "eye"} 
                                size={20} 
                                color={theme.colors.text.secondary} 
                            />
                        </TouchableOpacity>
                    </View>
            
                    <View style={styles.passwordContainer}>
                        <TextInput
                            label="Confirm Password"
                            value={formData.confirmPassword}
                            onChangeText={handleChange('confirmPassword')}
                            placeholder="Confirm your password"
                            secureTextEntry={!showConfirmPassword}
                            leftIcon={<Icon name="lock" size={20} color={theme.colors.text.secondary} />}
                            error={errors.confirmPassword}
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Icon 
                                name={showConfirmPassword ? "eye-slash" : "eye"} 
                                size={20} 
                                color={theme.colors.text.secondary} 
                            />
                        </TouchableOpacity>
                    </View>

                    {errors.general ? (
                        <Text style={styles.errorText}>{errors.general}</Text>
                    ) : null}

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Create Account"
                            onPress={onSignup}
                            loading={loading}
                            disabled={loading}
                            fullWidth
                        />

                        <Button
                            title="Already have an account? Login"
                            variant="text"
                            onPress={() => router.push('/auth/login')}
                            fullWidth
                        />
                    </View>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
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
    formCard: {
        marginBottom: theme.spacing.lg,
    },
    passwordContainer: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: theme.spacing.md,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: theme.spacing.xs,
    },
    errorText: {
        color: theme.colors.status.error,
        fontSize: theme.typography.fontSize.sm,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    buttonContainer: {
        gap: theme.spacing.sm,
    },
});
  
