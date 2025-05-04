// Types
interface Business {
    business_id: string;
    name: string;
    type: string;
    full_address: string;
    rating: number;
    reviews: number;
    website?: string;
    phone_number?: string;
    latitude: number;
    longitude: number;
}

interface SearchParams {
    query?: string;
    lat: number;
    lng: number;
    zoom: number;
    limit: number;
    language: string;
    region: string;
}

interface CityLocation {
    name: string;
    lat: number;
    lng: number;
}

// Constants
const CITY_LOCATIONS: CityLocation[] = [
    { name: 'Orono', lat: 44.8832, lng: -68.6719 },
    { name: 'Bangor', lat: 44.8016, lng: -68.7772 },
    { name: 'Portland', lat: 43.6591, lng: -70.2568 },
    { name: 'Bar Harbor', lat: 44.3876, lng: -68.2039 },
    { name: 'Augusta', lat: 44.3106, lng: -69.7795 }
];

const API_CONFIG = {
    baseUrl: 'https://local-business-data.p.rapidapi.com/search-in-area',
    headers: {
        'x-rapidapi-key': 'b0d6424ce8msh7f30f1848f91c61p19ce4ejsnb32bb571da63',
        'x-rapidapi-host': 'local-business-data.p.rapidapi.com'
    }
};

// DOM Elements
const searchForm = document.getElementById('searchForm') as HTMLFormElement;
const resultsContainer = document.getElementById('resultsContainer') as HTMLDivElement;
const businessModal = document.getElementById('businessModal') as HTMLDivElement;
const modalTitle = document.getElementById('modalTitle') as HTMLHeadingElement;
const modalContent = document.getElementById('modalContent') as HTMLDivElement;
const modalClose = document.querySelector('.modal__close') as HTMLButtonElement;
const citySelect = document.getElementById('city') as HTMLSelectElement;


// When loading api results
function showLoading(): void {
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="loading__spinner"></div>
        </div>
    `;
}

function hideLoading(): void {
    const loadingElement = resultsContainer.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showError(message: string): void {
    resultsContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

function createBusinessCard(business: Business): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'business-card';
    card.innerHTML = `
        <h3 class="business-card__title">${business.name}</h3>
        <p class="business-card__address">${business.full_address}</p>
        <div class="business-card__rating">
            <span>⭐ ${business.rating.toFixed(1)}</span>
            <span>(${business.reviews} reviews)</span>
        </div>
        <span class="business-card__type">${business.type}</span>
    `;
    
    card.addEventListener('click', () => showBusinessDetails(business));
    return card;
}

function showBusinessDetails(business: Business): void {
    modalTitle.textContent = business.name;
    modalContent.innerHTML = `
        <div class="business-details">
            <p><strong>Type:</strong> ${business.type}</p>
            <p><strong>Address:</strong> ${business.full_address}</p>
            <p><strong>Rating:</strong> ⭐ ${business.rating.toFixed(1)} (${business.reviews} reviews)</p>
            ${business.website ? `<p><strong>Website:</strong> <a href="${business.website}" target="_blank" rel="noopener noreferrer">${business.website}</a></p>` : ''}
            ${business.phone_number ? `<p><strong>Phone:</strong> <a href="tel:${business.phone_number}">${business.phone_number}</a></p>` : ''}
            <p><strong>Location:</strong> ${business.latitude}, ${business.longitude}</p>
        </div>
    `;
    
    businessModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(): void {
    businessModal.classList.remove('active');
    document.body.style.overflow = '';
}

// API Functions
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

// Event Handlers
function handleCityChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedCity = CITY_LOCATIONS.find(city => city.name === select.value);
    
    if (selectedCity) {
        const latInput = document.getElementById('lat') as HTMLInputElement;
        const lngInput = document.getElementById('lng') as HTMLInputElement;
        
        latInput.value = selectedCity.lat.toString();
        lngInput.value = selectedCity.lng.toString();
    }
}


async function handleSearch(event: Event): Promise<void> {
    event.preventDefault();
    
    const formData = new FormData(searchForm);
    const selectedCity = formData.get('city') as string;
    
    if (!selectedCity) {
        showError('Please select a city');
        return;
    }
    
    const cityLocation = CITY_LOCATIONS.find(city => city.name === selectedCity);
    if (!cityLocation) {
        showError('Invalid city selection');
        return;
    }
    
    const params: SearchParams = {
        query: formData.get('query') as string,
        lat: cityLocation.lat,
        lng: cityLocation.lng,
        zoom: 13,
        limit: parseInt(formData.get('limit') as string),
        language: 'en',
        region: 'us'
    };

    try {
        showLoading();
        const businesses = await fetchBusinesses(params);
        
        if (businesses.length === 0) {
            showError('No businesses found matching your criteria.');
            return;
        }

        resultsContainer.innerHTML = '';
        // Using a for loop as required
        for (let i = 0; i < businesses.length; i++) {
            resultsContainer.appendChild(createBusinessCard(businesses[i]));
        }
    } catch (error) {
        showError('An error occurred while fetching businesses. Please try again.');
    } finally {
        hideLoading();
    }
}

// Initialize
function initialize(): void {
    // Event Listeners
    searchForm.addEventListener('submit', handleSearch);
    modalClose.addEventListener('click', closeModal);
    citySelect.addEventListener('change', handleCityChange);
    
    
    // Close modal when clicking outside
    businessModal.addEventListener('click', (event) => {
        if (event.target === businessModal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && businessModal.classList.contains('active')) {
            closeModal();
        }
    });
    

}

// Start the application
document.addEventListener('DOMContentLoaded', initialize); 