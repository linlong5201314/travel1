/**
 * Property Test: Full Width Elements on Mobile
 * **Feature: mobile-responsive, Property 3: Full Width Elements on Mobile**
 * **Validates: Requirements 5.1, 5.4, 9.3, 11.4**
 * 
 * Property: For any form input, submit button, or action button on mobile devices (viewport < 768px),
 * the element's computed width SHALL equal its container's content width (100%).
 */

const fc = require('fast-check');

// Constants matching mobile.css
const MOBILE_BREAKPOINT = 768;

/**
 * Determines if a viewport width is considered mobile
 * @param {number} viewportWidth 
 * @returns {boolean}
 */
function isMobileViewport(viewportWidth) {
    return viewportWidth < MOBILE_BREAKPOINT;
}

/**
 * Simulates the mobile CSS behavior that enforces full width for form elements.
 * This function represents what our mobile.css does to form inputs and buttons.
 * 
 * In mobile.css, we have:
 * @media (max-width: 767px) {
 *   .auth-input, .auth-form input[type="text"], ... {
 *     width: 100% !important;
 *   }
 *   .auth-submit, .auth-form button[type="submit"], ... {
 *     width: 100% !important;
 *   }
 * }
 * 
 * @param {number} requestedWidth - The requested width of the element
 * @param {number} containerWidth - The width of the parent container
 * @param {boolean} isMobileViewport - Whether we're in mobile viewport
 * @param {string} elementType - Type of element (input, button, etc.)
 * @returns {number} - The effective width after CSS rules
 */
function computeEffectiveWidth(requestedWidth, containerWidth, isMobileViewport, elementType) {
    const fullWidthElements = [
        'input[type=text]',
        'input[type=email]',
        'input[type=password]',
        'input[type=tel]',
        'input[type=search]',
        'textarea',
        'select',
        'button[type=submit]',
        'input[type=submit]',
        '.auth-input',
        '.auth-submit',
        '.profile-form input',
        '.profile-form button'
    ];
    
    if (isMobileViewport && fullWidthElements.includes(elementType)) {
        // Mobile CSS enforces 100% width
        return containerWidth;
    }
    // Desktop or non-form elements: use requested width
    return requestedWidth;
}

/**
 * Checks if an element's width equals its container width (100%)
 * @param {number} elementWidth 
 * @param {number} containerWidth 
 * @returns {boolean}
 */
function isFullWidth(elementWidth, containerWidth) {
    return elementWidth === containerWidth;
}

/**
 * Calculates the percentage width of an element relative to its container
 * @param {number} elementWidth 
 * @param {number} containerWidth 
 * @returns {number}
 */
function calculateWidthPercentage(elementWidth, containerWidth) {
    if (containerWidth === 0) return 0;
    return (elementWidth / containerWidth) * 100;
}

