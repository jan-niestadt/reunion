// links-to-molex: aggregate the result of several API's "links-to-molex" responses,
// so we can easily find if a Molex id is being linked to and from what resource and which entry.

// Import dependencies
const express = require('express');  // Express framework
const cors = require('cors');        // To enable CORS
const helmet = require('helmet');    // Enhance security with extra HTTP headers
const morgan = require('morgan');    // Log HTTP requests
const axios = require('axios');      // To fetch from the APIs

// API timeout. If an API doesn't respond quickly enough, just report an error.
const API_TIMEOUT_MS = 5000;

// The APIs we want to aggregate, from the QUERY_APIS environment variable
// (with a default fallback)
const MOLEX_LINKS_APIS = process.env.QUERY_APIS ? JSON.parse(process.env.QUERY_APIS) : {
    anw: 'http://anw-api.local/dws/api/external-links/molex',
    combi: 'http://combi-api.local/dws/api/external-links/molex'
};

// If an API replies with more than this number of links, error out
const API_RECORD_LIMIT = 1000;

// Create the Express app
const app = express();

// Enhance our API's security
app.use(helmet());

// Enable CORS for all requests
app.use(cors());

// Log HTTP requests
app.use(morgan('combined'));

async function getLinks(res, molexIds, lastEditDays) {
    const errors = [];
    const fetchPromises = Object.entries(MOLEX_LINKS_APIS).map(entry => {
        const [ apiName, apiUrl ] = entry;
        //console.log(`apiName ${apiName}; molexIds ${molexIds}; lastedit ${lastEditDays}`);
        return axios.get(`${apiUrl}`, {
            params: {
                'dst_ids': molexIds.join(','),
                'lastedit': lastEditDays,
                'limit': API_RECORD_LIMIT,
            },
            timeout: API_TIMEOUT_MS
        }).catch(error => {
            // Failed to get results from this API. Collect the error so we can report it.
            errors.push(`Failed to fetch from ${error.config.url} (${apiName})`);
            return Promise.resolve([]);
        }).then(result => {
            if (Array.isArray(result)) {
                // Caught exception (above); don't log error twice.
            } else if (result.data['nextUrl']) {
                // Too many links to combine. Error out.
                errors.push(`Too many links (>${API_RECORD_LIMIT}) from ${result.config.url} (${apiName})`);
                return Promise.resolve([]);
            } else {
                // Include the api name in the results
                if (!result.data['external-links']) {
                    errors.push(`No external-links key in response from ${result.config.url} (${apiName})`);
                    return Promise.resolve([]);
                }
                const links = result.data['external-links'].map(l => ({ srcResource: apiName, ...l }));
                return Promise.resolve(links);
            }
        });
    });
    let fetchResults = [];
    try {
        fetchResults = await Promise.all(fetchPromises);
    } catch (e) {
        errors.push(`Unexpected error: ${e}`);
    }
    if (errors.length > 0)
        console.log('Errors occurred: ', errors);
    if (errors.length === 0) {
        // Everything okay. Reply with links.
        const links = fetchResults.flat();
        res.send({
            status: {
                ok: true,
                errors: [],
            },
            links
        });
    } else {
        // Error(s) occurred. Include a fake link so even if the application forgets to check status,
        // it still seems as if there are links to this molex id, so it cannot be deleted.
        res.send({
            status: {
                ok: false,
                errors,
            },
            links: [
                {
                    ERROR: 'Error(s) occurred contacting API(s). See above. Refusing to return any link information.'
                }
            ]
        });
    }
}

// Find all links to a specific Molex lemma id
app.get('/links/:molexId', (req, res) => {
    const molexId = req.params.molexId;
    //res.send({ id, msg: `Showing links to id ${id}` });
    //const molexId = 216137;

    getLinks(res, [molexId], -1);
});

app.get('/links', (req, res) => {
    const parMolexIds = req.query['molex-ids'];
    const molexIds = parMolexIds ? parMolexIds.split(/,/) : [];
    const lastEditDays = req.query['lastedit'] ?? -1;
    //res.send({ id, msg: `Showing links to id ${id}` });
    //const molexId = 216137;

    getLinks(res, molexIds, lastEditDays);
});

// Start the server
app.listen(3001, () => {
    console.log('listening on port 3001');
});
