import geolib from 'geolib';
import { scoreLocationRestaurants } from './midpointUtils.js';
import logger from '../logger.js';

/**
 * Finds the best restaurant location using a balanced, expanding search.
 * 1. It finds the fairest midpoint by balancing restaurant score and distance from the geometric center.
 * 2. It searches in a small radius around that point.
 * 3. If results are sparse, it expands the search radius from the same point.
 */
const findBestRestaurantLocation = async (midpointResults, citiesData, filters, minRestaurantCount = 5) => {
    const geometricMidpointResult = midpointResults.find(r => r.method_name === 'geometric');

    if (!geometricMidpointResult) {
        return { bestScore: null, bestMethod: 'Error: Geometric midpoint not found' };
    }

    const geometricCenter = {
        latitude: geometricMidpointResult.coordinates[0],
        longitude: geometricMidpointResult.coordinates[1]
    };

    // 1. Score all potential locations with an initial small radius.
    const scoredCandidates = await Promise.all(
        midpointResults.map(async (result) => {
            const score = await scoreLocationRestaurants(result.coordinates, filters, 5000); // Start with 5km radius
            return { ...score, method_name: result.method_name };
        })
    );

    // 2. Calculate a balanced score for each to find the fairest hub.
    const balancedResults = scoredCandidates.map(candidate => {
        const restaurantScore = candidate.totalScore;
        const distanceFromCenter = geolib.getDistance(
            geometricCenter,
            { latitude: candidate.location[0], longitude: candidate.location[1] }
        ) / 1000;
        const fairnessPenalty = distanceFromCenter; // 1 point penalty per km from center
        const balancedScore = restaurantScore - fairnessPenalty;

        return {
            score: candidate,
            method: candidate.method_name,
            balancedScore: balancedScore
        };
    });

    // 3. Find the winning location based on the highest balanced score.
    const winner = balancedResults.reduce((best, current) => {
        return (!best || current.balancedScore > best.balancedScore) ? current : best;
    }, null);

    let finalScore = winner.score;
    let finalMethod = winner.method;

    // 4. Check quality and expand search if necessary.
    if (finalScore.restaurantCount < minRestaurantCount) {
        logger.info(`Initial 5km search found only ${finalScore.restaurantCount} restaurants. Expanding search to 15km...`);
        finalScore = await scoreLocationRestaurants(winner.score.location, filters, 15000); // Re-score the winning location with a 15km radius
        finalMethod = `${winner.method} (Expanded Search)`;
    }

    // 5. Return the best result.
    return {
        bestScore: finalScore,
        bestMethod: finalMethod
    };
};

export { findBestRestaurantLocation };
