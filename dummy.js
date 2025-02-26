REUNION.addService({
	// The service we're querying
	id: 'dummy',
	title: 'Dummy service',

	// The resources this service will search
	resources: [
		{
			id: 'dummy',
			title: 'Dummy resource',
		}
	],

    search(str, reporter) {
        setTimeout(() => {
            //console.log(`searching ${this.id} for ${str}`);
            reporter.searchFailed(this, 'Service not available');
            // reporter.searchCompleted(this, [{
            //     modernLemma: 'Result 1',
            //     woordsoort: 'zelfstandig naamwoord',
            //     snippet: `Searched ${this.id} for ${str}`,
            //     url: 'https://example.com/1',
            //     betekenissen: []
            // }, {
            //     modernLemma: 'Result 2',
            //     woordsoort: 'zelfstandig naamwoord',
            //     snippet: 'This is the second result',
            //     url: 'https://example.com/2',
            //     betekenissen: []
            // }]);
        }, Math.random() * 2000);
    },
});