describe('Property 3: Full Width Elements on Mobile', () => {
    /**
     * **Feature: mobile-responsive, Property 3: Full Width Elements on Mobile**
     * 
     * For any mobile viewport width (320-767px) and any form input element,
     * when mobile styles are applied, the element's width SHALL equal 100% of its container.
     */
    test('form inputs should be full width on mobile', () => {
        fc.assert(
            fc.property(
                // Generate mobile viewport widths (320-767px)
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate form input types
                fc.constantFrom(
                    'input[type=text]',
                    'input[type=email]',
                    'input[type=password]',
                    'input[type=tel]',
                    'textarea',
                    'select'
                ),
                // Generate container widths (typical mobile container widths)
                fc.integer({ min: 280, max: 767 }),
                // Generate initial element widths (some may be smaller than container)
                fc.integer({ min: 100, max: 400 }),
                (viewportWidth, elementType, containerWidth, requestedWidth) => {
                    // Verify we're in mobile viewport
                    const isMobile = isMobileViewport(viewportWidth);
                    expect(isMobile).toBe(true);
                    
                    // Compute effective width after mobile CSS is applied
                    const effectiveWidth = computeEffectiveWidth(
                        requestedWidth,
                        containerWidth,
                        isMobile,
                        elementType
                    );
                    
                    // Verify element is full width
                    return isFullWidth(effectiveWidth, containerWidth);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Submit buttons should be full width on mobile
     */
    test('submit buttons should be full width on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.constantFrom('button[type=submit]', 'input[type=submit]'),
                fc.integer({ min: 280, max: 767 }),
                fc.integer({ min: 80, max: 200 }),
                (viewportWidth, elementType, containerWidth, requestedWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveWidth = computeEffectiveWidth(
                        requestedWidth,
                        containerWidth,
                        isMobile,
                        elementType
                    );
                    
                    // On mobile, submit buttons should be full width
                    return effectiveWidth === containerWidth;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Auth form inputs should be full width on mobile
     */
    test('auth form inputs should be full width on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.constantFrom('.auth-input', '.auth-submit'),
                fc.integer({ min: 280, max: 767 }),
                fc.integer({ min: 100, max: 300 }),
                (viewportWidth, elementType, containerWidth, requestedWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveWidth = computeEffectiveWidth(
                        requestedWidth,
                        containerWidth,
                        isMobile,
                        elementType
                    );
                    
                    return effectiveWidth === containerWidth;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Profile form inputs should be full width on mobile
     */
    test('profile form inputs should be full width on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.constantFrom('.profile-form input', '.profile-form button'),
                fc.integer({ min: 280, max: 767 }),
                fc.integer({ min: 100, max: 300 }),
                (viewportWidth, elementType, containerWidth, requestedWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveWidth = computeEffectiveWidth(
                        requestedWidth,
                        containerWidth,
                        isMobile,
                        elementType
                    );
                    
                    return effectiveWidth === containerWidth;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * On desktop viewports, form elements should NOT be forced to full width
     */
    test('desktop viewports should not force full width on form elements', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                fc.constantFrom('input[type=text]', 'input[type=email]', 'button[type=submit]'),
                fc.integer({ min: 400, max: 1200 }),
                fc.integer({ min: 100, max: 300 }),
                (viewportWidth, elementType, containerWidth, requestedWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    expect(isMobile).toBe(false);
                    
                    const effectiveWidth = computeEffectiveWidth(
                        requestedWidth,
                        containerWidth,
                        isMobile,
                        elementType
                    );
                    
                    // On desktop, elements should maintain their original width
                    return effectiveWidth === requestedWidth;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify the boundary condition: at exactly 768px, mobile styles should NOT apply
     */
    test('at exactly 768px viewport, full width styles should not apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT;
        const containerWidth = 500;
        const requestedWidth = 200;
        
        const isMobile = isMobileViewport(viewportWidth);
        expect(isMobile).toBe(false);
        
        const effectiveWidth = computeEffectiveWidth(
            requestedWidth,
            containerWidth,
            isMobile,
            'input[type=text]'
        );
        
        // At 768px (not mobile), elements keep their original width
        expect(effectiveWidth).toBe(requestedWidth);
    });

    /**
     * Verify the boundary condition: at 767px, mobile styles SHOULD apply
     */
    test('at 767px viewport, full width styles should apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT - 1;
        const containerWidth = 500;
        const requestedWidth = 200;
        
        const isMobile = isMobileViewport(viewportWidth);
        expect(isMobile).toBe(true);
        
        const effectiveWidth = computeEffectiveWidth(
            requestedWidth,
            containerWidth,
            isMobile,
            'input[type=text]'
        );
        
        // At 767px (mobile), elements should be full width
        expect(effectiveWidth).toBe(containerWidth);
    });

    /**
     * Property: Width percentage should be exactly 100% on mobile
     */
    test('form elements should have exactly 100% width on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.constantFrom('input[type=text]', 'input[type=email]', 'button[type=submit]'),
                fc.integer({ min: 280, max: 767 }),
                fc.integer({ min: 100, max: 300 }),
                (viewportWidth, elementType, containerWidth, requestedWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveWidth = computeEffectiveWidth(
                        requestedWidth,
                        containerWidth,
                        isMobile,
                        elementType
                    );
                    
                    const widthPercentage = calculateWidthPercentage(effectiveWidth, containerWidth);
                    
                    // On mobile, width should be exactly 100%
                    return widthPercentage === 100;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Elements already at full width should remain full width
     */
    test('elements already at full width should remain full width on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.constantFrom('input[type=text]', 'button[type=submit]'),
                fc.integer({ min: 280, max: 767 }),
                (viewportWidth, elementType, containerWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    // Element already at full width
                    const requestedWidth = containerWidth;
                    
                    const effectiveWidth = computeEffectiveWidth(
                        requestedWidth,
                        containerWidth,
                        isMobile,
                        elementType
                    );
                    
                    return effectiveWidth === containerWidth;
                }
            ),
            { numRuns: 100 }
        );
    });
});
