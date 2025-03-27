// API base URL configuration
const API_BASE_URL = 'http://localhost:3000';

// Selecting DOM elements that will be manipulated
const keywordInput = document.getElementById('keyword');
const searchButton = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const resultsHeader = document.getElementById('results-header');
const searchTermSpan = document.getElementById('search-term');
const resultsCountSpan = document.getElementById('results-count');
const productsContainer = document.getElementById('products-container');
const errorMessage = document.getElementById('error-message');

// Function to show the loader and disable the search button
function showLoader() {
  loader.classList.remove('hidden');
  searchButton.disabled = true;
}

// Function to hide the loader and re-enable the search button
function hideLoader() {
  loader.classList.add('hidden');
  searchButton.disabled = false;
}

// Function to show an error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

// Function to hide the error message
function hideError() {
  errorMessage.classList.add('hidden');
  errorMessage.textContent = '';
}

// Function to generate rating stars
function generateStars(rating) {
  // Converting rating text to a number
  // Example: "4.5 out of 5 stars" -> 4.5
  const ratingValue = parseFloat(rating.replace(/[^\d.]/g, ''));

  if (isNaN(ratingValue)) {
    return '☆☆☆☆☆';
  }

  // Rounding to the nearest 0.5
  const roundedRating = Math.round(ratingValue * 2) / 2;

  // Generating stars representation
  const fullStars = Math.floor(roundedRating);
  const halfStar = roundedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Function to create a product card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  // Creating the card's HTML content
  card.innerHTML = `
    <img 
      src="${product.imageUrl}" 
      alt="${product.title}" 
      class="product-image"
      onerror="this.src='https://via.placeholder.com/300x300?text=Image+Not+Available'"
    >
    <div class="product-info">
      <div class="product-title">${product.title}</div>
      <div class="product-rating">
        <span class="stars">${generateStars(product.rating)}</span>
        <span class="review-count">(${product.reviewCount})</span>
      </div>
    </div>
  `;

  return card;
}

// Function to fetch products from the API
async function fetchProducts(keyword) {
  try {
    // Preparing UI for search
    showLoader();
    hideError();
    productsContainer.innerHTML = '';
    resultsHeader.classList.add('hidden');

    // Building the API URL with the keyword
    const url = `${API_BASE_URL}/api/scrape?keyword=${encodeURIComponent(keyword)}`;

    // Making the API request
    console.log(`Fetching products for keyword: ${keyword}`);
    const response = await fetch(url);

    // Checking if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching products');
    }

    // Processing the response data
    const data = await response.json();
    console.log(`Received ${data.count} products from API`);

    // Updating UI with results
    searchTermSpan.textContent = keyword;
    resultsCountSpan.textContent = data.count;
    resultsHeader.classList.remove('hidden');

    // Creating and adding product cards to the container
    data.products.forEach(product => {
      const productCard = createProductCard(product);
      productsContainer.appendChild(productCard);
    });

    // Display a message if no products are found
    if (data.count === 0) {
      productsContainer.innerHTML = `
        <div class="no-results">
          <p>No products found for "${keyword}".</p>
          <p>Try a different keyword.</p>
        </div>
      `;
    }

  } catch (error) {
    // Error handling
    console.error('Error:', error);
    showError(`Failed to fetch products: ${error.message}`);
  } finally {
    // Always hide the loader when done
    hideLoader();
  }
}

// Setting up click event for the search button
searchButton.addEventListener('click', () => {
  const keyword = keywordInput.value.trim();

  // Checking if a keyword was provided
  if (!keyword) {
    showError('Please enter a keyword to search for.');
    return;
  }

  // Starting the search
  fetchProducts(keyword);
});

// Setting up Enter key press event for the input
keywordInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    searchButton.click();
  }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Focus on the input when the page loads
  keywordInput.focus();
  console.log('Amazon Product Scraper frontend initialized');
});
