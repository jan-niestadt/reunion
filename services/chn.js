export default {
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
		searchString = searchString.replace(/\*/g, '.*');
		fetch(`https://anw.ivdnt.org/backend/corpus?output=json&lemma=${encodeURIComponent(searchString)}`)
			.then(response => response.json())
			.then(data => {
				const { link, moreLink, b, i } = reporter.htmlBuilder;
				function words(frag) {
					const w = (frag && frag.word || []);
					const p = (frag && frag.punct || []);
					return w.map((word, i) => p[i] ? `${p[i]}${word}` : `${word} `).join('');
				}
				const results = data.hits.slice(0, 10)
					.map(hit => (`<tr><td class='before'>${hit.start > 0 ? `…` : ''} ${words(hit.left||hit.before)}</td><td class='match'>${b(words(hit.match))}</td><td class='after'>${words(hit.right||hit.after)} …</tr>`))
				const chnUrl = `https://portal.clarin.ivdnt.org/corpus-frontend-chn/chn-extern/search/hits?patt=%5Bword%3D%22${encodeURIComponent(searchString)}%22%5D`;
				results.push(`<tr><td colspan='3'>${moreLink(chnUrl)}</td></tr>`);
				reporter.finished(this.resources[0], {
					number: results.length,
					html: `<table class='conc'>${results.join('')}</table>`
				});
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
};

