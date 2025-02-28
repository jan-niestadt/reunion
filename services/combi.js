//https://woordcombinaties.ivdnt.org/solr-api/search?rows=10000&sort=lemma+asc&fl=pid,title,lemma-clean,lemma-pos,lemma-addition,lemma-patterns,lemma-zich,part-of-speech,showPatterns&q.lemma-tokenized=%22passeren%22

REUNION.addService({
	// The service we're querying
	id: 'combi',

	// The resources this service will search
	resources: [
		{
			id: 'combi',
			shortName: 'Woordcombinaties',
			name: 'Woordcombinaties',
		}
	],
	
	SITE_URL: 'https://woordcombinaties.ivdnt.org/',

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const url = `${this.SITE_URL}/solr-api/search?` +
			`rows=10000&sort=lemma+asc&fl=pid,title,lemma-clean,lemma-addition,part-of-speech&` +
			`q.lemma-tokenized=%22${searchString}%22`;
		fetch(url)
			.then(response => response.json())
			.then(data => {
				const { link, b, i, text } = REUNION.htmlBuilder;
                const results = data.results.map(result => {
					const lemma = result['lemma-clean'];
                    const url = `${this.SITE_URL}/docs/${encodeURI(result.title)}/${result.pid}`
                    const woordsoort = unifyPartOfSpeech(result['part-of-speech']);
                    const optAdd = result['lemma-addition'] ? ` (${result['lemma-addition']})` : '';
                    return {
                        main: `${link(lemma, url)}${text(optAdd)} ${i(woordsoort)}`
                    };
                });
				reporter.finished(this.resources[0], results);
			})
			.catch(err => {
				reporter.failed(this.resources[0], err);
			});
	},
});

