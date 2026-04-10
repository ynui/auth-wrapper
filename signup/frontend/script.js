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
        const name = document.getElementById('name').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const nameParts = name.split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const body = { username: email, email, password };
        if (firstName) body.firstName = firstName;
        if (lastName) body.lastName = lastName;

        messageEl.className = 'message';
        messageEl.textContent = '';

        if (!email || !name || !password) {
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
        submitBtn.classList.add('loading');

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem('signupFirstName', firstName);
                window.location.href = '/success.html';
            } else {
                showError(data.message);
            }
        } catch (error) {
            showError('Unable to connect to server. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
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
