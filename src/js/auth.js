const fetchData = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    return json;
  } catch (error) {
    return { error: error.message };
  }
};

// Funktio ilmoitusten näyttämiseen
const showNotification = (elementId, message, isSuccess) => {
  const notification = document.getElementById(elementId);
  notification.textContent = message;
  notification.className = 'notification ' + (isSuccess ? 'success' : 'error');
  notification.style.display = 'block';
  
  // Piilota ilmoitus 3 sekunnin kuluttua
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
};

const registerUser = async (event) => {
  event.preventDefault();

  // Haetaan oikea formi
  const registerForm = document.querySelector('.registerForm');

  // Haetaan formista arvot
  const username = registerForm.querySelector('#username').value.trim();
  const password = registerForm.querySelector('#password').value.trim();
  const email = registerForm.querySelector('#email').value.trim();

  console.log("Lähetetään tiedot:", { username, password, email });

  // Lomakevalidointi - peruskenttien tarkistus
  if (!username || !password || !email) {
    showNotification('registerNotification', 'Kaikki kentät täytyy täyttää', false);
    return;
  }

  // Tarkistetaan salasanan pituus
  if (password.length < 8) {
    showNotification('registerNotification', 'Salasanan tulee olla vähintään 8 merkkiä pitkä', false);
    return;
  }

  // Luodaan body lähetystä varten taustapalvelun vaatimaan muotoon
  const bodyData = {
    username: username,
    password: password,
    email: email,
  };

  // Endpoint
  const url = 'http://localhost:3000/api/users';

  // Options
  const options = {
    body: JSON.stringify(bodyData),
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  };

  console.log("Lähetetään pyyntö osoitteeseen:", url);
  console.log("Pyynnön options:", options);

  // Hae data
  const response = await fetchData(url, options);
  console.log("Saatu vastaus:", response);
  
  // Näytetään mahdolliset validointivirheet yksityiskohtaisesti
  if (response.errors) {
    console.log("Validointivirheet:", JSON.stringify(response.errors));
  }

  // Tarkistetaan onko vastaus virheilmoitus
  if (response.status === 400 || response.error) {
    // Näytetään mahdolliset validointivirheet
    if (response.errors && response.errors.length > 0) {
      console.error("Validointivirheet:", response.errors);
      showNotification('registerNotification', 'Rekisteröinti epäonnistui: ' + response.errors.map(err => err.msg).join(', '), false);
    } else {
      showNotification('registerNotification', 'Rekisteröinti epäonnistui: ' + (response.error || response.message), false);
    }
    return;
  }

  showNotification('registerNotification', 'Rekisteröinti onnistui!', true);
  registerForm.reset(); // tyhjennetään formi
};

const loginUser = async (event) => {
  event.preventDefault();

  // Haetaan oikea formi
  const loginForm = document.querySelector('.loginForm');

  // Haetaan formista arvot, tällä kertaa käyttäen attribuuutti selektoreita
  const username = loginForm.querySelector('input[name=username]').value;
  const password = loginForm.querySelector('input[name=password]').value;

  console.log("Kirjautumistiedot:", { username, password });

  // Lomakevalidointi
  if (!username || !password) {
    showNotification('loginNotification', 'Kaikki kentät täytyy täyttää', false);
    return;
  }

  // Luodaan body lähetystä varten taustapalvelun vaatimaan muotoon
  const bodyData = {
    username: username,
    password: password,
  };

  // Endpoint
  const url = 'http://localhost:3000/api/auth/login';

  // Options
  const options = {
    body: JSON.stringify(bodyData),
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  };

  console.log("Lähetetään kirjautumispyyntö osoitteeseen:", url);
  console.log("Kirjautumispyynnön options:", options);

  // Hae data
  const response = await fetchData(url, options);
  console.log("Kirjautumisen täysi vastaus:", JSON.stringify(response));

  if (response.error || response.status === 401) {
    showNotification('loginNotification', 'Kirjautuminen epäonnistui: ' + (response.error || response.message), false);
    return;
  }

  // Tallennetaan token ja käyttäjänimi, jos ne ovat vastauksessa
  if (response.token) {
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

  loginForm.reset(); // tyhjennetään formi
};

const checkUser = async (event) => {
  event.preventDefault();

  // Endpoint
  const url = 'http://localhost:3000/api/auth/me';
  
  // Kutsun headers tiedot johon liitetään tokeni
  let headers = {};
  
  // Nyt haetaan Token localstoragesta
  const token = localStorage.getItem('token');
  console.log("Haettu token:", token);
  
  if (!token) {
    showNotification('meNotification', 'Et ole kirjautunut sisään', false);
    return;
  }
  
  // Muodostetaa nyt headers oikeaan muotoon
  headers = {
    Authorization: `Bearer ${token}`
  };

  // Options
  const options = {
    headers: headers,
  };
  
  console.log("Käyttäjätietojen haku osoitteesta:", url);
  console.log("Käyttäjätietojen haun headers:", headers);

  // Hae data
  const response = await fetchData(url, options);
  console.log("Käyttäjätietojen haun vastaus:", response);

  if (response.error) {
    showNotification('meNotification', 'Virhe käyttäjätietojen hakemisessa: ' + response.error, false);
    return;
  }

  showNotification('meNotification', 'Käyttäjätiedot haettu onnistuneesti!', true);
  console.log(response);
};

// Tyhjennä kirjautumistiedot -toiminto
const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nimi');
  showNotification('clearNotification', 'Kirjautumistiedot tyhjennetty', true);
};

// Lisää tapahtumankuuntelijat
const registerForm = document.querySelector('.registerForm');
registerForm.addEventListener('submit', registerUser);

const loginForm = document.querySelector('.loginForm');
loginForm.addEventListener('submit', loginUser);

const meRequest = document.querySelector('#meRequest');
meRequest.addEventListener('click', checkUser);

const clearButton = document.querySelector('#clearButton');
clearButton.addEventListener('click', clearSession);