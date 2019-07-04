
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

 class Guidance {

	constructor () {
		this.removeBanner = this.removeBanner.bind(this);
	}

	createPlaceholder () {
		const containerEl = container(); 
		containerEl.appendChild(link());
		return containerEl;
	}

	createBanner () {
		this.banner = container(true); 

		this.banner.appendChild(closeButton(this.removeBanner));
		this.banner.appendChild(link());

		setTimeout(this.removeBanner, 5000000);

		return this.banner;
	}

	removeBanner () {
		this.banner && this.banner.remove();
	}
}

export default Guidance;