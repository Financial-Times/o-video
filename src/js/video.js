/* global fetch */
import crossDomainFetch from 'o-fetch-jsonp';
import getRendition from './helpers/get-rendition';
import VideoAds from './ads';

function eventListener(video, ev) {
	const event = new CustomEvent('oTracking.event', {
		detail: {
			action: 'media',
			advertising: video.opts.advertising,
			category: 'video',
			event: ev.type,
			mediaType: 'video',
			contentId: video.opts.id,
			progress: video.getProgress()
		},
		bubbles: true
	});
	document.body.dispatchEvent(event);
};

function addEvents(video, events) {
	events.forEach(event => {
		video.videoEl.addEventListener(event, eventListener.bind(this, video));
	});
};

// use the image resizing service, if width supplied
function updatePosterUrl(posterImage, width) {
	let url = `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(posterImage)}?source=o-video`;
	if (width) {
		url += `&fit=scale-down&width=${width}`;
	}
	return url;
};

function getBrandName(tags){
	if(!tags){
		return '';
	}
	
	for(let tag of tags){
		if(tag.indexOf('brand:') === 0){
			return tag.replace('brand:', '').trim();
		}
	}
}

function formatDuration(lengthInMs){
	let lengthInSeconds = Math.round(lengthInMs / 1000);
	let minutes = Math.round(lengthInSeconds / 60);
	let seconds = (lengthInSeconds - (minutes * 60)).toString();
	let paddedSeconds = seconds.length === 2 ? seconds : '0'+seconds;
	return `${minutes}:${paddedSeconds}`;
}

