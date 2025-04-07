import { REUNION } from './lib/reunion.js';

const services = [
    'anw',
    'chn',
    'gtb',
    'combi',
    'dsdd',
    'etymologiebank',
    'taalportaal'
];

let initialized = false;

async function initSearch() {
    if (initialized)
        return;
    initialized = true;

    await REUNION.loadServices(services);

    // Set up our results areas based on the resources we're querying
    // Navigation at the top
    const topNav = `<div class='resourcesNav'>` +
    REUNION.resources.map(resource => `
        <span title="${resource.name}" class='resourceNav' id='nav-${resource.id}'>
            <a href="#resource-${resource.id}"
                >${(resource.shortName || resource.name)
                    .replaceAll(/\(([^)]+)\)/g, '<small>$1</small>')}</a>
            <span class='num-${resource.id}'></span>
        </span>
    `).join('') + `
    </div>`;
    const heading = `<p>Trefwoorden voor: <span id='searchString'></span> <span id='totalResults'></span></p>`;
        // Result areas per resource
    const results = REUNION.resources
            .map(resource => 
                `<div class='resource ${resource.type}' id='resource-${resource.id}'>
                    <h2>${resource.name}
                        <span class='num-${resource.id}'></span>
                    </h2>
                    <div class="results" id="results-${resource.id}">
                    </div>
                </div>`)
            .join('');
    document.getElementById('results').innerHTML = topNav + heading + results;
    
    // Handle form submission
    document.getElementById('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchString = document.getElementById('search').value;
        const url = new URL(location);
        url.searchParams.set("query", searchString);
        history.pushState({}, "", url);
        //console.log(`Form submitted with ${searchString}`);
        await initSearch();
        performSearch(searchString);
    });
}

// Don't re-run last search if not necessary
let lastSearchString = undefined;

// Keep track of total results from all resources
let totalResults = 0;

// Handle back/forward navigation and page reload
const historyHandler = async (event) => {
    const searchString = new URL(location).searchParams.get("query");
    document.getElementById('search').value = searchString;
    //console.log(`History navigation to ${searchString}`);
    await initSearch();
    performSearch(searchString);
};
window.addEventListener("popstate", historyHandler);
window.addEventListener("DOMContentLoaded", historyHandler);

function setNumberOfResults(value, resource) {
    const txt = value ? `[${value}]` : '';
    if (resource)
        document.querySelectorAll(`.num-${resource.id}`).forEach(el => el.innerText = txt);
    else
        document.getElementById('totalResults').innerText = txt;
}

function setResultsHtml(html, resource) {
    document.getElementById(`results-${resource.id}`).innerHTML = html;
}

// Clear results
function clear() {
    // Clear the results
    document.getElementById('searchString').innerText = '';
    document.getElementById('totalResults').innerText = '';
    REUNION.resources.forEach(resource => {
        setNumberOfResults('', resource);
        setResultsHtml('', resource);
    });
}

// Perform search and update page
function performSearch(searchString) {
    if (lastSearchString === searchString)
        return; // nothing to do
    
    // Initialize
    lastSearchString = searchString;
    totalResults = 0;

    if (!searchString) {
        clear();
        return;
    }

    // Show that the search is starting
    //console.log(`Searching for ${searchString}`);
    document.getElementById('searchString').innerText = searchString;

    // perform the search
    REUNION.performSearch(searchString, {
        // Called when the search is started on a service
        started(resource) {
            //console.log(`Started search on ${REUNION.report(resource)} for ${searchString}`);
            setNumberOfResults('…', resource);
            setResultsHtml('<p>Searching...</p>', resource);
        },

        // Called when the search is completed for a resource
        finished(resource, results) {
            setNumberOfResults(results.number || 0, resource);
            totalResults += results.number || 0;
            setNumberOfResults(totalResults);
            setResultsHtml(results.html || '???', resource);
        },

        // Called when the search failed for a service
        failed(resource, reason) {
            console.log(`FAILED: search on ${REUNION.report(resource)} for ${searchString}, reason: ${reason}`);
            setNumberOfResults('⨯', resource);
            setResultsHtml(`<p class='failed'>Search on '${resource.name}' failed: ${reason}</p>`, resource);
        }
    });
}