import formats from './formats';
const testEl = document.createElement('video');

let supportedFormats = [];
if (testEl.canPlayType) {
	try {
		supportedFormats = Object.keys(formats).filter(format => formats[format].some(type => testEl.canPlayType(type)));
	} catch(e) { }
}

export default supportedFormats;
