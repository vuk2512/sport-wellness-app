// auth.js - Authentication and Form Validation

// Global variables
let isLoginMode = true;
let authModal, authForm, closeModal, toggleAuth, modalTitle, nameField;

document.addEventListener('DOMContentLoaded', function() {
    authModal = document.getElementById('authModal');
    authForm = document.getElementById('authForm');
    closeModal = document.getElementById('closeModal');
    toggleAuth = document.getElementById('toggleAuth');
    modalTitle = document.getElementById('modalTitle');
    nameField = document.getElementById('nameField');
    const authBtns = document.querySelectorAll('.auth-button');

    // Open modal
    authBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                authModal.classList.remove('hidden');
            }
        });
    });

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.classList.add('hidden');
            resetForm();
        });
    }

    // Close modal on outside click
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.add('hidden');
            resetForm();
        }
    });

    // Toggle between login and register
    if (toggleAuth) {
        toggleAuth.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            
            if (isLoginMode) {
                modalTitle.textContent = 'Prijavi se';
                nameField.classList.add('hidden');
                toggleAuth.textContent = 'Nemaš nalog? Registruj se';
                authForm.querySelector('button[type="submit"]').textContent = 'Prijavi se';
            } else {
                modalTitle.textContent = 'Registruj se';
                nameField.classList.remove('hidden');
                toggleAuth.textContent = 'Imaš nalog? Prijavi se';
                authForm.querySelector('button[type="submit"]').textContent = 'Registruj se';
            }
            
            resetForm();
        });
    }

    // Form submission with validation
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('fullName')?.value.trim();

            // Validate email
            if (!validateEmail(email)) {
                showError('email', 'Unesite validnu email adresu (mora sadržati @)');
                return;
            }

            // Validate password
            if (!validatePassword(password)) {
                showError('password', 'Lozinka mora imati najmanje 6 karaktera');
                return;
            }

            if (isLoginMode) {
                // Login logic
                handleLogin(email, password);
            } else {
                // Register logic
                if (!validateName(fullName)) {
                    showError('fullName', 'Unesite puno ime i prezime (min 3 karaktera)');
                    return;
                }
                handleRegister(email, password, fullName);
            }
        });
    }

    // Real-time validation on input
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('fullName');

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            clearError('email');
            if (emailInput.value.length > 0 && !validateEmail(emailInput.value)) {
                emailInput.style.borderColor = '#ef4444';
            } else {
                emailInput.style.borderColor = '';
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            clearError('password');
            if (passwordInput.value.length > 0 && passwordInput.value.length < 6) {
                passwordInput.style.borderColor = '#ef4444';
            } else {
                passwordInput.style.borderColor = '';
            }
        });
    }

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            clearError('fullName');
            if (nameInput.value.length > 0 && nameInput.value.length < 3) {
                nameInput.style.borderColor = '#ef4444';
            } else {
                nameInput.style.borderColor = '';
            }
        });
    }
});

// Validation functions (NO HTML5 validation)
function validateEmail(email) {
    // Check if email contains @ and has text before and after it
    if (!email.includes('@')) return false;
    
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    if (parts[0].length === 0 || parts[1].length === 0) return false;
    if (!parts[1].includes('.')) return false;
    
    const domainParts = parts[1].split('.');
    if (domainParts[domainParts.length - 1].length < 2) return false;
    
    return true;
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validateName(name) {
    return name && name.length >= 3 && /\s/.test(name);
}

// Error handling functions
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '#ef4444';
    
    // Create or update error message
    let errorDiv = field.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        field.parentElement.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '';
    const errorDiv = field.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function resetForm() {
    const form = document.getElementById('authForm');
    if (form) {
        form.reset();
        
        // Clear all errors
        ['email', 'password', 'fullName'].forEach(fieldId => {
            clearError(fieldId);
        });
    }
}

// Authentication handlers
async function handleLogin(email, password) {
    try {
        console.log('Attempting login for:', email);
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        console.log('Login response:', data, error);

        if (error) {
            alert('Greška pri prijavi: ' + error.message);
            return;
        }

        // Save user data
        localStorage.setItem('currentUser', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0]
        }));

        // Close modal and redirect
        document.getElementById('authModal').classList.add('hidden');
        
        // Update dashboard link visibility
        if (typeof updateDashboardLink === 'function') {
            updateDashboardLink();
        }
        
        alert('Uspešno ste se prijavili!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Greška pri prijavi');
    }
}

async function handleRegister(email, password, name) {
    try {
        const { data, error } = await window.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (error) {
            alert('Greška pri registraciji: ' + error.message);
            return;
        }

        alert('Uspešno ste kreirali nalog! Sada se prijavite.');
        // Switch to login mode
        isLoginMode = true;
        if (modalTitle) modalTitle.textContent = 'Prijavi se';
        if (nameField) nameField.classList.add('hidden');
        if (toggleAuth) toggleAuth.textContent = 'Nemaš nalog? Registruj se';
        if (authForm) authForm.querySelector('button[type="submit"]').textContent = 'Prijavi se';
        resetForm();
    } catch (error) {
        console.error('Register error:', error);
        alert('Greška pri registraciji');
    }
}