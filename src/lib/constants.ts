export const POINTS_PER_INCH = 72;
export const SLIDE_BREAK_COMMENT = '<!-- slide-break -->';
export const DEFAULT_FONT = 'Calibri';
export const DEFAULT_CODE_FONT = 'Courier New';

export const layout = {
    SLIDE_WIDTH: 10,
    SLIDE_HEIGHT: 5.625, // For a 16:9 aspect ratio slide
    CONTENT_X: 0.5,
    CONTENT_WIDTH: 9.0,
    TITLE_Y: 0.25,
    TITLE_H: 1.0,
    SUBTITLE_Y: 1.2,
    SUBTITLE_H: 0.4,
    BODY_START_Y: 1.5,
    SLIDE_MARGIN_BOTTOM: 0.675, // Vertical margin at the bottom of the slide in inches
    IMAGE_H: 2.5,
    IMAGE_W: 7.0,
    ELEMENT_PADDING: 0.2, // Vertical padding between elements in inches
    get BODY_END_Y() {
        return this.SLIDE_HEIGHT - this.SLIDE_MARGIN_BOTTOM;
    },
    get IMAGE_X() {
        return (this.SLIDE_WIDTH - this.IMAGE_W) / 2; // Center the image
    },
};
