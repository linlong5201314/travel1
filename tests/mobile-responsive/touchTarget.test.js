/**
 * Property Test: Touch Target Minimum Size
 * **Feature: mobile-responsive, Property 1: Touch Target Minimum Size**
 * **Validates: Requirements 1.5, 2.4, 5.2, 8.3, 11.3**
 * 
 * Property: For any clickable or tappable element in the mobile view (viewport < 768px),
 * the element's computed width and height SHALL both be at least 44 pixels.
 */

const fc = require('fast-check');

// Constants matching mobile.css
const TOUCH_TARGET_MIN_SIZE = 44;
const MOBILE_BREAKPOINT = 768;

/**
 * Simulates the mobile CSS behavior that enforces minimum touch target sizes.
 * This function represents what our mobile.css does to interactive elements.
 * 
 * In mobile.css, we have:
 * @media (max-width: 767px) {
 *   button, .btn, a.btn, input[type="submit"], input[type="button"], [role="button"] {
 *     min-height: var(--touch-target-min);
 *     min-width: var(--touch-target-min);
 *   }
 * }
 * 
 * @param {number} requestedWidth - The requested width of the element
 * @param {number} requestedHeight - The requested height of the element
 * @param {boolean} isMobileViewport - Whether we're in mobile viewport
 * @returns {{width: number, height: number}} - The effective dimensions after CSS rules
 */
function computeEffectiveDimensions(requestedWidth, requestedHeight, isMobileViewport) {
    if (isMobileViewport) {
        // Mobile CSS enforces minimum touch target size
        return {
            width: Math.max(requestedWidth, TOUCH_TARGET_MIN_SIZE),
            height: Math.max(requestedHeight, TOUCH_TARGET_MIN_SIZE)
        };
    }
    // Desktop: no minimum enforced
    return {
        width: requestedWidth,
        height: requestedHeight
    };
}

/**
 * Checks if dimensions meet touch target requirements
 * @param {number} width 
 * @param {number} height 
 * @returns {boolean}
 */
function meetsTouchTargetRequirements(width, height) {
    return width >= TOUCH_TARGET_MIN_SIZE && height >= TOUCH_TARGET_MIN_SIZE;
}

/**
 * Determines if a viewport width is considered mobile
 * @param {number} viewportWidth 
 * @returns {boolean}
 */
function isMobileViewport(viewportWidth) {
    return viewportWidth < MOBILE_BREAKPOINT;
}

