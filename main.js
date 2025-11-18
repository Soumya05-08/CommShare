// js/main.js
const API_URL = 'http://localhost:5000/api';
let currentLocation = { lat: null, lng: null };
let allItems = [];

// DOM Elements
const useMyLocationBtn = document.getElementById('useMyLocationBtn');
const manualLocationBtn = document.getElementById('manualLocationBtn');
const manualLocationInput = document.getElementById('manualLocationInput');
const manualAddress = document.getElementById('manualAddress');
const geocodeBtn = document.getElementById('geocodeBtn');
const locationDisplay = document.getElementById('locationDisplay');
const locationText = document.getElementById('locationText');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const radiusFilter = document.getElementById('radiusFilter');
const sortFilter = document.getElementById('sortFilter');
const itemsGrid = document.getElementById('itemsGrid');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');
const itemCount = document.getElementById('itemCount');
const logoutBtn = document.getElementById('logoutBtn');

// Event Listeners
useMyLocationBtn.addEventListener('click', useMyLocation);
manualLocationBtn.addEventListener('click', toggleManualLocation);
geocodeBtn.addEventListener('click', geocodeAddress);
searchBtn.addEventListener('click', searchItems);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchItems();
});
categoryFilter.addEventListener('change', searchItems);
radiusFilter.addEventListener('change', searchItems);
sortFilter.addEventListener('change', () => displayItems(allItems));
logoutBtn.addEventListener('click', logout);

// Use device location
function useMyLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  useMyLocationBtn.disabled = true;
  useMyLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Detecting...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation.lat = position.coords.latitude;
      currentLocation.lng = position.coords.longitude;
      
      locationText.textContent = `Location detected: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
      locationDisplay.classList.remove('hidden');
      manualLocationInput.classList.add('hidden');
      
      useMyLocationBtn.disabled = false;
      useMyLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs mr-2"></i> Use My Location';
      
      // Auto-search with current location
      searchItems();
    },
    (error) => {
      alert('Unable to retrieve your location: ' + error.message);
      useMyLocationBtn.disabled = false;
      useMyLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs mr-2"></i> Use My Location';
    }
  );
}

// Toggle manual location input
function toggleManualLocation() {
  manualLocationInput.classList.toggle('hidden');
}

// Geocode address using Nominatim (OpenStreetMap)
async function geocodeAddress() {
  const address = manualAddress.value.trim();
  if (!address) {
    alert('Please enter an address');
    return;
  }

  geocodeBtn.disabled = true;
  geocodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
    const data = await response.json();

    if (data && data.length > 0) {
      currentLocation.lat = parseFloat(data[0].lat);
      currentLocation.lng = parseFloat(data[0].lon);
      
      locationText.textContent = `Location: ${data[0].display_name}`;
      locationDisplay.classList.remove('hidden');
      
      // Auto-search with geocoded location
      searchItems();
    } else {
      alert('Location not found. Please try a different address.');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    alert('Failed to geocode address. Please try again.');
  } finally {
    geocodeBtn.disabled = false;
    geocodeBtn.innerHTML = '<i class="fas fa-search"></i>';
  }
}

// Search items
async function searchItems() {
  if (!currentLocation.lat || !currentLocation.lng) {
    alert('Please select a location first');
    return;
  }

  const search = searchInput.value.trim();
  const category = categoryFilter.value;
  const radius = radiusFilter.value;

  // Show loading
  loadingIndicator.classList.remove('hidden');
  itemsGrid.innerHTML = '';
  noResults.classList.add('hidden');
  resultsCount.classList.add('hidden');

  try {
    let url = `${API_URL}/items?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=${radius}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch items');
    
    let items = await response.json();

    // Filter by category if selected
    if (category) {
      items = items.filter(item => item.category === category);
    }

    allItems = items;
    displayItems(items);
  } catch (error) {
    console.error('Search error:', error);
    alert('Failed to load items. Please try again.');
  } finally {
    loadingIndicator.classList.add('hidden');
  }
}

// Display items
function displayItems(items) {
  itemsGrid.innerHTML = '';
  
  if (items.length === 0) {
    noResults.classList.remove('hidden');
    resultsCount.classList.add('hidden');
    return;
  }

  // Sort items
  const sortBy = sortFilter.value;
  let sortedItems = [...items];
  
  if (sortBy === 'price-low') {
    sortedItems.sort((a, b) => a.rentPerHour - b.rentPerHour);
  } else if (sortBy === 'price-high') {
    sortedItems.sort((a, b) => b.rentPerHour - a.rentPerHour);
  }

  // Display items
  sortedItems.forEach(item => {
    const card = createItemCard(item);
    itemsGrid.appendChild(card);
  });

  // Show results count
  itemCount.textContent = items.length;
  resultsCount.classList.remove('hidden');
  noResults.classList.add('hidden');
}

// Create item card
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer';
  card.onclick = () => viewItemDetail(item._id);

  // Calculate distance if location is available
  let distanceText = '';
  if (currentLocation.lat && currentLocation.lng && item.location.coordinates) {
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      item.location.coordinates.coordinates[1],
      item.location.coordinates.coordinates[0]
    );
    distanceText = `<p class="text-gray-500 text-sm mt-1"><i class="fas fa-map-marker-alt mr-1"></i> ${distance.toFixed(1)} km away</p>`;
  }

  card.innerHTML = `
    <div class="relative">
      <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-48 object-cover">
      <span class="absolute top-2 right-2 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
        ${item.category}
      </span>
    </div>
    <div class="p-4">
      <h3 class="font-bold text-lg text-gray-800 mb-2">${item.name}</h3>
      <p class="text-gray-600 text-sm mb-3 line-clamp-2">${item.description}</p>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-teal-600 font-bold text-xl">₹${item.rentPerHour}/hr</p>
          ${distanceText}
        </div>
        <button class="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition text-sm font-semibold">
          View
        </button>
      </div>
    </div>
  `;

  return card;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// View item detail
function viewItemDetail(itemId) {
  window.location.href = `item-detail.html?id=${itemId}`;
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  }
}

// Initialize
checkAuth();

// Load all items on page load (without location filter)
async function loadAllItems() {
  try {
    const response = await fetch(`${API_URL}/items`);
    if (response.ok) {
      const items = await response.json();
      allItems = items;
      displayItems(items);
    }
  } catch (error) {
    console.error('Load items error:', error);
  }
}

// Load all items initially
loadAllItems();
