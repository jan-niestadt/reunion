export default {
	// The service we're querying
	id: 'etym',

	// The resources this service will search
	resources: [
		{
			id: 'etym',
			shortName: 'Etymologiebank',
			name: 'Etymologiebank',
			type: 'woordenboek'
		}
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		fetch(`https://etymologiebank.nl/zoek_woord`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ zoekterm: searchString })
		})
			.then(response => response.text())
			.then(response => {
				const data = new window.DOMParser().parseFromString(response, "text/html");
				const links = [...data.querySelectorAll('#text p a')];
				const results = links.map(a => 
					`<li><a href="${a.href}" target="_blank">${a.textContent}</a></li>`
				).join('');
				reporter.finished(this.resources[0], {
					number: links.length,
					html: `<ul>${results}</ul>`
				});
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
};

const ETYM_RESPONSE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="nl">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title>Zoekresultaat</title>
	<link rel="stylesheet" href="/css/etymologie.css?ver=034" />
	<script defer data-domain="etymologiebank.nl" src="https://statistiek.ivdnt.org/js/plausible.js"></script>
</head>

<body>
<div id="wrapper">
<div id="kop">
<!-- <div id="logo"></div>-->
<div id="menu">
<ul>
	<li><a href="https://etymologiebank.nl/">Home</a></li>
	<li><a href="https://etymologiebank.nl/zoek">Zoeken</a></li>
	<li><a href="https://etymologiebank.nl/werken">Werken</a></li>
	<li><a href="https://etymologiebank.nl/werkwijze">Werkwijze</a></li>
        <li><a href="https://etymologiebank.nl/medewerkers">Medewerkers</a></li>
	<li><a href="https://etymologiebank.nl/partners">Partners</a></li>
	<li><a href="https://etymologiebank.nl/disclaimer">Disclaimer</a></li>
	<li><a href="https://etymologiebank.nl/colofon">Colofon</a></li>
</ul>
</div>
</div>
<div id="content">
<table><tr>
<td id="left"><form name="Zoek lemma's" action="https://etymologiebank.nl/zoek_woord" method="post" accept-charset="UTF-8" autocapitalize="none">
<input id="searchfield-left" type="text" name="word" value="">
<br>
<input id="searchBtn" type="submit" name="submit" value="Snel zoeken">
</form><p id="wiki"><a href="http://www.etymologiewebsite.nl/wiki/Hoofdpagina" target="new">Meehelpen? Ga naar etymologieWiki</a></p>
<p>&nbsp;</p>
<div id="onzetaalwidget">
    <link rel="stylesheet" href="https://onzetaal.nl/media/css/woord-widget.css" media="screen" />
    <!--<img src="/img/jaarwoord-banner.jpg" alt="Jaarwoord generator van Genootschap Onze Taal">  -->
<b>Jaarwoordgenerator</b><br>
Vul hier een jaartal in (vanaf 1800) en ontdek welke woorden er in dat jaar aan het Nederlands werden toegevoegd.<br><br>
    <form action="https://onzetaal.nl/een-woord-uit-elk-jaar/zoek-jaarwoord" target="_blank">
    <div>
       <!-- <label>Voer jaartal in</label> -->
        <input type="text" id="searchfield-left" placeholder="Voer jaartal in" name="jaar">
    </div>
    <button type="submit">Toon woord</button>
    </form>    
</div>
<p>&nbsp;</p>
</td>
<td id="text"><h2>Zoekresultaat</h2>
                        <p><a href="https://etymologiebank.nl/trefwoord/koe1">koe (rund)</a></p>
                        <p><a href="https://etymologiebank.nl/trefwoord/koe2">koe (leren handbekleedsel van steenkruiers)</a></p>
                         <div id="back"><a href="javascript:history.back()">Terug naar vorige pagina</a></div>
<div id="bron">Bronverwijzing: <br><i>Sijs, Nicoline van der (samensteller) (2010), Etymologiebank, op http://etymologiebank.nl/</i></div>
</td></tr></table>
</div>
<div id="voet"> <p> Hosted by Instituut voor de Nederlandse Taal </div> 
</div>
</body>
</html>`;