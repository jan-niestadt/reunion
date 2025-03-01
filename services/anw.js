import *  as XML from '../lib/xml.js';
import { unifyPartOfSpeech } from '../lib/util.js';

export default {
	// The service we're querying
	id: 'anw',

	// The resources this service will search
	resources: [
		{
			id: 'anw',
			shortName: 'ANW (1970-nu)',
			name: 'Algemeen Nederlands Woordenboek (1970-nu)',
			type: 'dictionary'
		}
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const url = new URL('https://anw.ivdnt.org/unified_search')
		url.search = new URLSearchParams({ trefwoord: searchString }).toString();
		fetch(url)
			.then(response => response.text())
			.then(str => new window.DOMParser().parseFromString(str, "text/xml"))
			.then(data => {
				const results = [];
				const arts = XML.findSingleElement(data, 'artikelen');
				const { link, linkIcon, sentence, listItem, i } = reporter.htmlBuilder;
				XML.forEachChildElement(arts, art => {
					if (art.nodeType === Element.ELEMENT_NODE) {
						const snippet = [];
						const bets = XML.findSingleElement(art, 'betekenissen');
						XML.forEachChildElement(bets, bet => {
							const url = XML.getElementValue(bet, 'url');
							const nr = XML.getElementValue(bet, 'betekenisnummer');
							const definitie = XML.getElementValue(bet, 'definitie');
							const content = `${sentence(definitie)} ${linkIcon(url)}`;
							snippet.push(listItem(nr, content));
						});
						const lemma = XML.getElementValue(art, 'modern_lemma');
						const url = XML.getElementValue(art, 'url');
						const woordsoort = unifyPartOfSpeech(XML.getElementValue(art, 'woordsoort'));
						results.push({
							main: `${link(lemma, url)} ${i(woordsoort)}`,
							snippet
						});
					}
				});
				reporter.finished(this.resources[0], results);
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
};
