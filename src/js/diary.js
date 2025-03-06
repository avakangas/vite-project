// Funktio hakee käyttäjän päiväkirjamerkinnät
const getEntries = async () => {
  const url = 'http://localhost:3000/api/paivakirja';

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const options = {
    headers: headers,
  };

  try {
    const entries = await fetchData(url, options); // Hae merkinnät
    if (entries.error) {
      console.log('Virhe päiväkirjamerkintöjen haussa!');
      showSnackbar('Virhe päiväkirjamerkintöjen hakemisessa!', 'error');
      return;
    }

    const savedEntriesDiv = document.querySelector('#saved-paivakirja');
    savedEntriesDiv.innerHTML = ''; // Tyhjennetään vanhat merkinnät

    // Lisää kaikki merkinnät näkyviin
    entries.forEach((entry) => {
      const entryDiv = document.createElement('div');
      entryDiv.classList.add('entry');
      entryDiv.innerHTML = `
        <p><strong>Päivämäärä:</strong> ${entry.entry_date}</p>
        <p><strong>Mieli:</strong> ${entry.mood}</p>
        <p><strong>Paino:</strong> ${entry.weight} kg</p>
        <p><strong>Unet:</strong> ${entry.sleep_hours} tuntia</p>
        <p><strong>Huomioita:</strong> ${entry.notes}</p>
        <small>${entry.date}</small>
      `;
      savedEntriesDiv.appendChild(entryDiv);
    });
  } catch (error) {
    console.error('Virhe päiväkirjamerkintöjen haussa:', error);
    showSnackbar('Virhe palvelimelta!', 'error');
  }
};

// Funktio tallentaa uuden päiväkirjamerkinnän
const savePaivakirjaEntry = async () => {
  const entryText = document.querySelector('#paivakirja-entry').value.trim();
  const mood = document.querySelector('#mood').value.trim();  // Käyttäjän valitsema mieliala
  const weight = document.querySelector('#weight').value.trim(); // Käyttäjän syöttämä paino
  const sleepHours = document.querySelector('#sleep-hours').value.trim(); // Käyttäjän syöttämä uniaika
  const notes = document.querySelector('#notes').value.trim();  // Käyttäjän lisäämät huomioita

  if (!entryText || !mood || !weight || !sleepHours) {
    showSnackbar('Täytä kaikki kentät ennen tallentamista!', 'error');
    return;
  }

  const newEntry = {
    entry_date: new Date().toISOString(),  // Päivämäärä
    mood: mood,
    weight: weight,
    sleep_hours: sleepHours,
    notes: notes,
  };

  const url = 'http://localhost:3000/api/paivakirja';
  const token = localStorage.getItem('token');
  const options = {
    body: JSON.stringify(newEntry),
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  try {
    const response = await fetchData(url, options);  // Lähetetään uusi merkintä
    if (response.error) {
      console.log('Virhe tallentamisessa:', response.error);
      showSnackbar('Virhe tallentamisessa!', 'error');
      return;
    }

    showSnackbar('Päiväkirjamerkintä tallennettu!', 'success');
    document.querySelector('#paivakirja-entry').value = '';  // Tyhjennetään kenttä
    document.querySelector('#mood').value = '';  // Tyhjennetään mieliala kenttä
    document.querySelector('#weight').value = '';  // Tyhjennetään paino kenttä
    document.querySelector('#sleep-hours').value = '';  // Tyhjennetään unet kenttä
    document.querySelector('#notes').value = '';  // Tyhjennetään huomioita kenttä

    getEntries();  // Päivitetään näkyvät merkinnät
  } catch (error) {
    console.error('Virhe tallentamisessa:', error);
    showSnackbar('Virhe palvelimelta!', 'error');
  }
};

// Käytetään tätä, kun haluamme näyttää tallennetut merkinnät
getEntries();

// Varmista, että tallennusnappi käyttää tätä toimintoa
document.querySelector('#save-paivakirja').addEventListener('click', savePaivakirjaEntry);
