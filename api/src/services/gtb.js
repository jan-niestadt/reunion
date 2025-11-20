import *  as XML from '../lib/xml.js';
import { unifyPartOfSpeech, parseXml, searchUrl } from '../lib/util.js';
import { JSDOM } from 'jsdom';

export default {
	// The service we're querying
	id: 'gtb',

	// The resources this service will search in
	resources: [
		{
			id: 'wnt',
			name: 'Woordenboek der Nederlandsche Taal (1500-1976)',
			shortName: 'WNT (1500-1976)',
			type: 'dictionary'
		},
		{
			id: 'mnw',
			name: 'Middelnederlands (1300-1500)',
			shortName: 'MNW (1300-1500)',
			type: 'dictionary'
		},
		{
			id: 'vmnw',
			name: 'Vroegmiddelnederlands (1200-1300)',
			shortName: 'VMNW (1200-1300)',
			type: 'dictionary'
		},
		{
			id: 'onw',
			name: 'Oudnederlands (500-1200)',
			shortName: 'ONW (500-1200)',
			type: 'dictionary'
		},
	],

	// Function that performs the search and reports the results to the reporter
	// The reporter is an object that has a method finished(service, results)
	search(searchString, reporter) {
		const url = searchUrl(`https://gtb.ivdnt.org/iWDB/unified_search`, { lemmodern: searchString });
		//url.search = new URLSearchParams({ trefwoord: searchString }).toString();
		fetch(url)
			.then(response => response.text())
			.then(str => {
				str = str.replace(/&(nbsp|#160);/g, ' ').replace(/\s\s+/g, ' '); // @@@ FAKE RESPONSE (CORS)
				return parseXml(str);
			})
			.then(data => {
				//console.log(data);
				XML.forEachElement(data.getElementsByTagName('wdb'), wdb => {
					const naam = XML.getElementValue(wdb, 'wdb_naam');
					const resource = this.resources.find(resource => resource.id === naam.toLowerCase());
					if (!resource) {
						throw new Error(`wdb_naam from GTB response not found: ${naam}`);
					}
					const numArticles = XML.getElementValue(wdb, 'aantal_artikelen');
					const numItems = XML.getElementValue(wdb, 'aantal_items');
					const results = [];
					const arts = XML.findSingleElement(wdb, 'artikelen');
					XML.forEachChildElement(arts, art => {
						if (art.nodeType === 1/*ELEMENT_NODE*/) {
							const snippet = [];
							const bets = XML.findSingleElement(art, 'betekenissen');
							const { link, linkIcon, listItem, i, text, htmlSentence } = reporter.htmlBuilder;
							XML.forEachChildElement(bets, bet => {
								const url = XML.getElementValue(bet, 'url');
								const nr = XML.getElementValue(bet, 'betekenisnummer');
								const definitie = XML.getElementValue(bet, 'definitie');
								const content = `${htmlSentence(definitie)} ${linkIcon(url)}`;
								snippet.push(listItem(content, nr));
							});
							const lemma = XML.getElementValue(art, 'modern_lemma');
							const url = XML.getElementValue(art, 'url');
							const woordsoort = unifyPartOfSpeech(XML.getElementValue(art, 'woordsoort'));
							const historischLemma = XML.getElementValue(art, 'historisch_lemma');
							results.push(`<li>${link(lemma, url)}` +
									`${ historischLemma.toLowerCase() !== lemma.toLowerCase() ? ` ("${text(historischLemma)}")` : ''}` +
									` ${i(woordsoort)}<ul>${snippet.join('')}</ul></li>`);
						}
					});
					reporter.finished(resource, {
						number: numArticles,
						html: `<ul>${results.join('')}</ul>`
					});
				});
			})
			.catch(err => {
				console.error(err);
				this.resources.forEach(resource => reporter.failed(resource, err));
			});
	},
};