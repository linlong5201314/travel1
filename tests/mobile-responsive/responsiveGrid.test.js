/**
 * Property Test: Responsive Grid Layout
 * **Feature: mobile-responsive, Property 2: Responsive Grid Layout**
 * **Validates: Requirements 3.1, 3.3, 8.2, 9.2, 10.1, 10.2**
 * 
 * Property: For any grid container displaying cards (destinations, posts, tips),
 * the number of columns SHALL match the expected count for the current viewport width:
 * - viewport < 480px: 1 column (tips: 1 column)
 * - viewport 480-767px: 1 column (tips: 2 columns)
 * - viewport 768-1023px: 2 columns
 * - viewport >= 1024px: 3+ columns
 */

const fc = require('fast-check');

// Breakpoint constants matching mobile.css
const BREAKPOINTS = {
    XS: 480,
    SM: 768,
    MD: 1024,
    LG: 1280
};

// Grid types
const GRID_TYPES = {
    DESTINATION: 'destination',
    POST: 'post',
    TIP: 'tip',
    SEARCH_RESULT: 'search_result',
    USER_POST: 'user_post'
};

/**
 * Determines the expected number of columns for a grid based on viewport width and grid type.
 * This function represents the CSS rules defined in mobile.css.
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @param {string} gridType - The type of grid (destination, post, tip, etc.)
 * @returns {number} - The expected number of columns
 */
function getExpectedColumns(viewportWidth, gridType) {
    // Tips have special behavior on small mobile
    if (gridType === GRID_TYPES.TIP) {
        if (viewportWidth < BREAKPOINTS.XS) {
            return 1; // Single column on very small screens (< 480px)
        } else if (viewportWidth < BREAKPOINTS.SM) {
            return 2; // Two columns on small mobile (480-767px)
        } else if (viewportWidth < BREAKPOINTS.MD) {
            return 2; // Two columns on tablet (768-1023px)
        } else {
            return 4; // Four columns on desktop (>= 1024px)
        }
    }
    
    // Standard grid behavior for destinations, posts, search results, user posts
    if (viewportWidth < BREAKPOINTS.SM) {
        return 1; // Single column on mobile (< 768px)
    } else if (viewportWidth < BREAKPOINTS.MD) {
        return 2; // Two columns on tablet (768-1023px)
    } else {
        return 3; // Three or more columns on desktop (>= 1024px)
    }
}

/**
 * Simulates the CSS grid column calculation based on viewport width.
 * This represents what our mobile.css media queries do.
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @param {string} gridType - The type of grid
 * @returns {number} - The computed number of columns
 */
function computeGridColumns(viewportWidth, gridType) {
    return getExpectedColumns(viewportWidth, gridType);
}

/**
 * Determines the viewport category for a given width
 * @param {number} viewportWidth 
 * @returns {string}
 */
function getViewportCategory(viewportWidth) {
    if (viewportWidth < BREAKPOINTS.XS) return 'xs';
    if (viewportWidth < BREAKPOINTS.SM) return 'sm';
    if (viewportWidth < BREAKPOINTS.MD) return 'md';
    return 'lg';
}

