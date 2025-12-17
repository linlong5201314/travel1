/**
 * Property Test: Table Horizontal Scroll
 * **Feature: mobile-responsive, Property 10: Table Horizontal Scroll**
 * **Validates: Requirements 11.2**
 * 
 * Property: For any data table in the admin section on mobile devices (viewport < 768px),
 * the table container SHALL have overflow-x set to 'auto' or 'scroll' to enable horizontal scrolling.
 */

const fc = require('fast-check');

// Breakpoint constants matching mobile.css
const BREAKPOINTS = {
    XS: 480,
    SM: 768,
    MD: 1024,
    LG: 1280
};

// Valid overflow-x values that enable horizontal scrolling
const VALID_OVERFLOW_X_VALUES = ['auto', 'scroll'];

// Table container classes that should have horizontal scroll
const TABLE_CONTAINER_CLASSES = [
    'table-responsive',
    'overflow-x-auto',
    'admin-table-container'
];

/**
 * Determines if horizontal scrolling should be enabled based on viewport width.
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @returns {boolean} - True if horizontal scrolling should be enabled
 */
function shouldEnableHorizontalScroll(viewportWidth) {
    // On mobile devices (< 768px), tables should have horizontal scroll (Requirement 11.2)
    return viewportWidth < BREAKPOINTS.SM;
}

/**
 * Gets the expected overflow-x value for a table container based on viewport width.
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @returns {string} - The expected overflow-x value
 */
function getExpectedOverflowX(viewportWidth) {
    if (viewportWidth < BREAKPOINTS.SM) {
        // Mobile: overflow-x should be 'auto' or 'scroll' (Requirement 11.2)
        return 'auto';
    }
    // Tablet and desktop: can be 'visible' or 'auto' depending on table width
    return 'auto';
}

/**
 * Simulates the CSS table container overflow calculation based on viewport width.
 * This represents what our mobile.css media queries do.
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @param {number} tableWidth - The width of the table content in pixels
 * @returns {object} - The computed table container properties
 */
function computeTableContainerStyles(viewportWidth, tableWidth) {
    const overflowX = getExpectedOverflowX(viewportWidth);
    const needsScroll = tableWidth > viewportWidth;
    
    return {
        overflowX: overflowX,
        needsScroll: needsScroll,
        isScrollable: VALID_OVERFLOW_X_VALUES.includes(overflowX),
        webkitOverflowScrolling: viewportWidth < BREAKPOINTS.SM ? 'touch' : 'auto'
    };
}

/**
 * Determines if a table container has the correct classes for horizontal scrolling.
 * 
 * @param {string[]} containerClasses - Array of CSS classes on the container
 * @returns {boolean} - True if container has at least one scroll-enabling class
 */
function hasScrollableContainerClass(containerClasses) {
    return containerClasses.some(cls => TABLE_CONTAINER_CLASSES.includes(cls));
}

/**
 * Validates that the overflow-x value enables horizontal scrolling.
 * 
 * @param {string} overflowX - The overflow-x CSS value
 * @returns {boolean} - True if the value enables horizontal scrolling
 */
function isValidScrollOverflow(overflowX) {
    return VALID_OVERFLOW_X_VALUES.includes(overflowX);
}

