import { parseHtml } from '../lib/util.js';

export default {
	// The service we're querying
	id: 'etym',

	// The resources this service will search
	resources: [
		{
			id: 'etym',
			shortName: 'Etymologiebank',
			name: 'Etymologiebank',
			type: 'woordenboek'
		}
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		fetch(`https://etymologiebank.nl/zoek_woord`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ word: searchString })
		})
			.then(response => response.text())
			.then(response => {
				return parseHtml(response); 
			})
			.then(data => {
				//console.log(data);
				const { link, ul } = reporter.htmlBuilder;
				const results = [...data.querySelectorAll('#text p a')]
					.filter(a => !a.href.includes('javascript:'))
					.map(a => `${link(a.textContent, a.href)}`);
				reporter.finished(this.resources[0], {
					number: results.length,
					html: ul(results)
				});
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
};
