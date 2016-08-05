const formats = {
	mpeg4: [
		'video/mp4; codecs="mp4v.20.8"'
	],
	h264: [
		'video/mp4; codecs="avc1.42E01E"',
		'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
	],
	ogg: [
		'video/ogg; codecs="theora"'
	],
	webm: [
		'video/webm; codecs="vp8, vorbis"'
	]
};

export default formats;
