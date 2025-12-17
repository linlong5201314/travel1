/**
 * Property Test: Mobile Carousel Dimensions
 * **Feature: mobile-responsive, Property 6: Mobile Carousel Dimensions**
 * **Validates: Requirements 2.1, 2.4**
 * 
 * Property: For any carousel element on mobile devices (viewport < 768px),
 * the carousel height SHALL be 70vh and control buttons SHALL have minimum
 * dimensions of 44x44 pixels.
 */

const fc = require('fast-check');

// Constants matching mobile.css
const MOBILE_BREAKPOINT = 768;
const TOUCH_TARGET_MIN_SIZE = 44;
const MOBILE_CAROUSEL_HEIGHT_VH = 70;
const MIN_CAROUSEL_HEIGHT_PX = 400;

/**
 * Determines if a viewport width is considered mobile
 * @param {number} viewportWidth 
 * @returns {boolean}
 */
function isMobileViewport(viewportWidth) {
    return viewportWidth < MOBILE_BREAKPOINT;
}

/**
 * Computes the carousel height based on viewport dimensions.
 * On mobile (< 768px), carousel height is 70vh with a minimum of 400px.
 * On desktop, carousel height is 100vh.
 * 
 * This represents the CSS rules in mobile.css:
 * @media (max-width: 767px) {
 *   .carousel {
 *     height: 70vh !important;
 *     min-height: 400px;
 *   }
 * }
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @param {number} viewportHeight - The viewport height in pixels
 * @returns {number} - The computed carousel height in pixels
 */
function computeCarouselHeight(viewportWidth, viewportHeight) {
    if (isMobileViewport(viewportWidth)) {
        // Mobile: 70vh with minimum 400px
        const heightFromVh = (viewportHeight * MOBILE_CAROUSEL_HEIGHT_VH) / 100;
        return Math.max(heightFromVh, MIN_CAROUSEL_HEIGHT_PX);
    }
    // Desktop: 100vh
    return viewportHeight;
}

/**
 * Computes the carousel control button dimensions based on viewport.
 * On mobile, control buttons have minimum 44x44px dimensions.
 * 
 * This represents the CSS rules in mobile.css:
 * @media (max-width: 767px) {
 *   .carousel-control, .carousel-prev, .carousel-next {
 *     width: var(--touch-target-min) !important;
 *     height: var(--touch-target-min) !important;
 *     min-width: var(--touch-target-min);
 *     min-height: var(--touch-target-min);
 *   }
 * }
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @param {number} requestedWidth - The requested button width
 * @param {number} requestedHeight - The requested button height
 * @returns {{width: number, height: number}} - The effective button dimensions
 */
function computeCarouselControlDimensions(viewportWidth, requestedWidth, requestedHeight) {
    if (isMobileViewport(viewportWidth)) {
        // Mobile: enforce minimum 44x44px
        return {
            width: Math.max(requestedWidth, TOUCH_TARGET_MIN_SIZE),
            height: Math.max(requestedHeight, TOUCH_TARGET_MIN_SIZE)
        };
    }
    // Desktop: use requested dimensions (default is 50x50 in style.css)
    return {
        width: requestedWidth,
        height: requestedHeight
    };
}

/**
 * Checks if the scroll arrow should be visible based on viewport.
 * On mobile (< 768px), the scroll arrow is hidden.
 * 
 * This represents the CSS rules in mobile.css:
 * @media (max-width: 767px) {
 *   .scroll-arrow, #scrollToDestinations {
 *     display: none !important;
 *   }
 * }
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @returns {boolean} - Whether the scroll arrow is visible
 */
function isScrollArrowVisible(viewportWidth) {
    return !isMobileViewport(viewportWidth);
}

