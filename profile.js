// js/profile.js
const API_URL = 'http://localhost:5000/api';
let currentProfile = null;

// DOM Elements
const loadingIndicator = document.getElementById('loadingIndicator');
const profileContainer = document.getElementById('profileContainer');
const avatarImg = document.getElementById('avatarImg');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const borrowedCount = document.getElementById('borrowedCount');
const lendedCount = document.getElementById('lendedCount');
const totalCount = document.getElementById('totalCount');
const borrowedList = document.getElementById('borrowedList');
const lendedList = document.getElementById('lendedList');
const editProfileBtn = document.getElementById('editProfileBtn');
const editAvatarBtn = document.getElementById('editAvatarBtn');
const editModal = document.getElementById('editModal');
const editProfileForm = document.getElementById('editProfileForm');
const editName = document.getElementById('editName');
const editEmail = document.getElementById('editEmail');
const editAvatar = document.getElementById('editAvatar');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Event Listeners
editProfileBtn.addEventListener('click', openEditModal);
editAvatarBtn.addEventListener('click', openEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
editProfileForm.addEventListener('submit', saveProfile);
logoutBtn.addEventListener('click', logout);

// Click outside modal to close
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Fetch profile
async function fetchProfile() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/profiles/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        logout();
        return;
      }
      throw new Error('Failed to fetch profile');
    }

    currentProfile = await response.json();
    displayProfile(currentProfile);
  } catch (error) {
    console.error('Fetch profile error:', error);
    alert('Failed to load profile');
  } finally {
    loadingIndicator.classList.add('hidden');
    profileContainer.classList.remove('hidden');
  }
}

// Display profile
function displayProfile(profile) {
  // Set avatar
  if (profile.avatarUrl) {
    avatarImg.src = profile.avatarUrl;
  } else {
    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=128&background=0D8ABC&color=fff`;
  }

  // Set basic info
  profileName.textContent = profile.name;
  profileEmail.innerHTML = `<i class="fas fa-envelope mr-2"></i> ${profile.email}`;

  // Set counts
  const borrowed = profile.recentlyBorrowed || [];
  const lended = profile.recentlyLended || [];
  
  borrowedCount.textContent = borrowed.length;
  lendedCount.textContent = lended.length;
  totalCount.textContent = borrowed.length + lended.length;

  // Display borrowed items
  if (borrowed.length === 0) {
    borrowedList.innerHTML = '<p class="text-gray-500 text-center py-4">No items borrowed yet</p>';
  } else {
    borrowedList.innerHTML = borrowed.map((item, index) => `
      <div class="flex items-center justify-between p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition">
        <div class="flex items-center gap-3">
          <span class="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold">
            ${index + 1}
          </span>
          <span class="text-gray-800 font-medium">${item}</span>
        </div>
        <i class="fas fa-check-circle text-teal-600"></i>
      </div>
    `).join('');
  }

  // Display lended items
  if (lended.length === 0) {
    lendedList.innerHTML = '<p class="text-gray-500 text-center py-4">No items lended yet</p>';
  } else {
    lendedList.innerHTML = lended.map((item, index) => `
      <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
        <div class="flex items-center gap-3">
          <span class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            ${index + 1}
          </span>
          <span class="text-gray-800 font-medium">${item}</span>
        </div>
        <i class="fas fa-check-circle text-blue-600"></i>
      </div>
    `).join('');
  }
}

// Open edit modal
function openEditModal() {
  if (!currentProfile) return;
  
  editName.value = currentProfile.name;
  editEmail.value = currentProfile.email;
  editAvatar.value = currentProfile.avatarUrl || '';
  
  editModal.classList.remove('hidden');
  editModal.classList.add('flex');
}

// Close edit modal
function closeEditModal() {
  editModal.classList.add('hidden');
  editModal.classList.remove('flex');
}

// Save profile
async function saveProfile(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('token');
  const updatedProfile = {
    name: editName.value.trim(),
    email: editEmail.value.trim(),
    avatarUrl: editAvatar.value.trim()
  };

  try {
    const response = await fetch(`${API_URL}/profiles/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedProfile)
    });

    if (!response.ok) throw new Error('Failed to update profile');

    const data = await response.json();
    currentProfile = data.profile;
    displayProfile(currentProfile);
    closeEditModal();
    
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Update profile error:', error);
    alert('Failed to update profile');
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Initialize
if (checkAuth()) {
  fetchProfile();
}
