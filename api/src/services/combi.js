import { searchUrl, unifyPartOfSpeech } from '../lib/util.js';

let LEMMA_LIST = null;

async function getLemmaList() {
    if (!LEMMA_LIST) {
        const url = 'https://woordcombinaties.ivdnt.org/solr-api/search?q.title=*&fl=pid,title,lemma-clean,lemma-addition,part-of-speech&rows=100000&sort=title+asc';
        const response = await fetch(url);
        const data = await response.json();
        LEMMA_LIST = {};
        data.results.forEach(item => {
            LEMMA_LIST[item['lemma-clean'].toString().toLowerCase()] = item;
        });
    }
    return LEMMA_LIST;
}

const SITE_URL = 'https://woordcombinaties.ivdnt.org';

function linkUrl(result) {
    return `${SITE_URL}/docs/${encodeURI(result.title)}/${result.pid}`;
}

function linkHtml(result) {
    const lemma = result['lemma-clean'];
    const optAdd = result['lemma-addition'] ? ` (${result['lemma-addition']})` : '';
    return `<a target="_blank" href="${linkUrl(result)}">${lemma}</a>${optAdd}`;
}

export default {
    // The service we're querying
    id: 'combi',

    // The resources this service will search
    resources: [
        {
            id: 'combi',
            shortName: 'Woordcombinaties',
            name: 'Woordcombinaties',
            type: 'dictionary'
        }
    ],
    
    SITE_URL,
    
    // Function that finds links to a lemma or molexId
    // The reporter is an object that has a method finished(service, results)
    links(lemma, molexId, reporter) {
        getLemmaList().then(lemmaList => {
            const llem = lemma.toLowerCase();
            const tryKeys = [llem, `${llem}, zich`];
            // console.log(lemma);
            // console.log(key);
            // console.log(lemmaList[key]);
            // console.log(key in lemmaList);
            const links = [];
            for (const key of tryKeys) {
                const item = lemmaList[key];
                const url = linkUrl(item);
                links.push({
                    entry: item['lemma-clean'],
                    entryAddition: item['lemma-addition'],
                    url,
                    html: linkHtml(item)
                });
            }
            reporter.finished(this.resources[0], { 
                status: 'ok', 
                links
            });
        });
    },

    // Function that performs the search and reports the results to the reporter
    // The reporter is an object that has a method finished(service, results)
    search(searchString, reporter) {
        const url = `${this.SITE_URL}/solr-api/search?` +
            `rows=10000&sort=lemma+asc&fl=pid,title,lemma-clean,lemma-addition,part-of-speech&` +
            `q.lemma-tokenized=%22${searchString}%22`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const { link, i, text, ul } = reporter.htmlBuilder;
                const results = data.results.map(result => {
                    const woordsoort = unifyPartOfSpeech(result['part-of-speech']);
                    return `<li>${linkHtml(result)} ${i(woordsoort)}</li>`;
                });
                reporter.finished(this.resources[0], {
                    number: data.results.length,
                    html: ul(results)
                });
            })
            .catch(err => {
                reporter.failed(this.resources[0], err);
            });
    },
};

