

import './xml.js';
import './util.js';

const isEmpty = (html) => {
    return html.toString().match(/^\s*$/);
};

// Escape text for use in HTML
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

const HTML_BUILDER = {
    text(text) {
        return qa(text);
    },
    sentence(text) {
        return HTML_BUILDER.text(text.replace(/(\p{L})\s*$/gu, '$1.'));
    },
    htmlSentence(html) {
        return html.replace(/(\p{L})\s*$/gu, '$1.');
    },
    listItem(html, ordinal) {
        if (!ordinal)
            ordinal = '';
        else
            ordinal = ordinal.replace(/([\d\w])$/, '$1.');
        return `<li><span class='ordinal'>${ordinal}</span><span class='content'>${html}</span></li>`;
    },
    link(html, url, className) {
        if (Array.isArray(className))
            className = className.join(' ');
        const optClass = className ? ` class="${qa(className)}"` : '';
        return `<a target="_blank" href="${qa(url, true)}"${optClass}>${qa(isEmpty(html) ? url : html)}</a>`;
    },
    linkIcon(url, className) {
        if (Array.isArray(className))
            className = className.join(' ');
        className += ' icon';
        return HTML_BUILDER.link('📘', url, className); //➤
    },
    moreLink(url, className) {
        if (Array.isArray(className))
            className = className.join(' ');
        className += ' more';
        return HTML_BUILDER.link('meer »', url, className);
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
        return HTML_BUILDER.el('span', html, className);
    },
    div(html, className) {
        return HTML_BUILDER.el('div', html, className);
    },
    b(html) {
        return HTML_BUILDER.el('strong', html);
    },
    i(html) {
        return HTML_BUILDER.el('em', html);
    },
    ul(items) {
        return HTML_BUILDER.el('ul', items.join(''), null, false);
    }
};

const REUNION = {

    _services: [],

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

    performSearch(type, query, molexId, reporter) {
        this._services.forEach(service => {
            const includeResources = service.resources.filter(r => reporter.include(r));
            if (includeResources.length === 0)
                return; // No need to call this service
            service.resources.forEach(resource => {
                if (reporter.started)
                    reporter.started(resource);
            });
            const _reporter = {
                include(resource) {
                    return reporter.include(resource);
                },

                finished(resource, results) {
                    if (reporter.finished)
                        reporter.finished(resource, results);
                    else {
                        console.error(`Finished search on ${this.report(resource)} for ${query}, but no finished() method defined`);
                        console.log(results);
                    }
                },
                failed(resource, reason) {
                    if (reporter.failed)
                        reporter.failed(resource, reason);
                    else {
                        console.error(`Failed search on ${this.report(resource)} for ${query}, but no failed() method defined`);
                        console.error(`REASON: ${reason}`);
                    }
                },
                htmlBuilder: HTML_BUILDER
            };
            if (type === 'search' && service.search) {
                service.search(query, _reporter);
            } else if (type === 'links' && service.links) {
                service.links(query, molexId, _reporter);
            } else {
                service.resources.forEach(resource => {
                    reporter.finished(resource, {
                        status: 'unsupported',
                        number: 0,
                        links: type === 'links' ? [] : undefined,
                        html: ''
                    });
                });
            }
        });
    }
}

export { REUNION, HTML_BUILDER };