# Ehdottomat Kiellot (STRICT DON'TS)

<!--
Tämä on kooste yleisimmistä ja tuhoisimmista tekoälyagenttien tekemistä virheistä.
NAITÄ SÄÄNTÖJÄ EI SAA RIKKOA MISSÄÄN OLOSUHTEISSA.
-->

## 1. Älä hallusinoi riippuvuuksia (No Hallucinated Packages)
* **KIELLETTYÄ:** Käyttää npm-kirjastoa, importtia tai funktiota, jonka olemassaolosta tai dokumentaatiosta et ole 100% varma.
* **SYY:** Koodi ei käänny, testit kaatuvat ja asioiden selvittämiseen menee hukkaan tokeneita. 
* **TEE NÄIN:** Tarkista aina projektin `package.json` ensin. Jos uusi kirjasto tarvitaan, varmista että se on todellinen.

## 2. Älä eksy kaninkoloon (No Scope Creep & Rabbit Holes)
* **KIELLETTYÄ:** Tehdä samassa PR:ssä tai Taskissa refaktorointeja tiedostoihin, jotka eivät liity käsillä olevaan pyyntöön millään tavalla.
* **SYY:** Pienestä muutoksesta kasvaa hallitsematon soppa, josta on vaikea löytää alkuperäistä tavoitetta.
* **TEE NÄIN:** Pysy tiukasti siinä mita pyydettiin. Jos näet koodissa jotain täysin muuta parannettavaa, jätä kommentti tai kirjaa se ylös myöhempää varten.

## 3. Älä niele virheitä (No Silent Failures)
* **KIELLETTYÄ:** Kirjoittaa tyhjiä `try-catch`-lohkoja `try { ... } catch (e) {}`.
* **SYY:** Virheen tullessa mikään ei varoita kehittäjää ja debuggaaminen on mahdotonta.
* **TEE NÄIN:** Lokita virhe AINA (esim. `console.error`) tai heitä se eteenpäin koodissa, jotta se nousee pintaan.

## 4. Älä riko toimivaa (No Blind Breaking Changes)
* **KIELLETTYÄ:** Muuttaa jaettujen komponenttien / funktioiden rajapintoja (props, argumentit) tarkistamatta, missä muualla niitä käytetään (`grep_search`).
* **SYY:** Saatat korjata yhden sovelluksen osan, mutta rikkoa huomaamattasi viisi muuta paikkaa.
* **TEE NÄIN:** Etsi aina kaikki referenssit ennen jaetun funktion muokkaamista tai tee uusi funktio vanhan rinnalle, kunnes olet varma.

## 5. Älä ylisuunnittele (YAGNI - You Aren't Gonna Need It)
* **KIELLETTYÄ:** Luoda abstraktioita, ylimääräisiä luokkia tai monimutkaisia rakenteita vain "varmuuden vuoksi tulevaisuutta varten".
* **SYY:** Koodin lukeminen hidastuu.
* **TEE NÄIN:** Ratkaise vain käsillä oleva ongelma mahdollisimman yksinkertaisesti (KISS - Keep It Simple, Stupid).

## 6. Älä paljasta salaisuuksia (No Hardcoded Secrets)
* **KIELLETTYÄ:** Laittaa suoraan koodiin (`.js`, `.ts` jne.) API-avaimia, salasanoja, tietokannan osoitteita.
* **TEE NÄIN:** Käytä aina `.env` ympäristömuuttujia.

Kaikki agentit (Ilmarinen, Louhi, Väinämöinen, Aino, Turso) sitoutuvat lukemaan nämä säännöt.
