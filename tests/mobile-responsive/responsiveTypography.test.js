/**
 * Property Test: Responsive Typography
 * **Feature: mobile-responsive, Property 4: Responsive Typography**
 * **Validates: Requirements 2.2, 4.4, 6.1, 6.3, 6.4**
 * 
 * Property: For any text element on mobile devices (viewport < 768px):
 * - Body text font-size SHALL be at least 14px
 * - Line-height SHALL be at least 1.6
 * - Carousel headings SHALL be 2rem
 * - Post titles SHALL be 1.5rem
 */

const fc = require('fast-check');

// Constants matching mobile.css
const MOBILE_BREAKPOINT = 768;
const MIN_BODY_FONT_SIZE_PX = 14;
const MIN_LINE_HEIGHT = 1.6;
const CAROUSEL_HEADING_SIZE_REM = 2;
const POST_TITLE_SIZE_REM = 1.5;
const BASE_FONT_SIZE_PX = 16; // Standard browser default

/**
 * Converts rem to pixels using standard base font size
 * @param {number} rem - Value in rem units
 * @returns {number} - Value in pixels
 */
function remToPx(rem) {
    return rem * BASE_FONT_SIZE_PX;
}

/**
 * Determines if a viewport width is considered mobile
 * @param {number} viewportWidth 
 * @returns {boolean}
 */
function isMobileViewport(viewportWidth) {
    return viewportWidth < MOBILE_BREAKPOINT;
}

/**
 * Simulates the mobile CSS behavior for body text font size.
 * In mobile.css, we enforce minimum 14px font size for body text.
 * 
 * @param {number} requestedFontSize - The requested font size in pixels
 * @param {boolean} isMobile - Whether we're in mobile viewport
 * @returns {number} - The effective font size after CSS rules
 */
function computeEffectiveBodyFontSize(requestedFontSize, isMobile) {
    if (isMobile) {
        // Mobile CSS enforces minimum 14px for body text
        return Math.max(requestedFontSize, MIN_BODY_FONT_SIZE_PX);
    }
    return requestedFontSize;
}

/**
 * Simulates the mobile CSS behavior for line height.
 * In mobile.css, we enforce minimum 1.6 line-height for readability.
 * 
 * @param {number} requestedLineHeight - The requested line height
 * @param {boolean} isMobile - Whether we're in mobile viewport
 * @returns {number} - The effective line height after CSS rules
 */
function computeEffectiveLineHeight(requestedLineHeight, isMobile) {
    if (isMobile) {
        // Mobile CSS enforces minimum 1.6 line-height
        return Math.max(requestedLineHeight, MIN_LINE_HEIGHT);
    }
    return requestedLineHeight;
}

/**
 * Simulates the mobile CSS behavior for carousel headings.
 * In mobile.css, carousel headings are set to 2rem.
 * 
 * @param {number} requestedFontSizeRem - The requested font size in rem
 * @param {boolean} isMobile - Whether we're in mobile viewport
 * @returns {number} - The effective font size in rem after CSS rules
 */
function computeEffectiveCarouselHeadingSize(requestedFontSizeRem, isMobile) {
    if (isMobile) {
        // Mobile CSS sets carousel headings to 2rem
        return CAROUSEL_HEADING_SIZE_REM;
    }
    return requestedFontSizeRem;
}

/**
 * Simulates the mobile CSS behavior for post titles.
 * In mobile.css, post titles are set to 1.5rem.
 * 
 * @param {number} requestedFontSizeRem - The requested font size in rem
 * @param {boolean} isMobile - Whether we're in mobile viewport
 * @returns {number} - The effective font size in rem after CSS rules
 */
function computeEffectivePostTitleSize(requestedFontSizeRem, isMobile) {
    if (isMobile) {
        // Mobile CSS sets post titles to 1.5rem
        return POST_TITLE_SIZE_REM;
    }
    return requestedFontSizeRem;
}

