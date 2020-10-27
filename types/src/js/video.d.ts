export default Video;
declare class Video {
    static init(rootEl: any, config: any): Video[];
    constructor(el: any, opts: any);
    containerEl: any;
    amountWatched: number;
    fireWatchedEvent: any;
    visibilityListener: any;
    didUserPressPlay: boolean;
    opts: any;
    targeting: {
        site: string;
        position: string;
        sizes: string;
        videoId: any;
    };
    videoAds: VideoAds;
    guidance: Guidance;
    getData(): any;
    videoData: any;
    posterImage: string;
    rendition: any;
    renderVideo(): void;
    init(): any;
    addVideo(): void;
    liveRegionEl: HTMLDivElement;
    videoEl: HTMLVideoElement;
    addCaptions(): void;
    updateVideo(): void;
    addPlaceholder(): void;
    placeholderEl: HTMLDivElement;
    placeholderImageEl: HTMLImageElement;
    infoPanel: VideoInfo;
    playButtonEl: HTMLButtonElement;
    play(): void;
    updatePlaceholder(): void;
    update(newOpts: any): any;
    getProgress(): number;
    getDuration(): number;
    getTrackMode(): TextTrackMode;
    getAmountWatched(decimalPoints: any): number;
    getAmountWatchedPercentage(decimalPoints: any): number;
    pauseOtherVideos(): void;
    currentlyPlayingVideo: any;
    clearCurrentlyPlaying(): void;
    markPlayStart(): void;
    playStart: number;
    updateAmountWatched(): void;
    resetAmountWatched(): void;
    showGuidanceBanner(): void;
    destroy(): void;
}
declare namespace Video {
    export { Playlist };
}
import VideoAds from "./ads.js";
import Guidance from "./guidance.js";
import VideoInfo from "./info.js";
import Playlist from "./playlist.js";
