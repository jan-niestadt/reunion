REUNION.addService({
	// The service we're querying
	id: 'anw',

	// The resources this service will search
	resources: [
		{
			id: 'anw',
			shortName: 'ANW (1970-nu)',
			name: 'Algemeen Nederlands Woordenboek (1970-nu)',
		}
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const url = new URL('https://anw.ivdnt.org/unified_search')
		url.search = new URLSearchParams({ trefwoord: searchString }).toString();
		fetch(url)
			.then(response => response.text())
			.then(str => new window.DOMParser().parseFromString(str, "text/xml"))
			.then(data => {
				const results = [];
				const arts = findSingleElement(data, 'artikelen');
				const { link, text, b, i } = REUNION.htmlBuilder;
				forEachChildElement(arts, art => {
					if (art.nodeType === Element.ELEMENT_NODE) {
						const snippet = [];
						const bets = findSingleElement(art, 'betekenissen');
						forEachChildElement(bets, bet => {
							const url = getElementValue(bet, 'url');
							const nr = getElementValue(bet, 'betekenisnummer');
							const definitie = getElementValue(bet, 'definitie');
							snippet.push({
								html: `${b(nr)} ${text(definitie)} ${link('➤', url)}`
							});
						});
						const lemma = getElementValue(art, 'modern_lemma');
						const url = getElementValue(art, 'url');
						const woordsoort = unifyPartOfSpeech(getElementValue(art, 'woordsoort'));
						results.push({
							html: `${link(lemma, url)} ${i(woordsoort)}`,
							snippet
						});
					}
				});
				reporter.finished(this.resources[0], results);
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
});

