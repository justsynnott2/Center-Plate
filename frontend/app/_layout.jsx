import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from '../contexts/AuthContext.js';
import { SessionProvider } from '../contexts/SessionContext.js';
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// List of routes that require authentication
const PROTECTED_ROUTES = [
  'home',
  'profile',
  'settings',
  'preferences',
  'session',
  'locations',
  'vote',
  'results'
];

// This component handles auth-based navigation
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentRoute = segments[0];
    const inAuthGroup = currentRoute === 'auth';
    const isSignupRoute = currentRoute === 'auth/signup';
    
    // Check if current route requires authentication
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      currentRoute === route || currentRoute?.startsWith(`${route}/`)
    );
    
    if (!user && isProtectedRoute) {
      // Redirect to login if trying to access protected route while not authenticated
      router.replace('/auth/login');
    } else if (user && inAuthGroup && !isSignupRoute) {
      // Redirect to home if authenticated and trying to access auth pages
      router.replace('/home');
    }
  }, [user, loading, segments]);

  return children;
}

export default function Layout() {
  const router = useRouter();
  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
    <AuthProvider>
      <SessionProvider>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }}/>
            <Stack.Screen name="auth/recover" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }}/>
            <Stack.Screen name="preferences" options={{ headerShown: false }}/>
            <Stack.Screen name="masterPreference" options={{ headerShown: false }}/>
            <Stack.Screen name="home" options={{ headerShown: false }}/>
            <Stack.Screen name="profile" options={{ headerShown: false }}/>
            <Stack.Screen name="session/create" options={{ headerShown: false }}/>
            <Stack.Screen name="session/[id]" options={{ headerShown: false }}/>
            <Stack.Screen name="session/vote/[id]" options={{ headerShown: false }}/>
            <Stack.Screen name="session/results/[id]" options={{ headerShown: false }}/>
            <Stack.Screen name="locations/manageLocations" options={{ headerShown: false }}/>
          </Stack>

          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
              <Icon name="gear" size={24} color="#000100" />
              <Text>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
              <Icon name="home" size={24} color="#000100" />
              <Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
              <Icon name="user" size={24} color="#000100" />
              <Text>Profile</Text>
            </TouchableOpacity>
          </View>
        </AuthGuard>
      </SessionProvider>
    </AuthProvider>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  bottomNav: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#9DD1F1',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
});
