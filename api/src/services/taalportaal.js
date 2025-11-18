import { parseHtml } from '../lib/util.js';

export default {
	// The service we're querying
	id: 'taalportaal',

	// The resources this service will search
	resources: [
		{
			id: 'taalportaal',
			shortName: 'Taalportaal',
			name: 'Taalportaal',
			type: 'grammatica'
		}
	],

	TP_TOPIC_URL: `https://taalportaal.org/taalportaal/topic`,

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const tpUrl = `${this.TP_TOPIC_URL}/find?query=${encodeURIComponent(searchString)}`;
		fetch(tpUrl)
		//fetch(`https://anw.ivdnt.org/backend/lemmalist?output=json&prefix=A`)
			.then(response => response.text())
			.then(response => {
				return parseHtml(response);
			})
			.then(data => {
				//console.log(data);
				const { link, moreLink } = reporter.htmlBuilder;
				const results = [...data.querySelectorAll('.searchresultitem a')].slice(0, 3).map(a => {
					a.querySelector('.topictype').remove();
					const href = `${this.TP_TOPIC_URL}/${a.getAttribute('href')}`;
					const title = a.querySelector('.searchresultitemtitle').textContent;
					return `<li>${link(title, href)}</li>`;
				});
				results.push(`<li>${moreLink(tpUrl)}</li>`);
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