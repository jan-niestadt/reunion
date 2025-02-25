const REUNION = {

    _services: [],

    addService(service) {
        // Make sure resources know their own service
        service.resources.forEach(resource => resource.service = service);
        this._services.push(service);
    },

    get services() {
        return this._services;
    },

    get resources() {
        return this._services.flatMap(service => service.resources);
    },

    performSearch(searchString, reporter) {
        this._services.forEach(service => {
            reporter.searchStarted(service);
            service.search(searchString, reporter);
        });
    }
}