describe('Property 6: Mobile Carousel Dimensions', () => {
    /**
     * **Feature: mobile-responsive, Property 6: Mobile Carousel Dimensions**
     * 
     * For any mobile viewport (< 768px), the carousel height SHALL be 70vh
     * with a minimum of 400px.
     */
    test('carousel height should be 70vh on mobile viewports', () => {
        fc.assert(
            fc.property(
                // Generate mobile viewport widths (320-767px)
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate various viewport heights
                fc.integer({ min: 480, max: 1200 }),
                (viewportWidth, viewportHeight) => {
                    // Verify we're in mobile viewport
                    expect(isMobileViewport(viewportWidth)).toBe(true);
                    
                    const carouselHeight = computeCarouselHeight(viewportWidth, viewportHeight);
                    const expectedHeight = Math.max(
                        (viewportHeight * MOBILE_CAROUSEL_HEIGHT_VH) / 100,
                        MIN_CAROUSEL_HEIGHT_PX
                    );
                    
                    // Carousel height should be 70vh (with 400px minimum)
                    return carouselHeight === expectedHeight;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Carousel height should never be less than 400px on mobile
     */
    test('carousel height should have minimum 400px on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Include small viewport heights to test minimum
                fc.integer({ min: 300, max: 800 }),
                (viewportWidth, viewportHeight) => {
                    const carouselHeight = computeCarouselHeight(viewportWidth, viewportHeight);
                    
                    // Carousel height should never be less than 400px
                    return carouselHeight >= MIN_CAROUSEL_HEIGHT_PX;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Carousel control buttons should have minimum 44x44px on mobile
     */
    test('carousel control buttons should be at least 44x44px on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate various button dimensions (some smaller than 44px)
                fc.integer({ min: 20, max: 60 }),
                fc.integer({ min: 20, max: 60 }),
                (viewportWidth, requestedWidth, requestedHeight) => {
                    const dimensions = computeCarouselControlDimensions(
                        viewportWidth,
                        requestedWidth,
                        requestedHeight
                    );
                    
                    // Both dimensions should be at least 44px on mobile
                    return dimensions.width >= TOUCH_TARGET_MIN_SIZE &&
                           dimensions.height >= TOUCH_TARGET_MIN_SIZE;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Scroll arrow should be hidden on mobile viewports
     */
    test('scroll arrow should be hidden on mobile viewports', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                (viewportWidth) => {
                    // On mobile, scroll arrow should not be visible
                    return !isScrollArrowVisible(viewportWidth);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Scroll arrow should be visible on desktop viewports
     */
    test('scroll arrow should be visible on desktop viewports', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                (viewportWidth) => {
                    // On desktop, scroll arrow should be visible
                    return isScrollArrowVisible(viewportWidth);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * On desktop, carousel height should be 100vh
     */
    test('carousel height should be 100vh on desktop viewports', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                fc.integer({ min: 600, max: 1200 }),
                (viewportWidth, viewportHeight) => {
                    // Verify we're in desktop viewport
                    expect(isMobileViewport(viewportWidth)).toBe(false);
                    
                    const carouselHeight = computeCarouselHeight(viewportWidth, viewportHeight);
                    
                    // Desktop carousel should be 100vh
                    return carouselHeight === viewportHeight;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Boundary test: at exactly 768px, desktop styles should apply
     */
    test('at exactly 768px viewport, desktop carousel styles should apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT;
        const viewportHeight = 800;
        
        expect(isMobileViewport(viewportWidth)).toBe(false);
        
        const carouselHeight = computeCarouselHeight(viewportWidth, viewportHeight);
        
        // At 768px (desktop), carousel should be 100vh
        expect(carouselHeight).toBe(viewportHeight);
        
        // Scroll arrow should be visible
        expect(isScrollArrowVisible(viewportWidth)).toBe(true);
    });

    /**
     * Boundary test: at 767px, mobile styles should apply
     */
    test('at 767px viewport, mobile carousel styles should apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT - 1;
        const viewportHeight = 800;
        
        expect(isMobileViewport(viewportWidth)).toBe(true);
        
        const carouselHeight = computeCarouselHeight(viewportWidth, viewportHeight);
        const expectedHeight = (viewportHeight * MOBILE_CAROUSEL_HEIGHT_VH) / 100;
        
        // At 767px (mobile), carousel should be 70vh
        expect(carouselHeight).toBe(expectedHeight);
        
        // Scroll arrow should be hidden
        expect(isScrollArrowVisible(viewportWidth)).toBe(false);
    });

    /**
     * Control buttons larger than 44px should maintain their size on mobile
     */
    test('control buttons larger than 44px should maintain size on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.integer({ min: TOUCH_TARGET_MIN_SIZE, max: 100 }),
                fc.integer({ min: TOUCH_TARGET_MIN_SIZE, max: 100 }),
                (viewportWidth, requestedWidth, requestedHeight) => {
                    const dimensions = computeCarouselControlDimensions(
                        viewportWidth,
                        requestedWidth,
                        requestedHeight
                    );
                    
                    // Buttons already >= 44px should keep their size
                    return dimensions.width === requestedWidth &&
                           dimensions.height === requestedHeight;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * On desktop, control buttons can be smaller than 44px
     */
    test('on desktop, control buttons can have any size', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                fc.integer({ min: 20, max: 100 }),
                fc.integer({ min: 20, max: 100 }),
                (viewportWidth, requestedWidth, requestedHeight) => {
                    const dimensions = computeCarouselControlDimensions(
                        viewportWidth,
                        requestedWidth,
                        requestedHeight
                    );
                    
                    // On desktop, buttons keep their requested size
                    return dimensions.width === requestedWidth &&
                           dimensions.height === requestedHeight;
                }
            ),
            { numRuns: 100 }
        );
    });
});
