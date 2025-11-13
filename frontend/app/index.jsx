import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../styles/theme.js';
import Header from '../components/common/Header.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Index() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<Header
				title="CenterPlate"
				variant="primary"
				style={styles.header}
			/>

			<View style={styles.content}>
				<Card style={styles.welcomeCard}>
					<Icon name="cutlery" size={64} color={theme.colors.primary.main} />
					<Text style={styles.title}>Welcome to CenterPlate</Text>
					<Text style={styles.subtitle}>
						The easiest way to decide where to eat with your group
					</Text>
				</Card>

				<Card style={styles.featuresCard}>
					<Text style={styles.sectionTitle}>Features</Text>
					<View style={styles.featuresList}>
						<View style={styles.featureItem}>
							<Icon name="users" size={24} color={theme.colors.primary.main} />
							<Text style={styles.featureText}>Create and join dining sessions</Text>
						</View>
						<View style={styles.featureItem}>
							<Icon name="map-marker" size={24} color={theme.colors.primary.main} />
							<Text style={styles.featureText}>Find restaurants near you</Text>
						</View>
						<View style={styles.featureItem}>
							<Icon name="check-square" size={24} color={theme.colors.primary.main} />
							<Text style={styles.featureText}>Vote on your preferences</Text>
						</View>
					</View>
				</Card>

				<View style={styles.buttonContainer}>
					<Button
						title="Get Started"
						onPress={() => router.push('/home')}
						variant="primary"
						icon="arrow-right"
						style={styles.button}
					/>
					<Button
						title="Learn More"
						onPress={() => router.push('/learn-more')}
						variant="outlined"
						icon="info-circle"
					/>
				</View>
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
		padding: theme.spacing.lg,
	},
	welcomeCard: {
		alignItems: 'center',
		padding: theme.spacing.xl,
		marginBottom: theme.spacing.lg,
	},
	title: {
		fontSize: theme.typography.fontSize.xl,
		fontWeight: theme.typography.fontWeight.bold,
		color: theme.colors.text.primary,
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.sm,
	},
	subtitle: {
		fontSize: theme.typography.fontSize.md,
		color: theme.colors.text.secondary,
		textAlign: 'center',
	},
	featuresCard: {
		marginBottom: theme.spacing.lg,
	},
	sectionTitle: {
		fontSize: theme.typography.fontSize.lg,
		fontWeight: theme.typography.fontWeight.bold,
		color: theme.colors.text.primary,
		marginBottom: theme.spacing.md,
	},
	featuresList: {
		gap: theme.spacing.md,
	},
	featureItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.sm,
	},
	featureText: {
		color: theme.colors.text.secondary,
		fontSize: theme.typography.fontSize.md,
		flex: 1,
	},
	buttonContainer: {
		gap: theme.spacing.sm,
	},
	button: {
		marginBottom: theme.spacing.sm,
	},
});