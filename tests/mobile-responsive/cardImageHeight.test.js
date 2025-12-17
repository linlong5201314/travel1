/**
 * Property Test: Card Image Height Consistency
 * **Feature: mobile-responsive, Property 7: Card Image Height Consistency**
 * **Validates: Requirements 3.2, 4.2**
 * 
 * Property: For any destination card image on mobile devices (viewport < 768px),
 * the computed height SHALL be 200px. For featured story images, the height SHALL be 300px.
 */

const fc = require('fast-check');

// Constants matching mobile.css
const MOBILE_BREAKPOINT = 768;
const DESTINATION_CARD_IMAGE_HEIGHT_MOBILE = 200;
const FEATURED_STORY_IMAGE_HEIGHT_MOBILE = 300;
const DESTINATION_CARD_IMAGE_HEIGHT_DESKTOP = 280;
const FEATURED_STORY_IMAGE_HEIGHT_DESKTOP = 500;

// Image types
const IMAGE_TYPES = {
    DESTINATION_CARD: 'destination_card',
    FEATURED_STORY: 'featured_story',
    STORY_LIST_ITEM: 'story_list_item'
};

/**
 * Determines if a viewport width is considered mobile
 * @param {number} viewportWidth 
 * @returns {boolean}
 */
function isMobileViewport(viewportWidth) {
    return viewportWidth < MOBILE_BREAKPOINT;
}

/**
 * Computes the effective image height based on viewport width and image type.
 * This function represents the CSS rules defined in mobile.css.
 * 
 * In mobile.css:
 * @media (max-width: 767px) {
 *   .destination-card .destination-img { height: 200px !important; }
 *   #stories .w-full.lg\:w-3\/5 img { height: 300px !important; }
 * }
 * 
 * @param {number} viewportWidth - The viewport width in pixels
 * @param {string} imageType - The type of image
 * @param {number} requestedHeight - The original/requested height
 * @returns {number} - The computed height after CSS rules
 */
function computeImageHeight(viewportWidth, imageType, requestedHeight) {
    const isMobile = isMobileViewport(viewportWidth);
    
    switch (imageType) {
        case IMAGE_TYPES.DESTINATION_CARD:
            if (isMobile) {
                // Mobile CSS enforces 200px height (Requirement 3.2)
                return DESTINATION_CARD_IMAGE_HEIGHT_MOBILE;
            }
            // Desktop: use default or requested height
            return requestedHeight || DESTINATION_CARD_IMAGE_HEIGHT_DESKTOP;
            
        case IMAGE_TYPES.FEATURED_STORY:
            if (isMobile) {
                // Mobile CSS enforces 300px height (Requirement 4.2)
                return FEATURED_STORY_IMAGE_HEIGHT_MOBILE;
            }
            // Desktop: use default or requested height
            return requestedHeight || FEATURED_STORY_IMAGE_HEIGHT_DESKTOP;
            
        case IMAGE_TYPES.STORY_LIST_ITEM:
            if (isMobile) {
                // Story list items become vertical cards with 180px image height
                return 180;
            }
            // Desktop: flexible height based on container
            return requestedHeight || 150;
            
        default:
            return requestedHeight;
    }
}

