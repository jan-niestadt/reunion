const REUNION = {

    _services: [],

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