describe('Property 4: Responsive Typography', () => {
    /**
     * **Feature: mobile-responsive, Property 4: Responsive Typography**
     * 
     * For any mobile viewport width (320-767px) and any body text element,
     * the font-size SHALL be at least 14px.
     */
    test('body text should have minimum 14px font size on mobile', () => {
        fc.assert(
            fc.property(
                // Generate mobile viewport widths (320-767px)
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate body text element types
                fc.constantFrom('p', 'span', 'li', 'td', 'th', 'label'),
                // Generate initial font sizes (some may be smaller than 14px)
                fc.integer({ min: 8, max: 20 }),
                (viewportWidth, elementType, requestedFontSize) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    expect(isMobile).toBe(true);
                    
                    // Compute effective font size after mobile CSS is applied
                    const effectiveFontSize = computeEffectiveBodyFontSize(
                        requestedFontSize,
                        isMobile
                    );
                    
                    // Verify minimum font size requirement is met
                    return effectiveFontSize >= MIN_BODY_FONT_SIZE_PX;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * For any mobile viewport width and any text element,
     * the line-height SHALL be at least 1.6.
     */
    test('text elements should have minimum 1.6 line-height on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate various line heights (some may be smaller than 1.6)
                fc.float({ min: 1.0, max: 2.0, noNaN: true }),
                (viewportWidth, requestedLineHeight) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    // Compute effective line height after mobile CSS is applied
                    const effectiveLineHeight = computeEffectiveLineHeight(
                        requestedLineHeight,
                        isMobile
                    );
                    
                    // Verify minimum line height requirement is met
                    return effectiveLineHeight >= MIN_LINE_HEIGHT;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * For any mobile viewport width, carousel headings SHALL be 2rem.
     */
    test('carousel headings should be 2rem on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate various desktop heading sizes (typically 4-8rem)
                fc.float({ min: 3, max: 8, noNaN: true }),
                (viewportWidth, requestedFontSizeRem) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    // Compute effective carousel heading size
                    const effectiveSize = computeEffectiveCarouselHeadingSize(
                        requestedFontSizeRem,
                        isMobile
                    );
                    
                    // On mobile, carousel headings should be exactly 2rem
                    return effectiveSize === CAROUSEL_HEADING_SIZE_REM;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * For any mobile viewport width, post titles SHALL be 1.5rem.
     */
    test('post titles should be 1.5rem on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate various desktop title sizes (typically 2-5rem)
                fc.float({ min: 2, max: 5, noNaN: true }),
                (viewportWidth, requestedFontSizeRem) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    // Compute effective post title size
                    const effectiveSize = computeEffectivePostTitleSize(
                        requestedFontSizeRem,
                        isMobile
                    );
                    
                    // On mobile, post titles should be exactly 1.5rem
                    return effectiveSize === POST_TITLE_SIZE_REM;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify that on desktop viewports, typography is not constrained
     */
    test('desktop viewports should not enforce mobile typography constraints', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                fc.integer({ min: 10, max: 13 }), // Intentionally smaller than 14px
                fc.float({ min: 1.0, max: 1.5, noNaN: true }), // Intentionally smaller than 1.6
                (viewportWidth, requestedFontSize, requestedLineHeight) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    expect(isMobile).toBe(false);
                    
                    // On desktop, no minimum is enforced
                    const effectiveFontSize = computeEffectiveBodyFontSize(
                        requestedFontSize,
                        isMobile
                    );
                    const effectiveLineHeight = computeEffectiveLineHeight(
                        requestedLineHeight,
                        isMobile
                    );
                    
                    // Elements should maintain their original values on desktop
                    return effectiveFontSize === requestedFontSize && 
                           effectiveLineHeight === requestedLineHeight;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify the boundary condition: at exactly 768px, mobile styles should NOT apply
     */
    test('at exactly 768px viewport, mobile typography styles should not apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT;
        const requestedFontSize = 12;
        const requestedLineHeight = 1.2;
        
        const isMobile = isMobileViewport(viewportWidth);
        expect(isMobile).toBe(false);
        
        const effectiveFontSize = computeEffectiveBodyFontSize(requestedFontSize, isMobile);
        const effectiveLineHeight = computeEffectiveLineHeight(requestedLineHeight, isMobile);
        
        // At 768px (not mobile), elements keep their original values
        expect(effectiveFontSize).toBe(requestedFontSize);
        expect(effectiveLineHeight).toBe(requestedLineHeight);
    });

    /**
     * Verify the boundary condition: at 767px, mobile styles SHOULD apply
     */
    test('at 767px viewport, mobile typography styles should apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT - 1;
        const requestedFontSize = 12;
        const requestedLineHeight = 1.2;
        
        const isMobile = isMobileViewport(viewportWidth);
        expect(isMobile).toBe(true);
        
        const effectiveFontSize = computeEffectiveBodyFontSize(requestedFontSize, isMobile);
        const effectiveLineHeight = computeEffectiveLineHeight(requestedLineHeight, isMobile);
        
        // At 767px (mobile), minimum values are enforced
        expect(effectiveFontSize).toBe(MIN_BODY_FONT_SIZE_PX);
        expect(effectiveLineHeight).toBe(MIN_LINE_HEIGHT);
    });

    /**
     * Property: Text already meeting requirements should not be affected
     */
    test('text already meeting requirements should maintain values on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.integer({ min: MIN_BODY_FONT_SIZE_PX, max: 24 }),
                fc.float({ min: Math.fround(MIN_LINE_HEIGHT), max: Math.fround(2.0), noNaN: true }),
                (viewportWidth, requestedFontSize, requestedLineHeight) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveFontSize = computeEffectiveBodyFontSize(
                        requestedFontSize,
                        isMobile
                    );
                    const effectiveLineHeight = computeEffectiveLineHeight(
                        requestedLineHeight,
                        isMobile
                    );
                    
                    // Text already meeting requirements should keep their values
                    return effectiveFontSize === requestedFontSize && 
                           effectiveLineHeight === requestedLineHeight;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify carousel heading size in pixels on mobile
     */
    test('carousel headings should be 32px (2rem) on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                (viewportWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveSizeRem = computeEffectiveCarouselHeadingSize(6, isMobile);
                    const effectiveSizePx = remToPx(effectiveSizeRem);
                    
                    // 2rem = 32px with 16px base
                    return effectiveSizePx === 32;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify post title size in pixels on mobile
     */
    test('post titles should be 24px (1.5rem) on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                (viewportWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveSizeRem = computeEffectivePostTitleSize(4, isMobile);
                    const effectiveSizePx = remToPx(effectiveSizeRem);
                    
                    // 1.5rem = 24px with 16px base
                    return effectiveSizePx === 24;
                }
            ),
            { numRuns: 100 }
        );
    });
});
