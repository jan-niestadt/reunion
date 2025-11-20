
export function unifyPartOfSpeech(woordsoort) {
	if (woordsoort) {
        // (INCOMPLETE; see ArtikelObject in unified-search repo for current list)
        woordsoort = woordsoort.replace(/znw\.?/g, 'zelfstandig naamwoord');
        woordsoort = woordsoort.replace(/\(v\.?\)/g, ' (vrouwelijk)');
        woordsoort = woordsoort.replace(/\(m\.?\)/g, ' (mannelijk)');
        woordsoort = woordsoort.replace(/\(o\.?\)/g, ' (onzijdig)');
        woordsoort = woordsoort.replace('v.', ' (vrouwelijk)');
        woordsoort = woordsoort.replace('m.', ' (mannelijk)');
        woordsoort = woordsoort.replace('o.', ' (onzijdig)');
        woordsoort = woordsoort.replace('&nbsp;', '');
	}
	return woordsoort;
}


import { JSDOM } from 'jsdom';

export function parseXml(str) {
	return new JSDOM(str, { contentType: "text/xml" }).window.document;
}

export function parseHtml(str) {
	return new JSDOM(str, { contentType: "text/html" }).window.document;
}

/** Construct a URL with query parameters */
export function searchUrl(baseUrl, params) {
	const url = new URL(baseUrl);
	url.search = new URLSearchParams(params).toString();
	return url;
}

/** Join an array of strings with a specified HTML element */
export function elJoin(elName, array) {
	if (array.length === 0)
		return '';
	return `<${elName}>${array.join('')}</${elName}>`;
}
