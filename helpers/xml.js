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