// converts data-o-video attributes to an options object
function getOptionsFromDataAttributes(attributes) {
	const opts = {};
	// Try to get config set declaratively on the element
	Array.prototype.forEach.call(attributes, (attr) => {
		if (attr.name.indexOf('data-o-video') === 0) {
			// Remove the prefix part of the data attribute name
			const key = attr.name.replace('data-o-video-', '');
			try {
				// If it's a JSON, a boolean or a number, we want it stored like that, and not as a string
				// We also replace all ' with " so JSON strings are parsed correctly
				opts[key] = JSON.parse(attr.value.replace(/\'/g, '"'));
			} catch (e) {
				opts[key] = attr.value;
			}
		}
	});

	return opts;
}

const defaultOpts = {
	advertising: false,
	autorender: true,
	classes: [],
	optimumwidth: null,
	placeholder: false,
	placeholdertitle: false,
	placeholderdisplay: 'brand',
	data: null,
	snapwidth: 400
};

class Video {
	constructor(el, opts) {
		this.containerEl = el;

		this.opts = opts || getOptionsFromDataAttributes(this.containerEl.attributes);

		Object.keys(defaultOpts).forEach(optionName => {
			if (typeof this.opts[optionName] === 'undefined') {
				this.opts[optionName] = defaultOpts[optionName];
			}
		});

		// display different kinds of info on the placeholder
		this.placeholderInfo = {};

		if(this.opts.placeholderdisplay) {
			this.opts.placeholderdisplay.split(',').forEach(display => {
				this.placeholderInfo[display] = true;
			});
		}

		if(this.opts.titlelink){
			this.placeholderInfo.link = this.opts.titlelink;
		}

		if (typeof this.opts.classes === 'string') {
			this.opts.classes = this.opts.classes.split(' ');
		}
		this.opts.classes.push('o-video__video');

		this.targeting = {
			site: '/5887/ft.com',
			position: 'video',
			sizes: '592x333|400x225',
			videoId: this.opts.id
		};

		if (this.opts.advertising) {
			this.videoAds = new VideoAds(this);
		}

		this.containerEl.setAttribute('data-o-video-js', '');

		if (this.opts.autorender === true) {
			this.init();
		}
	}

	getData() {
		const dataPromise = this.opts.data ?
			Promise.resolve(this.opts.data) :
			crossDomainFetch(`//next-video.ft.com/api/${this.opts.id}`)
				.then(response => {
					if (response.ok) {
						return response.json();
					} else {
						throw Error('Brightcove responded with a ' + response.status + ' (' + response.statusText + ') for id ' + this.opts.id);
					}
				});


		return dataPromise.then(data => {
			this.videoData = data;
			this.posterImage = updatePosterUrl(data.videoStillURL, this.opts.optimumwidth);
			this.rendition = getRendition(data.renditions);
		});
	}

	renderVideo() {
		if (this.rendition) {
			if (this.opts.placeholder) {
				this.addPlaceholder();
			} else {
				this.addVideo();
			}
		}
	}

	init() {
		let loadAdsLibraryPromise = Promise.resolve();
		if (this.opts.advertising) {
			loadAdsLibraryPromise = this.videoAds.loadAdsLibrary();
		}
		return loadAdsLibraryPromise
					.then(() => this.getData(), () => {
						// If ad doesn't load for some reason, load video as normal
						this.opts.advertising = false;
						return this.getData();
					})
					.then(() => this.renderVideo());
	}

	addVideo() {
		this.videoEl = document.createElement('video');
		this.videoEl.setAttribute('controls', true);
		this.videoEl.setAttribute('poster', this.posterImage);
		this.videoEl.setAttribute('src', this.rendition && this.rendition.url);
		this.videoEl.className = Array.isArray(this.opts.classes) ? this.opts.classes.join(' ') : this.opts.classes;
		this.containerEl.classList.add('o-video--player');
		this.containerEl.appendChild(this.videoEl);

		addEvents(this, ['play', 'pause', 'ended']);
		this.videoEl.addEventListener('playing', this.pauseOtherVideos);
		this.videoEl.addEventListener('suspend', this.clearCurrentlyPlaying);
		this.videoEl.addEventListener('ended', this.clearCurrentlyPlaying);

		if (this.opts.advertising) {
			this.videoAds.setUpAds();
		}
	}



	addPlaceholder() {
		this.placeholderEl = document.createElement('div');
		this.placeholderEl.classList.add('o-video__placeholder');
		const placeholderImageEl = document.createElement('img');
		placeholderImageEl.classList.add('o-video__placeholder-image');

		// Add a class to signify that the placeholder being diplayed is "large"
		if(this.containerEl.offsetWidth > this.opts.snapwidth){
			this.placeholderEl.classList.add('o-video__placeholder--large');
		}
		placeholderImageEl.setAttribute('src', this.posterImage);
		this.placeholderEl.appendChild(placeholderImageEl);

		const playButtonEl = document.createElement('button');
		playButtonEl.className = 'o-video__play-button';

		const playButtonTextEl = document.createElement('span');
		playButtonTextEl.className = 'o-video__play-button-text';
		playButtonTextEl.textContent = 'Play video';
		playButtonEl.appendChild(playButtonTextEl);

		const playIconEl = document.createElement('i');
		playIconEl.className = 'o-video__play-button-icon';
		playButtonEl.appendChild(playIconEl);
		this.placeholderEl.appendChild(playButtonEl);

		const infoContainerEl = document.createElement('div');
		infoContainerEl.className = 'o-video__info';
		this.placeholderEl.appendChild(infoContainerEl);

		const brand = getBrandName(this.videoData.tags);
		if(brand && this.placeholderInfo.brand){
			const brandEl = document.createElement('span');
			brandEl.className = 'o-video__info__brand';
			brandEl.textContent = brand;
			infoContainerEl.appendChild(brandEl);
		}

		const duration = formatDuration(this.videoData.length);
		if(duration && this.placeholderInfo.duration){
			const durationEl = document.createElement('span');
			durationEl.className = 'o-video__info__duration';
			durationEl.textContent = duration;
			infoContainerEl.appendChild(durationEl);
		}

		let titleEl;
		let titleContent = this.videoData && this.videoData.name;
		if (titleContent && (this.opts.placeholdertitle || this.placeholderInfo.title)) {
			titleEl = document.createElement('div');
			titleEl.className = 'o-video__title';
			if(this.placeholderInfo.link){
				let linkEl = document.createElement('a');
				linkEl.classList.add('o-video__title-link');
				linkEl.href = this.placeholderInfo.link;
				linkEl.textContent = titleContent;
				titleEl.appendChild(linkEl);
			}else{
				titleEl.textContent = titleContent;
			}

			infoContainerEl.appendChild(titleEl);
		}

		const description = this.videoData.shortDescription;
		if(description && this.placeholderInfo.description){
			const descriptionEl = document.createElement('span');
			descriptionEl.className = 'o-video__description';
			descriptionEl.textContent = description;
			infoContainerEl.appendChild(descriptionEl);
		}

		this.placeholderEl.addEventListener('click', () => {
			// Adds video soon so ads can start loading
			this.addVideo();

			this.containerEl.removeChild(this.placeholderEl);

			if (!this.opts.advertising) {
				this.videoEl.play();
			}
			this.videoEl.focus();
		});

		this.containerEl.appendChild(this.placeholderEl);
	}

	getProgress() {
		return this.videoEl.duration ? parseInt(100 * this.videoEl.currentTime / this.videoEl.duration, 10) : 0;
	}

	pauseOtherVideos() {
		if (this.currentlyPlayingVideo && this.currentlyPlayingVideo !== this.videoEl) {
			this.currentlyPlayingVideo.pause();
		}

		this.currentlyPlayingVideo = this.videoEl;
	}

	clearCurrentlyPlaying() {
		if (this.currentlyPlayingVideo !== this.videoEl) {
			this.currentlyPlayingVideo = null;
		}
	}

	static init(rootEl, config) {
		const videos = [];
		if (!rootEl) {
			rootEl = document.body;
		} else if (typeof rootEl === 'string') {
			rootEl = document.querySelector(rootEl);
		}

		const videoEls = rootEl.querySelectorAll(':not([data-o-video-js])[data-o-component~="o-video"]');

		for (let i = 0; i < videoEls.length; i++) {
			videos.push(new Video(videoEls[i], config));
		}

		return videos;
	}
}

export default Video;
