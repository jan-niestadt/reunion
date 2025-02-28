REUNION.addService({
	// The service we're querying
	name: 'fail',

	// The resources this service will search
	resources: [
		{
			id: 'fail',
			title: 'Failing resource',
		}
	],

    search(str, reporter) {
        setTimeout(() => {
            reporter.searchFailed(this, 'Service not available');
        }, Math.random() * 2000);
    },
});
