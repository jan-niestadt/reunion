import *  as XML from '../lib/xml.js';
import { unifyPartOfSpeech, parseXml, searchUrl } from '../lib/util.js';
import { HTML_BUILDER } from '../lib/reunion.js';
import { JSDOM } from 'jsdom';

let ANW_LEMMA_LIST = null;

async function anwLemmaList() {
	if (!ANW_LEMMA_LIST) {
		const url = 'https://anw.ivdnt.org/backend/lemmalist?output=json';
		const response = await fetch(url);
		const data = await response.json();
		ANW_LEMMA_LIST = {};
		data.forEach(item => {
			ANW_LEMMA_LIST[item[0].toString().toLowerCase()] = item[1]; // value = display lemma
		});
	}
	return ANW_LEMMA_LIST;
}

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

	// Function that finds links to a lemma or molexId
	// The reporter is an object that has a method finished(service, results)
	links(lemma, molexId, reporter) {
		anwLemmaList().then(lemmaList => {
			const key = lemma.toLowerCase();
			if (key in lemmaList) {
				const display = lemmaList[key]; // use display form
				const url = searchUrl(`https://anw.ivdnt.org/article/${encodeURIComponent(lemma)}`);
				reporter.finished(this.resources[0], {
					status: 'ok', 
					links: [ 
						{ 
							entry: display,
							url,
							html: `<a target="_blank"href="${url}">${display}</a>`
						} 
					]
				});
			} else {
				reporter.finished(this.resources[0], { status: 'ok', links: [] });
			}
		});

		// Works, but ANW does not return 404 for missing lemmas...
		//
		// fetch(url, { method: 'HEAD' })
		// 	.then(response => {
		// 		if (response.ok) {
		// 			reporter.finished(this.resources[0], { status: 'ok', links: [ { entry: lemma, url } ] });
		// 		} else {
		// 			reporter.finished(this.resources[0], { status: 'ok', status: 'error', links: [] });
		// 		}
		// 	})
		// 	.catch(err => {
		// 		console.error(err);
		// 		reporter.failed(this.resources[0], err);
		// 	});
	},

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const url = searchUrl('https://anw.ivdnt.org/unified_search', { trefwoord: searchString });
		fetch(url)
			.then(response => response.text())
			.then(str => parseXml(str))
			.then(data => {
				const results = [];
				let number = 0;
				const arts = XML.findSingleElement(data, 'artikelen');
				
				const { link, linkIcon, sentence, listItem, i, ul } = HTML_BUILDER;

				XML.forEachChildElement(arts, art => {
					if (art.nodeType === 1/*ELEMENT_NODE*/) {
						const snippets = [];
						const bets = XML.findSingleElement(art, 'betekenissen');
						XML.forEachChildElement(bets, bet => {
							const url = XML.getElementValue(bet, 'url');
							const nr = XML.getElementValue(bet, 'betekenisnummer');
							const definitie = XML.getElementValue(bet, 'definitie');
							const content = `${sentence(definitie)} ${linkIcon(url)}`;
							snippets.push(listItem(content, nr === '0.0' ? '' : nr));
						});
						const lemma = XML.getElementValue(art, 'modern_lemma');
						const url = XML.getElementValue(art, 'url');
						const woordsoort = unifyPartOfSpeech(XML.getElementValue(art, 'woordsoort'));
						results.push(`<li>${link(lemma, url)} ${i(woordsoort)}${ul(snippets)}</li>`);
						number++;
					}
				});
				reporter.finished(this.resources[0], {
					status: 'ok',
					number,
					html: ul(results)
				});
			})
			.catch(err => {
				console.error(err);
				reporter.failed(this.resources[0], err);
			});
	},
};
