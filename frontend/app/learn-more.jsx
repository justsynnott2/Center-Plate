import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function LearnMoreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Learn More' }} />
      <Text style={styles.headerTitle}>Meet in the Middle</Text>

      <Text style={styles.body}>
        Tired of the endless "where should we eat?" debate? CenterPlate makes it easy for you and your friends to find the perfect restaurant that's fair for everyone.
      </Text>

      <Text style={styles.title}>How It Works</Text>
      
      <View style={styles.step}>
        <Icon name="plus-circle" size={24} color="#2e78b7" />
        <View style={styles.stepTextContainer}>
          <Text style={styles.stepTitle}>1. Create a Session</Text>
          <Text style={styles.stepBody}>Start a new dining session and invite your friends to join.</Text>
        </View>
      </View>

      <View style={styles.step}>
        <Icon name="check-square-o" size={24} color="#2e78b7" />
        <View style={styles.stepTextContainer}>
          <Text style={styles.stepTitle}>2. Everyone Votes</Text>
          <Text style={styles.stepBody}>Each person votes on a list of nearby restaurants.</Text>
        </View>
      </View>

      <View style={styles.step}>
        <Icon name="trophy" size={24} color="#2e78b7" />
        <View style={styles.stepTextContainer}>
          <Text style={styles.stepTitle}>3. Find Your Spot</Text>
          <Text style={styles.stepBody}>The app shows you the top-voted restaurant for your group to enjoy.</Text>
        </View>
      </View>

      <Link href="/home" style={styles.link}>
        <Text style={styles.linkText}>Get Started</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  stepTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepBody: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  link: {
    marginTop: 30,
    paddingVertical: 15,
    alignSelf: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e78b7',
  },
});
