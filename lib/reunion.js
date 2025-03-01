

import './xml.js';
import './util.js';

const isEmpty = (html) => {
    return html.toString().match(/^\s*$/);
};

const qa = (text, preserveCR) => {
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
};

const REUNION = {

    _services: [],

    // Methods to build HTML responses safely
    htmlBuilder: {
        text(text) {
            return qa(text);
        },
        link(html, url, className, target = '_blank') {
            if (Array.isArray(className))
                className = className.join(' ');
            const optClass = className ? ` class="${qa(className)}"` : '';
            return `<a target="${qa(target, true)}" href="${qa(url, true)}"${optClass}>${qa(isEmpty(html) ? url : html)}</a>`;
        },
        moreLink() {
            return REUNION.htmlBuilder.link('(meer)', ...arguments);
        },
        el(elName, innerHtml, className, evenIfEmpty = false) {
            if (!evenIfEmpty && isEmpty(innerHtml))
                return '';
            if (Array.isArray(className))
                className = className.join(' ');
            const optClass = className
                ? ` class="${qa(className)}"`
                : '';
            return `<${elName}${optClass}>${innerHtml}</${elName}>`;
        },
        span(html, className) {
            return REUNION.htmlBuilder.el('span', html, className);
        },
        div(html, className) {
            return REUNION.htmlBuilder.el('div', html, className);
        },
        b(html) {
            return REUNION.htmlBuilder.el('strong', html);
        },
        i(html) {
            return REUNION.htmlBuilder.el('em', html);
        }
    },

    async loadServices(serviceIds) {
        //console.log('Loading services');
        for (const id of serviceIds) {
            //console.log(`Loading ${id}`);
            await import(`../services/${id}.js`)
                .then(module => REUNION.addService(module.default))
                .catch(err => console.error(`${err} loading ${id}`));
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
            const _reporter = {
                finished(resource, results) {
                    results.forEach(result => {
                        if (!result.snippet)
                            result.snippet = [];
                    });
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
                },
                htmlBuilder: this.htmlBuilder
            };
            service.search(searchString, _reporter);
        });
    }
}

export { REUNION };