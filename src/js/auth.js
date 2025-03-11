// Funktion fetch pyyntöihin
const fetchData = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    return json;
  } catch (error) {
    return { error: error.message };
  }
};

// Näyttää ilmoitukset
const showNotification = (elementId, message, isSuccess) => {
  const notification = document.getElementById(elementId);
  notification.textContent = message;
  notification.className = 'notification ' + (isSuccess ? 'success' : 'error');
  notification.style.display = 'block';
  
  // Ilmoitus näkyy vain 3s
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
};

// Rekiteröitymisen käsittely
const registerUser = async (event) => {
  event.preventDefault(); // Ei oletuksia

  // Rekisteröitymisen haku
  const registerForm = document.querySelector('.registerForm');
  const username = registerForm.querySelector('#username').value.trim();
  const password = registerForm.querySelector('#password').value.trim();
  const email = registerForm.querySelector('#email').value.trim();

  console.log("Lähetetään tiedot:", { username, password, email });

  // Tarkistaa että kaikki vaadittavat kentät on täytetty
  if (!username || !password || !email) {
    showNotification('registerNotification', 'Kaikki kentät täytyy täyttää', false);
    return;
  }

  // Salasanan pituus minim 8
  if (password.length < 8) {
    showNotification('registerNotification', 'Salasanan tulee olla vähintään 8 merkkiä pitkä', false);
    return;
  }

  // Lähtevien tietojen varmistus
  const bodyData = {
    username: username,
    password: password,
    email: email,
  };

  const url = 'http://localhost:3000/api/users';

  const options = {
    body: JSON.stringify(bodyData),
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  };

  console.log("Lähetetään pyyntö osoitteeseen:", url);
  console.log("Pyynnön options:", options);

  // Pyyntö palvelimelle
  const response = await fetchData(url, options);
  console.log("Saatu vastaus:", response);
  
  if (response.errors) {
    console.log("Validointivirheet:", JSON.stringify(response.errors));
  }

  // Virhetilanteen ksäittely
  if (response.status === 400 || response.error) {
    if (response.errors && response.errors.length > 0) {
      console.error("Validointivirheet:", response.errors);
      showNotification('registerNotification', 'Rekisteröinti epäonnistui: ' + response.errors.map(err => err.msg).join(', '), false);
    } else {
      showNotification('registerNotification', 'Rekisteröinti epäonnistui: ' + (response.error || response.message), false);
    }
    return;
  }

  // Onnistumisen kertominen ja lomakkeen kenttien tyhjennys
  showNotification('registerNotification', 'Rekisteröinti onnistui!', true);
  registerForm.reset(); 
};

// Käyttäjän kirjautuminen
const loginUser = async (event) => {
  event.preventDefault(); // Ei oletuksia

  // Kirjautumis lomakkeen hakun 
  const loginForm = document.querySelector('.loginForm');
  const username = loginForm.querySelector('input[name=username]').value;
  const password = loginForm.querySelector('input[name=password]').value;

  console.log("Kirjautumistiedot:", { username, password });

  // Kaikkien kenttien täytön tarkastus
  if (!username || !password) {
    showNotification('loginNotification', 'Kaikki kentät täytyy täyttää', false);
    return;
  }

  // Tarkastaa palvelimelle menevät tiedot
  const bodyData = {
    username: username,
    password: password,
  };

  const url = 'http://localhost:3000/api/auth/login';

  const options = {
    body: JSON.stringify(bodyData),
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  };

  console.log("Lähetetään kirjautumispyyntö osoitteeseen:", url);
  console.log("Kirjautumispyynnön options:", options);

  // Pyyntö bacendiin
  const response = await fetchData(url, options);
  console.log("Kirjautumisen täysi vastaus:", JSON.stringify(response));

  // Virhetilanteen käsittely
  if (response.error || response.status === 401) {
    showNotification('loginNotification', 'Kirjautuminen epäonnistui: ' + (response.error || response.message), false);
    return;
  }

  // Onnistumisen käsittely
  if (response.token) {
    // Tallentaa tokenin ja käyttäjänimen localStorageen
    localStorage.setItem('token', response.token);
    if (response.user && response.user.username) {
      localStorage.setItem('nimi', response.user.username);
    }
    console.log("Token tallennettu:", response.token);
    showNotification('loginNotification', 'Kirjautuminen onnistui!', true);
  } else {
    console.error("Tokenia ei löytynyt vastauksesta:", response);
    showNotification('loginNotification', 'Kirjautuminen epäonnistui: tokenia ei löytynyt', false);
    return;
  }

  // Lomakkeen tyhjennys
  loginForm.reset(); 
};

// Käyttäjätietojen tarkastus
const checkUser = async (event) => {
  event.preventDefault(); // Ei oletusta

  const url = 'http://localhost:3000/api/auth/me';
  
  let headers = {};
  
  // Hakee tokenin
  const token = localStorage.getItem('token');
  console.log("Haettu token:", token);
  
  // Tarkistaa, onko token oikea tai olemassa
  if (!token) {
    showNotification('meNotification', 'Et ole kirjautunut sisään', false);
    return;
  }
  
  // Tokenin pyytö
  headers = {
    Authorization: `Bearer ${token}`
  };

  const options = {
    headers: headers,
  };
  
  console.log("Käyttäjätietojen haku osoitteesta:", url);
  console.log("Käyttäjätietojen haun headers:", headers);

  // Lähettää pyynnön 
  const response = await fetchData(url, options);
  console.log("Käyttäjätietojen haun vastaus:", response);

  // Käsittelee virhetilanteen
  if (response.error) {
    showNotification('meNotification', 'Virhe käyttäjätietojen hakemisessa: ' + response.error, false);
    return;
  }

  // Näyttää onnistumisilmoituksen
  showNotification('meNotification', 'Käyttäjätiedot haettu onnistuneesti!', true);
  console.log(response);
};

// kirjaa käyttäjän ulos
const clearSession = () => {
  // Poistaa tokenin ja käyttäjänimen localStoragesta
  localStorage.removeItem('token');
  localStorage.removeItem('nimi');
  showNotification('clearNotification', 'Kirjautumistiedot tyhjennetty', true);
};

// Lisää tapahtumankäsittelijät 
const registerForm = document.querySelector('.registerForm');
registerForm.addEventListener('submit', registerUser);

// Kirjautumislomake
const loginForm = document.querySelector('.loginForm');
loginForm.addEventListener('submit', loginUser);

// Käyttäjätietojen tarkistuspainike
const meRequest = document.querySelector('#meRequest');
meRequest.addEventListener('click', checkUser);

// Istunnon tyhjennys -painike
const clearButton = document.querySelector('#clearButton');
clearButton.addEventListener('click', clearSession);