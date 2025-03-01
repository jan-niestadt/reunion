REUNION.addService({
	// The service we're querying
	id: 'chn',

	// The resources this service will search
	resources: [
		{
			id: 'chn',
			shortName: 'CHN',
			name: 'Corpus Hedendaags Nederlands',
			type: 'corpus'
		}
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		fetch(escapeForUrl`https://anw.ivdnt.org/backend/corpus?output=json&lemma=${searchString}`)
			.then(response => response.json())
			.then(data => {
				const { link, moreLink, b, i } = REUNION.htmlBuilder;
				function words(frag) {
					const w = (frag && frag.word || []);
					const p = (frag && frag.punct || []);
					return w.map((word, i) => p[i] ? `${p[i]}${word}` : `${word} `).join('');
				}
				const snippet = data.hits.slice(0, 5)
					.map(hit => (`${hit.start > 0 ? `…` : ''} ${words(hit.left||hit.before)} ${b(words(hit.match))} ${words(hit.right||hit.after)} …`))
				const chnUrl = escapeForUrl`https://portal.clarin.ivdnt.org/corpus-frontend-chn/chn-extern/search/hits?patt=%5Bword%3D%22${searchString}%22%5D`;
					snippet.push(moreLink(chnUrl));
				reporter.finished(this.resources[0], [{
					main: `${link('CHN', chnUrl)}`,
					snippet
				}]);
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
});

