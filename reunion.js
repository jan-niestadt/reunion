const REUNION = {

    _services: [],

    // Methods to build HTML responses safely
    htmlBuilder: {
        qa(text, preserveCR) {
            preserveCR = preserveCR ? '&#13;' : '\n';
            return ('' + text) /* Forces the conversion to string. */
                .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
                .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                /*
                You may add other replacements here for HTML only 
                (but it's not necessary).
                Or for XML, only if the named entities are defined in its DTD.
                */ 
                .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
                .replace(/[\r\n]/g, preserveCR);
        },
        text(text) {
            return REUNION.htmlBuilder.qa(text);
        },
        link(html, url, target = '_blank') {
            return `<a target="${REUNION.htmlBuilder.qa(target, true)}" href="${REUNION.htmlBuilder.qa(url, true)}">${html}</a>`;
        },
        b(html) {
            return html.match(/^\s*$/) ? '' : `<strong>${html}</strong>`;
        },
        i(html) {
            return html.match(/^\s*$/) ? '' : `<em>${html}</em>`;
        }
    },

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
                if (reporter.started)
                    reporter.started(resource);
            });
            service.search(searchString, {
                finished(resource, results) {

                    // Translate from markdown if necessary
                    results.forEach(result => {
                        if (!result.html && result.markdown) {
                            result.html = markdownToHtml(result.markdown);
                        }
                        (result.snippet || []).forEach(betekenis => {
                            if (!betekenis.html && betekenis.markdown) {
                                betekenis.html = markdownToHtml(betekenis.markdown);
                            }
                        });
                    })
                    if (reporter.finished)
                        reporter.finished(resource, results);
                    else {
                        console.error(`Finished search on ${this.report(resource)} for ${searchString}, but no finished() method defined`);
                        console.log(results);
                    }
                },
                failed(resource, reason) {
                    if (reporter.failed)
                        reporter.failed(resource, reason);
                    else {
                        console.error(`Failed search on ${this.report(resource)} for ${searchString}, but no failed() method defined`);
                        console.error(`REASON: ${reason}`);
                    }
                }
            });
        });
    }
}