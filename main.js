// main.js - Glavni JavaScript fajl

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Check if user is logged in and update UI
    updateAuthUI();
    updateDashboardLink();
});

// Update Dashboard link visibility
function updateDashboardLink() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const dashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');
    
    dashboardLinks.forEach(link => {
        if (currentUser) {
            link.classList.remove('hidden');
        } else {
            link.classList.add('hidden');
        }
    });
}

// Update Auth UI based on login status
function updateAuthUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authBtns = document.querySelectorAll('.auth-button');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    if (currentUser) {
        authBtns.forEach(btn => {
            btn.textContent = currentUser.name.split(' ')[0];
            btn.onclick = () => window.location.href = 'dashboard.html';
        });
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        if (logoutBtnMobile) {
            logoutBtnMobile.addEventListener('click', logout);
        }
    } else {
        authBtns.forEach(btn => {
            btn.textContent = 'Prijavi se';
            btn.onclick = () => {
                const modal = document.getElementById('authModal');
                if (modal) modal.classList.remove('hidden');
            };
        });
        
        // Redirect to home if on dashboard without login
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
    }
}

// Logout function
function logout() {
    if (confirm('Da li sigurno želiš da se odjaviš?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        
        // Update dashboard link visibility
        updateDashboardLink();
        
        window.location.href = 'index.html';
    }
}

// Database simulation using localStorage
class Database {
    constructor() {
        this.users = this.getUsers();
        this.workouts = this.getWorkouts();
        this.programs = this.getPrograms();
    }

    // Users table operations
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
        this.users = users;
    }

    addUser(user) {
        const users = this.getUsers();
        const newUser = {
            id: Date.now(),
            ...user,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    findUserByEmail(email) {
        return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    // Workouts table operations
    getWorkouts() {
        return JSON.parse(localStorage.getItem('workouts')) || [];
    }

    saveWorkouts(workouts) {
        localStorage.setItem('workouts', JSON.stringify(workouts));
        this.workouts = workouts;
    }

    addWorkout(workout) {
        const workouts = this.getWorkouts();
        const newWorkout = {
            id: Date.now(),
            ...workout,
            createdAt: new Date().toISOString()
        };
        workouts.push(newWorkout);
        this.saveWorkouts(workouts);
        return newWorkout;
    }

    getUserWorkouts(userId) {
        return this.getWorkouts().filter(w => w.userId === userId);
    }

    deleteWorkout(id) {
        const workouts = this.getWorkouts().filter(w => w.id !== id);
        this.saveWorkouts(workouts);
    }

    updateWorkout(id, updates) {
        const workouts = this.getWorkouts();
        const index = workouts.findIndex(w => w.id === id);
        if (index !== -1) {
            workouts[index] = { ...workouts[index], ...updates };
            this.saveWorkouts(workouts);
            return workouts[index];
        }
        return null;
    }

    // Programs table operations
    getPrograms() {
        return JSON.parse(localStorage.getItem('programs')) || [];
    }

    savePrograms(programs) {
        localStorage.setItem('programs', JSON.stringify(programs));
        this.programs = programs;
    }

    getUserProgram(userId) {
        return this.getPrograms().find(p => p.userId === userId);
    }
}

// Initialize database
const db = new Database();

// Handle "Kreni Sada" button - check login before redirecting to dashboard
function handleStartNow() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Show auth modal if not logged in
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('hidden');
        }
    } else {
        // Redirect to dashboard if logged in
        window.location.href = 'dashboard.html';
    }
}

// Export for use in other files
window.db = db;
window.updateAuthUI = updateAuthUI;
window.handleStartNow = handleStartNow;