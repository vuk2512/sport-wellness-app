// pricing.js - Pricing Plans Handler

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.plan-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!currentUser) {
                document.getElementById('authModal')?.classList.remove('hidden');
                return;
            }
            
            const planName = this.closest('.plan-card').querySelector('h3').textContent;
            purchasePlan(planName);
        });
    });
});

async function purchasePlan(planName) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    try {
        // Save subscription to database
        const { data, error } = await window.supabase
            .from('subscriptions')
            .insert({
                user_id: currentUser.id,
                plan_name: planName,
                status: 'active',
                start_date: new Date().toISOString(),
                created_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('Error purchasing plan:', error);
            alert('Greška pri kupovanju plana');
            return;
        }
        
        alert(`Čestitamo! Preuzeli ste ${planName} plan. Biće vam dostupan na Dashboard-u.`);
        window.location.href = 'dashboard.html';
    } catch (err) {
        console.error('Purchase error:', err);
        alert('Greška pri kupovanju plana');
    }
}
