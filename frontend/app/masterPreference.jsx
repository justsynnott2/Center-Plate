import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../contexts/SessionContext.js';
import { theme } from '../styles/theme.js';
import Header from '../components/common/Header.jsx';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import Icon from 'react-native-vector-icons/FontAwesome';
import PreferencesForm from '../components/preferences/PreferencesForm.jsx';

export default function MasterPreference() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { session, loading: sessionLoading, error: sessionError } = useSession();
	const [preferences, setPreferences] = useState({
		dietaryValue: '',
		priceValue: '',
		cuisineValue: '',
		includeParking: false,
		includeTransport: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [validationErrors, setValidationErrors] = useState({});

	useEffect(() => {
		if (session?.preferences) {
			setPreferences(session.preferences);
		}
	}, [session]);

	const validateForm = () => {
		const errors = {};
		if (!preferences.cuisineValue) {
			errors.cuisineValue = 'Please select a cuisine preference';
		}
		if (!preferences.priceValue) {
			errors.priceValue = 'Please select a price range';
		}
		if (!preferences.dietaryValue) {
			errors.dietaryValue = 'Please select a dietary preference';
		}
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSavePreferences = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			setLoading(true);
			setError(null);
			// Implement your save preferences API call here
			//await saveSessionPreferences(id, preferences);
			Alert.alert('Success', 'Preferences saved successfully');
			router.back();
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	if (sessionLoading) {
		return <Loading fullScreen />;
	}

	if (sessionError) {
		return (
			<View style={styles.container}>
				<Header
					title="Error"
					variant="secondary"
					style={styles.header}
				/>
				<View style={styles.errorContainer}>
					<Icon name="exclamation-circle" size={48} color={theme.colors.text.contrast} />
					<Text style={styles.errorText}>{sessionError}</Text>
					<Button
						title="Go Back"
						onPress={() => router.back()}
						variant="primary"
					/>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Header
				title="Master Preferences"
				variant="primary"
				leftIcon="arrow-left"
				onLeftPress={() => router.back()}
				style={styles.header}
			/>

			<ScrollView style={styles.content}>
				<PreferencesForm
					preferences={preferences}
					onPreferencesChange={setPreferences}
					validationErrors={validationErrors}
					title="Session Preferences"
				/>

				{error && (
					<Text style={styles.errorText}>{error}</Text>
				)}

				<Button
					title="Save Preferences"
					onPress={handleSavePreferences}
					variant="primary"
					loading={loading}
					style={styles.saveButton}
				/>
			</ScrollView>
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
		padding: theme.spacing.lg,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: theme.spacing.lg,
		gap: theme.spacing.lg,
	},
	errorText: {
		color: theme.colors.text.contrast,
		fontSize: theme.typography.fontSize.md,
		textAlign: 'center',
		marginTop: theme.spacing.sm,
	},
	saveButton: {
		marginBottom: theme.spacing.lg,
	},
});