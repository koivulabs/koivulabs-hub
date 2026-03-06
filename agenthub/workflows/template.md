---
description: [Työnkulun lyhyt kuvaus, esim. Uuden ominaisuuden luominen]
---
# Työnkulkupohja (Workflow Template)

<!--
OHJE: Määrittele askeleet tarkasti numeroituna. Agentit suorittavat nämä järjestyksessä.
Jos askel sisältää '// turbo' -merkinnän, askeleen komentorivikomennot voidaan ajaa automaattisesti.
Jos tiedostossa on missä tahansa '// turbo-all', kaikki komennot ajetaan automaattisesti.
-->

## Triggeri
[Milloin tämä työnkulku käynnistetään? Esim. "Kun käyttäjä pyytää uutta käyttöliittymäkomponenttia."]

## Askeleet (Steps)

1. **Analysointi:** Tarkista `rules/core_rules.md` ja varmista, ettei tehtävä riko sääntöjä.
2. **Suunnittelu:** Määrittele tiedostot, joita pitää muuttaa. Älä vielä koodaa.
3. **Toteutus:** Kirjoita koodi ja tee muutokset.
4. **Varmistus:** Tarkista uudet muutokset ja varmista, etteivät ne riko olemassa olevaa.
5. **Virheiden lokitus:** Jos kohtasit virheitä, kirjaa ne ylös `rules/mistakes_log.md` -tiedostoon.
