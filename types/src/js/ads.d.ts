export default VideoAds;
declare class VideoAds {
    static loadAdsLibrary(): any;
    constructor(video: any);
    video: any;
    adsLoaded: boolean;
    videoLoaded: boolean;
    loadingStateDisplayed: boolean;
    adsCompleted: boolean;
    getVideoBrand(): any;
    setUpAds(): void;
    adContainerEl: HTMLDivElement;
    adDisplayContainer: any;
    adsLoader: any;
    adsManagerLoadedHandler(adsManagerLoadedEvent: any): void;
    adErrorHandler(adError: any): void;
    adEventHandler(adEvent: any): void;
    contentPauseRequestHandler(): void;
    contentResumeRequestHandler(): void;
    getAdProgress(): number;
    playAdEventHandler(): void;
    overlayEl: HTMLDivElement;
    requestAds(): void;
    adsManager: any;
    startAds(): void;
    loadingStateEl: HTMLSpanElement;
    reportError(error: any): void;
    playUserVideo(): void;
}