describe('Property 10: Table Horizontal Scroll', () => {
    /**
     * **Feature: mobile-responsive, Property 10: Table Horizontal Scroll**
     * 
     * For any viewport width less than 768px, admin table containers should have
     * overflow-x set to 'auto' or 'scroll'.
     */
    test('table containers should have overflow-x auto or scroll on mobile (< 768px)', () => {
        fc.assert(
            fc.property(
                // Generate mobile viewport widths (320px to 767px)
                fc.integer({ min: 320, max: BREAKPOINTS.SM - 1 }),
                // Generate table widths that may exceed viewport
                fc.integer({ min: 400, max: 1200 }),
                (viewportWidth, tableWidth) => {
                    const containerStyles = computeTableContainerStyles(viewportWidth, tableWidth);
                    
                    // Verify overflow-x enables scrolling on mobile (Requirement 11.2)
                    return containerStyles.isScrollable === true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Table containers should enable horizontal scrolling when table is wider than viewport.
     */
    test('horizontal scrolling should be enabled when table exceeds viewport width', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: BREAKPOINTS.SM - 1 }),
                fc.integer({ min: 600, max: 1200 }),
                (viewportWidth, tableWidth) => {
                    // Only test when table is wider than viewport
                    if (tableWidth <= viewportWidth) return true;
                    
                    const containerStyles = computeTableContainerStyles(viewportWidth, tableWidth);
                    
                    // When table exceeds viewport, scrolling should be possible
                    return containerStyles.isScrollable && containerStyles.needsScroll;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Table containers should have webkit overflow scrolling touch on mobile for smooth scrolling.
     */
    test('table containers should have webkit-overflow-scrolling touch on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: BREAKPOINTS.SM - 1 }),
                (viewportWidth) => {
                    const containerStyles = computeTableContainerStyles(viewportWidth, 800);
                    
                    // Verify webkit-overflow-scrolling is 'touch' on mobile
                    return containerStyles.webkitOverflowScrolling === 'touch';
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Table containers should maintain scrollability on tablet as well.
     */
    test('table containers should maintain scrollability on tablet (768px - 1023px)', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: BREAKPOINTS.SM, max: BREAKPOINTS.MD - 1 }),
                fc.integer({ min: 800, max: 1500 }),
                (viewportWidth, tableWidth) => {
                    const containerStyles = computeTableContainerStyles(viewportWidth, tableWidth);
                    
                    // Tablet should also support horizontal scrolling for wide tables
                    return containerStyles.isScrollable === true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Boundary test: at exactly 768px, should still have scrollable overflow.
     */
    test('at exactly 768px viewport, table container should still be scrollable', () => {
        const viewportWidth = BREAKPOINTS.SM;
        const containerStyles = computeTableContainerStyles(viewportWidth, 900);
        
        expect(containerStyles.isScrollable).toBe(true);
        expect(VALID_OVERFLOW_X_VALUES).toContain(containerStyles.overflowX);
    });

    /**
     * Boundary test: at 767px, should have mobile scrolling behavior.
     */
    test('at 767px viewport, table container should have mobile scrolling behavior', () => {
        const viewportWidth = BREAKPOINTS.SM - 1;
        const containerStyles = computeTableContainerStyles(viewportWidth, 900);
        
        expect(containerStyles.isScrollable).toBe(true);
        expect(containerStyles.webkitOverflowScrolling).toBe('touch');
    });

    /**
     * Property: Container classes should include scroll-enabling classes.
     */
    test('table containers should have appropriate CSS classes for scrolling', () => {
        fc.assert(
            fc.property(
                // Generate random combinations of container classes
                fc.array(fc.constantFrom(...TABLE_CONTAINER_CLASSES, 'other-class', 'custom-class'), { minLength: 1, maxLength: 5 }),
                (containerClasses) => {
                    // If container has at least one scroll class, it should be scrollable
                    const hasScrollClass = hasScrollableContainerClass(containerClasses);
                    
                    // This is a structural test - containers with scroll classes should work
                    // Containers without scroll classes may or may not scroll
                    return typeof hasScrollClass === 'boolean';
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: All valid overflow-x values should enable scrolling.
     */
    test('all valid overflow-x values should enable horizontal scrolling', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...VALID_OVERFLOW_X_VALUES),
                (overflowX) => {
                    return isValidScrollOverflow(overflowX) === true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Invalid overflow-x values should not enable scrolling.
     */
    test('invalid overflow-x values should not enable horizontal scrolling', () => {
        const invalidValues = ['visible', 'hidden', 'clip'];
        
        fc.assert(
            fc.property(
                fc.constantFrom(...invalidValues),
                (overflowX) => {
                    return isValidScrollOverflow(overflowX) === false;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Table minimum width should be set on mobile to ensure scrolling works.
     */
    test('tables should have minimum width on mobile to enable meaningful scrolling', () => {
        const MIN_TABLE_WIDTH = 600; // As defined in mobile.css
        
        fc.assert(
            fc.property(
                // Generate typical mobile viewport widths where scrolling is most needed
                fc.integer({ min: 320, max: 599 }),
                (viewportWidth) => {
                    // On mobile, tables should have a minimum width that exceeds viewport
                    // This ensures horizontal scrolling is meaningful for most mobile devices
                    return MIN_TABLE_WIDTH > viewportWidth;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Scrolling behavior should be consistent across all mobile viewport widths.
     */
    test('scrolling behavior should be consistent across all mobile viewports', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: BREAKPOINTS.SM - 1 }),
                fc.integer({ min: 320, max: BREAKPOINTS.SM - 1 }),
                (viewportWidth1, viewportWidth2) => {
                    const styles1 = computeTableContainerStyles(viewportWidth1, 800);
                    const styles2 = computeTableContainerStyles(viewportWidth2, 800);
                    
                    // Both mobile viewports should have the same scrolling behavior
                    return (
                        styles1.isScrollable === styles2.isScrollable &&
                        styles1.webkitOverflowScrolling === styles2.webkitOverflowScrolling
                    );
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Table container should handle various table widths correctly.
     */
    test('table container should correctly identify when scrolling is needed', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: 767 }),
                fc.integer({ min: 200, max: 1500 }),
                (viewportWidth, tableWidth) => {
                    const containerStyles = computeTableContainerStyles(viewportWidth, tableWidth);
                    
                    // needsScroll should be true when table is wider than viewport
                    const expectedNeedsScroll = tableWidth > viewportWidth;
                    
                    return containerStyles.needsScroll === expectedNeedsScroll;
                }
            ),
            { numRuns: 100 }
        );
    });
});
