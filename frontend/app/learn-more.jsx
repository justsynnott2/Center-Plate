import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function LearnMoreScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Learn More' }} />
      <Text style={styles.title}>Learn More</Text>
      <Text style={styles.body}>This is the learn more page.</Text>
      <Link href="/home" style={styles.link}>
          <Text style={styles.linkText}>Go back home</Text>
        </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
