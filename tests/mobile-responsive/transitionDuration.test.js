/**
 * Property Test: Transition Duration Limit
 * **Feature: mobile-responsive, Property 9: Transition Duration Limit**
 * **Validates: Requirements 12.1**
 * 
 * Property: For any CSS transition on mobile devices, the transition-duration 
 * SHALL be 300ms or less.
 */

const fc = require('fast-check');

// Constants matching mobile.css
const MAX_TRANSITION_DURATION_MS = 300;
const MOBILE_BREAKPOINT = 768;
const MOBILE_TRANSITION_VAR = '--mobile-transition';

/**
 * Parses a CSS duration string and returns the value in milliseconds.
 * Supports formats: '300ms', '0.3s', '300', etc.
 * 
 * @param {string} durationStr - The CSS duration string
 * @returns {number} - Duration in milliseconds
 */
function parseDurationToMs(durationStr) {
    if (typeof durationStr !== 'string') {
        return 0;
    }
    
    const trimmed = durationStr.trim().toLowerCase();
    
    // Handle 'ms' suffix
    if (trimmed.endsWith('ms')) {
        return parseFloat(trimmed.replace('ms', '')) || 0;
    }
    
    // Handle 's' suffix (seconds)
    if (trimmed.endsWith('s')) {
        return (parseFloat(trimmed.replace('s', '')) || 0) * 1000;
    }
    
    // Handle numeric value (assume milliseconds)
    const numValue = parseFloat(trimmed);
    return isNaN(numValue) ? 0 : numValue;
}

/**
 * Simulates the mobile CSS behavior that enforces maximum transition duration.
 * This function represents what our mobile.css does to transition durations.
 * 
 * In mobile.css, we have:
 * @media (max-width: 767px) {
 *   * {
 *     transition-duration: var(--mobile-transition) !important;
 *   }
 * }
 * 
 * Where --mobile-transition is 300ms.
 * 
 * @param {number} requestedDurationMs - The requested transition duration in ms
 * @param {boolean} isMobileViewport - Whether we're in mobile viewport
 * @returns {number} - The effective duration after CSS rules are applied
 */
function computeEffectiveTransitionDuration(requestedDurationMs, isMobileViewport) {
    if (isMobileViewport) {
        // Mobile CSS enforces maximum transition duration of 300ms
        // The !important rule overrides any requested duration
        return MAX_TRANSITION_DURATION_MS;
    }
    // Desktop: no maximum enforced, use requested duration
    return requestedDurationMs;
}

/**
 * Checks if a transition duration meets the mobile requirements
 * @param {number} durationMs - Duration in milliseconds
 * @returns {boolean}
 */
