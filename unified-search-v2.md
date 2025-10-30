# Geunificeerd verwijzen en zoeken

## Doel

Dit is een technische memo over een paar veelgehoorde wensen:

- onze projecten zo veel mogelijk te koppelen (waar nuttig), zodat gebruikers kunnen doorklikken
- bezoekers van ivdnt.org te laten zoeken in "al" onze projecten

## Huidige situatie

Hoe werkt dit nu, en wat voor problemen spelen er?

### Koppelingen

Sommige projecten zijn uitdrukkelijk met elkaar gekoppeld via IDs. Denk bijvoorbeeld aan ANW/WNW/Woordcombinaties die verwijzen naar Molex.

Andere projecten hebben geen uitdrukkelijke koppelingen maar willen wel naar elkaar verwijzen. Denk aan ANW/WNW die verwijzen naar de GTB, Woordcombinaties, CHN en Etymologiebank. Deze projecten verwijzen middels een "zoeklink": een koppeling naar een zoekresultaten-pagina, of soms (bijv. Woordcombinaties) direct naar een entry als de zoekvraag precies 1 resultaat oplevert.

Omdat we in het tweede geval niet weten welke zoekvragen wel en geen resultaten hebben, wijzen sommige koppelingen naar een lege zoekpagina. Liever toon je in die gevallen de koppeling niet.

### Zoeken op ivdnt.org

Jaren geleden hebben we een zoeksysteem gebouwd dat in een aantal projecten zoekt. Dit wordt nog steeds gebruikt op ivdnt.org.

Nadeel van dit systeem is dat het niet heel eenvoudig is om er projecten aan toe te voegen. De opzet is zo dat elk project een standaardprotocol moet volgen, wat vaak lastig te realiseren en onderhouden is. Ook hebben we weinig controle over hoe de zoekresultaten in de pagina weergegeven worden.

## Mogelijke oplossing

Voor beide genoemde wensen hebben we informatie nodig over andere projecten. Bijvoorbeeld: als we in het ANW vanaf het woord *aak* willen verwijzen naar andere projecten, moeten we weten welke projecten ook een of meer entries *aak* hebben. Als een gebruiker op ivdnt.org het woord *aak* intikt, wil zij iets vergelijkbaars weten: welke entries *aak* zijn er, of welke andere aan *aak* gerelateerde informatie is er?

Het ligt dus voor de hand om een webservice te implementeren die antwoord op deze vragen kan geven. De verschillende projecten en ivdnt.org kunnen gebruik maken van die webservice om te verwijzen naar de diverse projecten.

Gebaseerd op bovenstaande zijn dit een aantal waarschijnlijke functionele wensen voor zo'n service:

- een project toevoegen moet eenvoudig zijn
- het moet snel werken en  mag de servers niet te veel belasten

## Hoe te implementeren?

Om het toevoegen van projecten zo laagdrempelig mogelijk te houden, zou het schrijven van een kort scriptje voldoende moeten zijn. De webservice kan daarvoor gebouwd worden in Javascript of Python.

Zo'n scriptje zou de eigen API van elk project moeten aanspreken, zodat de projecten (meestal) niets hoeven te wijzigen.

Er zijn twee hoofdopties voor de dataflow tussen de webservice en de projecten:

- Het eenvoudigst is als elk request naar de service een request naar elk van onze projecten doet. Caching kan netwerkverkeer en server load iets beperken, maar het kan toch problemen opleveren, bijvoorbeeld door crawlers.
- Een alternatief is dat we dagelijks voor elk project een export maken met een woord en de bijbehorende URL. Deze lijsten worden in Solr geladen. Dit zorgt voor de laagste server load.
- Een hybride aanpak is eventueel ook denkbaar: de servers die het zwaarst belast worden via een export, de rest dynamisch.

De responsestructuur voor de webservice voor het zoeken op ivdnt.org moet rijk genoeg zijn dat per project relevante informatie kan worden getoond, maar abstract genoeg dat de resultaten netjes in de styling van ivdnt.org te integreren zijn. Beperkte HTML (paragraaf, lijst, link, etc.) is bijvoorbeeld een optie.

## Proof of concept: reunion

[Hier](https://github.com/jan-niestadt/reunion) staat een eenvoudige client-side aggregator in Javascript. Het zou niet moeilijk zijn om deze te porten naar Node.js zodat het server-side werkt. Dit heeft o.a. als voordeel dat ontbrekende CORS-headers geen problemen opleveren.

Het implementeren van de optie die lagere server load oplevert is meer werk.
