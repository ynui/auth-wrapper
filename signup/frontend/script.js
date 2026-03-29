const API_URL = '/api';

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
    }
}

initTheme();

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageEl = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');

    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const displayName = document.getElementById('displayName').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    messageEl.className = 'message';
    messageEl.textContent = '';

    if (!email || !password) {
        showError('Please fill in all required fields');
        return;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: email, firstName, lastName, displayName, email, password }),
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = '/success.html';
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Unable to connect to server. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
    });
}

function showError(msg) {
    const messageEl = document.getElementById('message');
    messageEl.className = 'message error';
    messageEl.textContent = msg;
}

function showSuccess(msg) {
    const messageEl = document.getElementById('message');
    messageEl.className = 'message success';
    messageEl.textContent = msg;
}