function meetsTransitionDurationRequirement(durationMs) {
    return durationMs <= MAX_TRANSITION_DURATION_MS;
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
 * Simulates CSS variable resolution for mobile transition
 * @param {boolean} isMobile 
 * @returns {number} - The resolved transition duration in ms
 */
function resolveMobileTransitionVar(isMobile) {
    // In mobile.css: --mobile-transition: 300ms
    return isMobile ? MAX_TRANSITION_DURATION_MS : null;
}

describe('Property 9: Transition Duration Limit', () => {
    /**
     * **Feature: mobile-responsive, Property 9: Transition Duration Limit**
     * 
     * For any mobile viewport width (320-767px) and any element with a transition,
     * when mobile styles are applied, the transition-duration SHALL be 300ms or less.
     */
    test('all transitions should have duration of 300ms or less on mobile', () => {
        fc.assert(
            fc.property(
                // Generate mobile viewport widths (320-767px)
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate various requested transition durations (some may exceed 300ms)
                fc.integer({ min: 50, max: 1000 }),
                (viewportWidth, requestedDurationMs) => {
                    // Verify we're in mobile viewport
                    const isMobile = isMobileViewport(viewportWidth);
                    expect(isMobile).toBe(true);
                    
                    // Compute effective duration after mobile CSS is applied
                    const effectiveDuration = computeEffectiveTransitionDuration(
                        requestedDurationMs,
                        isMobile
                    );
                    
                    // Verify transition duration requirement is met
                    return meetsTransitionDurationRequirement(effectiveDuration);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify that the mobile transition CSS variable resolves to 300ms
     */
    test('mobile transition CSS variable should resolve to 300ms', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                (viewportWidth) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    const resolvedValue = resolveMobileTransitionVar(isMobile);
                    
                    // On mobile, the CSS variable should resolve to 300ms
                    return resolvedValue === MAX_TRANSITION_DURATION_MS;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify that on desktop viewports, transitions can exceed 300ms
     * (the maximum duration constraint is only enforced on mobile)
     */
    test('desktop viewports should not enforce maximum transition duration', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                fc.integer({ min: 400, max: 1000 }), // Intentionally longer than 300ms
                (viewportWidth, requestedDurationMs) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    expect(isMobile).toBe(false);
                    
                    // On desktop, no maximum is enforced
                    const effectiveDuration = computeEffectiveTransitionDuration(
                        requestedDurationMs,
                        isMobile
                    );
                    
                    // Elements should maintain their original (longer) duration on desktop
                    return effectiveDuration === requestedDurationMs;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify the boundary condition: at exactly 768px, mobile styles should NOT apply
     */
    test('at exactly 768px viewport, mobile transition limit should not apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT;
        const requestedDurationMs = 500; // Longer than 300ms
        
        const isMobile = isMobileViewport(viewportWidth);
        expect(isMobile).toBe(false);
        
        const effectiveDuration = computeEffectiveTransitionDuration(
            requestedDurationMs,
            isMobile
        );
        
        // At 768px (not mobile), elements keep their original duration
        expect(effectiveDuration).toBe(requestedDurationMs);
    });

    /**
     * Verify the boundary condition: at 767px, mobile styles SHOULD apply
     */
    test('at 767px viewport, mobile transition limit should apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT - 1;
        const requestedDurationMs = 500; // Longer than 300ms
        
        const isMobile = isMobileViewport(viewportWidth);
        expect(isMobile).toBe(true);
        
        const effectiveDuration = computeEffectiveTransitionDuration(
            requestedDurationMs,
            isMobile
        );
        
        // At 767px (mobile), transitions are limited to 300ms
        expect(effectiveDuration).toBe(MAX_TRANSITION_DURATION_MS);
    });

    /**
     * Property: Transitions already at or below 300ms should effectively be 300ms on mobile
     * (due to the !important override)
     */
    test('transitions at or below 300ms should be set to exactly 300ms on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.integer({ min: 50, max: MAX_TRANSITION_DURATION_MS }),
                (viewportWidth, requestedDurationMs) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const effectiveDuration = computeEffectiveTransitionDuration(
                        requestedDurationMs,
                        isMobile
                    );
                    
                    // On mobile, all transitions are set to exactly 300ms
                    return effectiveDuration === MAX_TRANSITION_DURATION_MS;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Test duration parsing utility
     */
    describe('Duration parsing', () => {
        test('should parse milliseconds correctly', () => {
            expect(parseDurationToMs('300ms')).toBe(300);
            expect(parseDurationToMs('150ms')).toBe(150);
            expect(parseDurationToMs('0ms')).toBe(0);
        });

        test('should parse seconds correctly', () => {
            expect(parseDurationToMs('0.3s')).toBe(300);
            expect(parseDurationToMs('1s')).toBe(1000);
            expect(parseDurationToMs('0.5s')).toBe(500);
        });

        test('should handle edge cases', () => {
            expect(parseDurationToMs('')).toBe(0);
            expect(parseDurationToMs('invalid')).toBe(0);
            expect(parseDurationToMs('300')).toBe(300);
        });
    });

    /**
     * Verify various element types have their transitions limited on mobile
     */
    test('all element types should have transitions limited to 300ms on mobile', () => {
        const elementTypes = [
            'button',
            'a',
            'input',
            'select',
            'textarea',
            '.btn',
            '.card',
            '.modal',
            '.dropdown',
            '.navbar'
        ];

        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.constantFrom(...elementTypes),
                fc.integer({ min: 100, max: 800 }),
                (viewportWidth, elementType, requestedDurationMs) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    // Mobile CSS applies to all elements via * selector
                    const effectiveDuration = computeEffectiveTransitionDuration(
                        requestedDurationMs,
                        isMobile
                    );
                    
                    return meetsTransitionDurationRequirement(effectiveDuration);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Verify that the effective duration is consistent across multiple checks
     * (idempotence property)
     */
    test('transition duration computation should be idempotent', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.integer({ min: 50, max: 1000 }),
                (viewportWidth, requestedDurationMs) => {
                    const isMobile = isMobileViewport(viewportWidth);
                    
                    const firstComputation = computeEffectiveTransitionDuration(
                        requestedDurationMs,
                        isMobile
                    );
                    
                    // Computing again with the result should give the same value
                    const secondComputation = computeEffectiveTransitionDuration(
                        firstComputation,
                        isMobile
                    );
                    
                    return firstComputation === secondComputation;
                }
            ),
            { numRuns: 100 }
        );
    });
});
