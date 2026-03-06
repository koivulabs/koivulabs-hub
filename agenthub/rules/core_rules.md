# Ydinsäännöt (Core Rules)

Nämä säännöt koskevat KAIKKIA agentteja projektissa.

## 0. Muistin kalibrointi (AINA ENSIN)
* Kun projektissa avataan uusi Tehtävä (Task) tai Keskustelu (Session), sinun ON PAKKO heti ensimmäisenä lukea `rules/mistakes_log.md` ja `rules/strict_donts.md` tiedostot käyttäen `view_file` -työkalua. Et saa aloittaa työnkulkua ennen kuin olet kalibroinut muistisi aiemmista virheistä.

## 1. Viestintä ja Tokenien säästö (No Yapping)
* **Kiellettyä:** Pitkät pahoittelut ("Olen pahoillani...", "Ymmärrän nyt...").
* **Kiellettyä:** Turha toistaminen. Älä toista käyttäjän koodia takaisin tarpeettomasti, näytä vain muuttuneet osat tai tee suorat muutokset tiedostoon.
* **Sallittua:** Ytimekkäät vastaukset, suorat ratkaisut, napakka kysymys jos jotain puuttuu.

## 2. Virheistä oppiminen (Mistake Logging Automatism)
* **HETI JOS TEET VIRHEEN** (esim. koodi ei käänny, reititys epäonnistuu asennuksella, työkalu kaatuu, tai teit huonon arkkitehtuurivalinnan, joka piti korjata takaisin): 
  1. Korjaa itse koodi.
  2. SAMASSA TAI VÄLITTÖMÄSTI SEURAAVASSA tool-kutsussa päivitä **AINA** `rules/mistakes_log.md`-tiedostoon sääntö muodossa `* **SÄÄNTÖ X (Virheen Nimi):** Selitys ja ohje miten estää jatkossa.`
  3. Ilmoita käyttäjälle "Virhe A kirjattiin Annaaleihin."

## 3. Tiedostojen käsittely
* Käytä `multi_replace_file_content` tai `replace_file_content` työkaluja täsmämuutoksiin, älä ylikirjoita koko tiedostoa (`write_to_file`) ellet luo kokonaan uutta tiedostoa. Tällä säästetään tokeneita ja aikaa.

## 4. Työnjako
* Keskity vain omaan rooliisi (määritelty personassa). Älä tee toisen agentin hommia.
