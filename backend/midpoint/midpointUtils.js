import geolib from 'geolib';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import logger from '../logger.js';

dotenv.config();

const FOURSQUARE_API_URL = "https://api.foursquare.com/v2/venues/search";
const FOURSQUARE_CLIENT_ID = process.env.FOURSQUARE_CLIENT_ID;
const FOURSQUARE_CLIENT_SECRET = process.env.FOURSQUARE_CLIENT_SECRET;

if (!FOURSQUARE_CLIENT_ID || !FOURSQUARE_CLIENT_SECRET) {
    logger.error("Foursquare Client ID or Client Secret is not set in environment variables!");
} else {
    logger.info("Foursquare credentials are properly configured");
}

const CITIES_URL = "https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&refine.country_code=US";

async function fetchAllCities() {
    try {
        logger.info("Fetching cities from OpenDataSoft API");
        const response = await fetch(CITIES_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch cities: ${response.status}`);
        }
        const data = await response.json();
        const cities = data.records.map(city => ({
            name: city.fields.name || "Unknown",
            coordinates: city.fields.coordinates,
            population: city.fields.population || 0,
        }));
        logger.info("Successfully fetched %d cities", cities.length);
        return cities;
    } catch (error) {
        logger.error("Error fetching cities: %s", error.message);
        throw new Error(`Failed to fetch cities: ${error.message}`);
    }
}

async function scoreLocationRestaurants(coordinates, filters, radius = 10000) { // Accept radius as a parameter
    logger.info(`Entering scoreLocationRestaurants for coordinates: ${JSON.stringify(coordinates)} with radius: ${radius}m`);
    const [latitude, longitude] = coordinates;
    
    const filterCombinations = filters && filters.length > 0 
        ? filters.flatMap((_, i) => filters.slice(0, i + 1).map(combo => combo.join(" ")))
        : [""];

    let foundRestaurants = [];
    let restaurantScores = [];
    let rset = new Set();

    for (const query of filterCombinations) {
        logger.info(`Looping through filter combination: "${query || 'all'}"`);
        const params = new URLSearchParams({
            ll: `${latitude},${longitude}`,
            radius: radius.toString(), // Use the provided radius
            limit: 50,
            query: query || '',
            categoryId: '4d4b7105d754a06374d81259', // V2 ID for "Food"
            client_id: FOURSQUARE_CLIENT_ID,
            client_secret: FOURSQUARE_CLIENT_SECRET,
            v: '20251029'
        });

        try {
            const url = `${FOURSQUARE_API_URL}?${params}`;
            logger.info(`Constructed Foursquare GET request URL: ${url}`);
            const response = await fetch(url);
            logger.info(`Foursquare API response received. Status: ${response.status}`);

            if (!response.ok) {
                const errorBody = await response.text();
                logger.warn(`Foursquare API GET request failed with status: ${response.status}. Response: ${errorBody}` );
                continue;
            }
            
            const { response: { venues } } = await response.json();
            logger.info(`Successfully parsed Foursquare JSON response. Found ${venues.length} results.`);

            for (const result of venues) {
                const { id, name, location, categories } = result;
                
                if (!rset.has(id)) {
                    rset.add(id);
                    const { lat: restLat, lng: restLng } = location || {};
                    if (!restLat || !restLng) continue;
                    
                    const distance = geolib.getDistance({ latitude, longitude }, { latitude: restLat, longitude: restLng }) / 1000;
                    const score = 100 / (1 + distance / 5);

                    const restaurantData = { 
                        fsq_id: id, 
                        name, 
                        address: location?.formattedAddress?.join(', '), 
                        images: [], 
                        score, 
                        distance, 
                        coordinates: [restLat, restLng], 
                        categories: categories?.map(cat => cat.name) || [] 
                    };
                    foundRestaurants.push(restaurantData);
                    restaurantScores.push(score);
                }
            }
        } catch (e) {
            logger.error("Error processing query '%s': %s", query || "all", e.message);
        }
    }

    if (!restaurantScores.length) {
        logger.warn("No restaurants found for coordinates: [%f, %f]", latitude, longitude);
        return { location: coordinates, totalScore: 0, restaurantCount: 0, avgDistance: Infinity, bestRestaurants: [] };
    }
    
    foundRestaurants.sort((a, b) => b.score - a.score);
    const result = {
        location: coordinates,
        totalScore: restaurantScores.reduce((a, b) => a + b, 0) / restaurantScores.length,
        restaurantCount: foundRestaurants.length,
        avgDistance: foundRestaurants.reduce((a, b) => a + b.distance, 0) / foundRestaurants.length,
        bestRestaurants: foundRestaurants.slice(0, 10)
    };
    
    logger.info(`Location scored successfully: ${result.restaurantCount} restaurants found, score: ${result.totalScore}`);
    return result;
}

const getRestaurantImages = async (restaurantId) => {
    logger.warn(`Image fetching for v2 API is not yet implemented for restaurant ID: ${restaurantId}`);
    return [];
}

export { fetchAllCities, scoreLocationRestaurants, getRestaurantImages };
