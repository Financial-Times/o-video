
const closeButton = (onClick) => {
	const button = document.createElement('button');
	button.className = 'o-video__guidance__close';
	button.addEventListener('click', e => {
		e.stopPropagation();
		onClick()
	})
	return button;
}

const container = () => {
	const containerEl = document.createElement('div');
	containerEl.className = `o-video__guidance ${bannerMode && 'o-video__guidance--banner'}`;
	return containerEl;
}

const link = () => {
	const linkEl = document.createElement('a');
	linkEl.setAttribute('href', 'https://www.ft.com/accessibility');
	linkEl.className = 'o-video__guidance__link';
	linkEl.innerText = 'Subtitles unavailable';
	linkEl.target = '_blank';
	linkEl.addEventListener('click', e => e.stopPropagation())
	return linkEl;
}


const createGuidance = ({
	autoClose = null,
	showCloseButton = false
} = {}) => {
	const containerEl = container(); 
	containerEl.appendChild(link());
	if (showCloseButton) {
		containerEl.appendChild(
			closeButton(() => containerEl.remove())
		);
	}
	return containerEl;
}

export default createGuidance;