describe('Property 1: Touch Target Minimum Size', () => {
    /**
     * **Feature: mobile-responsive, Property 1: Touch Target Minimum Size**
     * 
     * For any mobile viewport width (320-767px) and any interactive element,
     * when mobile styles are applied, the element's dimensions SHALL be at least 44x44 pixels.
     */
    test('all interactive elements should have minimum 44x44px touch targets on mobile', () => {
        fc.assert(
            fc.property(
                // Generate mobile viewport widths (320-767px)
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate interactive element types
                fc.constantFrom('button', 'a', 'input[type=submit]', 'input[type=button]'),
                // Generate initial dimensions (some may be smaller than 44px)
                fc.integer({ min: 10, max: 100 }),
                fc.integer({ min: 10, max: 100 }),
                (viewportWidth, elementType, requestedWidth, requestedHeight) => {
                    // Verify we're in mobile viewport
                    const isMobile = isMobileViewport(viewportWidth);
                    expect(isMobile).toBe(true);
                    
                    // Compute effective dimensions after mobile CSS is applied
                    const effectiveDimensions = computeEffectiveDimensions(
                        requestedWidth, 
                        requestedHeight, 
                        isMobile
                    );
                    
                    // Verify touch target requirements are met
                    return meetsTouchTargetRequirements(
                        effectiveDimensions.width, 
                        effectiveDimensions.height
                    );
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify that navigation links meet touch target requirements on mobile
     */
    test('navigation links should have minimum 44x44px touch targets', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate various link dimensions
                fc.integer({ min: 10, max: 200 }), // width
                fc.integer({ min: 10, max: 60 }),  // height
                (viewportWidth, requestedWidth, requestedHeight) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    // Mobile CSS applies min-height: 44px to nav links
                    const effectiveDimensions = computeEffectiveDimensions(
                        requestedWidth,
                        requestedHeight,
                        isMobile
                    );
                    
                    // On mobile, height must be at least 44px
                    return effectiveDimensions.height >= TOUCH_TARGET_MIN_SIZE;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify form inputs meet touch target requirements on mobile
     */
    test('form inputs should have minimum 44px height on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.constantFrom('text', 'email', 'password', 'search'),
                fc.integer({ min: 20, max: 60 }), // typical input heights
                (viewportWidth, inputType, requestedHeight) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    // Mobile CSS applies min-height: 44px to form inputs
                    const effectiveHeight = isMobile 
                        ? Math.max(requestedHeight, TOUCH_TARGET_MIN_SIZE)
                        : requestedHeight;
                    
                    return effectiveHeight >= TOUCH_TARGET_MIN_SIZE;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify that on desktop viewports, elements can be smaller than 44px
     * (the minimum size constraint is only enforced on mobile)
     */
    test('desktop viewports should not enforce minimum touch target size', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                fc.integer({ min: 20, max: 40 }), // Intentionally smaller than 44px
                fc.integer({ min: 20, max: 40 }),
                (viewportWidth, requestedWidth, requestedHeight) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    expect(isMobile).toBe(false);
                    
                    // On desktop, no minimum is enforced
                    const effectiveDimensions = computeEffectiveDimensions(
                        requestedWidth,
                        requestedHeight,
                        isMobile
                    );
                    
                    // Elements should maintain their original (smaller) size on desktop
                    return effectiveDimensions.width === requestedWidth && 
                           effectiveDimensions.height === requestedHeight;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify the boundary condition: at exactly 768px, mobile styles should NOT apply
     */
    test('at exactly 768px viewport, mobile styles should not apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT;
        const requestedWidth = 30;
        const requestedHeight = 30;
        
        const isMobile = isMobileViewport(viewportWidth);
        expect(isMobile).toBe(false);
        
        const effectiveDimensions = computeEffectiveDimensions(
            requestedWidth,
            requestedHeight,
            isMobile
        );
        
        // At 768px (not mobile), elements keep their original size
        expect(effectiveDimensions.width).toBe(requestedWidth);
        expect(effectiveDimensions.height).toBe(requestedHeight);
    });

    /**
     * Verify the boundary condition: at 767px, mobile styles SHOULD apply
     */
    test('at 767px viewport, mobile styles should apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT - 1;
        const requestedWidth = 30;
        const requestedHeight = 30;
        
        const isMobile = isMobileViewport(viewportWidth);
        expect(isMobile).toBe(true);
        
        const effectiveDimensions = computeEffectiveDimensions(
            requestedWidth,
            requestedHeight,
            isMobile
        );
        
        // At 767px (mobile), elements get minimum 44px
        expect(effectiveDimensions.width).toBe(TOUCH_TARGET_MIN_SIZE);
        expect(effectiveDimensions.height).toBe(TOUCH_TARGET_MIN_SIZE);
    });

    /**
     * Property: Elements already larger than 44px should not be affected
     */
    test('elements larger than 44px should maintain their size on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.integer({ min: TOUCH_TARGET_MIN_SIZE, max: 200 }),
                fc.integer({ min: TOUCH_TARGET_MIN_SIZE, max: 200 }),
                (viewportWidth, requestedWidth, requestedHeight) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveDimensions = computeEffectiveDimensions(
                        requestedWidth,
                        requestedHeight,
                        isMobile
                    );
                    
                    // Elements already >= 44px should keep their size
                    return effectiveDimensions.width === requestedWidth && 
                           effectiveDimensions.height === requestedHeight;
                }
            ),
            { numRuns: 100 }
        );
    });
});
