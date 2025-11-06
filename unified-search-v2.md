# Geunificeerd verwijzen en zoeken

## Abstract

We willen dat projecten naar elkaar kunnen verwijzen, en dat op ivdnt.org in al onze projecten gezocht kan worden. De huidige aanpak schiet tekort, met name omdat het lastig te implementeren is voor elk project. Deze technische memo stelt voor om hier een goede oplossing te ontwikkelen en geeft een kleine aanzet hiervoor.


## Doel

Dit zijn veelgehoorde wensen:

- onze projecten zo veel mogelijk aan elkaar koppelen (waar nuttig), zodat gebruikers kunnen doorklikken
- bezoekers van ivdnt.org te laten zoeken in "al" onze projecten

## Huidige situatie

Hoe werkt dit nu, en wat voor problemen spelen er?

### Koppelingen

Sommige projecten zijn uitdrukkelijk met elkaar gekoppeld via IDs. Denk bijvoorbeeld aan ANW/WNW/Woordcombinaties die verwijzen naar Molex. Dit levert geen problemen op.

Andere projecten hebben geen uitdrukkelijke koppelingen maar willen wel naar elkaar verwijzen. Denk aan ANW/WNW die verwijzen naar de GTB, Woordcombinaties, CHN en Etymologiebank. Deze projecten verwijzen middels een "zoeklink": een koppeling naar een zoekresultaten-pagina, of soms (bijv. Woordcombinaties) direct naar een entry als de zoekvraag precies 1 resultaat oplevert.

Omdat we in het tweede geval niet weten welke zoekvragen wel en geen resultaten hebben, wijzen sommige koppelingen naar een lege zoekpagina, wat irritant en verwarrend voor gebruikers is. Liever toon je in die gevallen geen koppeling naar dit project.

### Zoeken op ivdnt.org

Jaren geleden hebben we een zoeksysteem gebouwd dat in een aantal projecten zoekt ("unified search"). Dit wordt nog steeds gebruikt op ivdnt.org.

Nadeel van dit systeem is dat het niet zo eenvoudig is om er projecten aan toe te voegen. De opzet is zo dat elk project een standaardprotocol moet volgen, wat vaak lastig te realiseren en onderhouden is. Ook hebben we weinig controle over hoe de zoekresultaten in de pagina weergegeven worden.

## Een betere "unified search" webservice

Voor de twee genoemde wensen hebben we informatie nodig over andere projecten.

Bijvoorbeeld:
- als we in het ANW vanaf het woord *aak* willen verwijzen naar andere projecten, moeten we weten welke projecten ook een of meer entries *aak* hebben.
- als een gebruiker op ivdnt.org het woord *aak* intikt, wil ze iets vergelijkbaars weten: welke entries *aak* zijn er, of welke andere aan *aak* gerelateerde informatie is er?

Het ligt dus voor de hand om een webservice te implementeren die antwoord op deze vragen kan geven. De verschillende projecten en ivdnt.org kunnen gebruik maken van die webservice om te verwijzen naar de diverse projecten.

Gebaseerd op bovenstaande zijn dit een aantal waarschijnlijke functionele wensen voor zo'n service:

- een project toevoegen moet eenvoudig zijn
- het moet snel werken en  mag de servers niet te veel belasten

## Hoe te implementeren?

Om het toevoegen van projecten zo laagdrempelig mogelijk te houden, zou het schrijven van een kort scriptje voldoende moeten zijn. De webservice kan daarvoor gebouwd worden in Javascript of Python.

Zo'n scriptje zou de eigen API van elk project moeten aanspreken, zodat de projecten (meestal) niets hoeven te wijzigen.

Er zijn twee hoofdopties voor de dataflow tussen de webservice en de projecten:

- Het eenvoudigst is als elk request naar de service een request naar elk van onze projecten doet. Caching kan netwerkverkeer en server load iets beperken, maar het kan toch problemen opleveren, bijvoorbeeld door crawlers.
- Een alternatief is dat we dagelijks voor elk project een export maken met een woord (of meerdere zoekwoorden, bijvoorbeeld een patroon of een definitie) plus de bijbehorende URL. Deze lijsten worden in Solr geladen. Dit zorgt voor de laagste server load.

De API-response voor onderling linken tussen projecten heeft genoeg aan een URL en een link-tekst (bijv. lemma).

De API-response voor het zoeken op ivdnt.org moet rijk genoeg zijn dat per project relevante informatie kan worden getoond, maar abstract genoeg dat de resultaten netjes in de styling van ivdnt.org te integreren zijn. Beperkte HTML (paragraaf, lijst, link, etc.) is bijvoorbeeld een optie.

## Zoekmogelijkheden

Het zou kunnen dat meerdere zoekmogelijkheden per project nodig zijn.

Bijvoorbeeld de ANS wil weten:
- staat dit woord in Woordcombinaties?
- komt dit patroon voor in Woordcombinaties?

Het systeem moet dus voorzien in deze verschillende zoekmogelijkheden.


## Proof of concept: reunion

[Hier](https://github.com/jan-niestadt/reunion) staat een eenvoudige client-side aggregator in Javascript. Het zou niet moeilijk zijn om deze te porten naar Node.js zodat het server-side werkt. Dit heeft o.a. als voordeel dat ontbrekende CORS-headers geen problemen opleveren.

Het implementeren van de optie die netwerkverkeer bespaart, is meer werk.
