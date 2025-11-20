// links-to-molex: aggregate the result of several API's "links-to-molex" responses,
// so we can easily find if a Molex id is being linked to and from what resource and which entry.

import { REUNION } from './lib/reunion.js';

// Use import instead of require
import express from 'express';  // Express framework
import cors from 'cors';        // To enable CORS
import helmet from 'helmet';    // Enhance security with extra HTTP headers
import morgan from 'morgan';    // Log HTTP requests
import axios from 'axios';      // To fetch from the APIs

// API timeout. If an API doesn't respond quickly enough, just report an error.
const API_TIMEOUT_MS = 5000;

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

function reporter(lemma, molexId, response, numberOfResources, res, outputAsHtml = false) {
    return {
        // Called when the search is started on a service
        started(resource) {
        },

        // Called when the search is completed for a resource
        finished(resource, results) {
            response.resources.push({
                ...results,
                resource: resrc(resource)
            });
            numberOfResources--;
            if (numberOfResources === 0)
                output(res, lemma, response, outputAsHtml);
        },

        // Called when the search failed for a service
        failed(resource, reason) {
            console.log(`FAILED: search on ${REUNION.report(resource)} for ${lemma}, reason: ${reason}`);
            response.resources.push({
                number: 0,
                error: reason,
                html: `<p class='failed'>Search on '${resource.name}' failed: ${reason}</p>`,
                resource: resrc(resource)
            });
            numberOfResources--;
            if (numberOfResources === 0)
                output(res, lemma, response, outputAsHtml);
        }
    };
}

// Find links to a word (or similar entry)
app.get('/links', (req, res) => {
    const lemma = req.query.q;
    const molexId = req.query.molexId;
    

    // perform the search
    let numberOfResources = REUNION.resources.length;
    const response = { resources: [] };
    REUNION.performSearch('links', lemma, molexId, reporter(lemma, molexId, response, numberOfResources, res, false));

});

function resrc(resource) {
    return {
        id: resource.id,
        name: resource.name,
        shortName: resource.shortName,
        type: resource.type
    };
}

function output(res, search, response, asHtml) {
    if (asHtml) {
        let html = '<html><head><title>Reunion Search Results</title></head><body>';
        html += `<h1>Search results for '${search}'</h1>`;
        response.resources.sort((a, b) => a.resource.id.localeCompare(b.resource.id));
        response.resources.forEach(r => {
            html += `<h2>${r.resource.name} (${r.number} results)</h2>`;
            if (r.error) {
                html += `<p class='failed'>Error: ${r.error}</p>`;
            } else {
                html += r.html;
            }
        });
        html += '</body></html>';
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    }
}

app.get('/search', (req, res) => {

    // Check if the Accept header allows JSON
    const acceptHeader = req.headers['accept'] || '';
    const acceptsJson = acceptHeader.includes('application/json') || acceptHeader.includes('*/*');
    const acceptsHtml = acceptHeader.includes('text/html') || acceptHeader.includes('*/*');
    if (!acceptsJson && !acceptsHtml) {
        res.status(406).send('Not Acceptable: This endpoint only serves application/json or text/html');
        return;
    }
    const outputAsHtml = (acceptsHtml && !acceptsJson) || req.query.output === 'html';

    const lemma = req.query.q;
    console.log(`Received search request for lemma '${lemma}'`);

    // perform the search
    let numberOfResources = REUNION.resources.length;
    const response = { resources: [] };
    REUNION.performSearch('search', lemma, null, reporter(lemma, null, response, numberOfResources, res, outputAsHtml));
    
});

// Start the server
app.listen(3001, () => {
    console.log('listening on port 3001');
});


const services = [
    'anw',
    'chn',
    'gtb',
    'combi',
    'dsdd',
    'etym',
    //'taalportaal'
];
await REUNION.loadServices(services);
