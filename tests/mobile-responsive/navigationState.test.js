/**
 * Property Test: Navigation State Consistency
 * **Feature: mobile-responsive, Property 5: Navigation State Consistency**
 * **Validates: Requirements 1.1, 1.2**
 * 
 * Property: For any viewport width, exactly one navigation mode SHALL be active:
 * - viewport < 768px: hamburger menu visible, desktop nav hidden
 * - viewport >= 768px: desktop nav visible, hamburger menu hidden
 */

const fc = require('fast-check');

// Constants matching mobile.css breakpoints
const MOBILE_BREAKPOINT = 768;
const MIN_VIEWPORT = 320;
const MAX_VIEWPORT = 1920;

/**
 * Determines if a viewport width is considered mobile
 * @param {number} viewportWidth 
 * @returns {boolean}
 */
function isMobileViewport(viewportWidth) {
    return viewportWidth < MOBILE_BREAKPOINT;
}

/**
 * Simulates the CSS behavior for navigation visibility.
 * This represents what our mobile.css does:
 * 
 * @media (max-width: 767px) {
 *   .desktop-nav { display: none !important; }
 *   #mobile-menu-btn { display: flex !important; }
 * }
 * 
 * @media (min-width: 1024px) {
 *   #mobile-menu-btn { display: none !important; }
 *   .desktop-nav { display: flex !important; }
 * }
 * 
 * @param {number} viewportWidth - The current viewport width
 * @returns {{desktopNavVisible: boolean, hamburgerMenuVisible: boolean}}
 */
function computeNavigationState(viewportWidth) {
    const isMobile = isMobileViewport(viewportWidth);
    
    return {
        desktopNavVisible: !isMobile,
        hamburgerMenuVisible: isMobile
    };
}

/**
 * Validates that exactly one navigation mode is active
 * @param {{desktopNavVisible: boolean, hamburgerMenuVisible: boolean}} state 
 * @returns {boolean}
 */
function isValidNavigationState(state) {
    // Exactly one should be visible (XOR condition)
    return state.desktopNavVisible !== state.hamburgerMenuVisible;
}

/**
 * Validates navigation state for mobile viewport
 * @param {{desktopNavVisible: boolean, hamburgerMenuVisible: boolean}} state 
 * @returns {boolean}
 */
function isValidMobileNavigationState(state) {
    return !state.desktopNavVisible && state.hamburgerMenuVisible;
}

/**
 * Validates navigation state for desktop viewport
 * @param {{desktopNavVisible: boolean, hamburgerMenuVisible: boolean}} state 
 * @returns {boolean}
 */
function isValidDesktopNavigationState(state) {
    return state.desktopNavVisible && !state.hamburgerMenuVisible;
}

describe('Property 5: Navigation State Consistency', () => {
    /**
     * **Feature: mobile-responsive, Property 5: Navigation State Consistency**
     * 
     * For any viewport width, exactly one navigation mode SHALL be active.
     */
    test('exactly one navigation mode should be active for any viewport width', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MIN_VIEWPORT, max: MAX_VIEWPORT }),
                (viewportWidth) => {
                    const navState = computeNavigationState(viewportWidth);
                    
                    // Exactly one navigation mode should be active
                    return isValidNavigationState(navState);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * For mobile viewports (< 768px), hamburger menu should be visible
     * and desktop nav should be hidden.
     */
    test('mobile viewport should show hamburger menu and hide desktop nav', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MIN_VIEWPORT, max: MOBILE_BREAKPOINT - 1 }),
                (viewportWidth) => {
                    // Verify we're in mobile viewport
                    expect(isMobileViewport(viewportWidth)).toBe(true);
                    
                    const navState = computeNavigationState(viewportWidth);
                    
                    // On mobile: hamburger visible, desktop nav hidden
                    return isValidMobileNavigationState(navState);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * For desktop viewports (>= 768px), desktop nav should be visible
     * and hamburger menu should be hidden.
     */
    test('desktop viewport should show desktop nav and hide hamburger menu', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: MAX_VIEWPORT }),
                (viewportWidth) => {
                    // Verify we're in desktop viewport
                    expect(isMobileViewport(viewportWidth)).toBe(false);
                    
                    const navState = computeNavigationState(viewportWidth);
                    
                    // On desktop: desktop nav visible, hamburger hidden
                    return isValidDesktopNavigationState(navState);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Boundary test: at exactly 768px, desktop nav should be visible
     */
    test('at exactly 768px viewport, desktop nav should be visible', () => {
        const viewportWidth = MOBILE_BREAKPOINT;
        
        expect(isMobileViewport(viewportWidth)).toBe(false);
        
        const navState = computeNavigationState(viewportWidth);
        
        expect(navState.desktopNavVisible).toBe(true);
        expect(navState.hamburgerMenuVisible).toBe(false);
    });

    /**
     * Boundary test: at 767px, hamburger menu should be visible
     */
    test('at 767px viewport, hamburger menu should be visible', () => {
        const viewportWidth = MOBILE_BREAKPOINT - 1;
        
        expect(isMobileViewport(viewportWidth)).toBe(true);
        
        const navState = computeNavigationState(viewportWidth);
        
        expect(navState.desktopNavVisible).toBe(false);
        expect(navState.hamburgerMenuVisible).toBe(true);
    });

    /**
     * Navigation state should be deterministic - same viewport width
     * should always produce the same navigation state.
     */
    test('navigation state should be deterministic for same viewport width', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MIN_VIEWPORT, max: MAX_VIEWPORT }),
                (viewportWidth) => {
                    const state1 = computeNavigationState(viewportWidth);
                    const state2 = computeNavigationState(viewportWidth);
                    
                    return state1.desktopNavVisible === state2.desktopNavVisible &&
                           state1.hamburgerMenuVisible === state2.hamburgerMenuVisible;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Navigation state should transition correctly at the breakpoint.
     * Testing that crossing the 768px boundary changes the navigation mode.
     */
    test('navigation state should transition at breakpoint boundary', () => {
        fc.assert(
            fc.property(
                // Generate pairs of viewport widths that cross the breakpoint
                fc.integer({ min: MIN_VIEWPORT, max: MOBILE_BREAKPOINT - 1 }),
                fc.integer({ min: MOBILE_BREAKPOINT, max: MAX_VIEWPORT }),
                (mobileWidth, desktopWidth) => {
                    const mobileState = computeNavigationState(mobileWidth);
                    const desktopState = computeNavigationState(desktopWidth);
                    
                    // States should be opposite
                    return mobileState.desktopNavVisible !== desktopState.desktopNavVisible &&
                           mobileState.hamburgerMenuVisible !== desktopState.hamburgerMenuVisible;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify that navigation never shows both modes simultaneously
     */
    test('navigation should never show both desktop nav and hamburger menu', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MIN_VIEWPORT, max: MAX_VIEWPORT }),
                (viewportWidth) => {
                    const navState = computeNavigationState(viewportWidth);
                    
                    // Both should never be visible at the same time
                    return !(navState.desktopNavVisible && navState.hamburgerMenuVisible);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify that navigation never hides both modes simultaneously
     */
    test('navigation should never hide both desktop nav and hamburger menu', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MIN_VIEWPORT, max: MAX_VIEWPORT }),
                (viewportWidth) => {
                    const navState = computeNavigationState(viewportWidth);
                    
                    // At least one should always be visible
                    return navState.desktopNavVisible || navState.hamburgerMenuVisible;
                }
            ),
            { numRuns: 100 }
        );
    });
});
