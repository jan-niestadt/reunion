// Get single child element's value
export function getElementValue(parent, name) {
    return parent.getElementsByTagName(name)[0].textContent;
}

// Find single descendant element by name
export function findSingleElement(ancestor, name) {
    return ancestor.getElementsByTagName(name)[0];
}

// Iterate over matched elements
export function forEachElement(els, callback) {
	for (let i = 0; i < els.length; i++) {
		callback(els[i]);
	}
}

// Call a function for each child element
export function forEachChildElement(node, callback) {
	for (let i = 0; i < node.childNodes.length; i++) {
		const child = node.childNodes[i];
		if (child.nodeType === Element.ELEMENT_NODE) {
			callback(child);
		}
	}
}