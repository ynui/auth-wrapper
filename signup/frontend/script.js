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

document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');
        const isPassword = passwordInput.type === 'password';
        
        passwordInput.type = isPassword ? 'text' : 'password';
        confirmInput.type = isPassword ? 'text' : 'password';
        toggle.classList.toggle('show-pass', isPassword);
    });
});

const validationRules = {
    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const lowerValue = value.toLowerCase();
        return emailRegex.test(lowerValue) ? 'valid' : 'invalid';
    },
    name: (value) => {
        if (!value) return null;
        return value.trim().length >= 2 ? 'valid' : 'invalid';
    },
    password: (value) => {
        if (!value) return null;
        return value.length >= 8 ? 'valid' : 'invalid';
    },
    confirmPassword: (value) => {
        if (!value) return null;
        const password = document.getElementById('password')?.value;
        return value === password && value.length >= 8 ? 'valid' : 'invalid';
    }
};

const iconSVG = {
    valid: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    invalid: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

function updateSubmitButton() {
    const emailInput = document.getElementById('email');
    const email = emailInput?.value.trim().toLowerCase() || '';
    if (emailInput) {
        emailInput.value = email;
    }
    
    const name = document.getElementById('name')?.value.trim() || '';
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isNameValid = name.trim().length >= 2;
    const isPasswordValid = password.length >= 8;
    const isConfirmValid = confirmPassword === password && password.length >= 8;
    
    const allValid = isEmailValid && isNameValid && isPasswordValid && isConfirmValid;
    document.getElementById('submitBtn').disabled = !allValid;
}

function validateField(input) {
    const wrapper = input.closest('.floating-label');
    const icon = wrapper.querySelector('.validation-icon');
    const rule = validationRules[input.id];
    
    if (!rule) return;
    
    const result = rule(input.value);
    
    if (result === null) {
        input.classList.remove('valid', 'invalid');
        icon.classList.remove('show', 'valid', 'invalid');
        icon.innerHTML = '';
    } else {
        input.classList.remove('valid', 'invalid');
        input.classList.add(result);
        icon.classList.remove('valid', 'invalid');
        icon.classList.add('show', result);
        icon.innerHTML = iconSVG[result];
    }
}

const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');

passwordInput?.addEventListener('input', () => {
    if (confirmInput.value) {
        validateField(confirmInput);
    }
    updateSubmitButton();
});

document.querySelectorAll('.floating-label input').forEach(input => {
    input.addEventListener('input', () => {
        validateField(input);
        updateSubmitButton();
    });
});

updateSubmitButton();

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageEl = document.getElementById('message');
        const submitBtn = document.getElementById('submitBtn');

                const emailInput = document.getElementById('email');
        const email = emailInput.value.trim().toLowerCase();
        emailInput.value = email;
        
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

const particlesCanvas = document.getElementById('particles-canvas');
if (particlesCanvas) {
    const ctx = particlesCanvas.getContext('2d');
    let particles = [];
    
    function resize() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
        initParticles();
    }
    
    function initParticles() {
        particles = [];
        const count = Math.floor((particlesCanvas.width * particlesCanvas.height) / 15000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * particlesCanvas.width,
                y: Math.random() * particlesCanvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        
        const style = getComputedStyle(document.documentElement);
        const color = style.getPropertyValue('--particle-color').trim();
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = particlesCanvas.width;
            if (p.x > particlesCanvas.width) p.x = 0;
            if (p.y < 0) p.y = particlesCanvas.height;
            if (p.y > particlesCanvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resize);
    resize();
    animate();
}
