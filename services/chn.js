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
				const results = data.hits.slice(0, 10).map(hit => {
					const words = frag => (frag.word || []).map((word, i) => (frag.punct[i] || '') + word).join('');
					return `<tr>
						<td class='before'>${hit.start > 0 ? '…' : ''} ${words(hit.left || hit.before)}</td>
						<td class='match'><b>${words(hit.match)}</b></td>
						<td class='after'>${words(hit.right || hit.after)} …</td>
					</tr>`;
				}).join('');
				const chnUrl = `https://portal.clarin.ivdnt.org/corpus-frontend-chn/chn-extern/search/hits?patt=%5Bword%3D%22${encodeURIComponent(searchString)}%22%5D`;
				reporter.finished(this.resources[0], {
					number: data.hits.length,
					html: `<table class='conc'>${results}<tr><td colspan='3'><a href="${chnUrl}" target="_blank">More results</a></td></tr></table>`
				});
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
};

