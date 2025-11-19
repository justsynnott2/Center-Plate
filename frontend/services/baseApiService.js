import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';

class BaseApiService {
    constructor() {
        this.auth = getAuth();
        this._isSigningOut = false; // prevent multiple signOut calls
        this.api = axios.create({
            baseURL: process.env.EXPO_PUBLIC_API_URL,
            timeout: 30000, // 30 second timeout
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to add auth token
        this.api.interceptors.request.use(
            async (config) => {
                console.log('[baseApiService] Making request to:', config.baseURL + config.url);
                console.log('[baseApiService] Request method:', config.method);
                console.log('[baseApiService] Request URL:', config.url);
                
                // Skip auth token for public endpoints
                // Note: config.url is relative to baseURL (e.g., '/users' not '/api/users')
                if (config.url === '/users' && config.method === 'post') {
                    console.log('[baseApiService] Skipping auth for POST /users (public endpoint)');
                    return config;
                }
                if (config.url === '/users/availability' && config.method === 'get') {
                    console.log('[baseApiService] Skipping auth for GET /users/availability (public endpoint)');
                    return config;
                }
                
                console.log('[baseApiService] Attempting to get auth token...');
                const token = await this.getAuthToken();
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor to handle errors
        this.api.interceptors.response.use(
            (response) => response.data,
            (error) => {
                console.error('[baseApiService] API request error:', error);
                
                // Handle timeout errors specifically
                if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                    console.warn('[baseApiService] Request timed out - suppressing UI error message');
                    // Suppress timeout error UI
                    return Promise.reject(new Error(''));
                }
                
                // Handle network errors
                if (error.code === 'ERR_NETWORK' || !error.response) {
                    console.warn('[baseApiService] Network error - suppressing UI error message');
                    // Suppress network error UI
                    return Promise.reject(new Error(''));
                }
                
                // Handle 401 Unauthorized: just pass through the error without signing out
                // Let the AuthGuard and app logic handle auth state naturally
                if (error.response?.status === 401) {
                    console.warn('[baseApiService] 401 Unauthorized - passing through error');
                    const errorMessage = error.response?.data?.details || 
                                       error.response?.data?.message || 
                                       error.response?.data?.error || 
                                       'Unauthorized';
                    throw new Error(errorMessage);
                }
                
                // Extract error message from the backend response
                // Prefer specific details over generic error labels like "Conflict"
                const errorMessage = error.response?.data?.details || 
                                   error.response?.data?.message || 
                                   error.response?.data?.error || 
                                   'API request failed';
                
                console.error('[baseApiService] Error message:', errorMessage);
                throw new Error(errorMessage);
            }
        );
    }

    async getAuthToken() {
        const user = this.auth.currentUser;
        console.log('[baseApiService] getAuthToken called');
        console.log('[baseApiService] currentUser:', user ? {
            uid: user.uid,
            email: user.email
        } : 'null');
        
        if (!user) {
            console.error('[baseApiService] No authenticated user found - throwing error');
            throw new Error('No authenticated user found');
        }
        
        try {
            const token = await user.getIdToken();
            console.log('[baseApiService] Successfully retrieved ID token');
            return token;
        } catch (err) {
            console.error('[baseApiService] getIdToken failed:', err);
            throw err;
        }
    }

    async get(endpoint, params) {
        return this.api.get(endpoint, params);
    }

    async post(endpoint, data) {
        return this.api.post(endpoint, data);
    }

    async put(endpoint, data) {
        return this.api.put(endpoint, data);
    }

    async patch(endpoint, data) {
        return this.api.patch(endpoint, data);
    }

    async delete(endpoint) {
        return this.api.delete(endpoint);
    }
}

export default new BaseApiService(); 