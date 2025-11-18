// js/add-item.js
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const addItemForm = document.getElementById('addItemForm');
const itemName = document.getElementById('itemName');
const itemDescription = document.getElementById('itemDescription');
const itemCategory = document.getElementById('itemCategory');
const rentPerHour = document.getElementById('rentPerHour');
const depositAmount = document.getElementById('depositAmount');
const itemCondition = document.getElementById('itemCondition');
const imageUrl = document.getElementById('imageUrl');
const address = document.getElementById('address');
const city = document.getElementById('city');
const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');
const ownerContact = document.getElementById('ownerContact');
const getLocationBtn = document.getElementById('getLocationBtn');
const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Event Listeners
addItemForm.addEventListener('submit', addItem);
getLocationBtn.addEventListener('click', getCurrentLocation);
logoutBtn.addEventListener('click', logout);

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to add items');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Get current location
function getCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  getLocationBtn.disabled = true;
  getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Detecting...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude;
      longitude.value = position.coords.longitude;
      
      getLocationBtn.disabled = false;
      getLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs mr-2"></i> Use My Current Location';
      
      alert('Location detected successfully!');
    },
    (error) => {
      alert('Unable to retrieve your location: ' + error.message);
      getLocationBtn.disabled = false;
      getLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs mr-2"></i> Use My Current Location';
    }
  );
}

// Add item
async function addItem(e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to add items');
    window.location.href = 'login.html';
    return;
  }

  // Validate form
  if (!itemName.value.trim() || !itemDescription.value.trim() || !itemCategory.value ||
      !rentPerHour.value || !address.value.trim() || !city.value.trim() ||
      !latitude.value || !longitude.value) {
    alert('Please fill in all required fields');
    return;
  }

  // Prepare item data
  const itemData = {
    name: itemName.value.trim(),
    description: itemDescription.value.trim(),
    category: itemCategory.value,
    imageUrl: imageUrl.value.trim() || undefined,
    rentPerHour: parseFloat(rentPerHour.value),
    address: address.value.trim(),
    city: city.value.trim(),
    latitude: parseFloat(latitude.value),
    longitude: parseFloat(longitude.value),
    ownerContact: ownerContact.value.trim() || undefined,
    condition: itemCondition.value,
    depositAmount: depositAmount.value ? parseFloat(depositAmount.value) : 0
  };

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating...';

  try {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add item');
    }

    alert('🎉 Item added successfully!\n\nYour item is now visible to nearby users.');
    
    // Redirect to profile or main page
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 1000);

  } catch (error) {
    console.error('Add item error:', error);
    alert('Error: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-plus-circle mr-2"></i> List Item for Rent';
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Initialize
checkAuth();
