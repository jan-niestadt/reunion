REUNION.addService({
	id: 'anw',
	title: 'ANW 1970-heden',

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method searchCompleted(service, results)
	search(str, reporter) {
		const url = new URL('https://anw.ivdnt.org/backend/lemmalist?output=json&prefix=A') // @@@ /unified_search  !!!
		url.search = new URLSearchParams({ trefwoord: str }).toString();
		fetch(url)
			.then(response => response.text())
			.then(str => new window.DOMParser().parseFromString(ANW_RESPONSE, "text/xml")) // @@@ FAKE RESPONSE (CORS)
			.then(data => {
				console.log(data);
				const results = [];
				const arts = findSingleElement(data, 'artikelen');
				forEachChildElement(arts, art => {
					if (art.nodeType === Element.ELEMENT_NODE) {
						const betekenissen = [];
						const bets = findSingleElement(art, 'betekenissen');
						forEachChildElement(bets, bet => {
							betekenissen.push({
								url: getElementValue(bet, 'url'),
								niveau: getElementValue(bet, 'niveau'),
								nr: getElementValue(bet, 'betekenisnummer'),
								definitie: getElementValue(bet, 'definitie')
							});
						});
						results.push({
							url: getElementValue(art, 'url'),
							modernLemma: getElementValue(art, 'modern_lemma'),
							historischLemma: getElementValue(art, 'historisch_lemma'),
							woordsoort: getElementValue(art, 'woordsoort'),
							betekenissen
						});
					}
				});
				reporter.searchCompleted(this, results);
			})
			.catch(err => {
				console.error(err);
				reporter.searchFailed(this, err);
			});
	},
});

