/**
 * Diary Frontend JavaScript
 * This file handles the diary entry functionality including:
 * - Fetching and displaying user's diary entries
 * - Submitting new diary entries
 * - Handling authentication
 */

// Global variables
let token = null;
const apiUrl = 'http://localhost:3000/api';
let userId = null;

// DOM elements
const diaryForm = document.getElementById('diary-form');
const entriesContainer = document.getElementById('entries-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const messageContainer = document.getElementById('message-container');
const authContainer = document.getElementById('auth-container');
const diaryContainer = document.getElementById('diary-container');

// Check if user is logged in
const checkAuth = () => {
  token = localStorage.getItem('token');
  if (token) {
    authContainer.style.display = 'none';
    diaryContainer.style.display = 'block';
    fetchUserInfo();
    fetchEntries();
  } else {
    authContainer.style.display = 'block';
    diaryContainer.style.display = 'none';
  }
};

// Fetch user information
const fetchUserInfo = async () => {
  try {
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      userId = userData.user_id;
      document.getElementById('username-display').textContent = userData.username;
    } else {
      // Token might be invalid or expired
      localStorage.removeItem('token');
      checkAuth();
    }
  } catch (error) {
    showMessage('Error fetching user data: ' + error.message, 'error');
  }
};

// Fetch all diary entries for the logged in user
const fetchEntries = async () => {
  try {
    const response = await fetch(`${apiUrl}/entries`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const entries = await response.json();
      displayEntries(entries);
    } else {
      showMessage('Failed to fetch entries. Please try again.', 'error');
    }
  } catch (error) {
    showMessage('Error fetching entries: ' + error.message, 'error');
  }
};

// Display entries in the DOM
const displayEntries = (entries) => {
  entriesContainer.innerHTML = '';
  
  if (entries.length === 0) {
    entriesContainer.innerHTML = '<p>No diary entries yet. Add your first one!</p>';
    return;
  }
  
  // Sort entries by date (newest first)
  entries.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
  
  entries.forEach(entry => {
    const entryDate = new Date(entry.entry_date).toLocaleDateString();
    
    const entryElement = document.createElement('div');
    entryElement.className = 'entry-card';
    
    entryElement.innerHTML = `
      <div class="entry-header">
        <h3>${entryDate}</h3>
        <span class="mood-badge">${entry.mood}</span>
      </div>
      <div class="entry-stats">
        <span><strong>Weight:</strong> ${entry.weight} kg</span>
        <span><strong>Sleep:</strong> ${entry.sleep_hours} hours</span>
      </div>
      <div class="entry-notes">
        <p>${entry.notes || 'No notes'}</p>
      </div>
    `;
    
    entriesContainer.appendChild(entryElement);
  });
};

// Add a new diary entry
const addEntry = async (entryData) => {
  try {
    const response = await fetch(`${apiUrl}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(entryData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage('Entry added successfully!', 'success');
      diaryForm.reset();
      fetchEntries(); // Refresh the entries list
    } else {
      showMessage(`Failed to add entry: ${data.message || 'Unknown error'}`, 'error');
      if (data.errors) {
        data.errors.forEach(err => {
          showMessage(`Field ${err.field}: ${err.message}`, 'error');
        });
      }
    }
  } catch (error) {
    showMessage('Error adding entry: ' + error.message, 'error');
  }
};

// Handle login
const login = async (username, password) => {
  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
      showMessage('Login successful!', 'success');
      checkAuth();
    } else {
      showMessage(`Login failed: ${data.message || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    showMessage('Error during login: ' + error.message, 'error');
  }
};

// Helper function to show messages
const showMessage = (message, type = 'info') => {
  messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
  
  // Clear message after 5 seconds
  setTimeout(() => {
    messageContainer.innerHTML = '';
  }, 5000);
};

// Event Listeners
if (diaryForm) {
  diaryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const formData = new FormData(diaryForm);
    const entryData = {
      entry_date: formData.get('entry_date'),
      mood: formData.get('mood'),
      weight: parseFloat(formData.get('weight')),
      sleep_hours: parseInt(formData.get('sleep_hours')),
      notes: formData.get('notes')
    };
    
    addEntry(entryData);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    login(username, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    showMessage('Logged out successfully', 'success');
    checkAuth();
  });
}

// Set today's date as the default for the entry date input
const setDefaultDate = () => {
  const dateInput = document.getElementById('entry_date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setDefaultDate();
});