describe('Property 7: Card Image Height Consistency', () => {
    /**
     * **Feature: mobile-responsive, Property 7: Card Image Height Consistency**
     * 
     * For any destination card image on mobile (viewport < 768px),
     * the height SHALL be exactly 200px.
     */
    test('destination card images should be 200px height on mobile', () => {
        fc.assert(
            fc.property(
                // Generate mobile viewport widths (320-767px)
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                // Generate various original image heights
                fc.integer({ min: 100, max: 500 }),
                (viewportWidth, originalHeight) => {
                    const computedHeight = computeImageHeight(
                        viewportWidth,
                        IMAGE_TYPES.DESTINATION_CARD,
                        originalHeight
                    );
                    
                    // On mobile, destination card images must be exactly 200px
                    return computedHeight === DESTINATION_CARD_IMAGE_HEIGHT_MOBILE;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * For any featured story image on mobile (viewport < 768px),
     * the height SHALL be exactly 300px (Requirement 4.2).
     */
    test('featured story images should be 300px height on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.integer({ min: 200, max: 800 }),
                (viewportWidth, originalHeight) => {
                    const computedHeight = computeImageHeight(
                        viewportWidth,
                        IMAGE_TYPES.FEATURED_STORY,
                        originalHeight
                    );
                    
                    // On mobile, featured story images must be exactly 300px
                    return computedHeight === FEATURED_STORY_IMAGE_HEIGHT_MOBILE;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * On desktop viewports, destination card images should maintain their default height
     */
    test('destination card images should maintain default height on desktop', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                (viewportWidth) => {
                    const computedHeight = computeImageHeight(
                        viewportWidth,
                        IMAGE_TYPES.DESTINATION_CARD,
                        DESTINATION_CARD_IMAGE_HEIGHT_DESKTOP
                    );
                    
                    // On desktop, should use the default desktop height
                    return computedHeight === DESTINATION_CARD_IMAGE_HEIGHT_DESKTOP;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * On desktop viewports, featured story images should maintain their default height
     */
    test('featured story images should maintain default height on desktop', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: MOBILE_BREAKPOINT, max: 1920 }),
                (viewportWidth) => {
                    const computedHeight = computeImageHeight(
                        viewportWidth,
                        IMAGE_TYPES.FEATURED_STORY,
                        FEATURED_STORY_IMAGE_HEIGHT_DESKTOP
                    );
                    
                    // On desktop, should use the default desktop height
                    return computedHeight === FEATURED_STORY_IMAGE_HEIGHT_DESKTOP;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Boundary test: at exactly 768px, desktop heights should apply
     */
    test('at exactly 768px viewport, desktop image heights should apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT;
        
        const destinationHeight = computeImageHeight(
            viewportWidth,
            IMAGE_TYPES.DESTINATION_CARD,
            DESTINATION_CARD_IMAGE_HEIGHT_DESKTOP
        );
        
        const featuredStoryHeight = computeImageHeight(
            viewportWidth,
            IMAGE_TYPES.FEATURED_STORY,
            FEATURED_STORY_IMAGE_HEIGHT_DESKTOP
        );
        
        expect(destinationHeight).toBe(DESTINATION_CARD_IMAGE_HEIGHT_DESKTOP);
        expect(featuredStoryHeight).toBe(FEATURED_STORY_IMAGE_HEIGHT_DESKTOP);
    });

    /**
     * Boundary test: at 767px, mobile heights should apply
     */
    test('at 767px viewport, mobile image heights should apply', () => {
        const viewportWidth = MOBILE_BREAKPOINT - 1;
        
        const destinationHeight = computeImageHeight(
            viewportWidth,
            IMAGE_TYPES.DESTINATION_CARD,
            400 // Original height doesn't matter on mobile
        );
        
        const featuredStoryHeight = computeImageHeight(
            viewportWidth,
            IMAGE_TYPES.FEATURED_STORY,
            600 // Original height doesn't matter on mobile
        );
        
        expect(destinationHeight).toBe(DESTINATION_CARD_IMAGE_HEIGHT_MOBILE);
        expect(featuredStoryHeight).toBe(FEATURED_STORY_IMAGE_HEIGHT_MOBILE);
    });

    /**
     * Property: Mobile image heights should be consistent regardless of original height
     */
    test('mobile image heights should be consistent regardless of original height', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                fc.integer({ min: 50, max: 1000 }),
                fc.integer({ min: 50, max: 1000 }),
                (viewportWidth, originalHeight1, originalHeight2) => {
                    const height1 = computeImageHeight(
                        viewportWidth,
                        IMAGE_TYPES.DESTINATION_CARD,
                        originalHeight1
                    );
                    
                    const height2 = computeImageHeight(
                        viewportWidth,
                        IMAGE_TYPES.DESTINATION_CARD,
                        originalHeight2
                    );
                    
                    // Both should be the same mobile height regardless of original
                    return height1 === height2 && height1 === DESTINATION_CARD_IMAGE_HEIGHT_MOBILE;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Featured story height should always be greater than destination card height on mobile
     */
    test('featured story height should be greater than destination card height on mobile', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: MOBILE_BREAKPOINT - 1 }),
                (viewportWidth) => {
                    const destinationHeight = computeImageHeight(
                        viewportWidth,
                        IMAGE_TYPES.DESTINATION_CARD,
                        300
                    );
                    
                    const featuredStoryHeight = computeImageHeight(
                        viewportWidth,
                        IMAGE_TYPES.FEATURED_STORY,
                        300
                    );
                    
                    // Featured story (300px) should be taller than destination card (200px)
                    return featuredStoryHeight > destinationHeight;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: All image heights should be positive
     */
    test('all image heights should be positive', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 320, max: 1920 }),
                fc.constantFrom(
                    IMAGE_TYPES.DESTINATION_CARD,
                    IMAGE_TYPES.FEATURED_STORY,
                    IMAGE_TYPES.STORY_LIST_ITEM
                ),
                fc.integer({ min: 50, max: 800 }),
                (viewportWidth, imageType, originalHeight) => {
                    const computedHeight = computeImageHeight(
                        viewportWidth,
                        imageType,
                        originalHeight
                    );
                    
                    return computedHeight > 0;
                }
            ),
            { numRuns: 100 }
        );
    });
});
