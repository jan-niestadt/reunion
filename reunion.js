const REUNION = {

    _services: [],

    init() {
        this.addService({
            id: 'anw',
            title: 'Algemeen Nederlands Woordenboek',
            search(str, reporter) {
                setTimeout(() => {
                    console.log(`searching ${this.id} for ${str}`);
                    reporter.searchCompleted(this, [{
                        title: 'Result 1',
                        snippet: `Searched ${this.id} for ${str}`,
                        link: 'https://example.com/1'
                    }, {
                        title: 'Result 2',
                        snippet: 'This is the second result',
                        link: 'https://example.com/2'
                    }]);
                }, Math.random() * 2000);
            },
        });
        this.addService({
            id: 'gtb',
            title: 'Historische Woordenboeken',
            search(str, reporter) {
                setTimeout(() => {
                    console.log(`searching ${this.id} for ${str}`);
                    reporter.searchCompleted(this, [{
                        title: 'Result 1',
                        snippet: `Searched ${this.id} for ${str}`,
                        link: 'https://example.com/1'
                    }, {
                        title: 'Result 2',
                        snippet: 'This is the second result',
                        link: 'https://example.com/2'
                    }]);
                }, Math.random() * 2000);
            },
        });
    },

    addService(service) {
        this._services.push(service);
    },

    services() {
        return this._services;
    },

    performSearch(searchString, reporter) {
        this._services.forEach(service => {
            reporter.searchStarted(service);
            service.search(searchString, reporter);
        });
    }
}