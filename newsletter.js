// Newsletter handler
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail').value.trim();
            
            // Basic email validation
            if (!email || !email.includes('@') || !email.includes('.')) {
                alert('Molimo unesite validnu email adresu');
                return;
            }
            
            try {
                // Save newsletter subscription to database
                const { data, error } = await window.supabase
                    .from('contact_messages')
                    .insert({
                        name: 'Newsletter',
                        email: email,
                        message_type: 'Newsletter',
                        message: 'Newsletter subscription',
                        subscribe_newsletter: true,
                        created_at: new Date().toISOString()
                    });
                
                if (error) {
                    console.error('Newsletter error:', error);
                    alert('Greška pri prijavi na newsletter: ' + error.message);
                    return;
                }
                
                alert('Hvala! Sada ste pretplaćeni na naš newsletter.');
                newsletterForm.reset();
            } catch (err) {
                console.error('Newsletter subscription error:', err);
                alert('Greška pri prijavi na newsletter');
            }
        });
    }
});
