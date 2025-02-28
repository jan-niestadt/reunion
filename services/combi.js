//https://woordcombinaties.ivdnt.org/solr-api/search?q.lemma-tokenized=%22passeren%22&rows=10000&sort=lemma+asc&fl=pid,title,lemma-clean,lemma-pos,lemma-addition,lemma-patterns,lemma-zich,part-of-speech,showPatterns

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

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const url = new URL('https://woordcombinaties.ivdnt.org/solr-api/search')
		url.search = new URLSearchParams({
            'q.lemma-tokenized': searchString,
            rows: 1000,
            sort: 'lemma asc',
            fl: 'pid,title,lemma-clean,lemma-pos,lemma-addition,lemma-patterns,lemma-zich,part-of-speech,showPatterns'
        }).toString();
		fetch(url)
			.then(response => response.json())
			.then(data => {
				const { link, b, i, text } = REUNION.htmlBuilder;
                const results = data.results.map(result => {
                    // Also encode parentheses inside markdown!
					const lemma = result['lemma-clean'];
                    const url = `https://woordcombinaties.ivdnt.org/docs/${encodeURI(result.title)}/${result.pid}`
                    const woordsoort = unifyPartOfSpeech(result['part-of-speech']);
                    const optAdd = result['lemma-addition'] ? ` (${result['lemma-addition']})` : '';
                    return {
                        html: `${link(lemma, url)}${text(optAdd)} ${i(woordsoort)}`
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

