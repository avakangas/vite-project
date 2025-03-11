// haetaan autentikaatiotokenin localStorage-varastosta
const getToken = () => {
  return localStorage.getItem('token');
};

// Päiväkirjamerkintöjen haku
const fetchEntries = async () => {
  try {
    // Tekee HTTP-pyynnön päiväkirjamerkintöjen hakemiseksi
    const response = await fetch('http://localhost:3000/api/entries', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`, // Lisää tokenin autentikaatiota varten
        'Content-Type': 'application/json'
      }
    });

    // Tarkistaa, onko vastaus on onnistunut
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Muuntaa vastauksen JSON-muodosta JavaScript-objekteiksi
    const entries = await response.json();
    // Merkintöjen näyttö
    displayEntries(entries);
    return entries;
  } catch (error) {
    // Virheiden käsittely
    console.error('Error fetching diary entries:', error);
    showMessage('Päiväkirja merkintöjen haku epäonnistui', 'error');
    return [];
  }
};

// Uuden päiväkirjamerkinnän teko
const createEntry = async (entryData) => {
  try {
    // Uuden merkinnän tiedot palvelimelle
    const response = await fetch('http://localhost:3000/api/entries', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`, // Tokenin 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entryData) // Muutetaan tiedot JSON-muotoon
    });

    // Vastauksen tarkastus
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    // Onnistunenn vastauksen tarkastus
    const result = await response.json();
    showMessage('Merkintä lisätty!', 'success');
    fetchEntries(); // Merkintälista uusiutuu
    return result;
  } catch (error) {
    // Virheiden tarkastus tai käsittely
    console.error('Error creating diary entry:', error);
    showMessage(`Merkinnän luonti epäonnistui: ${error.message}`, 'error');
    return null;
  }
};

// Päiväkirja merkinnän näyttö
const displayEntries = (entries) => {
  // Merkintöjen haku
  const entriesContainer = document.getElementById('entries-container');
  if (!entriesContainer) return;
  
  // Poisetetaan nykyinen merkintä teksti näkyvistä 
  entriesContainer.innerHTML = '';
  
  // Kertoo jos aijempia merkintöjä ei ole
  if (entries.length === 0) {
    entriesContainer.innerHTML = '<p>Ei viellä merkintöjä.</p>';
    return;
  }

  // Merkintöjen järjestely päivämäärän mukaan
  entries.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
  
  // Html merkintä kaikille merkinnöille
  entries.forEach(entry => {
    const entryElement = document.createElement('div');
    entryElement.className = 'entry-card';
    
    // Päivämäärä muoto
    const date = new Date(entry.entry_date);
    const formattedDate = date.toLocaleDateString();
    
    // HTML rakenne
    entryElement.innerHTML = `
      <div class="entry-header">
        <h3>${formattedDate}</h3>
        <span class="mood-badge">${entry.mood}</span>
      </div>
      <div class="entry-details">
        <p><strong>Paino:</strong> ${entry.weight} kg</p>
        <p><strong>Uni:</strong> ${entry.sleep_hours} Tuntia</p>
        <p class="Muistiinpanot">${entry.notes || 'Ei muistiinpanoja'}</p>
      </div>
    `;
    
    // Lisää merkinnän
    entriesContainer.appendChild(entryElement);
  });
};

// Lomakkeen lähettämisen käsittely
const handleEntryFormSubmit = (event) => {
  event.preventDefault(); // Estää oletustoiminnon
  
  // Lomakkeen tiedon haku
  const form = event.target;
  const entryData = {
    entry_date: form.elements['entry-date'].value,
    mood: form.elements['mood'].value,
    weight: parseFloat(form.elements['weight'].value),
    sleep_hours: parseInt(form.elements['sleep-hours'].value),
    notes: form.elements['notes'].value
  };
  
  // Merkinnän luonti
  createEntry(entryData).then(result => {
    if (result) {
      form.reset(); // Formin tyhjennys
    }
  });
};

// Viesti käyttäjälle
const showMessage = (message, type = 'info') => {
  // viestin sisältö
  const messageContainer = document.getElementById('message-container');
  if (!messageContainer) return;
  
  // viestielementti
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  // viestin lisäys
  messageContainer.innerHTML = '';
  messageContainer.appendChild(messageElement);
  
  // Viestin katoaa
  setTimeout(() => {
    messageElement.classList.add('fade-out');
    setTimeout(() => {
      messageContainer.innerHTML = '';
    }, 500);
  }, 3000);
};

// Alustaa päiväkirjasivun toiminnallisuuden
const initDiaryPage = () => {
  // Merkintä haetaan bacendistä
  fetchEntries();
  
  // Olettaa että merkintä tehdään tänään
  const dateInput = document.getElementById('entry-date');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }
  
  // Lisää tapahtumaan ksäittelijän
  const entryForm = document.getElementById('entry-form');
  if (entryForm) {
    entryForm.addEventListener('submit', handleEntryFormSubmit);
  }
};

// Kutsuu toimintoja kun sivu on latautunut
document.addEventListener('DOMContentLoaded', initDiaryPage);

// Vie funktiot 
export {
  fetchEntries,
  createEntry,
  displayEntries,
  initDiaryPage
};