export default {
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
				const { link, moreLink, text, sentence, listItem } = reporter.htmlBuilder;
                const results = data.concepts.map(concept => {
                    // Also encode parentheses inside markdown!
                    const url = `https://dsdd.ivdnt.org/DSDD/search?dir=0&page=1&word=${concept.display}`
					const snippet = concept.keywords
						.sort( (a, b) => b['data.count'] - a['data.count'] )
						.slice(0, 3)
						.map(keyword => (listItem(`${text(keyword.display)} (${text(keyword['data.count'])})`)));
					snippet.push(moreLink(url));
                    return `<li>${link(concept.display, url)} - ${sentence(concept.definition)}<ul>${snippet.join('')}</ul></li>`;
                });
				reporter.finished(this.resources[0], {
					number: results.length,
					html: `<ul>${results.join('')}</ul>`
				});
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
};

