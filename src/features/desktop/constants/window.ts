export interface Size {
    width: number;
    height: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface Offset {
    x: number;
    y: number;
}

export const SNAP_THRESHOLD = 50;
export const TITLE_BAR_HEIGHT = 32;
export const DEFAULT_WINDOW_SIZE: Size = { width: 600, height: 400 };
export const WINDOW_OFFSET = 30;