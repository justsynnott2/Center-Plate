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


//IDs of places from FourSquare API
const DINING_CATEGORY_IDS = [
  // Core dining categories
  '4d4b7105d754a06374d81259', // Restaurants
  '63be6904847c3692a84b9bb5', // Dining and Drinking
  '4bf58dd8d48988d116941735', // Bars
  '4bf58dd8d48988d11b941735', // Pubs
  '4bf58dd8d48988d16a941735', // Bakeries
  '63be6904847c3692a84b9bb6', // Cafes, Coffee, and Tea Houses
  '4bf58dd8d48988d16e941735', // Fast Food Restaurants
  '4bf58dd8d48988d147941735', // Diners
  '4bf58dd8d48988d1cb941735', // Food Trucks
  '4bf58dd8d48988d120951735', // Food Courts
  '52e81612bcbc57f1066b7a00', // Comfort Food Restaurants
  '4bf58dd8d48988d1d3941735', // Vegan and Vegetarian Restaurants
  '4bf58dd8d48988d14f941735', // Southern Food Restaurants
  '4bf58dd8d48988d1cc941735', // Steakhouses
  '4bf58dd8d48988d1ca941735', // Pizzerias
  '4bf58dd8d48988d153941735', // Burrito Restaurants
  '4bf58dd8d48988d1c0941735', // Mediterranean Restaurants
  '4bf58dd8d48988d1c1941735', // Mexican Restaurants
  '4bf58dd8d48988d1ce941735', // Seafood Restaurants
  '4bf58dd8d48988d10e941735', // Greek Restaurants
  '4bf58dd8d48988d111941735', // Italian Restaurants
  '4bf58dd8d48988d110941735', // Indian Restaurants
  '4bf58dd8d48988d111941735', // Italian Restaurants
  '4bf58dd8d48988d1d2941735', // Sushi Restaurants
  '4bf58dd8d48988d1d1941735', // Noodle Restaurants
  '4bf58dd8d48988d149941735', // Thai Restaurants
  '4bf58dd8d48988d14a941735', // Vietnamese Restaurants
  '4bf58dd8d48988d10c941735', // French Restaurants
  '4bf58dd8d48988d150941735', // Spanish Restaurants
  '4bf58dd8d48988d1db931735', // Tapas Restaurants
  '4bf58dd8d48988d151941735', // Taco Restaurants
  '4bf58dd8d48988d1c5941735', // Sandwich Spots
  '4bf58dd8d48988d1bd941735', // Salad Restaurants
  '4bf58dd8d48988d148941735', // Donut Shops
  '4bf58dd8d48988d1c9941735', // Ice Cream Parlors
  '4bf58dd8d48988d1d0941735', // Dessert Shops
  '4bf58dd8d48988d1bc941735', // Cupcake Shops
  '512e7cae91d4cbb4e5efe0af', // Frozen Yogurt Shops
  '52e81612bcbc57f1066b7a0c', // Bubble Tea Shops
  '4bf58dd8d48988d1e0931735', // Coffee Shops
  '4bf58dd8d48988d16d941735', // Cafés
  '4bf58dd8d48988d1dc931735', // Tea Rooms
  '52e81612bcbc57f1066b79f2', // Creperies
  '62d5af45da6648532de303ee', // Waffle Shops
  '4bf58dd8d48988d1de941735', // Vineyards
  '4bf58dd8d48988d14b941735', // Wineries
  '4e0e22f5a56208c4ea9a85a0', // Distilleries
  '50327c8591d4c4b30a586d5d', // Breweries
  '5e189fd6eee47d000759bbfd', // Cideries
  '5e189d71eee47d000759b7e2', // Meaderies
  '4bf58dd8d48988d179941735', // Bagel Shops
  '4bf58dd8d48988d143941735', // Breakfast Spots
  '4bf58dd8d48988d1be941735', // Latin American Restaurants
  '4bf58dd8d48988d144941735', // Caribbean Restaurants
  '4bf58dd8d48988d1bf941735', // Mac and Cheese Joints
  '4bf58dd8d48988d17a941735', // Cajun and Creole Restaurants
  '4bf58dd8d48988d1df931735', // BBQ Joints
  '4bf58dd8d48988d16b941735', // Brazilian Restaurants
  '4bf58dd8d48988d152941735', // Arepa Restaurants
  '4bf58dd8d48988d107941735', // Argentinian Restaurants
  '4bf58dd8d48988d10f941735', // Indian Restaurants
  '4bf58dd8d48988d1f5941735', // Dim Sum Restaurants
  '4bf58dd8d48988d1c3941735', // Moroccan Restaurants
  '4bf58dd8d48988d1c7941735', // Snack Places
  '4bf58dd8d48988d155941735', // Gastropubs
].join(',');
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

async function scoreLocationRestaurants(coordinates, filters, radius = 10000) { 
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
            radius: radius.toString(),
            limit: 50,
            query: query || '',
            categoryId: DINING_CATEGORY_IDS,
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
        bestRestaurants: foundRestaurants.slice(0, 25)
    };
    
    logger.info(`Location scored successfully: ${result.restaurantCount} restaurants found, score: ${result.totalScore}`);
    return result;
}

const getRestaurantImages = async (restaurantId) => {
    logger.warn(`Image fetching for v2 API is not yet implemented for restaurant ID: ${restaurantId}`);
    return [];
}

export { fetchAllCities, scoreLocationRestaurants, getRestaurantImages };
