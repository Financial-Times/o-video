export default Playlist;
declare class Playlist {
    constructor(opts: any);
    opts: any;
    currentIndex: any;
    cache: {};
    next(): void;
    prev(): void;
    goto(index: any): any;
}
