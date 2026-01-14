// dashboard.js - Dashboard Logic and Statistics

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Display welcome message
    document.getElementById('welcomeMessage').textContent = 
        `Dobrodošao/la nazad, ${currentUser.name}!`;

    // Load user data
    loadDashboardData();
    loadWorkoutHistory();
    loadCurrentProgram();
    initializeChart();
    
    // Setup form validation and submission
    setupWorkoutForm();
    
    // Set today's date as default
    document.getElementById('workoutDate').valueAsDate = new Date();
});

async function loadDashboardData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    try {
        const { data: workouts, error } = await window.supabase
            .from('workouts')
            .select('*')
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('Error loading workouts:', error);
            return;
        }

        const stats = {
            total_workouts: workouts.length,
            total_calories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
            avg_duration: workouts.length ? workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length : 0,
            last_workout_date: workouts.length ? Math.max(...workouts.map(w => new Date(w.workout_date).getTime())) : null
        };
        
        // Calculate active days and streak
        const uniqueDates = [...new Set(workouts.map(w => w.workout_date))];
        stats.active_days = uniqueDates.length;
        stats.streak = calculateStreak(workouts);
        
        // Update stats display
        document.getElementById('totalWorkouts').textContent = stats.total_workouts || 0;
        document.getElementById('totalCalories').textContent = (stats.total_calories || 0).toLocaleString();
        document.getElementById('activeDays').textContent = stats.active_days || 0;
        document.getElementById('streak').textContent = stats.streak || 0;
        
        // Update goals
        updateGoals(workouts);
        
        // For now, keep local calculation for goals and other stats
        // TODO: Move all calculations to server
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function calculateStreak(workouts) {
    if (workouts.length === 0) return 0;
    
    const dates = [...new Set(workouts.map(w => w.workout_date))].map(d => new Date(d)).sort((a, b) => b - a);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latest = new Date(dates[0]);
    latest.setHours(0, 0, 0, 0);
    
    // If latest workout is more than 1 day ago, streak is 0
    if ((today - latest) / (1000 * 60 * 60 * 24) > 1) return 0;
    
    let streak = 1;
    let currentDate = new Date(dates[0]);
    
    for (let i = 1; i < dates.length; i++) {
        const diff = Math.floor((currentDate - dates[i]) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            streak++;
            currentDate = dates[i];
        } else if (diff > 1) {
            break;
        }
    }
    
    return streak;
}

function updateGoals(workouts) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const weeklyWorkouts = workouts.filter(w => new Date(w.workout_date) >= weekStart).length;
    const monthlyWorkouts = workouts.filter(w => new Date(w.workout_date) >= monthStart).length;
    
    const weeklyGoal = 4;
    const monthlyGoal = 16;
    
    const weeklyPercentage = Math.min((weeklyWorkouts / weeklyGoal) * 100, 100);
    const monthlyPercentage = Math.min((monthlyWorkouts / monthlyGoal) * 100, 100);
    
    document.getElementById('weeklyProgress').textContent = `${weeklyWorkouts}/${weeklyGoal}`;
    document.getElementById('weeklyBar').style.width = `${weeklyPercentage}%`;
    
    document.getElementById('monthlyProgress').textContent = `${monthlyWorkouts}/${monthlyGoal}`;
    document.getElementById('monthlyBar').style.width = `${monthlyPercentage}%`;
}

function loadWorkoutHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    window.supabase
        .from('workouts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('workout_date', { ascending: false })
        .then(({ data: workouts, error }) => {
            if (error) {
                console.error('Error loading workout history:', error);
                return;
            }

            const historyDiv = document.getElementById('workoutHistory');
            
            if (workouts.length === 0) {
                historyDiv.innerHTML = '<p class="text-gray-400 text-center py-8">Još nemaš zabeleženih treninga. Dodaj prvi!</p>';
                return;
            }
            
            historyDiv.innerHTML = workouts.map(workout => `
                <div class="bg-zinc-800 p-4 rounded-lg flex justify-between items-center">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="bg-primary px-3 py-1 rounded text-sm">${workout.workout_type}</span>
                            <span class="font-bold">${formatDate(workout.workout_date)}</span>
                            ${workout.intensity ? `<span class="text-sm text-gray-400">${getIntensityLabel(workout.intensity)}</span>` : ''}
                        </div>
                        <div class="flex gap-4 text-sm text-gray-400">
                            <span><i class="fas fa-clock"></i> ${workout.duration} min</span>
                            <span><i class="fas fa-fire"></i> ${workout.calories} kcal</span>
                            ${workout.rating ? `<span>${'⭐'.repeat(workout.rating)}</span>` : ''}
                        </div>
                        ${workout.notes ? `<p class="text-sm text-gray-400 mt-2">${workout.notes}</p>` : ''}
                    </div>
                    <button onclick="deleteWorkout('${workout.id}')" 
                            class="text-red-500 hover:text-red-700 ml-4">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('sr-RS', options);
}

function getIntensityLabel(intensity) {
    const labels = {
        low: 'Nizak intenzitet',
        medium: 'Srednji intenzitet',
        high: 'Visok intenzitet'
    };
    return labels[intensity] || intensity;
}

function loadCurrentProgram() {
    const selectedProgram = JSON.parse(localStorage.getItem('selectedProgram'));
    const programDiv = document.getElementById('currentProgram');
    
    if (selectedProgram) {
        programDiv.innerHTML = `
            <div class="bg-zinc-800 p-4 rounded">
                <p class="font-bold text-lg mb-2">${selectedProgram.name}</p>
                <span class="inline-block px-3 py-1 rounded text-sm ${getCategoryColor(selectedProgram.category)}">
                    ${selectedProgram.category}
                </span>
                <p class="text-sm text-gray-400 mt-2">
                    Započeto: ${formatDate(selectedProgram.startDate)}
                </p>
            </div>
        `;
    }
}

function getCategoryColor(category) {
    const colors = {
        fitness: 'bg-primary',
        cardio: 'bg-green-600',
        wellness: 'bg-purple-600'
    };
    return colors[category] || 'bg-gray-600';
}

function setupWorkoutForm() {
    const form = document.getElementById('workoutForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear all previous errors
        clearAllErrors();
        
        // Get form values
        const workoutType = document.getElementById('workoutType').value;
        const duration = document.getElementById('duration').value;
        const calories = document.getElementById('calories').value;
        const workoutDate = document.getElementById('workoutDate').value;
        const intensity = document.querySelector('input[name="intensity"]:checked');
        const locations = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        const rating = document.getElementById('rating').value;
        const notes = document.getElementById('notes').value;
        
        // Validation
        let isValid = true;
        
        if (!workoutType) {
            showFormError('typeError', 'Molimo izaberite tip treninga');
            isValid = false;
        }
        
        if (!duration || duration < 1 || duration > 300) {
            showFormError('durationError', 'Trajanje mora biti između 1 i 300 minuta');
            isValid = false;
        }
        
        if (!calories || calories < 1 || calories > 2000) {
            showFormError('caloriesError', 'Kalorije moraju biti između 1 i 2000');
            isValid = false;
        }
        
        if (!workoutDate) {
            showFormError('dateError', 'Molimo unesite validan datum');
            isValid = false;
        }
        
        if (!intensity) {
            showFormError('intensityError', 'Molimo izaberite intenzitet');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Save workout
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const workout = {
            user_id: currentUser.id,
            workout_type: workoutType,
            duration: parseInt(duration),
            calories: parseInt(calories),
            workout_date: workoutDate,
            intensity: intensity.value,
            locations: locations,
            rating: rating ? parseInt(rating) : null,
            notes: notes
        };
        
        const { error } = await window.supabase
            .from('workouts')
            .insert(workout);
        
        if (error) {
            console.error('Error adding workout:', error);
            alert('Greška pri dodavanju treninga');
            return;
        }
        
        // Reset form
        form.reset();
        document.getElementById('workoutDate').valueAsDate = new Date();
        
        // Reload dashboard
        loadDashboardData();
        loadWorkoutHistory();
        loadCurrentProgram();
        updateChart();
        
        // Show success message
        alert('Trening uspešno dodat!');
    });
}

function showFormError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function clearAllErrors() {
    const errors = ['typeError', 'durationError', 'caloriesError', 'dateError', 'intensityError'];
    errors.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

function deleteWorkout(id) {
    if (confirm('Da li sigurno želiš da obrišeš ovaj trening?')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        window.supabase
            .from('workouts')
            .delete()
            .eq('id', id)
            .eq('user_id', currentUser.id)
            .then(({ error }) => {
                if (error) {
                    console.error('Error deleting workout:', error);
                    alert('Greška pri brisanju treninga');
                } else {
                    loadDashboardData();
                    loadWorkoutHistory();
                    updateChart();
                }
            });
    }
}

// Chart initialization
let progressChart;

function initializeChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    window.supabase
        .from('workouts')
        .select('*')
        .eq('user_id', currentUser.id)
        .then(({ data: workouts, error }) => {
            if (error) {
                console.error('Error loading workouts for chart:', error);
                return;
            }

            const last7Days = getLast7Days();
            const workoutsByDay = last7Days.map(date => {
                return workouts.filter(w => w.workout_date === date).length;
            });
            
            progressChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: last7Days.map(date => {
                        const d = new Date(date);
                        return d.toLocaleDateString('sr-RS', { weekday: 'short' });
                    }),
                    datasets: [{
                        label: 'Treninzi',
                        data: workoutsByDay,
                        borderColor: '#B4121B',
                        backgroundColor: 'rgba(180, 18, 27, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: false,
                    width: 600,
                    height: 400,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                color: '#9ca3af'
                            },
                            grid: {
                                color: '#27272a'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#9ca3af'
                            },
                            grid: {
                                color: '#27272a'
                            }
                        }
                    }
                }
            });
        });
}

function updateChart() {
    if (!progressChart) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    window.supabase
        .from('workouts')
        .select('*')
        .eq('user_id', currentUser.id)
        .then(({ data: workouts, error }) => {
            if (error) {
                console.error('Error loading workouts for chart update:', error);
                return;
            }

            const last7Days = getLast7Days();
            const workoutsByDay = last7Days.map(date => {
                return workouts.filter(w => w.workout_date === date).length;
            });
            
            progressChart.data.datasets[0].data = workoutsByDay;
            progressChart.update();
        });
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// Make deleteWorkout available globally
window.deleteWorkout = deleteWorkout;