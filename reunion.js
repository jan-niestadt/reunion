const REUNION = {

    _services: [],

    addService(service) {
        // Make sure resources know their own service
        service.resources.forEach(resource => resource.service = service);
        this._services.push(service);
    },

    get services() {
        return this._services;
    },

    get resources() {
        return this._services.flatMap(service => service.resources);
    },

    report(obj) {
        if (obj.id) {
            if (obj.service && obj.service.id !== obj.id) {
                // multi-resource service
                return `${obj.service.id}.${obj.id}`;
            }
            return obj.id;
        }
        return `Object:${JSON.stringify(obj)}`;
    },

    performSearch(searchString, reporter) {
        this._services.forEach(service => {
            service.resources.forEach(resource => {
                reporter.searchStarted(resource);
            });
            service.search(searchString, {
                searchCompleted(resource, results) {
                    results.forEach(result => {
                        if (result.markdown) {
                            result.html = markdownToHtml(result.markdown);
                        }
                        (result.betekenissen || []).forEach(betekenis => {
                            if (betekenis.markdown) {
                                betekenis.html = markdownToHtml(betekenis.markdown);
                            }
                        });
                    })
                    reporter.searchCompleted(resource, results);
                },
                searchFailed(resource, reason) {
                    reporter.searchFailed(resource, reason);
                }
            });
        });
    }
}

function mdLink(text, url) {
    return `[${text}](${url.replace(/\(/g, '%28').replace(/\)/g, '%29')})`;
}
function mdBold(text) {
    return `**${text.replace(/\*\*/, '\\*\\*')}**`;
}
function mdItalic(text) {
    return `*${text.replace(/\*/, '\\*')}*`;
}

function markdownToHtml(markdown) {
    console.log(markdown);
    return markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[([^\[\]]*?)\]\(([^\(\)\[\]]*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}



const WOORDSOORT_REPLACE = [
	// (see ArtikelObject in unified-search repo for current list)
	{
		find: /znw\.?/,
		replace: 'zelfstandig naamwoord',
	},
	{
		find: /\(v\.?\)/,
		replace: ' (vrouwelijk)',
	},
	{
		find: /\(m\.?\)/,
		replace: ' (vrouwelijk)',
	},
	{
		find: /\(o\.?\)/,
		replace: ' (vrouwelijk)',
	},
	{
		find: 'v.',
		replace: ' (vrouwelijk)',
	},
	{
		find: 'm.',
		replace: ' (mannelijk)',
	},
	{
		find: 'o.',
		replace: ' (onzijdig)',
	},
	{
		find: '&nbsp;',
		replace: '',
	},
];

function translateWoordsoort(woordsoort) {
	if (woordsoort) {
		WOORDSOORT_REPLACE.forEach(o => {
			woordsoort = woordsoort.replace(o.find, o.replace);
		});
	}
	return woordsoort;
}