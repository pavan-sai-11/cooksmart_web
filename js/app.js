// CookSmart - Shared Functions
// These functions are used across all pages

// --------------------------------
// DARK MODE
// --------------------------------

// Check and apply dark mode on every page load
function initDarkMode() {
    const isDark = localStorage.getItem("cs_darkmode") === "true";
    if (isDark) document.body.classList.add("dark");
    updateDarkModeIcon();
}

// Toggle dark mode on button click
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("cs_darkmode", isDark);
    updateDarkModeIcon();
}

// Update moon/sun icon
function updateDarkModeIcon() {
    const btn = document.getElementById("darkModeBtn");
    if (!btn) return;
    const isDark = document.body.classList.contains("dark");
    btn.innerHTML = isDark ? "☀️" : "🌙";
}


// --------------------------------
// TOAST NOTIFICATION
// --------------------------------

// Show a small popup message
function showToast(message, type = "success") {
    // Remove existing toast if any
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    // Create new toast
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show it
    setTimeout(() => toast.classList.add("show"), 100);

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// --------------------------------
// LOADING SPINNER
// --------------------------------

// Show loading spinner inside any container
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

// Show error message inside any container
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="error-box">
            ⚠️ ${message}
        </div>
    `;
}


// --------------------------------
// LOCALSTORAGE HELPERS
// --------------------------------

// Save data to LocalStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Get data from LocalStorage
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}


// --------------------------------
// NAVBAR ACTIVE LINK
// --------------------------------

// Highlight current page link in navbar
function setActiveNav() {
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".nav-links a");
    links.forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();
        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
}


// --------------------------------
// RUN ON EVERY PAGE LOAD
// --------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initDarkMode();
    setActiveNav();
});
// --------------------------------
// AUTHENTICATION
// --------------------------------

// Check if user is logged in
function checkAuthentication() {
    const currentUser = localStorage.getItem('cookSmartUser');
    const currentPage = window.location.pathname;
    
    if (!currentUser && !currentPage.includes('login.html')) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('cookSmartUser');
    localStorage.removeItem('cookSmartRemember');
    window.location.href = 'login.html';
}

// Get current logged-in user email
function getCurrentUser() {
    const user = localStorage.getItem('cookSmartUser');
    return user ? JSON.parse(user).email : null;
}

// Initialize authentication check on page load
window.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});
