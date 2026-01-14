// pricing.js - Pricing Plans Handler

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.plan-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!currentUser) {
                const modal = document.getElementById('authModal');
                if (modal) {
                    modal.classList.remove('hidden');
                }
                return;
            }
            
            const planCard = this.closest('.plan-card');
            if (!planCard) {
                alert('Greška pri preuzimanju paketa');
                return;
            }
            
            const planName = planCard.querySelector('h3') ? planCard.querySelector('h3').textContent : 'Nepoznat paket';
            purchasePlan(planName);
        });
    });
});

async function purchasePlan(planName) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    try {
        // Check if supabase is available
        if (!window.supabase) {
            console.error('Supabase is not initialized');
            alert('Greška: Baza podataka nije dostupna');
            return;
        }
        
        // Save subscription to database
        const { data, error } = await window.supabase
            .from('subscriptions')
            .insert({
                user_id: currentUser.id,
                plan_name: planName.trim(),
                status: 'active',
                start_date: new Date().toISOString(),
                created_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('Error purchasing plan:', error);
            alert('Greška pri kupovanju paketa: ' + error.message);
            return;
        }
        
        alert(`Čestitamo! Preuzeli ste ${planName} plan. Biće vam dostupan na Dashboard-u.`);
        window.location.href = 'dashboard.html';
    } catch (err) {
        console.error('Purchase error:', err);
        alert('Greška pri kupovanju paketa: ' + err.message);
    }
}