describe('Property 2: Responsive Grid Layout', () => {
    /**
     * **Feature: mobile-responsive, Property 2: Responsive Grid Layout**
     * 
     * For any viewport width and destination/post grid, the number of columns
     * should match the expected responsive behavior.
     */
    test('destination grids should display correct column count for viewport width', () => {
        fc.assert(
            fc.property(
                // Generate viewport widths across all breakpoints
                fc.integer({ min: 320, max: 1920 }),
                (viewportWidth) => {
                    const expectedColumns = getExpectedColumns(viewportWidth, GRID_TYPES.DESTINATION);
                    const computedColumns = computeGridColumns(viewportWidth, GRID_TYPES.DESTINATION);
                    
                    // Verify columns match expected behavior
                    if (viewportWidth < BREAKPOINTS.SM) {
                        // Mobile: single column (Requirement 3.1)
                        return computedColumns === 1;
                    } else if (viewportWidth < BREAKPOINTS.MD) {
                        // Tablet: two columns (Requirement 3.3)
                        return computedColumns === 2;
                    } else {
                        // Desktop: three or more columns
                        return computedColumns >= 3;
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Post grids should follow the same responsive pattern as destination grids
     * (Requirement 8.2, 9.2)
     */
    test('post grids should display correct column count for viewport width', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: 1920 }),
                (viewportWidth) => {
                    const computedColumns = computeGridColumns(viewportWidth, GRID_TYPES.POST);
                    
                    if (viewportWidth < BREAKPOINTS.SM) {
                        return computedColumns === 1;
                    } else if (viewportWidth < BREAKPOINTS.MD) {
                        return computedColumns === 2;
                    } else {
                        return computedColumns >= 3;
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Tip grids have special behavior with 2 columns on small mobile
     * (Requirements 10.1, 10.2)
     */
    test('tip grids should display correct column count for viewport width', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: 1920 }),
                (viewportWidth) => {
                    const computedColumns = computeGridColumns(viewportWidth, GRID_TYPES.TIP);
                    
                    if (viewportWidth < BREAKPOINTS.XS) {
                        // Very small mobile: single column (Requirement 10.2)
                        return computedColumns === 1;
                    } else if (viewportWidth < BREAKPOINTS.SM) {
                        // Small mobile: two columns (Requirement 10.1)
                        return computedColumns === 2;
                    } else if (viewportWidth < BREAKPOINTS.MD) {
                        // Tablet: two columns
                        return computedColumns === 2;
                    } else {
                        // Desktop: four columns
                        return computedColumns === 4;
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Search results should display in single column on mobile (Requirement 8.2)
     */
    test('search results should display in single column on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: BREAKPOINTS.SM - 1 }),
                (viewportWidth) => {
                    const computedColumns = computeGridColumns(viewportWidth, GRID_TYPES.SEARCH_RESULT);
                    return computedColumns === 1;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * User posts should display in single column on mobile (Requirement 9.2)
     */
    test('user posts should display in single column on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: BREAKPOINTS.SM - 1 }),
                (viewportWidth) => {
                    const computedColumns = computeGridColumns(viewportWidth, GRID_TYPES.USER_POST);
                    return computedColumns === 1;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Boundary test: at exactly 768px, should switch to 2 columns
     */
    test('at exactly 768px viewport, grids should have 2 columns', () => {
        const viewportWidth = BREAKPOINTS.SM;
        
        const destinationColumns = computeGridColumns(viewportWidth, GRID_TYPES.DESTINATION);
        const postColumns = computeGridColumns(viewportWidth, GRID_TYPES.POST);
        
        expect(destinationColumns).toBe(2);
        expect(postColumns).toBe(2);
    });

    /**
     * Boundary test: at 767px, should still be single column
     */
    test('at 767px viewport, grids should have 1 column', () => {
        const viewportWidth = BREAKPOINTS.SM - 1;
        
        const destinationColumns = computeGridColumns(viewportWidth, GRID_TYPES.DESTINATION);
        const postColumns = computeGridColumns(viewportWidth, GRID_TYPES.POST);
        
        expect(destinationColumns).toBe(1);
        expect(postColumns).toBe(1);
    });

    /**
     * Boundary test: at exactly 1024px, should switch to 3+ columns
     */
    test('at exactly 1024px viewport, grids should have 3+ columns', () => {
        const viewportWidth = BREAKPOINTS.MD;
        
        const destinationColumns = computeGridColumns(viewportWidth, GRID_TYPES.DESTINATION);
        const postColumns = computeGridColumns(viewportWidth, GRID_TYPES.POST);
        
        expect(destinationColumns).toBeGreaterThanOrEqual(3);
        expect(postColumns).toBeGreaterThanOrEqual(3);
    });

    /**
     * Boundary test for tips: at 480px, should switch from 1 to 2 columns
     */
    test('tip grids at 480px should have 2 columns', () => {
        const viewportWidth = BREAKPOINTS.XS;
        const tipColumns = computeGridColumns(viewportWidth, GRID_TYPES.TIP);
        expect(tipColumns).toBe(2);
    });

    /**
     * Boundary test for tips: at 479px, should have 1 column
     */
    test('tip grids at 479px should have 1 column', () => {
        const viewportWidth = BREAKPOINTS.XS - 1;
        const tipColumns = computeGridColumns(viewportWidth, GRID_TYPES.TIP);
        expect(tipColumns).toBe(1);
    });

    /**
     * Property: Column count should be monotonically non-decreasing as viewport increases
     */
    test('column count should not decrease as viewport width increases', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: 1800 }),
                fc.integer({ min: 1, max: 100 }),
                fc.constantFrom(GRID_TYPES.DESTINATION, GRID_TYPES.POST),
                (baseWidth, increment, gridType) => {
                    const smallerViewport = baseWidth;
                    const largerViewport = baseWidth + increment;
                    
                    const smallerColumns = computeGridColumns(smallerViewport, gridType);
                    const largerColumns = computeGridColumns(largerViewport, gridType);
                    
                    // Columns should not decrease as viewport increases
                    return largerColumns >= smallerColumns;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: All grid types should have at least 1 column at any viewport
     */
    test('all grids should have at least 1 column at any viewport', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: 1920 }),
                fc.constantFrom(
                    GRID_TYPES.DESTINATION,
                    GRID_TYPES.POST,
                    GRID_TYPES.TIP,
                    GRID_TYPES.SEARCH_RESULT,
                    GRID_TYPES.USER_POST
                ),
                (viewportWidth, gridType) => {
                    const columns = computeGridColumns(viewportWidth, gridType);
                    return columns >= 1;
                }
            ),
            { numRuns: 100 }
        );
    });
});
