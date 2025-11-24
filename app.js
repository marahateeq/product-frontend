// Product Management System - Frontend JavaScript
// Handles all API interactions and UI updates

// Configuration
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080';
const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

let autoRefreshTimer = null;

// Initialize application on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Product Management System');
    console.log('API Base URL:', API_BASE_URL);

    // Check API health
    checkAPIHealth();

    // Load users
    loadUsers();

    // Set up event listeners
    setupEventListeners();

    // Start auto-refresh
    startAutoRefresh();
});

// Event Listeners Setup
function setupEventListeners() {
    // Create user form
    document.getElementById('create-user-form').addEventListener('submit', handleCreateUser);

    // Edit user form
    document.getElementById('edit-user-form').addEventListener('submit', handleEditUser);

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        showNotification('Refreshing users list...', 'info');
        loadUsers();
    });

    // Close modal on outside click
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'edit-modal') {
            closeEditModal();
        }
    });
}

// API Health Check
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();

        if (data.status === 'healthy') {
            updateAPIStatus('Connected', 'success');
        } else {
            updateAPIStatus('API Issue', 'warning');
        }
    } catch (error) {
        console.error('API health check failed:', error);
        updateAPIStatus('Disconnected', 'error');
    }
}

// Update API status indicator
function updateAPIStatus(text, status) {
    const statusBadge = document.getElementById('api-status');
    statusBadge.textContent = text;
    statusBadge.className = `status-badge status-${status}`;
}

// Load all users
async function loadUsers() {
    const loading = document.getElementById('loading');
    const usersList = document.getElementById('users-list');

    loading.classList.remove('hidden');
    usersList.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/users`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            displayUsers(data.users);
            updateUserCount(data.count);
        } else {
            throw new Error(data.error || 'Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users: ' + error.message, 'error');
        usersList.innerHTML = '<p class="error-message">Failed to load users. Please try again.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}

// Display users in the list
function displayUsers(users) {
    const usersList = document.getElementById('users-list');

    if (users.length === 0) {
        usersList.innerHTML = '<p class="empty-message">No users found. Create your first user above!</p>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-card" data-user-id="${user.id}">
            <div class="user-info">
                <div class="user-name">${escapeHtml(user.full_name || user.username)}</div>
                <div class="user-details">
                    <span class="user-username">@${escapeHtml(user.username)}</span>
                    <span class="user-email">${escapeHtml(user.email)}</span>
                </div>
                <div class="user-meta">
                    Created: ${formatDate(user.created_at)}
                </div>
            </div>
            <div class="user-actions">
                <button class="btn-icon btn-edit" onclick="openEditModal(${user.id})" title="Edit">
                    ✏️
                </button>
                <button class="btn-icon btn-delete" onclick="confirmDeleteUser(${user.id}, '${escapeHtml(user.username)}')" title="Delete">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// Update user count badge
function updateUserCount(count) {
    const badge = document.getElementById('user-count');
    badge.textContent = `${count} User${count !== 1 ? 's' : ''}`;
}

// Handle create user form submission
async function handleCreateUser(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username').trim(),
        email: formData.get('email').trim(),
        full_name: formData.get('full_name').trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`User "${userData.username}" created successfully!`, 'success');
            e.target.reset();
            loadUsers();
        } else {
            throw new Error(data.error || 'Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showNotification('Failed to create user: ' + error.message, 'error');
    }
}

// Open edit modal
async function openEditModal(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        const data = await response.json();

        if (data.success) {
            const user = data.user;
            document.getElementById('edit-user-id').value = user.id;
            document.getElementById('edit-username').value = user.username;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-full-name').value = user.full_name || '';

            document.getElementById('edit-modal').classList.remove('hidden');
        } else {
            throw new Error(data.error || 'Failed to load user');
        }
    } catch (error) {
        console.error('Error loading user:', error);
        showNotification('Failed to load user details: ' + error.message, 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('edit-user-form').reset();
}

// Handle edit user form submission
async function handleEditUser(e) {
    e.preventDefault();

    const userId = document.getElementById('edit-user-id').value;
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username').trim(),
        email: formData.get('email').trim(),
        full_name: formData.get('full_name').trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('User updated successfully!', 'success');
            closeEditModal();
            loadUsers();
        } else {
            throw new Error(data.error || 'Failed to update user');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Failed to update user: ' + error.message, 'error');
    }
}

// Confirm and delete user
function confirmDeleteUser(userId, username) {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
        deleteUser(userId);
    }
}

// Delete user
async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('User deleted successfully!', 'success');
            loadUsers();
        } else {
            throw new Error(data.error || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user: ' + error.message, 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Auto-refresh functionality
function startAutoRefresh() {
    autoRefreshTimer = setInterval(() => {
        console.log('Auto-refreshing users...');
        loadUsers();
        checkAPIHealth();
    }, AUTO_REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

// Utility Functions

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Stop auto-refresh when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
        loadUsers();
    }
});
