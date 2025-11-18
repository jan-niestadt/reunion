
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
