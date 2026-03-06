# Virheloki ja Opitut Asiat (Mistakes Log)

<!--
AGENTTI: Jos teit virheen, kirjaa se tänne. Etsi täältä myös aiemmat vastoinkäymiset ennen kuin aloitat uuden tehtävän!
Tämä tiedosto kasvaa ajan myötä ja estää samojen virheiden toistamisen.
-->

## Kirjatut säännöt virheiden pohjalta:

* **SÄÄNTÖ 1 (GH Pages assets 404):** Kun sovellusta julkaistaan GitHub Pages -alihakemistoon (kuten `/the-basic-three/`), `index.html`- ja `manifest.json`-tiedostojen kuvapoluissa ei saa käyttää alkavaa kauttaviivaa (absolute root path `/icon.png`). Tämä rikkoo kuvat. Käytä aina suhteellisia polkuja, esim. `icon.png`, jotta Vite/GitHub osaavat yhdistää ne oikeaan `base`-URIin.
* **SÄÄNTÖ 2 (Laiminlyöty Cloud Push):** Kun pyydetään pistämään tuote liveksi, pelkkä asennuspaketin (esim. `gh-pages npm build`) siirto tuotantoon ei riitä. On **AINA** muistettava täsmätä lähdekoodi ajamalla myös `git push origin main` (tai vastaava), jotta kehityshaara ei jää jälkeen tuotannosta. Käyttäjä odottaa koodin olevan pilvessä.
* **SÄÄNTÖ 3 (WhatsApp Web Fallback):** Älä käytä `whatsapp://send?text=` sovellusprotokollaa web-applikaatioissa jaoille, sillä se heittää "unknown protocol" -virheen työpöytäselaimissa, joissa ei ole asennettuna itse WhatsApp-ohjelmaa. Käytä sen sijaan aina universaalia verkko-osoitetta `https://wa.me/?text=`, joka avaa joko sovelluksen mobiilissa tai nätisti ohjaa käyttäjän WhatsApp Webiin työpöydällä.
