import baseApiService from './baseApiService';

const SESSION_STATUS = {
    WAITING: 'waiting',
    VOTING: 'voting',
    FINISHED: 'finished'
};

class SessionService {
    async getSessions() {
        return baseApiService.get('/sessions');
    }

    async getSession(sessionId) {
        return baseApiService.get(`/sessions/${sessionId}`);
    }

    async createSession(sessionData) {
        return baseApiService.post('/sessions', {
            ...sessionData,
            status: SESSION_STATUS.WAITING
        });
    }

    async updateSession(sessionId, sessionData) {
        return baseApiService.put(`/sessions/${sessionId}`, sessionData);
    }

    async deleteSession(sessionId) {
        return baseApiService.delete(`/sessions/${sessionId}`);
    }

    async updateSessionStatus(sessionId, status) {
        return baseApiService.patch(`/sessions/${sessionId}/status`, { status });
    }

    async startVoting(sessionId) {
        try {
            // First update the status to voting
            await this.updateSessionStatus(sessionId, SESSION_STATUS.VOTING);
            
            // Then lock the midpoint and restaurants
            return baseApiService.post(`/sessions/${sessionId}/start-voting`);
        } catch (error) {
            console.error('Error starting voting:', error);
            throw error;
        }
    }

    async finishSession(sessionId, winningRestaurantId) {
        try {
            // First update the status to finished
            await this.updateSessionStatus(sessionId, SESSION_STATUS.FINISHED);
            
            // Then set the winning restaurant
            return baseApiService.post(`/sessions/${sessionId}/finish`, { winningRestaurantId });
        } catch (error) {
            console.error('Error finishing session:', error);
            throw error;
        }
    }

    async updateSessionPreference(sessionId, preference) {
        return baseApiService.patch(`/sessions/${sessionId}/preferences`, preference);
    }

    async addParticipant(sessionId, userId) {
        return baseApiService.post(`/sessions/${sessionId}/participants/${userId}`);
    }

    async removeParticipant(sessionId, userId) {
        return baseApiService.delete(`/sessions/${sessionId}/participants/${userId}`);
    }

    async updateParticipantRole(sessionId, userId, role) {
        return baseApiService.patch(`/sessions/${sessionId}/participants/${userId}/role`, { role });
    }

    async updateParticipantLocation(sessionId, userId, location) {
        return baseApiService.patch(`/sessions/${sessionId}/participants/${userId}/location`, { location });
    }

    async getAcceptedParticipants(sessionId) {
        return baseApiService.get(`/sessions/${sessionId}/participants/accepted`);
    }

    async getPendingParticipants(sessionId) {
        return baseApiService.get(`/sessions/${sessionId}/participants/pending`);
    }
    
    async acceptInvite(sessionId, userId) {
        return baseApiService.post(`/sessions/${sessionId}/invites/${userId}/accept`);
    }

    async rejectInvite(sessionId, userId) {
        return baseApiService.post(`/sessions/${sessionId}/invites/${userId}/reject`);
    }

    async updateMidpoint(sessionId, midpoint) {
        try {
            // Only allow midpoint updates in WAITING status
            const session = await this.getSession(sessionId);
            if (session.status !== SESSION_STATUS.WAITING) {
                throw new Error('Cannot update midpoint when session is not in waiting status');
            }
            return baseApiService.patch(`/sessions/${sessionId}/midpoint`, { midpoint });
        } catch (error) {
            console.error('Error updating midpoint:', error);
            throw error;
        }
    }

    async addRestaurant(sessionId, restaurant) {
        try {
            // Only allow restaurant additions in WAITING status
            const session = await this.getSession(sessionId);
            if (session.status !== SESSION_STATUS.WAITING) {
                throw new Error('Cannot add restaurants when session is not in waiting status');
            }
            return baseApiService.post(`/sessions/${sessionId}/restaurants`, { restaurant });
        } catch (error) {
            console.error('Error adding restaurant:', error);
            throw error;
        }
    }

    async addRestaurants(sessionId, restaurants) {
        try {
            // Only allow restaurant additions in WAITING status
            const session = await this.getSession(sessionId);
            if (session.status !== SESSION_STATUS.WAITING) {
                throw new Error('Cannot add restaurants when session is not in waiting status');
            }
            return baseApiService.post(`/sessions/${sessionId}/restaurants/bulk`, { restaurants });
        } catch (error) {
            console.error('Error adding restaurants:', error);
            throw error;
        }
    }

    async removeRestaurant(sessionId, restaurantId) {
        try {
            // Only allow restaurant removal in WAITING status
            const session = await this.getSession(sessionId);
            if (session.status !== SESSION_STATUS.WAITING) {
                throw new Error('Cannot remove restaurants when session is not in waiting status');
            }
            return baseApiService.delete(`/sessions/${sessionId}/restaurants/${restaurantId}`);
        } catch (error) {
            console.error('Error removing restaurant:', error);
            throw error;
        }
    }

    async voteOnRestaurant(sessionId, rid, uid) {
        try {
            // Only allow voting in VOTING status
            const session = await this.getSession(sessionId);
            if (session.status !== SESSION_STATUS.VOTING) {
                throw new Error('Cannot vote when session is not in voting status');
            }
            return baseApiService.post(`/sessions/${sessionId}/restaurants/${rid}/vote`, { uid });
        } catch (error) {
            console.error('Error voting on restaurant:', error);
            throw error;
        }
    }

    async getVotingResults(sessionId) {
        try {
            // Only allow getting results in VOTING or FINISHED status
            const session = await this.getSession(sessionId);
            if (session.status !== SESSION_STATUS.VOTING && session.status !== SESSION_STATUS.FINISHED) {
                throw new Error('Cannot get voting results when session is not in voting or finished status');
            }
            return baseApiService.get(`/sessions/${sessionId}/voting-results`);
        } catch (error) {
            console.error('Error getting voting results:', error);
            throw error;
        }
    }
}

export default new SessionService();