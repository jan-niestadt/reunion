# Experiment: client-side aggregator

Reunion is a client-side aggregator that allows you to aggregate data from multiple sources and display it in a single view. It is designed to be used in a browser, and can be embedded in any web page.

A current limitation is that some project's web services don't allow accessing them from the client side (no CORS headers). Because of this, some of the services in this proof of concept include a stubbed API response. This would be solved by converting the aggregator to run on the server-side.
