Sovelluksessa pystyy rekisteröitymään ja kirjautumaan. 
Sovelluksessa pystyy kirjautumaan ulso.
Sovelluksessa pystyy luomaan uuden päiväkirja merkinnän.
Sovelluksessa pystyy katsomaan aikaisemmin luotuja merkintöjä.

Julkaisua sekä testaamista varten löydät vite-demoprojektin täältä. Mikäli olet epävarma omasta sovelluksesi toiminnasta, asenna tämä demoprojekti testausta varten. Katso myös miten tiedostoissa on viitattu erilaisiin tiedostojen relatiivisiin polkuihin.

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