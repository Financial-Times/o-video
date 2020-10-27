export default Guidance;
declare class Guidance {
    removeBanner(): void;
    hideBanner(): void;
    createPlaceholder(): HTMLDivElement;
    createBanner(): HTMLDivElement;
    banner: HTMLDivElement;
    timeout: number;
}
