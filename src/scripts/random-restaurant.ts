/**
I Used typescript to 
 */

interface Business {
    name: string;
    address: string;
    rating: number;
    type: string;
    hours?: string;
    phone?: string;
    website?: string;
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

// Modal Elements
const modal = document.getElementById('restaurantModal') as HTMLDivElement;
const modalClose = modal.querySelector('.modal__close') as HTMLButtonElement;
const modalRestaurantName = document.getElementById('modalRestaurantName') as HTMLHeadingElement;
const modalRestaurantAddress = document.getElementById('modalRestaurantAddress') as HTMLParagraphElement;
const modalRestaurantRating = document.getElementById('modalRestaurantRating') as HTMLDivElement;
const modalRestaurantType = document.getElementById('modalRestaurantType') as HTMLParagraphElement;
const modalRestaurantHours = document.getElementById('modalRestaurantHours') as HTMLDivElement;
const modalRestaurantPhone = document.getElementById('modalRestaurantPhone') as HTMLDivElement;
const modalRestaurantWebsite = document.getElementById('modalRestaurantWebsite') as HTMLDivElement;

// Utility Functions
function showLoading(): void {
    resultCard.innerHTML = `
        <div class="loading">
            <div class="loading__spinner"></div>
        </div>
    `;
    resultCard.classList.remove('hidden');
    randomButton.disabled = true;
}

function hideLoading(): void {
    const loadingElement = resultCard.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
    randomButton.disabled = false;
}

function showError(message: string): void {
    resultCard.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
    resultCard.classList.remove('hidden');
    hideLoading();
}

async function fetchBusinesses(params: SearchParams): Promise<Business[]> {
    // connect paramters to the base url
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
        displayRestaurant(restaurant);
        
    } catch (error) {
        showError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
        hideLoading();
    }
}

// Display the restaurant
function displayRestaurant(restaurant: Business): void {
    // Clear any loading or error states
    hideLoading();
    
    // Update result card content
    resultCard.innerHTML = `
        <div class="result-card__content">
            <h3 class="result-card__title">${restaurant.name}</h3>
            <p class="result-card__address">${restaurant.address}</p>
            <div class="result-card__rating">Rating: ⭐${restaurant.rating}</div>
            <p class="result-card__type">${restaurant.type || 'Restaurant'}</p>
        </div>
    `;
    
    // Show the result card with animation
    resultCard.classList.remove('hidden');
    setTimeout(() => resultCard.classList.add('show'), 10);

    // Make result card clickable
    resultCard.style.cursor = 'pointer';
    resultCard.addEventListener('click', () => showRestaurantDetails(restaurant));
}

// Show restaurant details in modal
function showRestaurantDetails(restaurant: Business): void {
    modalRestaurantName.textContent = restaurant.name;
    modalRestaurantAddress.textContent = restaurant.address;
    modalRestaurantRating.textContent = `Rating: ${restaurant.rating}`;
    modalRestaurantType.textContent = restaurant.type || 'Restaurant';
    
    // Optional details
    if (restaurant.hours) {
        modalRestaurantHours.innerHTML = `<strong>Hours:</strong> ${restaurant.hours}`;
    }
    if (restaurant.phone) {
        modalRestaurantPhone.innerHTML = `<strong>Phone:</strong> <a href="tel:${restaurant.phone}">${restaurant.phone}</a>`;
    }
    if (restaurant.website) {
        modalRestaurantWebsite.innerHTML = `<strong>Website:</strong> <a href="${restaurant.website}" target="_blank" rel="noopener noreferrer">${restaurant.website}</a>`;
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(): void {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event Listeners
randomButton.addEventListener('click', getRandomRestaurant);
modalClose.addEventListener('click', closeModal);

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

