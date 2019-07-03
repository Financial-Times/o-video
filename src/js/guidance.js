
const closeButton = (onClick) => {
	const button = document.createElement('button');
	button.className = 'o-video__guidance__close';
	button.addEventListener('click', e => {
		e.stopPropagation();
		onClick()
	})
	return button;
}

const container = (bannerMode) => {
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


export const createGuidancePlaceholder = () => {
	const containerEl = container(); 
	containerEl.appendChild(link());
	return { element: containerEl };
}

export const createGuidanceBanner = ({
	closeTimeout = 5
} = {}) =>  {
	const containerEl = container(true); 
	const teardown = () => containerEl.remove();

	containerEl.appendChild(closeButton(teardown));
	containerEl.appendChild(link());

	setTimeout(teardown, closeTimeout * 1000);

	return { element: containerEl, teardown };
}