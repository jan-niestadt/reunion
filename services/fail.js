REUNION.addService({
	// The service we're querying
	id: 'fail',

	// The resources this service will search
	resources: [
		{
			id: 'fail',
			name: 'Failing resource',
			type: 'misc'
		}
	],

    search(str, reporter) {
        setTimeout(() => {
            reporter.failed(this.resources[0], 'Service not available');
        }, Math.random() * 2000);
    },
});
