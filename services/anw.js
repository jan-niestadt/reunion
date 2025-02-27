REUNION.addService({
	// The service we're querying
	id: 'anw',
	title: 'Algemeen Nederlands Woordenboek',

	// The resources this service will search
	resources: [
		{
			id: 'anw',
			titleShort: 'Hedendaag (1970-nu)',
			title: 'Hedendaags Nederlands (1970-nu)',
		}
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method searchCompleted(service, results)
	search(searchString, reporter) {
		const url = new URL('https://anw.ivdnt.org/backend/lemmalist?output=json&prefix=A') // @@@ /unified_search  !!!
		url.search = new URLSearchParams({ trefwoord: searchString }).toString();
		fetch(url)
			.then(response => response.text())
			.then(str => new window.DOMParser().parseFromString(ANW_RESPONSE, "text/xml")) // @@@ FAKE RESPONSE (CORS)
			.then(data => {
				//console.log(data);
				const results = [];
				const arts = findSingleElement(data, 'artikelen');
				forEachChildElement(arts, art => {
					if (art.nodeType === Element.ELEMENT_NODE) {
						const betekenissen = [];
						const bets = findSingleElement(art, 'betekenissen');
						forEachChildElement(bets, bet => {
							const url = getElementValue(bet, 'url');
							const nr = getElementValue(bet, 'betekenisnummer');
							const definitie = getElementValue(bet, 'definitie');
							betekenissen.push({
								// url,
								// niveau: getElementValue(bet, 'niveau'),
								// nr,
								// definitie,
								markdown: `**${nr}** ${definitie} [➤](${url})`
							});
						});
						const lemma = getElementValue(art, 'modern_lemma');
						const url = getElementValue(art, 'url');
						const woordsoort = translateWoordsoort(getElementValue(art, 'woordsoort'));
						results.push({
							markdown: `[**${lemma}**](${url}) *${woordsoort}*`,
							// url,
							// modernLemma: lemma,
							// historischLemma: getElementValue(art, 'historisch_lemma'),
							// woordsoort,
							betekenissen
						});
					}
				});
				reporter.searchCompleted(this.resources[0], results);
			})
			.catch(err => {
				console.error(err);
				reporter.searchFailed(this, err);
			});
	},
});

