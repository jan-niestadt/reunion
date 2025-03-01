//https://woordcombinaties.ivdnt.org/solr-api/search?q.lemma-tokenized=%22passeren%22&rows=10000&sort=lemma+asc&fl=pid,title,lemma-clean,lemma-pos,lemma-addition,lemma-patterns,lemma-zich,part-of-speech,showPatterns

REUNION.addService({
	// The service we're querying
	id: 'dsdd',

	// The resources this service will search
	resources: [
		{
			id: 'dsdd',
			shortName: 'DSDD',
			name: 'Database van de Zuidelijk-Nederlandse Dialecten',
			type: 'dictionary'
		}
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const url = new URL('https://dsdd.ivdnt.org/dsdd-api/concepts')
		url.search = new URLSearchParams({
            include_facets: true,
			include_data: true,
			search_in: 'concepts',
			word: searchString,
			start: 0,
			rows: 1000
        }).toString();
		fetch(url)
			.then(response => response.json())
			.then(data => {
				const { link, moreLink, text } = REUNION.htmlBuilder;
                const results = data.concepts.map(concept => {
                    // Also encode parentheses inside markdown!
                    const url = `https://dsdd.ivdnt.org/DSDD/search?dir=0&page=1&word=${concept.display}`
					const snippet = concept.keywords
						.sort( (a, b) => b['data.count'] - a['data.count'] )
						.slice(0, 3)
						.map(keyword => (`${text(keyword.display)} (${text(keyword['data.count'])})`));
					snippet.push(moreLink(url));
                    return {
                        main: `${link(concept.display, url)} - ${text(concept.definition)}`,
						snippet
                    };
                });
				reporter.finished(this.resources[0], results);
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
});

