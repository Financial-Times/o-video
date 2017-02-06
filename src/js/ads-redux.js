
// https://developers.google.com/interactive-media-ads/docs/sdks/html5/quickstart

var videoContent = document.getElementById('contentElement');

var adDisplayContainer =
    new google.ima.AdDisplayContainer(
        document.getElementById('adContainer'),
        videoContent);

adDisplayContainer.initialize();


var adsLoader = new google.ima.AdsLoader(adDisplayContainer);
