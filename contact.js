// contact.js - Contact Form Handler

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            const newsletter = document.getElementById('newsletter').checked;
            const typeSelect = document.querySelector('select');
            const type = typeSelect ? typeSelect.value : 'Opšte informacije';
            
            // Validation
            if (!name || !email || !message) {
                alert('Molimo popunite sva obavezna polja');
                return;
            }
            
            try {
                // Check if window.supabase exists
                if (!window.supabase) {
                    console.error('Supabase is not initialized');
                    alert('Greška: Baza podataka nije dostupna');
                    return;
                }

                // Save contact message to database
                const { data, error } = await window.supabase
                    .from('contact_messages')
                    .insert({
                        name: name,
                        email: email,
                        message_type: type,
                        message: message,
                        subscribe_newsletter: newsletter,
                        created_at: new Date().toISOString()
                    });
                
                if (error) {
                    console.error('Error sending message:', error);
                    alert('Greška pri slanju poruke: ' + error.message);
                    return;
                }
                
                alert('Hvala! Vaša poruka je primljena. Uskoro ćemo vas kontaktirati.');
                contactForm.reset();
            } catch (err) {
                console.error('Contact form error:', err);
                alert('Greška pri slanju poruke: ' + err.message);
            }
        });
    }
});

