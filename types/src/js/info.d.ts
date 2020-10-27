export default VideoInfo;
declare class VideoInfo {
    constructor(video: any);
    video: any;
    opts: any;
    infoEl: HTMLDivElement;
    brandEl: HTMLSpanElement;
    titleEl: HTMLSpanElement;
    descriptionEl: HTMLParagraphElement;
    update(): void;
    teardown(): void;
}
