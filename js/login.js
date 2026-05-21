// CookSmart - Login Page JavaScript

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('cookSmartUser');
    if (currentUser && window.location.pathname.includes('login.html')) {
        // Redirect to home if already logged in
        window.location.href = 'index.html';
    }
});

// Toggle between sign in and sign up
function toggleSignup() {
    const loginCard = document.querySelector('.login-card');
    const signupCard = document.getElementById('signupCard');
    loginCard.style.display = loginCard.style.display === 'none' ? 'block' : 'none';
    signupCard.style.display = signupCard.style.display === 'none' ? 'block' : 'none';
}

// Handle Sign In
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;
            const errorMessage = document.getElementById('errorMessage');

            // Get all registered users from localStorage
            const users = JSON.parse(localStorage.getItem('cookSmartUsers')) || [];

            // Find user with matching email and password
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                errorMessage.textContent = 'Invalid email or password';
                errorMessage.classList.add('show');
                setTimeout(() => {
                    errorMessage.classList.remove('show');
                }, 4000);
                return;
            }

            // User authenticated - save session
            localStorage.setItem('cookSmartUser', JSON.stringify({
                email: user.email,
                loggedInAt: new Date().toISOString()
            }));

            if (rememberMe) {
                localStorage.setItem('cookSmartRemember', 'true');
            }

            // Redirect to home
            window.location.href = 'index.html';
        });
    }

    // Signup handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const errorMessage = document.getElementById('signupErrorMessage');

            // Validation
            if (password.length < 6) {
                errorMessage.textContent = 'Password must be at least 6 characters';
                errorMessage.classList.add('show');
                setTimeout(() => errorMessage.classList.remove('show'), 4000);
                return;
            }

            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.classList.add('show');
                setTimeout(() => errorMessage.classList.remove('show'), 4000);
                return;
            }

            // Check if email already exists
            const users = JSON.parse(localStorage.getItem('cookSmartUsers')) || [];
            if (users.some(u => u.email === email)) {
                errorMessage.textContent = 'Email already registered';
                errorMessage.classList.add('show');
                setTimeout(() => errorMessage.classList.remove('show'), 4000);
                return;
            }

            // Add new user
            users.push({
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('cookSmartUsers', JSON.stringify(users));

            // Auto-login the new user
            localStorage.setItem('cookSmartUser', JSON.stringify({
                email: email,
                loggedInAt: new Date().toISOString()
            }));

            // Redirect to home
            window.location.href = 'index.html';
        });
    }
});

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load dark mode preference
window.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
});
