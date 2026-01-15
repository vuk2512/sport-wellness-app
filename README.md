Sport & Wellness Tracker 🏋️‍♂️💪
Sport & Wellness Tracker je moderna veb aplikacija dizajnirana da pomogne korisnicima u održavanju zdravih životnih navika. Glavna ideja projekta je omogućiti jednostavan i intuitivan način za praćenje treninga, merenje napretka i održavanje kontinuiteta u vežbanju.

🔗 Link ka aplikaciji: https://sportwellnessapp.netlify.app/

📝 O projektu
Aplikacija rešava problem nedostatka motivacije i neorganizovanosti tako što korisnicima pruža centralizovano mesto (Dashboard) gde mogu:

Videti svoju statistiku u realnom vremenu.

Unositi nove treninge.

Pratiti istoriju vežbanja.

Korišćenjem savremenih tehnologija, obezbedili smo da podaci budu dostupni bilo kada i bilo gde, uz maksimalnu sigurnost i brzinu.

🚀 Kako radi (Arhitektura & Backend)
Aplikacija omogućava korisnicima kreiranje naloga, prijavljivanje i čuvanje podataka o treninzima u oblaku.

🔄 Evolucija Backenda (Node.js ➡️ Supabase)
Prvobitna verzija aplikacije je razvijana sa Node.js backendom koji je pokretan lokalno. Međutim, radi veće efikasnosti, stabilnosti i lakšeg povezivanja, migrirali smo kompletnu infrastrukturu na Supabase.

Trenutno stanje: Aplikacija je povezana sa Supabase API-jem, što znači da Login/Registracija i čuvanje podataka potpuno funkcionišu u realnom vremenu.

Legacy fajlovi: U strukturi projekta su zadržani određeni backend fajlovi iz originalne Node.js verzije (kao fallback ili za referencu), ali primarna funkcionalnost sada ide preko Supabase servisa.

⚠️ Važna napomena za korisnike
Aplikacija se oslanja na JavaScript za komunikaciju sa bazom podataka i prikazivanje interfejsa.

Problem: Neki pretraživači ili striktni Ad/Script Blockeri mogu automatski blokirati skripte neophodne za rad (npr. login funkcionalnost ili učitavanje grafika).

Rešenje: Ukoliko primetite da se podaci ne učitavaju ili dugmići ne reaguju:

Pokušajte da otvorite sajt u Google Chrome ili Microsoft Edge pretraživaču.

Privremeno isključite ekstenzije za blokiranje reklama/skripti za ovaj sajt.

👨‍💻 Za developere
Komentari u kodu: Radi lakšeg snalaženja, održavanja i eventualne saradnje sa drugim programerima, svi komentari u kodu su pisani na engleskom jeziku.

👥 Autori
Ovu aplikaciju je sa ponosom kreirala: Ekipa Stack Overflow 💻

© 2026 Sport & Wellness Tracker