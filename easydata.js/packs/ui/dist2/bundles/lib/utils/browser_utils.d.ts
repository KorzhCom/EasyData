export declare namespace browserUtils {
    function IsIE(): boolean;
    function IsEdge(): boolean;
    function IsFirefox(): boolean;
    function isMobileMode(): boolean;
    function setIsMobileMode(value: boolean | undefined): void;
    function onMobileModeChanged(callback: (newValue: boolean) => void): void;
    function getMobileCssClass(): string | null;
}
