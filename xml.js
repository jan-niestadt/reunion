// Get single child element's value
function getElementValue(parent, name) {
    return parent.getElementsByTagName(name)[0].textContent;
}

// Find single descendant element by name
function findSingleElement(ancestor, name) {
    return ancestor.getElementsByTagName(name)[0];
}

// Iterate over matched elements
function forEachElement(els, callback) {
	for (let i = 0; i < els.length; i++) {
		callback(els[i]);
	}
}

// Call a function for each child element
function forEachChildElement(node, callback) {
	for (let i = 0; i < node.childNodes.length; i++) {
		const child = node.childNodes[i];
		if (child.nodeType === Element.ELEMENT_NODE) {
			callback(child);
		}
	}
}

const WOORDSOORT_REPLACE = [
	// (see ArtikelObject in unified-search repo for current list)
	{
		find: /znw\.?/,
		replace: 'zelfstandig naamwoord',
	},
	{
		find: /\(v\.?\)/,
		replace: ' (vrouwelijk)',
	},
	{
		find: /\(m\.?\)/,
		replace: ' (vrouwelijk)',
	},
	{
		find: /\(o\.?\)/,
		replace: ' (vrouwelijk)',
	},
	{
		find: 'v.',
		replace: ' (vrouwelijk)',
	},
	{
		find: 'm.',
		replace: ' (mannelijk)',
	},
	{
		find: 'o.',
		replace: ' (onzijdig)',
	},
	{
		find: '&nbsp;',
		replace: '',
	},
];

function translateWoordsoort(woordsoort) {
	if (woordsoort) {
		WOORDSOORT_REPLACE.forEach(o => {
			woordsoort = woordsoort.replace(o.find, o.replace);
		});
	}
	return woordsoort;
}
