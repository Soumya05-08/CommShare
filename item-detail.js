// js/item-detail.js
const API_URL = 'http://localhost:5000/api';
let map;
let currentItem;

// Get item ID from URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');

// DOM Elements
const loadingIndicator = document.getElementById('loadingIndicator');
const itemDetailContainer = document.getElementById('itemDetailContainer');
const itemImage = document.getElementById('itemImage');
const categoryBadge = document.getElementById('categoryBadge');
const conditionBadge = document.getElementById('conditionBadge');
const itemName = document.getElementById('itemName');
const rentPrice = document.getElementById('rentPrice');
const depositAmount = document.getElementById('depositAmount');
const itemDescription = document.getElementById('itemDescription');
const ownerName = document.getElementById('ownerName');
const ownerContact = document.getElementById('ownerContact');
const itemLocation = document.getElementById('itemLocation');
const availability = document.getElementById('availability');
const fullAddress = document.getElementById('fullAddress');
const rentBtn = document.getElementById('rentBtn');

// Event Listeners
rentBtn.addEventListener('click', rentItem);

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to view item details');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Fetch item details
async function fetchItemDetails() {
  if (!itemId) {
    alert('Item ID not found');
    window.location.href = 'main.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/items/${itemId}`);
    if (!response.ok) throw new Error('Failed to fetch item');
    
    currentItem = await response.json();
    displayItemDetails(currentItem);
  } catch (error) {
    console.error('Fetch item error:', error);
    alert('Failed to load item details');
    window.location.href = 'main.html';
  }
}

// Display item details
function displayItemDetails(item) {
  // Update all fields
  itemImage.src = item.imageUrl;
  itemImage.alt = item.name;
  categoryBadge.textContent = item.category;
  conditionBadge.textContent = item.condition;
  itemName.textContent = item.name;
  rentPrice.textContent = `₹${item.rentPerHour}/hr`;
  depositAmount.textContent = `₹${item.depositAmount}`;
  itemDescription.textContent = item.description;
  ownerName.textContent = item.ownerName;
  ownerContact.textContent = item.ownerContact;
  itemLocation.textContent = item.location.city;
  fullAddress.textContent = `${item.location.address}, ${item.location.city}`;
  
  // Availability status
  if (item.available) {
    availability.innerHTML = '<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i> Available</span>';
    rentBtn.disabled = false;
  } else {
    availability.innerHTML = '<span class="text-red-600"><i class="fas fa-times-circle mr-1"></i> Not Available</span>';
    rentBtn.disabled = true;
    rentBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }

  // Initialize map
  initMap(item.location.coordinates.coordinates);

  // Hide loading, show content
  loadingIndicator.classList.add('hidden');
  itemDetailContainer.classList.remove('hidden');
}

// Initialize map
function initMap(coordinates) {
  const [lng, lat] = coordinates;

  // Create map
  map = L.map('map').setView([lat, lng], 13);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Add marker
  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(`<b>${currentItem.name}</b><br>${currentItem.location.address}`).openPopup();
}

// Rent item
async function rentItem() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to rent items');
    window.location.href = 'login.html';
    return;
  }

  // Confirm rental
  const confirmed = confirm(
    `Do you want to borrow "${currentItem.name}" for ₹${currentItem.rentPerHour}/hr?\n\n` +
    `Deposit Required: ₹${currentItem.depositAmount}\n` +
    `Owner: ${currentItem.ownerName}\n` +
    `Contact: ${currentItem.ownerContact}`
  );

  if (!confirmed) return;

  rentBtn.disabled = true;
  rentBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

  try {
    const response = await fetch(`${API_URL}/items/${itemId}/rent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to rent item');
    }

    alert('🎉 Item borrowed successfully!\n\nYou can now contact the owner to arrange pickup.');
    
    // Redirect to profile
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 1000);

  } catch (error) {
    console.error('Rent error:', error);
    alert('Error: ' + error.message);
    rentBtn.disabled = false;
    rentBtn.innerHTML = '<i class="fas fa-handshake mr-2"></i> Rent This Item';
  }
}

// Initialize
if (checkAuth()) {
  fetchItemDetails();
}
