import '../css/auth.css';
import { fetchData } from './fetch.js';

// Show a notification message
const showNotification = (message, type) => {
  const snackbar = document.createElement('div');
  snackbar.className = `snackbar ${type}`;
  snackbar.textContent = message;
  document.body.appendChild(snackbar);

  // Remove the snackbar after 3 seconds
  setTimeout(() => {
    snackbar.classList.add('fade-out');
    setTimeout(() => {
      snackbar.remove();
    }, 300);
  }, 3000);
};

// User registration
const registerUser = async (event) => {
  event.preventDefault();
  const registerForm = document.querySelector('.registerForm');
  const username = registerForm.querySelector('#username').value.trim();
  const password = registerForm.querySelector('#password').value.trim();
  const email = registerForm.querySelector('#email').value.trim();

  // Form validation
  if (!username || !password || !email) {
    showNotification('Täytä kaikki kentät!', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Salasanan tulee olla vähintään 6 merkkiä pitkä!', 'error');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showNotification('Anna kelvollinen sähköpostiosoite!', 'error');
    return;
  }

  // Show loading indicator
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Käsitellään...';
  submitBtn.disabled = true;

  const bodyData = { username, password, email };
  const url = 'http://localhost:3000/api/users';
  const options = {
    body: JSON.stringify(bodyData),
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
  };

  try {
    const response = await fetchData(url, options);
    if (response.error) {
      console.error('Error adding a new user:', response.error);
      showNotification(response.error || 'Käyttäjän lisääminen epäonnistui!', 'error');
      return;
    }

    if (response.message) {
      console.log(response.message);
      showNotification('Käyttäjä lisätty onnistuneesti!', 'success');
      registerForm.reset();
      
      // Automatically switch to login after successful registration
      setTimeout(() => {
        document.querySelector('.registerForm').style.display = 'none';
        document.querySelector('.loginForm').style.display = 'block';
      }, 1500);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showNotification('Palvelinvirhe. Yritä uudelleen myöhemmin.', 'error');
  } finally {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
};

// User login
const loginUser = async (event) => {
  event.preventDefault();
  const loginForm = document.querySelector('.loginForm');
  const username = loginForm.querySelector('input[name=username]').value.trim();
  const password = loginForm.querySelector('input[name=password]').value.trim();

  // Form validation
  if (!username || !password) {
    showNotification('Täytä kaikki kentät!', 'error');
    return;
  }

  // Show loading indicator
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Kirjaudutaan...';
  submitBtn.disabled = true;

  const bodyData = { username, password };
  const url = 'http://localhost:3000/api/auth/login';
  const options = {
    body: JSON.stringify(bodyData),
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
  };

  try {
    const response = await fetchData(url, options);
    if (response.error) {
      console.error('Error logging in:', response.error);
      showNotification(response.error || 'Virheellinen käyttäjänimi tai salasana!', 'error');
      return;
    }

    if (response.token) {
      console.log('Login successful');
      localStorage.setItem('token', response.token);
      localStorage.setItem('nimi', response.user.username);
      localStorage.setItem('user_id', response.user.id || response.user._id);
      showNotification(`Tervetuloa, ${response.user.username}!`, 'success');
      
      // Update UI for logged in state
      loginForm.reset();
      document.querySelector('.auth-forms').style.display = 'none';
      document.querySelector('#meRequest').style.display = 'block';
      document.querySelector('#userListContainer').style.display = 'block';
      
      // Load user info immediately after login
      loadUserInfo();
      
      // Also load all users automatically
      loadAllUsers();
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('Palvelinvirhe. Yritä uudelleen myöhemmin.', 'error');
  } finally {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
};

// Load user information
const loadUserInfo = async () => {
  const url = 'http://localhost:3000/api/auth/me';
  const token = localStorage.getItem('token');
  
  if (!token) {
    showNotification('Et ole kirjautunut sisään!', 'error');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  const options = { headers };

  try {
    const response = await fetchData(url, options);
    if (response.error) {
      console.error('Error loading user info:', response.error);
      showNotification('Virhe käyttäjätietojen lataamisessa!', 'error');
      return;
    }

    const userInfoElement = document.getElementById('meResponse');
    userInfoElement.innerHTML = `
      <div class="user-info-card">
        <h4>Käyttäjätiedot</h4>
        <p><strong>Käyttäjänimi:</strong> ${response.user.username}</p>
        <p><strong>Sähköposti:</strong> ${response.user.email || 'Ei saatavilla'}</p>
        <p><strong>ID:</strong> ${response.user.id || response.user._id}</p>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching user data:', error);
    showNotification('Virhe käyttäjätietojen lataamisessa!', 'error');
  }
};

// Load all users
const loadAllUsers = async () => {
  const url = 'http://localhost:3000/api/users';
  const token = localStorage.getItem('token');
  
  if (!token) {
    showNotification('Et ole kirjautunut sisään!', 'error');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  const options = { headers };
  
  // Show loading state
  const userListElement = document.getElementById('userList');
  userListElement.innerHTML = '<div class="loading">Ladataan käyttäjiä...</div>';

  try {
    const response = await fetchData(url, options);
    if (response.error) {
      console.error('Error loading users:', response.error);
      showNotification('Virhe käyttäjien lataamisessa!', 'error');
      userListElement.innerHTML = '<p class="error-text">Virhe käyttäjien lataamisessa!</p>';
      return;
    }

    userListElement.innerHTML = '';

    // Check if response is array or object
    const users = Array.isArray(response) ? response : response.users || [];

    if (users.length === 0) {
      userListElement.innerHTML = '<p class="info-text">Ei käyttäjiä saatavilla.</p>';
      return;
    }

    // Create table for users
    const table = document.createElement('table');
    table.className = 'user-table';
    
    // Create header row
    const headerRow = document.createElement('tr');
    ['Käyttäjänimi', 'Sähköposti', 'ID', 'Toiminnot'].forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    
    // Add user data to table
    users.forEach(user => {
      const tr = document.createElement('tr');
      
      const tdUsername = document.createElement('td');
      tdUsername.textContent = user.username;
      tr.appendChild(tdUsername);
      
      const tdEmail = document.createElement('td');
      tdEmail.textContent = user.email || 'N/A';
      tr.appendChild(tdEmail);
      
      const tdId = document.createElement('td');
      tdId.textContent = user.id || user._id;
      tr.appendChild(tdId);
      
      // Actions column with new edit and delete buttons
      const tdActions = document.createElement('td');
      tdActions.className = 'actions';
      
      const viewBtn = document.createElement('button');
      viewBtn.className = 'button small info';
      viewBtn.textContent = 'Tiedot';
      viewBtn.addEventListener('click', () => {
        showUserDetails(user);
      });
      
      const editBtn = document.createElement('button');
      editBtn.className = 'button small warning';
      editBtn.textContent = 'Muokkaa';
      editBtn.addEventListener('click', () => {
        showEditUserForm(user);
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'button small danger';
      deleteBtn.textContent = 'Poista';
      deleteBtn.addEventListener('click', () => {
        confirmDeleteUser(user);
      });
      
      tdActions.appendChild(viewBtn);
      
      // Check if current user is not the logged in user before showing edit/delete
      const loggedInUserId = localStorage.getItem('user_id');
      if (loggedInUserId && (user.id === loggedInUserId || user._id === loggedInUserId)) {
        tdActions.appendChild(editBtn);
      }
      
      // Only add delete button for admin users or self (simplified)
      // In a real app, you would check for admin permissions
      if (loggedInUserId && (user.id === loggedInUserId || user._id === loggedInUserId)) {
        tdActions.appendChild(deleteBtn);
      }
      
      tr.appendChild(tdActions);
      table.appendChild(tr);
    });
    
    userListElement.appendChild(table);
    showNotification('Käyttäjälista ladattu!', 'success');
  } catch (error) {
    console.error('Error fetching users:', error);
    userListElement.innerHTML = '<p class="error-text">Virhe käyttäjien lataamisessa!</p>';
    showNotification('Virhe käyttäjien lataamisessa!', 'error');
  }
};

// Show user details in a modal
const showUserDetails = (user) => {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <h3>Käyttäjän tiedot</h3>
      <div class="user-details">
        <p><strong>Käyttäjänimi:</strong> ${user.username}</p>
        <p><strong>Sähköposti:</strong> ${user.email || 'Ei saatavilla'}</p>
        <p><strong>ID:</strong> ${user.id || user._id}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listener to close button
  const closeButton = modal.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    modal.remove();
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
};

// Show edit user form in a modal
const showEditUserForm = (user) => {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <h3>Muokkaa käyttäjän tietoja</h3>
      <form id="editUserForm" class="form">
        <div class="form-group">
          <label for="edit-username">Käyttäjänimi:</label>
          <input type="text" id="edit-username" name="username" value="${user.username}" required>
        </div>
        <div class="form-group">
          <label for="edit-email">Sähköposti:</label>
          <input type="email" id="edit-email" name="email" value="${user.email || ''}" required>
        </div>
        <div class="form-group">
          <label for="edit-password">Uusi salasana (jätä tyhjäksi jos et halua vaihtaa):</label>
          <input type="password" id="edit-password" name="password">
        </div>
        <div class="form-group">
          <input type="hidden" name="userId" value="${user.id || user._id}">
          <button type="submit" class="button primary">Tallenna muutokset</button>
          <button type="button" class="button secondary cancel-edit">Peruuta</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  const closeButton = modal.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    modal.remove();
  });
  
  const cancelButton = modal.querySelector('.cancel-edit');
  cancelButton.addEventListener('click', () => {
    modal.remove();
  });
  
  const editForm = modal.querySelector('#editUserForm');
  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateUser(event, modal);
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
};

// Update user data
const updateUser = async (event, modal) => {
  const form = event.target;
  const userId = form.querySelector('input[name="userId"]').value;
  const username = form.querySelector('input[name="username"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value.trim();
  
  // Form validation
  if (!username || !email) {
    showNotification('Käyttäjänimi ja sähköposti vaaditaan!', 'error');
    return;
  }
  
  if (password && password.length < 6) {
    showNotification('Salasanan tulee olla vähintään 6 merkkiä pitkä!', 'error');
    return;
  }
  
  // Prepare data
  const bodyData = { username, email };
  if (password) {
    bodyData.password = password;
  }
  
  // Show loading indicator
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Tallennetaan...';
  submitBtn.disabled = true;
  
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Et ole kirjautunut sisään!', 'error');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    return;
  }
  
  const url = `http://localhost:3000/api/users/${userId}`;
  const options = {
    body: JSON.stringify(bodyData),
    method: 'PUT',
    headers: { 
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  };
  
  try {
    const response = await fetchData(url, options);
    if (response.error) {
      console.error('Error updating user:', response.error);
      showNotification(response.error || 'Käyttäjän päivittäminen epäonnistui!', 'error');
    } else {
      console.log('User updated:', response);
      showNotification('Käyttäjätiedot päivitetty onnistuneesti!', 'success');
      modal.remove();
      
      // Reload user data
      loadUserInfo();
      loadAllUsers();
      
      // If this is the current user, update their name in localStorage
      const currentUserId = localStorage.getItem('user_id');
      if (currentUserId === userId) {
        localStorage.setItem('nimi', username);
      }
    }
  } catch (error) {
    console.error('Update error:', error);
    showNotification('Palvelinvirhe. Yritä uudelleen myöhemmin.', 'error');
  } finally {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
};

// Confirm user deletion
const confirmDeleteUser = (user) => {
  // Create confirmation modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content confirm-dialog">
      <h3>Vahvista poisto</h3>
      <p>Oletko varma, että haluat poistaa käyttäjän "${user.username}"?</p>
      <p>Tätä toimintoa ei voi peruuttaa.</p>
      <div class="buttons">
        <button id="confirmDelete" class="button danger">Poista käyttäjä</button>
        <button id="cancelDelete" class="button secondary">Peruuta</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('confirmDelete').addEventListener('click', () => {
    deleteUser(user.id || user._id);
    modal.remove();
  });
  
  document.getElementById('cancelDelete').addEventListener('click', () => {
    modal.remove();
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
};

// Delete a user
const deleteUser = async (userId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Et ole kirjautunut sisään!', 'error');
    return;
  }
  
  const url = `http://localhost:3000/api/users/${userId}`;
  const options = {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  };
  
  try {
    const response = await fetchData(url, options);
    if (response.error) {
      console.error('Error deleting user:', response.error);
      showNotification(response.error || 'Käyttäjän poistaminen epäonnistui!', 'error');
    } else {
      console.log('User deleted:', response);
      showNotification('Käyttäjä poistettu onnistuneesti!', 'success');
      
      // Check if the deleted user is the current user
      const currentUserId = localStorage.getItem('user_id');
      if (currentUserId === userId) {
        // If current user is deleted, log out
        localStorage.clear();
        showNotification('Olet kirjautunut ulos!', 'success');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Otherwise just reload the user list
        loadAllUsers();
      }
    }
  } catch (error) {
    console.error('Delete error:', error);
    showNotification('Palvelinvirhe. Yritä uudelleen myöhemmin.', 'error');
  }
};

// Initialize app
const initializeApp = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // If token exists, user is logged in
    document.querySelector('.auth-forms').style.display = 'none';
    document.querySelector('#meRequest').style.display = 'block';
    document.querySelector('#userListContainer').style.display = 'block';
    
    // Get logged in user's name
    const username = localStorage.getItem('nimi');
    if (username) {
      showNotification(`Tervetuloa takaisin, ${username}!`, 'success');
    }
    
    // Load user data
    loadUserInfo();
    loadAllUsers();
  } else {
    // If no token, show login form
    document.querySelector('.auth-forms').style.display = 'flex';
    document.querySelector('.loginForm').style.display = 'block';
    document.querySelector('.registerForm').style.display = 'none';
    document.querySelector('#meRequest').style.display = 'none';
    document.querySelector('#userListContainer').style.display = 'none';
  }
};

// Navigate to registration
document.querySelector('#goToRegister').addEventListener('click', () => {
  document.querySelector('.loginForm').style.display = 'none';
  document.querySelector('.registerForm').style.display = 'block';
});

// Navigate to login
document.querySelector('#goToLogin').addEventListener('click', () => {
  document.querySelector('.registerForm').style.display = 'none';
  document.querySelector('.loginForm').style.display = 'block';
});

// Form submissions
document.querySelector('.registerForm').addEventListener('submit', registerUser);
document.querySelector('.loginForm').addEventListener('submit', loginUser);

// Request authenticated user data
document.querySelector('#meRequest').addEventListener('click', loadUserInfo);

// Load user list
document.querySelector('#loadUsers').addEventListener('click', loadAllUsers);

// Clear localStorage and logout
document.querySelector('#clearButton').addEventListener('click', () => {
  localStorage.clear();
  showNotification('Olet kirjautunut ulos!', 'success');
  
  setTimeout(() => {
    // Reload page after logout
    window.location.reload();
  }, 1500);
});

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);