interface Business {
    name: string;
    address: string;
    rating: number;
    type: string;
}

interface SearchParams {
    lat: number;
    lng: number;
    zoom: number;
    limit: number;
    language: string;
    region: string;
    extract_emails_and_contacts: boolean;
    query: string;
}

// API Configuration
const API_CONFIG = {
    baseUrl: 'https://local-business-data.p.rapidapi.com/search-in-area',
    headers: {
        'x-rapidapi-key': 'b0d6424ce8msh7f30f1848f91c61p19ce4ejsnb32bb571da63',
        'x-rapidapi-host': 'local-business-data.p.rapidapi.com'
    }
};

// City locations with latitude and longitude
const CITY_LOCATIONS = {
    'Orono': { lat: 44.88269, lng: -68.71603 },
    'Bangor': { lat: 44.8016, lng: -68.7772 },
    'Portland': { lat: 43.6591, lng: -70.2568 },
    'Bar Harbor': { lat: 44.3876, lng: -68.2039 },
    'Augusta': { lat: 44.3106, lng: -69.7795 }
};

// DOM Elements
const citySelect = document.getElementById('city') as HTMLSelectElement;
const randomButton = document.getElementById('randomButton') as HTMLButtonElement;
const resultCard = document.getElementById('resultCard') as HTMLDivElement;
const restaurantName = document.getElementById('restaurantName') as HTMLHeadingElement;
const restaurantAddress = document.getElementById('restaurantAddress') as HTMLParagraphElement;
const restaurantRating = document.getElementById('restaurantRating') as HTMLDivElement;
const restaurantType = document.getElementById('restaurantType') as HTMLParagraphElement;

// Utility Functions
function showLoading(): void {
    randomButton.disabled = true;
    randomButton.textContent = 'Loading...';
}

function hideLoading(): void {
    randomButton.disabled = false;
    randomButton.textContent = 'Surprise Me!';
}

function showError(message: string): void {
    alert(message);
    hideLoading();
}

async function fetchBusinesses(params: SearchParams): Promise<Business[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            queryParams.append(key, value.toString());
        }
    });

    const url = `${API_CONFIG.baseUrl}?${queryParams.toString()}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: API_CONFIG.headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching businesses:', error);
        throw error;
    }
}

// Fetch and display random restaurant
async function getRandomRestaurant(): Promise<void> {
    const selectedCity = citySelect.value;
    
    if (!selectedCity) {
        showError('Please select a city first');
        return;
    }
    
    showLoading();
    
    try {
        const location = CITY_LOCATIONS[selectedCity];
        const params: SearchParams = {
            lat: location.lat,
            lng: location.lng,
            zoom: 13,
            limit: 10,
            language: 'en',
            region: 'us',
            extract_emails_and_contacts: false,
            query: 'Restaurants'
        };
        
        const businesses = await fetchBusinesses(params);
        
        if (businesses.length === 0) {
            throw new Error('No restaurants found in this area');
        }
        
        // Randomly select a restaurant
        const randomIndex = Math.floor(Math.random() * businesses.length);
        const restaurant = businesses[randomIndex];
        
        // Display the restaurant
        restaurantName.textContent = restaurant.name;
        restaurantAddress.textContent = restaurant.address;
        restaurantRating.textContent = `Rating: ${restaurant.rating}`;
        restaurantType.textContent = restaurant.type || 'Restaurant';
        
        // Show the result card with animation
        resultCard.classList.remove('hidden');
        setTimeout(() => resultCard.classList.add('show'), 10);
        
    } catch (error) {
        showError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
        hideLoading();
    }
}

// Event Listeners
randomButton.addEventListener('click', getRandomRestaurant);

