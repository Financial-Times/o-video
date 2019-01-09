# FT Video [![Circle CI](https://circleci.com/gh/Financial-Times/o-video.svg?style=svg)](https://circleci.com/gh/Financial-Times/o-video) [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](#licence)

Creates a video player and attaches analytics. Also supports pre roll ads.

## Usage

Create an element of the format e.g.

```html
<div data-o-component="o-video o-video--large"></div>
```

In JS

```js
const OVideo = require('o-video');
const opts = {
	id: 4165329773001,
	optimumwidth: 710,
	placeholder: true,
	classes: ['video']
};
const video = new OVideo(document.body, opts);
```

### Config

Where `opts` is an optional object with properties

 * `id` [`String`] Source's ID of the video (`brightcoveId` or `uuid`)
 * `autorender` [`Boolean`] Whether to have the video render automatically. If *false* then you will need to call `init()` when ready
 * `optimumwidth` [`Number`] The optimum width of the video placeholder image
 * `optimumvideowidth` [`Number`] The optimum width of the video itself, used when there are multiple video renditions available to
 decide which to display (the smallest one that's at least as large as this width, if it exists)
 * `placeholder` [`Boolean`] Show just the poster image, load (and play) video on click
 * `placeholderHint` [`String`] An optional hint to display alongside the play icon (defaults to empty)
 * `placeholderInfo` [`Array`] A list of extra information to display on the placeholder (Available: title, description, brand)
 * `playsinline` [`Boolean`] Whether to play the [video inline](https://webkit.org/blog/6784/new-video-policies-for-ios/) on iOS smallscreen (defaults to fullscreen)
 * `classes` [`Array`] Classes to add to the video (and placeholder) element
 * `advertising` [`Boolean`] whether or not to show ads on the video
 * `showCaptions` [`Boolean`] whether or not to add captions to the video. Defaults to *true*.
 * `data` [`Object`] JSON object representing a [response from next-media-api](https://next-media-api.ft.com/v1/eebe9cb5-8d4c-3bd7-8dd9-50e869e2f526). If used, the component will not make a call to the API and use this data instead.

The config options can also be set as data attribute to instantiate the module declaratively:

```html
<div data-o-component="o-video o-video--large"
	data-o-video-id="4165329773001"
	data-o-video-optimumwidth="710">
</div>
```

### With a playlist

Playlists may take a queue of videos and play them one after another.

```js
const Video = require('o-video');

const queue = [
	'4165329773001',
	'4907997821001',
	'4165329773001'
];

const player = new Video(document.body, { autorender: false });
const playlist = new Video.Playlist({ player, queue });

document.querySelector('.next-btn').onclick = () => playlist.next();
document.querySelector('.prev-btn').onclick = () => playlist.prev();
```

The queue is an `array` containing Brightcove video ID strings.

## Testing
```
$ npm test
```
Requires Firefox (v38.0.0 to test with polyfills and mirror CircleCI)


## Migration

State | Major Version | Last Minor Release | Migration guide |
:---: | :---: | :---: | :---:
✨ active | 5 | N/A | [migrate to v5](MIGRATION.md#migrating-from-v4-to-v5) |
⚠ maintained| 4 | 4.1 | [migrate to v4](MIGRATION.md#migrating-from-v3-to-v4) |
╳ deprecated | 3 | 3.1 | [migrate to v3](MIGRATION.md#migrating-from-v2-to-v3) |
╳ deprecated | 2 | 2.5 | [migrate to v2](MIGRATION.md#migrating-from-v1-to-v2) |
╳ deprecated | 1 | 1.4 | N/A |

### Configuration

The `placeholdertitle` property no longer exists, it has been replaced by `placeholder-info` which accepts an array containing one or more of `'title'`, `'description'`, `'brand'`.

```diff
<div class="video-container">
	<div class="o-video" data-o-component="o-video"
		data-o-video-source="Brightcove"
		data-o-component="o-video"
		data-o-video-id="4165329773001"
		data-o-video-advertising="true"
		data-o-video-placeholder="true"
- 		data-o-video-placeholdertitle="true"
+ 		data-o-video-placeholder-info="['title']"
	></div>
</div>
```

The `optimumwidth` property is no longer used for the video width, it is now only used for the poster image width. To choose an optimum video width you can use the new property `optimumvideowidth`.


```diff
<div class="video-container">
	<div class="o-video" data-o-component="o-video"
		data-o-video-source="Brightcove"
		data-o-component="o-video"
		data-o-video-id="4165329773001"
		data-o-video-advertising="true"
		data-o-video-placeholder="true"
		data-o-video-placeholder-info="['title']"
		data-o-video-optimumwidth="400"
+ 		data-o-video-optimumvideowidth="400"
	></div>
</div>
```

### Sass

The silent flag `_o-video_applied` variable has been renamed to `o-video-is-silent` and has had it's default value changed from `false` to `true`. If you want to include the component with the styles please look at the code diff below.

```diff
+ $o-video-is-silent: false;
@import 'o-video/main';
```
