import *  as XML from '../lib/xml.js';
import { unifyPartOfSpeech } from '../lib/util.js';

export default {
	// The service we're querying
	id: 'gtb',

	// The resources this service will search in
	resources: [
		{
			id: 'wnt',
			name: 'Woordenboek der Nederlandsche Taal (1500-1976)',
			shortName: 'WNT (1500-1976)',
			type: 'dictionary'
		},
		{
			id: 'mnw',
			name: 'Middelnederlands (1300-1500)',
			shortName: 'MNW (1300-1500)',
			type: 'dictionary'
		},
		{
			id: 'vmnw',
			name: 'Vroegmiddelnederlands (1200-1300)',
			shortName: 'VMNW (1200-1300)',
			type: 'dictionary'
		},
		{
			id: 'onw',
			name: 'Oudnederlands (500-1200)',
			shortName: 'ONW (500-1200)',
			type: 'dictionary'
		},
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const url = new URL('https://anw.ivdnt.org/backend/lemmalist?output=json&prefix=A') // @@@ GTB /unified_search  !!!
		url.search = new URLSearchParams({ trefwoord: searchString }).toString();
		fetch(url)
			.then(response => response.text())
			.then(str => {
				const response = GTB_RESPONSE.replace(/&(nbsp|#160);/g, ' ').replace(/\s\s+/g, ' '); // @@@ FAKE RESPONSE (CORS)
				return new window.DOMParser().parseFromString(response, "text/xml"); 
			})
			.then(data => {
				//console.log(data);
				XML.forEachElement(data.getElementsByTagName('wdb'), wdb => {
					const naam = XML.getElementValue(wdb, 'wdb_naam');
					const resource = this.resources.find(resource => resource.id === naam.toLowerCase());
					if (!resource) {
						throw new Error(`wdb_naam from GTB response not found: ${naam}`);
					}
					const numArticles = XML.getElementValue(wdb, 'aantal_artikelen');
					const numItems = XML.getElementValue(wdb, 'aantal_items');
					const results = [];
					const arts = XML.findSingleElement(wdb, 'artikelen');
					XML.forEachChildElement(arts, art => {
						if (art.nodeType === Element.ELEMENT_NODE) {
							const snippet = [];
							const bets = XML.findSingleElement(art, 'betekenissen');
							const { link, linkIcon, listItem, i, text, htmlSentence } = reporter.htmlBuilder;
							XML.forEachChildElement(bets, bet => {
								const url = XML.getElementValue(bet, 'url');
								const nr = XML.getElementValue(bet, 'betekenisnummer');
								const definitie = XML.getElementValue(bet, 'definitie');
								const content = `${htmlSentence(definitie)} ${linkIcon(url)}`;
								snippet.push(listItem(nr, content));
							});
							const lemma = XML.getElementValue(art, 'modern_lemma');
							const url = XML.getElementValue(art, 'url');
							const woordsoort = unifyPartOfSpeech(XML.getElementValue(art, 'woordsoort'));
							const historischLemma = XML.getElementValue(art, 'historisch_lemma');
							results.push({
								main: link(lemma, url) +
									`${ historischLemma.toLowerCase() !== lemma.toLowerCase() ? ` ("${text(historischLemma)}")` : ''}` +
									` ${i(woordsoort)}`,
								snippet
							});
						}
					});
					reporter.finished(resource, results);
				});
			})
			.catch(err => {
				console.error(err);
				this.resources.forEach(resource => reporter.failed(resource, err));
			});
	},
};



const GTB_RESPONSE = `<?xml version="1.0" encoding="UTF-8" ?>
<wdbs>
	<gebruikersquery>koe</gebruikersquery>
	<aangepaste_query></aangepaste_query>
			<gezocht_bij_benadering>nee</gezocht_bij_benadering >
		<totaal_aantal_artikelen>11</totaal_aantal_artikelen>
	<totaal_aantal_items>11</totaal_aantal_items>	
	    <wdb>
		<wdb_naam>MNW</wdb_naam>
		<periode>1250-1550</periode>
		<aantal_artikelen>3</aantal_artikelen>
		<aantal_items>3</aantal_items>
		<artikelen>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=MNW&amp;id=22377&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>COE</historisch_lemma>
								<woordsoort>znw(v.)</woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=MNW&amp;id=22377&amp;lemmodern=koe&amp;Betekenis_id=22377.sense.1</url>
						<niveau>0</niveau>
						<betekenisnummer></betekenisnummer>
													<definitie>Koe.&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=MNW&amp;id=22377&amp;lemmodern=koe&amp;Betekenis_id=22377.sense.2</url>
						<niveau>1</niveau>
						<betekenisnummer></betekenisnummer>
													<definitie>Met coeyen lopen, &lt;i&gt;koedrijver zijn of worden&lt;/i&gt;.&#160;&#160;</definitie>
											</betekenis>
								</betekenissen>
			</artikel>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=MNW&amp;id=22438&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>COEN</historisch_lemma>
									<homoniemnummer>I</homoniemnummer>
								<woordsoort></woordsoort>
				<betekenissen>
								</betekenissen>
			</artikel>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=MNW&amp;id=23610&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>COUWE</historisch_lemma>
									<homoniemnummer>IV</homoniemnummer>
								<woordsoort></woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=MNW&amp;id=23610&amp;lemmodern=koe&amp;Betekenis_id=23610.sense.1</url>
						<niveau>0</niveau>
						<betekenisnummer></betekenisnummer>
													<definitie>Koe.&#160;</definitie>
											</betekenis>
								</betekenissen>
			</artikel>
				</artikelen>
	</wdb>
	    <wdb>
		<wdb_naam>VMNW</wdb_naam>
		<periode>1200-1300</periode>
		<aantal_artikelen>1</aantal_artikelen>
		<aantal_items>1</aantal_items>
		<artikelen>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=VMNW&amp;id=ID98082&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>COE</historisch_lemma>
								<woordsoort>znw.v.</woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=VMNW&amp;id=ID98082&amp;lemmodern=koe&amp;Betekenis_id=A98082</url>
						<niveau>0</niveau>
						<betekenisnummer></betekenisnummer>
													<definitie>&#160;koe; beeld van een koe; Koe</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=VMNW&amp;id=ID98082&amp;lemmodern=koe&amp;Betekenis_id=C98082.I.1</url>
						<niveau>0</niveau>
						<betekenisnummer>1</betekenisnummer>
													<definitie>&#160;Koe, vrouwelijk huisrund. &#160;Diernaam&#160;&#160;&#160;&#160;</definitie>
											</betekenis>
								</betekenissen>
			</artikel>
				</artikelen>
	</wdb>
	    <wdb>
		<wdb_naam>ONW</wdb_naam>
		<periode>500-1200</periode>
		<aantal_artikelen>1</aantal_artikelen>
		<aantal_items>1</aantal_items>
		<artikelen>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=ONW&amp;id=ID2743&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>kuo</historisch_lemma>
								<woordsoort>znw. &#160;v.</woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=ONW&amp;id=ID2743&amp;lemmodern=koe&amp;Betekenis_id=ID2743.sense.1</url>
						<niveau>0</niveau>
						<betekenisnummer>1</betekenisnummer>
													<definitie>Koe, vrouwelijk rund.</definitie>
											</betekenis>
								</betekenissen>
			</artikel>
				</artikelen>
	</wdb>
	    <wdb>
		<wdb_naam>WNT</wdb_naam>
		<periode>1500-heden</periode>
		<aantal_artikelen>6</aantal_artikelen>
		<aantal_items>6</aantal_items>
		<artikelen>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>KOE</historisch_lemma>
									<homoniemnummer>I</homoniemnummer>
								<woordsoort>znw.(v.)</woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432&amp;lemmodern=koe&amp;Betekenis_id=M034432.bet.1</url>
						<niveau>0</niveau>
						<betekenisnummer>I</betekenisnummer>
													<definitie>Vrouwelijk rund.&#160;&#160;</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432&amp;lemmodern=koe&amp;Betekenis_id=M034432.bet.2</url>
						<niveau>1</niveau>
						<betekenisnummer>I.1</betekenisnummer>
													<definitie>Vrouwelijk huisrund, &lt;I&gt;Bos taurus domesticus&lt;/I&gt;, in den regel een dat reeds gekalfd heeft.&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;Zoo lui als een koe (V. WINSCHOOTEN, &lt;I&gt;Seeman&lt;/I&gt; 113 [1681]), &#8212; als een vogeltje dat koe heet. &#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432&amp;lemmodern=koe&amp;Betekenis_id=M034432.bet.57</url>
						<niveau>1</niveau>
						<betekenisnummer>I.2</betekenisnummer>
													<definitie>Vrouwelijk exemplaar van andere soorten van het rundergeslacht, b.v. de wisents, de Amerikaansche bisons, de buffels, enz.</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432&amp;lemmodern=koe&amp;Betekenis_id=M034432.bet.58</url>
						<niveau>0</niveau>
						<betekenisnummer>II</betekenisnummer>
													<definitie>Bij uitbreiding ook gebruikt voor de wijfjes van sommige andere groote zoogdieren; b.v. in jagerstaal voor het wijfjeshert; voorts ook &#8212; gelijk in meer germ. talen &#8212; voor den wijfjeswalvisch.</definitie>
											</betekenis>
								</betekenissen>
			</artikel>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432.re.85&amp;lemmodern=koe~drijven </url>
				<modern_lemma>koe~drijven </modern_lemma>
				<historisch_lemma>Koeiendrijven</historisch_lemma>
								<woordsoort></woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432.re.85&amp;lemmodern=koe~drijven </url>
						<niveau>0</niveau>
						<betekenisnummer></betekenisnummer>
													<definitie></definitie>
											</betekenis>
								</betekenissen>
			</artikel>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432.re.177&amp;lemmodern=koe~melken </url>
				<modern_lemma>koe~melken </modern_lemma>
				<historisch_lemma>Koemelken</historisch_lemma>
								<woordsoort></woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034432.re.177&amp;lemmodern=koe~melken </url>
						<niveau>0</niveau>
						<betekenisnummer></betekenisnummer>
													<definitie></definitie>
											</betekenis>
								</betekenissen>
			</artikel>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034433&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>KOE</historisch_lemma>
									<homoniemnummer>II</homoniemnummer>
								<woordsoort>znw.</woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034433&amp;lemmodern=koe&amp;Betekenis_id=M034433.bet.1</url>
						<niveau>0</niveau>
						<betekenisnummer></betekenisnummer>
													<definitie>Lederen handbekleedsel, door metselaars en steenkruiers gebruikt om het stukschuren der handen door de gedurige aanraking met de ruwe en dikwijls nog heete steenen te voorkomen (ZWIERS [1918]). Misschien is &lt;I&gt;koeien&lt;/I&gt; eigenlijk de aanduiding van de stof (koeleder) waarvan deze bekleedsels gemaakt worden.</definitie>
											</betekenis>
								</betekenissen>
			</artikel>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034434&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>KOE</historisch_lemma>
									<homoniemnummer>III</homoniemnummer>
								<woordsoort>znw.</woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034434&amp;lemmodern=koe&amp;Betekenis_id=M034434.bet.1</url>
						<niveau>0</niveau>
						<betekenisnummer>1</betekenisnummer>
													<definitie>Kinkhoren (&lt;I&gt;Loquela (Wdb.)&lt;/I&gt; [Klemskerke, 1907]).&#160;</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034434&amp;lemmodern=koe&amp;Betekenis_id=M034434.bet.2</url>
						<niveau>0</niveau>
						<betekenisnummer>2</betekenisnummer>
													<definitie>Benaming voor het geluid waarmee men iemand in de verte roept; in de Kempen (CORN.-VERVL.); bij TUERL.&#160;&lt;I&gt;koehoe.&lt;/I&gt; Misschien oorspr. gebezigd om het dier &#8221;koe&#8221; te roepen en dan het woord &lt;I&gt;Koe&lt;/I&gt; (I): verg. in dezen zin &lt;I&gt;koi&lt;/I&gt; aan de Zaan (BOEKENOOGEN 1333).&#160;</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034434&amp;lemmodern=koe&amp;Betekenis_id=M034434.bet.3</url>
						<niveau>0</niveau>
						<betekenisnummer>3</betekenisnummer>
													<definitie>In Z.-Nederl. volgens SCHUERM. [1865-1870]: oprisping.&#160;</definitie>
											</betekenis>
								</betekenissen>
			</artikel>
					<artikel>
				<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034435&amp;lemmodern=koe</url>
				<modern_lemma>koe</modern_lemma>
				<historisch_lemma>KOE</historisch_lemma>
									<homoniemnummer>IV</homoniemnummer>
								<woordsoort>znw.</woordsoort>
				<betekenissen>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034435&amp;lemmodern=koe&amp;Betekenis_id=M034435.bet.1</url>
						<niveau>0</niveau>
						<betekenisnummer>1</betekenisnummer>
													<definitie>In West-Friesl. gebezigd bij het kaartspel als iemand zijn slag haalt. &#160;</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034435&amp;lemmodern=koe&amp;Betekenis_id=M034435.bet.2</url>
						<niveau>0</niveau>
						<betekenisnummer>2</betekenisnummer>
													<definitie>Op de Veluwe: dubbel vijf in &apos;t dominospel (&lt;I&gt;Nav.&lt;/I&gt; 30, 358).&#160;</definitie>
											</betekenis>
									<betekenis>
						<url>http://gtb.inl.nl/iWDB/search?actie=article&amp;wdb=WNT&amp;id=M034435&amp;lemmodern=koe&amp;Betekenis_id=M034435.bet.3</url>
						<niveau>0</niveau>
						<betekenisnummer>3</betekenisnummer>
													<definitie>In de verbinding op de koe staan, bijna verloren zijn bij het spel (V. DALE&#7459;). Wellicht is &lt;I&gt;koe&lt;/I&gt; hier &lt;I&gt;coup de gr&#226;ce&lt;/I&gt; (HARREB. 1, 425 &lt;I&gt;a&lt;/I&gt; [1858]); voor de grap teekent men bij den naam van den speler die op de koe staat een koe (dier).&#160;</definitie>
											</betekenis>
								</betekenissen>
			</artikel>
				</artikelen>
	</wdb>
	</wdbs>`;
	