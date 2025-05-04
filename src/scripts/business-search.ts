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

// API Configuration
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

// Utility Functions
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
async function handleSearch(event: Event): Promise<void> {
    event.preventDefault();
    
    const formData = new FormData(searchForm);
    const params: SearchParams = {
        query: formData.get('query') as string,
        lat: parseFloat(formData.get('lat') as string),
        lng: parseFloat(formData.get('lng') as string),
        zoom: parseInt(formData.get('zoom') as string),
        limit: parseInt(formData.get('limit') as string),
        language: formData.get('language') as string,
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
        businesses.forEach(business => {
            resultsContainer.appendChild(createBusinessCard(business));
        });
    } catch (error) {
        showError('An error occurred while fetching businesses. Please try again.');
    } finally {
        hideLoading();
    }
}

// Initialize
function initialize(): void {
    searchForm.addEventListener('submit', handleSearch);
    modalClose.addEventListener('click', closeModal);
    
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