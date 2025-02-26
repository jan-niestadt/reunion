REUNION.addService({
	// The service we're querying
	id: 'gtb',
	title: 'Historische woordenboeken',

	// The resources this service will search in
	resources: [
		{
			id: 'wnt',
			title: 'Woordenboek der Nederlandsche Taal (1500-1976)',
		},
		{
			id: 'mnw',
			title: 'Middelnederlands (1300-1500)',
		},
		{
			id: 'vmnw',
			title: 'Vroegmiddelnederlands (1200-1300)',
		},
		{
			id: 'onw',
			title: 'Oudnederlands (500-1200)',
		},
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method searchCompleted(service, results)
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
				forEachElement(data.getElementsByTagName('wdb'), wdb => {
					const naam = getElementValue(wdb, 'wdb_naam');
					const resource = this.resources.find(resource => resource.id === naam.toLowerCase());
					if (!resource) {
						throw new Error(`wdb_naam from GTB response not found: ${naam}`);
					}
					const numArticles = getElementValue(wdb, 'aantal_artikelen');
					const numItems = getElementValue(wdb, 'aantal_items');
					const results = [];
					const arts = findSingleElement(wdb, 'artikelen');
					forEachChildElement(arts, art => {
						if (art.nodeType === Element.ELEMENT_NODE) {
							const betekenissen = [];
							const bets = findSingleElement(art, 'betekenissen');
							forEachChildElement(bets, bet => {
								const url = getElementValue(bet, 'url');
								const nr = getElementValue(bet, 'betekenisnummer');
								const definitie = getElementValue(bet, 'definitie');
								betekenissen.push({
									url,
									niveau: getElementValue(bet, 'niveau'),
									nr,
									definitie,
									markdown: `**${nr}** ${definitie} [➤](${url})`
								});
							});
							const lemma = getElementValue(art, 'modern_lemma');
							const url = getElementValue(art, 'url');
							const woordsoort = translateWoordsoort(getElementValue(art, 'woordsoort'));
							const historischLemma = getElementValue(art, 'historisch_lemma');
							results.push({
								markdown: `[**${lemma}**](${url})` +
									`${ historischLemma.toLowerCase() !== lemma.toLowerCase() ? ` ("${historischLemma}")` : ''}` +
									`${ woordsoort ? ` *(${woordsoort})*` : ''}`,
								url: getElementValue(art, 'url'),
								modernLemma: getElementValue(art, 'modern_lemma'),
								historischLemma,
								woordsoort: translateWoordsoort(getElementValue(art, 'woordsoort')),
								betekenissen
							});
						}
					});
					reporter.searchCompleted(resource, results);
				});
			})
			.catch(err => {
				console.error(err);
				reporter.searchFailed(this, err);
			});
	},
});

