import { scoreLocationRestaurants } from './midpointUtils.js';

/**
 * Finds the best restaurant location using an expanding search radius.
 * It first searches in a 10km radius around the geometric midpoint.
 * If not enough restaurants are found, it expands the search to 25km.
 * @param {Object[]} midpointResults - The results of midpoint calculations.
 * @param {Object[]} citiesData - Unused, kept for compatibility.
 * @param {string[][]} filters - A list of filters for restaurants.
 * @param {number} [minRestaurantCount=5] - The minimum number of restaurants to consider a location viable.
 * @returns {Promise<{bestScore: number, bestMethod: string}>} - The best scored location.
 */
const findBestRestaurantLocation = async (midpointResults, citiesData, filters, minRestaurantCount = 5) => {
    const geometricMidpointResult = midpointResults.find(r => r.method_name === 'geometric');

    if (!geometricMidpointResult) {
        return { bestScore: null, bestMethod: 'Error: Geometric midpoint not found' };
    }

    // 1. First, search in a standard 10km radius.
    let score = await scoreLocationRestaurants(geometricMidpointResult.coordinates, filters, 10000);

    // 2. If the first search is not good enough, expand the radius to 25km.
    if (score.restaurantCount < minRestaurantCount) {
        score = await scoreLocationRestaurants(geometricMidpointResult.coordinates, filters, 25000);
        return { bestScore: score, bestMethod: 'Geometric Midpoint (Expanded Search)' };
    }

    // 3. If the first search was sufficient, return its results.
    return { bestScore: score, bestMethod: 'Geometric Midpoint' };
};

export { findBestRestaurantLocation };
