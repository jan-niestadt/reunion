// Don't re-run last search if not necessary
let lastSearchString = undefined;

// Keep track of total results from all resources
let totalResults = 0;

function setNumberOfResults(value, resource) {
    const txt = value ? ` (${value})` : '';
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
    console.log(`Searching for ${searchString}`);
    document.getElementById('searchString').innerText = searchString;

    // perform the search
    REUNION.performSearch(searchString, {

        // Called when the search is started on a service
        searchStarted(service) {
            //console.log(`Started search on ${service.name} (resources ${service.resources.map(r => r.id)}) for ${searchString}`);
            service.resources.forEach(resource => {
                setNumberOfResults('…', resource);
                setResultsHtml('<p>Searching...</p>', resource);
            });
        },

        // Called when the search is completed for a resource
        searchCompleted(resource, results) {
            setNumberOfResults(results.length, resource);
            totalResults += results.length;
            setNumberOfResults(totalResults);
            const resultsHtml = results.map(result => {
                const hist = result.historischLemma && result.historischLemma.toLowerCase() !== result.modernLemma.toLowerCase() ? 
                    ` ("${result.historischLemma.toLowerCase()}")` : '';
                const betHtml = (result.betekenissen || []).map(bet => `<li>${bet.html}</li>`).join('');
                return `
                    <li>
                        <p>${result.html}</p>
                        <ul class="bet">${betHtml}</ul>
                    </li>`;
            }).join('');
            setResultsHtml(resultsHtml, resource);
        },

        // Called when the search failed for a service
        searchFailed(service, reason) {
            console.log(`FAILED: search on ${service.name} (resources: ${service.resources.map(r => r.title)}) for ${searchString}, reason: ${reason}`);
            service.resources.forEach(resource => {
                setNumberOfResults('⨯', resource);
                setResultsHtml(`<p>Search on '${resource.title}' failed: ${reason}</p>`, resource);
            });
        }
    });
}

// Set up our results areas based on the resources we're querying
// Navigation at the top
const topNav = `<div class='resourcesNav'>` +
REUNION.resources.map(resource => `
    <span title="${resource.title}" class='resourceNav' id='nav-${resource.id}'>
        <a href="#resource-${resource.id}"
            >${(resource.titleShort || resource.title)
                .replaceAll(/\(([^)]+)\)/g, '<small>$1</small>')}</a>
        <span class='num-${resource.id}'></span>
    </span>
`).join('') + `
</div>`;
const heading = `<p>Trefwoorden voor: <span id='searchString'></span> <span id='totalResults'></span></p>`;
    // Result areas per resource
const results = REUNION.resources
        .map(resource => 
            `<div class='resource' id='resource-${resource.id}'>
                <h2>${resource.title}
                    <span class='num-${resource.id}'></span>
                </h2>
                <ul class="results" id="results-${resource.id}">
                </ul>
            </div>`)
        .join('');
document.getElementById('results').innerHTML = topNav + heading + results;

// Handle form submission
document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const searchString = document.getElementById('search').value;
    const url = new URL(location);
    url.searchParams.set("query", searchString);
    history.pushState({}, "", url);
    performSearch(searchString);
});

// Handle back/forward navigation and page reload
const historyHandler = (event) => {
    const searchString = new URL(location).searchParams.get("query");
    document.getElementById('search').value = searchString;
    performSearch(searchString);
};
window.addEventListener("popstate", historyHandler);
window.addEventListener("DOMContentLoaded", historyHandler);
