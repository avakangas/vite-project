Sovelluksessa pystyy rekisteröitymään ja kirjautumaan. 
Sovelluksessa pystyy kirjautumaan ulso.
Sovelluksessa pystyy luomaan uuden päiväkirja merkinnän.
Sovelluksessa pystyy katsomaan aikaisemmin luotuja merkintöjä.

![Kuva rekisteröitymiseen](/public/img/Sovelluskuva.jpg)
![Kirjautumisikkuna](/public/img/Kirjatutumisikkuna.jpg)
![Autetikaatio pyykkön teko ja istunnonhallinta (kirjaudu ulos tai päiväkirja merkintä)](/public/img/käyttäjätiedotjahallinta.jpg)
![Uuden merkinnänteko](/public/img/uusimerkintä.jpg)
![Vanhojen merkintöjen tarkastelu](/public/img/aijemmatmerkinnät.jpg)

Frontend: http://localhost:5173/src/pages/login.html
Backend: http://127.0.0.1:3000/

Tietokannan kuvau:
Taulut:
diaryentries,exercises, medications, users
Sovelluksessa käytetyt taulut:
Diaryentries, users
Users:  user_id, username, password, email, created_at, user_level
Diaryentries:  entry_id, user_id, entry_date, mood, weight, sleep_hours, notes, created_at 

![ER-kaavio](/public/img/kaaviotietokannoista.jpg)

Bugit: Kun päiväkirja merkinnät haetaan ja näyetään sivulla ne näkyvät kahdesti.

Tutorialit: Käytin kurssin materiaaleja ja isäni auttoi minua kahdessa funktiossa.