/* global fetch */
import crossDomainFetch from 'o-fetch-jsonp';
import getRendition from './helpers/get-rendition';
import VideoAds from './ads';
import VideoInfo from './info';
import Playlist from './playlist';

function eventListener(video, ev) {
	// Dispatch progress event at start, 25%, 50%, 75% and 100%
	if (ev.type === 'progress' && video.getProgress() % 25 !== 0) {
		return;
	}

	const event = new CustomEvent('oTracking.event', {
		detail: {
			action: ev.type,
			advertising: video.opts.advertising,
			category: 'video',
			contentId: video.opts.id,
			progress: video.getProgress(),
		},
		bubbles: true
	});
	document.body.dispatchEvent(event);
}

function addEvents(video, events) {
	events.forEach(event => {
		video.videoEl.addEventListener(event, eventListener.bind(this, video));
	});
}

// use the image resizing service, if width supplied
function updatePosterUrl(posterImage, width) {
	let url = `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(posterImage)}?source=o-video`;

	if (width) {
		url += `&fit=scale-down&width=${width}`;
	}

	return url;
}

// converts data-o-video attributes to an options object
function getOptionsFromDataAttributes(attributes) {
	const opts = {};
	// Try to get config set declaratively on the element
	Array.prototype.forEach.call(attributes, (attr) => {
		if (attr.name.indexOf('data-o-video') === 0) {
			// Remove the prefix part of the data attribute name and hyphen-case to camelCase
			const key = attr.name.replace('data-o-video-', '').replace(/-([a-z])/g, (m, w) => {
				return w.toUpperCase();
			});

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
	placeholder: null,
	placeholderFeatures: ['title'],
	data: null
};

class Video {
	constructor(el, opts) {
		this.containerEl = el;

		this.opts = Object.assign({}, defaultOpts, opts, getOptionsFromDataAttributes(this.containerEl.attributes));

		if (typeof this.opts.classes === 'string') {
			this.opts.classes = this.opts.classes.split(' ');
		}

		if (this.opts.classes.indexOf('o-video__video') === -1) {
			this.opts.classes.push('o-video__video');
		}

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
			this.rendition = getRendition(data.renditions, this.opts);
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
		return (this.opts.advertising ? this.videoAds.loadAdsLibrary() : Promise.resolve())
			.catch(() => {
				// If ad doesn't load for some reason, load video as normal
				this.opts.advertising = false;
			})
			.then(() => this.getData())
			.then(() => this.renderVideo());
	}

	addVideo() {
		this.videoEl = document.createElement('video');
		this.videoEl.controls = true;
		this.videoEl.className = Array.isArray(this.opts.classes) ? this.opts.classes.join(' ') : this.opts.classes;
		this.containerEl.classList.add('o-video--player');

		this.updateVideo();

		if (this.placeholderEl && !this.opts.advertising) {
			this.videoEl.autoplay = this.videoEl.autostart = true;
		}

		this.containerEl.appendChild(this.videoEl);

		addEvents(this, ['play', 'playing', 'pause', 'ended', 'progress']);
		this.videoEl.addEventListener('playing', this.pauseOtherVideos.bind(this));
		this.videoEl.addEventListener('suspend', this.clearCurrentlyPlaying.bind(this));
		this.videoEl.addEventListener('ended', this.clearCurrentlyPlaying.bind(this));

		if (this.opts.advertising) {
			this.videoAds.setUpAds();
		}
	}

	updateVideo() {
		this.videoEl.poster = this.posterImage;
		this.videoEl.src = this.rendition && this.rendition.url;
	}

	addPlaceholder() {
		this.placeholderEl = document.createElement('div');
		this.placeholderEl.className = 'o-video__placeholder';

		this.placeholderImageEl = document.createElement('img');
		this.placeholderImageEl.className = 'o-video__placeholder-image';
		this.placeholderImageEl.setAttribute('role', 'presentation');
		this.placeholderImageEl.setAttribute('alt', '');

		this.placeholderEl.appendChild(this.placeholderImageEl);

		// info panel
		if (this.opts.placeholderFeatures.length) {
			this.infoPanel = new VideoInfo(this);
		}

		// play button
		const playButtonEl = document.createElement('button');
		playButtonEl.className = 'o-video__play-button';

		const playButtonTextEl = document.createElement('span');
		playButtonTextEl.className = 'o-video__play-button-text';
		playButtonTextEl.textContent = 'Play video';
		playButtonEl.appendChild(playButtonTextEl);

		const playButtonIconEl = document.createElement('i');
		playButtonIconEl.className = 'o-video__play-button-icon';
		playButtonEl.appendChild(playButtonIconEl);

		this.placeholderEl.appendChild(playButtonEl);

		this.placeholderEl.addEventListener('click', () => {
			// Adds video soon so ads can start loading
			this.addVideo();
			this.videoEl.focus();
			this.videoEl.paused && this.videoEl.play();

			this.containerEl.removeChild(this.placeholderEl);
			this.infoPanel && this.infoPanel.teardown();

			this.placeholderEl = null;
			this.placeholderImageEl = null;
			this.placeholderBrandEl = null;
			this.placeholderDurationEl = null;
			this.placeholderTitleEl = null;
			this.placeholderDescriptionEl = null;
		});

		this.updatePlaceholder();

		this.containerEl.appendChild(this.placeholderEl);
	}

	updatePlaceholder() {
		this.placeholderImageEl.src = this.posterImage;
		this.infoPanel && this.infoPanel.update();
	}

	update(newOpts) {
		this.videoEl && this.videoEl.pause();
		this.clearCurrentlyPlaying();

		this.opts = Object.assign(this.opts, { data: null }, newOpts);

		if (!this.videoEl && !this.placeholderEl) {
			return this.init();
		}

		return this.getData().then(() => {
			if (this.placeholderEl) {
				this.updatePlaceholder();
			} else {
				this.updateVideo();
			}
		});
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

Video.Playlist = Playlist;

export default Video;
