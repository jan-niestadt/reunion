import *  as XML from '../lib/xml.js';
import { unifyPartOfSpeech } from '../lib/util.js';
import { qa } from '../lib/reunion.js';

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
				
				//const { link, linkIcon, sentence, listItem, i } = reporter.htmlBuilder;
				const htmlBuilder = () => {
					const parts = [];

					const builder = {
						toString() {
							return parts.join('');
						},
						html(html) {
							parts.push(html);
							return this;
						},
						text(text) {
							return this.html(qa(text));
						},
						sentence(text) {
							return this.text(text.replace(/(\p{L})\s*$/gu, '$1.'));
						},
						htmlSentence(html) {
							return this.html(html.replace(/(\p{L})\s*$/gu, '$1.'));
						},
						listItem(html, ordinal) {
							if (!ordinal)
								ordinal = '▪';
							else
								ordinal = ordinal.replace(/([\d\w])$/, '$1.');
							return this.html(`<div class='list-item'><span class='ordinal'>${ordinal}</span><span class='content'>${html}</span></div>`);
						},
						link(html, url, className) {
							if (Array.isArray(className))
								className = className.join(' ');
							const optClass = className ? ` class="${qa(className)}"` : '';
							return this.html(`<a target="_blank" href="${qa(url, true)}"${optClass}>${qa(isEmpty(html) ? url : html)}</a>`);
						},
						linkIcon(url, className) {
							if (Array.isArray(className))
								className = className.join(' ');
							className += ' icon';
							return this.link('📘', url, className);
						},
						moreLink(url, className) {
							if (Array.isArray(className))
								className = className.join(' ');
							className += ' more';
							return this.link('meer »', url, className);
						},
						el(elName, innerHtml, className, evenIfEmpty = false) {
							if (!evenIfEmpty && isEmpty(innerHtml))
								return '';
							if (Array.isArray(className))
								className = className.join(' ');
							const optClass = className
								? ` class="${qa(className)}"`
								: '';
							return this.html(`<${elName}${optClass}>${innerHtml}</${elName}>`);
						},
						span(html, className) {
							return this.el('span', html, className);
						},
						div(html, className) {
							return this.el('div', html, className);
						},
						b(html) {
							return this.el('strong', html);
						},
						i(html) {
							return this.el('em', html);
						}
					
					};
					return builder;
				};

				XML.forEachChildElement(arts, art => {
					if (art.nodeType === Element.ELEMENT_NODE) {
						const html = htmlBuilder();
						const lemma = XML.getElementValue(art, 'modern_lemma');
						const url = XML.getElementValue(art, 'url');
						const woordsoort = unifyPartOfSpeech(XML.getElementValue(art, 'woordsoort'));
						html.link(lemma, url).text(' ').

						const snippet = [];
						const bets = XML.findSingleElement(art, 'betekenissen');
						XML.forEachChildElement(bets, bet => {
							const url = XML.getElementValue(bet, 'url');
							const nr = XML.getElementValue(bet, 'betekenisnummer');
							const definitie = XML.getElementValue(bet, 'definitie');
							const content = `${sentence(definitie)} ${linkIcon(url)}`;
							snippet.push(listItem(content, nr === '0.0' ? '' : nr));
						});
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
