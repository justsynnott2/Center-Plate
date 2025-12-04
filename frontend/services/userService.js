import baseApiService from './baseApiService';

class UserService {
    async searchUsers(query) {
        return baseApiService.get('/users/search', {params: {query}});
    }

    async createUser(userData) {
        return baseApiService.post('/users', userData);
    }
    
    async getAllUsers() {
        return baseApiService.get('/users');
    }

    async getUser(userId) {
        return baseApiService.get(`/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return baseApiService.put(`/users/${userId}`, userData);
    }

    async deleteUser(userId) {
        return baseApiService.delete(`/users/${userId}`);
    }

    async addLocation(userId, locationData) {
        return baseApiService.post(`/users/${userId}/locations`, locationData);
    }

    async updateLocation(userId, locationId, locationData) {
        return baseApiService.patch(`/users/${userId}/locations/${locationId}`, locationData);
    }

    async removeLocation(userId, locationId) {
        return baseApiService.delete(`/users/${userId}/locations/${locationId}`);
    }

    async setDefaultLocation(userId, locationId) {
        return baseApiService.patch(`/users/${userId}/locations/${locationId}/default`);
    }

    async updatePreferences(userId, preferences) {
        return baseApiService.patch(`/users/${userId}/preferences`, {preferences});
    }

    async updatePushToken(userId, pushToken) {
        return baseApiService.put(`/users/${userId}/pushToken`, { pushToken });
    }

    async getSessions(userId) {
        return baseApiService.get(`/users/${userId}/sessions`);
    }

    async getAcceptedSessions(userId) {
        return baseApiService.get(`/users/${userId}/sessions/accepted`);
    }

    async getPendingSessions(userId) {
        return baseApiService.get(`/users/${userId}/sessions/pending`);
    }

}

export default new UserService(); 