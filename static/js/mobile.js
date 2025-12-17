/**
 * 环球旅记 - 移动端交互工具
 * Mobile interaction utilities for Global Travel Blog
 */

(function() {
    'use strict';

    // ============================================
    // Configuration
    // ============================================
    const config = {
        breakpoints: {
            xs: 480,
            sm: 768,
            md: 1024,
            lg: 1280
        },
        touchTargetSize: 44,
        transitionDuration: 300,
        scrollThreshold: 50
    };

    // ============================================
    // Viewport Detection Utilities
    // ============================================
    const viewport = {
        /**
         * Get current viewport width
         * @returns {number} Current viewport width in pixels
         */
        getWidth: function() {
            return window.innerWidth || document.documentElement.clientWidth;
        },

        /**
         * Get current viewport height
         * @returns {number} Current viewport height in pixels
         */
        getHeight: function() {
            return window.innerHeight || document.documentElement.clientHeight;
        },

        /**
         * Check if current viewport is mobile (< 768px)
         * @returns {boolean}
         */
        isMobile: function() {
            return this.getWidth() < config.breakpoints.sm;
        },

        /**
         * Check if current viewport is tablet (768px - 1023px)
         * @returns {boolean}
         */
        isTablet: function() {
            const width = this.getWidth();
            return width >= config.breakpoints.sm && width < config.breakpoints.md;
        },

        /**
         * Check if current viewport is desktop (>= 1024px)
         * @returns {boolean}
         */
        isDesktop: function() {
            return this.getWidth() >= config.breakpoints.md;
        },

        /**
         * Get current breakpoint name
         * @returns {string} 'xs', 'sm', 'md', 'lg', or 'xl'
         */
        getBreakpoint: function() {
            const width = this.getWidth();
            if (width < config.breakpoints.xs) return 'xs';
            if (width < config.breakpoints.sm) return 'sm';
            if (width < config.breakpoints.md) return 'md';
            if (width < config.breakpoints.lg) return 'lg';
            return 'xl';
        }
    };

    // ============================================
    // Mobile Menu Functions
    // ============================================
    const mobileMenu = {
        menuElement: null,
        menuPanel: null,
        menuOverlay: null,
        menuBtn: null,
        closeBtn: null,
        isOpen: false,
        scrollPosition: 0,

        /**
         * Initialize mobile menu
         */
        init: function() {
            this.menuElement = document.getElementById('mobile-menu');
            this.menuBtn = document.getElementById('mobile-menu-btn');
            this.closeBtn = document.getElementById('close-menu-btn');
            
            if (this.menuElement) {
                this.menuPanel = this.menuElement.querySelector('.mobile-menu-panel');
                this.menuOverlay = this.menuElement.querySelector('.mobile-menu-overlay');
            }

            if (this.menuBtn) {
                this.menuBtn.addEventListener('click', this.open.bind(this));
            }

            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', this.close.bind(this));
            }

            // Close on overlay click
            if (this.menuOverlay) {
                this.menuOverlay.addEventListener('click', this.close.bind(this));
            }

            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            }.bind(this));

            // Handle resize - close menu if viewport becomes desktop
            window.addEventListener('resize', function() {
                if (viewport.isDesktop() && this.isOpen) {
                    this.close();
                }
            }.bind(this));
        },

        /**
         * Open mobile menu
         */
        open: function() {
            if (!this.menuElement || !this.menuPanel) return;

            // Save scroll position
            this.scrollPosition = window.pageYOffset;

            // Show menu container
            this.menuElement.classList.remove('hidden');
            
            // Update aria attributes
            if (this.menuBtn) {
                this.menuBtn.setAttribute('aria-expanded', 'true');
            }
            
            // Trigger animation after a small delay for CSS transition
            setTimeout(function() {
                this.menuPanel.classList.remove('translate-x-full');
                this.menuElement.classList.add('open');
            }.bind(this), 10);

            // Prevent body scroll
            this.preventBodyScroll(true);
            
            this.isOpen = true;

            // Focus close button for accessibility
            if (this.closeBtn) {
                setTimeout(function() {
                    this.closeBtn.focus();
                }.bind(this), config.transitionDuration);
            }
        },

        /**
         * Close mobile menu
         */
        close: function() {
            if (!this.menuElement || !this.menuPanel) return;

            // Animate out
            this.menuPanel.classList.add('translate-x-full');
            this.menuElement.classList.remove('open');
            
            // Update aria attributes
            if (this.menuBtn) {
                this.menuBtn.setAttribute('aria-expanded', 'false');
            }

            // Hide after animation
            setTimeout(function() {
                this.menuElement.classList.add('hidden');
            }.bind(this), config.transitionDuration);

            // Restore body scroll
            this.preventBodyScroll(false);
            
            this.isOpen = false;

            // Restore scroll position
            window.scrollTo(0, this.scrollPosition);
            
            // Return focus to menu button
            if (this.menuBtn) {
                this.menuBtn.focus();
            }
        },

        /**
         * Toggle mobile menu
         */
        toggle: function() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        /**
         * Prevent or restore body scrolling
         * @param {boolean} prevent - Whether to prevent scrolling
         */
        preventBodyScroll: function(prevent) {
            if (prevent) {
                document.body.classList.add('menu-open');
                document.body.style.top = -this.scrollPosition + 'px';
            } else {
                document.body.classList.remove('menu-open');
                document.body.style.top = '';
            }
        }
    };

    // ============================================
    // Touch Event Handlers
    // ============================================
    const touchHandler = {
        startX: 0,
        startY: 0,
        threshold: 50,

        /**
         * Initialize touch handlers
         */
        init: function() {
            // Swipe to close menu - need to wait for mobileMenu to be initialized
            const menuPanel = document.querySelector('#mobile-menu .mobile-menu-panel');
            if (menuPanel) {
                menuPanel.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
                menuPanel.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
            }
        },

        /**
         * Handle touch start
         * @param {TouchEvent} e
         */
        handleTouchStart: function(e) {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        },

        /**
         * Handle touch end - detect swipe right to close
         * @param {TouchEvent} e
         */
        handleTouchEnd: function(e) {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = endX - this.startX;
            const diffY = Math.abs(endY - this.startY);

            // Swipe right to close (horizontal swipe with minimal vertical movement)
            if (diffX > this.threshold && diffY < this.threshold) {
                mobileMenu.close();
            }
        }
    };

    // ============================================
    // Mobile Search Functions
    // ============================================
    const mobileSearch = {
        searchPanel: null,
        searchBtn: null,
        searchClose: null,
        searchInput: null,
        isOpen: false,

        /**
         * Initialize mobile search
         */
        init: function() {
            this.searchPanel = document.getElementById('mobile-search-panel');
            this.searchBtn = document.getElementById('mobile-search-btn');
            this.searchClose = document.getElementById('mobile-search-close');
            this.searchInput = document.getElementById('mobile-search-input');

            if (this.searchBtn) {
                this.searchBtn.addEventListener('click', this.open.bind(this));
            }

            if (this.searchClose) {
                this.searchClose.addEventListener('click', this.close.bind(this));
            }

            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            }.bind(this));

            // Close when clicking outside the search container
            if (this.searchPanel) {
                this.searchPanel.addEventListener('click', function(e) {
                    if (e.target === this.searchPanel) {
                        this.close();
                    }
                }.bind(this));
            }

            // Handle resize - close search if viewport becomes desktop
            window.addEventListener('resize', function() {
                if (viewport.isDesktop() && this.isOpen) {
                    this.close();
                }
            }.bind(this));
        },

        /**
         * Open mobile search panel
         */
        open: function() {
            if (!this.searchPanel) return;

            // Show search panel
            this.searchPanel.classList.remove('hidden');
            
            // Update aria attributes
            if (this.searchBtn) {
                this.searchBtn.setAttribute('aria-expanded', 'true');
            }
            
            // Trigger animation after a small delay for CSS transition
            setTimeout(function() {
                this.searchPanel.classList.add('open');
            }.bind(this), 10);

            this.isOpen = true;

            // Focus search input for accessibility
            if (this.searchInput) {
                setTimeout(function() {
                    this.searchInput.focus();
                }.bind(this), config.transitionDuration);
            }
        },

        /**
         * Close mobile search panel
         */
        close: function() {
            if (!this.searchPanel) return;

            // Animate out
            this.searchPanel.classList.remove('open');
            
            // Update aria attributes
            if (this.searchBtn) {
                this.searchBtn.setAttribute('aria-expanded', 'false');
            }

            // Hide after animation
            setTimeout(function() {
                this.searchPanel.classList.add('hidden');
            }.bind(this), config.transitionDuration);

            this.isOpen = false;
            
            // Return focus to search button
            if (this.searchBtn) {
                this.searchBtn.focus();
            }
        },

        /**
         * Toggle mobile search panel
         */
        toggle: function() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
    };

    // ============================================
    // Scroll-based Navbar Behavior
    // ============================================
    // Scroll-based Navbar Behavior
    // Requirement 12.3: Hide navbar on scroll down, show on scroll up
    // ============================================
    const navbarScroll = {
        navbar: null,
        lastScrollY: 0,
        ticking: false,
        isHidden: false,

        /**
         * Initialize navbar scroll behavior
         */
        init: function() {
            this.navbar = document.getElementById('navbar');
            if (!this.navbar) {
                // Try alternative selectors
                this.navbar = document.querySelector('nav.navbar') || 
                              document.querySelector('header nav') ||
                              document.querySelector('nav');
            }
            if (!this.navbar) return;

            // Add initial visible class
            this.navbar.classList.add('navbar-visible');
            
            window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
            
            // Handle resize - reset navbar on desktop
            window.addEventListener('resize', debounce(function() {
                if (viewport.isDesktop()) {
                    this.show();
                }
            }.bind(this), 100));
        },

        /**
         * Handle scroll event
         */
        onScroll: function() {
            if (!this.ticking) {
                window.requestAnimationFrame(this.update.bind(this));
                this.ticking = true;
            }
        },

        /**
         * Update navbar visibility based on scroll direction
         */
        update: function() {
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

            // Only apply on mobile
            if (viewport.isMobile()) {
                // Don't hide if menu is open
                if (mobileMenu.isOpen || mobileSearch.isOpen) {
                    this.show();
                } else if (currentScrollY > this.lastScrollY && currentScrollY > config.scrollThreshold) {
                    // Scrolling down - hide navbar
                    this.hide();
                } else if (currentScrollY < this.lastScrollY) {
                    // Scrolling up - show navbar
                    this.show();
                }
                
                // Always show at top of page
                if (currentScrollY <= 0) {
                    this.show();
                }
            } else {
                // Reset on desktop
                this.show();
            }

            this.lastScrollY = Math.max(0, currentScrollY);
            this.ticking = false;
        },

        /**
         * Hide the navbar
         */
        hide: function() {
            if (!this.navbar || this.isHidden) return;
            this.navbar.classList.add('navbar-hidden');
            this.navbar.classList.remove('navbar-visible');
            this.navbar.style.transform = 'translateY(-100%)';
            this.isHidden = true;
        },

        /**
         * Show the navbar
         */
        show: function() {
            if (!this.navbar || !this.isHidden) return;
            this.navbar.classList.remove('navbar-hidden');
            this.navbar.classList.add('navbar-visible');
            this.navbar.style.transform = 'translateY(0)';
            this.isHidden = false;
        }
    };

    // ============================================
    // Initialization
    // ============================================
    function init() {
        mobileMenu.init();
        mobileSearch.init();
        touchHandler.init();
        navbarScroll.init();

        // Add viewport class to body
        updateViewportClass();
        window.addEventListener('resize', debounce(updateViewportClass, 100));
    }

    /**
     * Update body class based on viewport
     */
    function updateViewportClass() {
        const body = document.body;
        body.classList.remove('viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg', 'viewport-xl');
        body.classList.add('viewport-' + viewport.getBreakpoint());
    }

    /**
     * Debounce utility function
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // ============================================
    // Public API
    // ============================================
    window.MobileUtils = {
        viewport: viewport,
        mobileMenu: mobileMenu,
        mobileSearch: mobileSearch,
        config: config,
        
        // Convenience methods
        isMobile: function() { return viewport.isMobile(); },
        isTablet: function() { return viewport.isTablet(); },
        isDesktop: function() { return viewport.isDesktop(); },
        toggleMenu: function() { mobileMenu.toggle(); },
        openMenu: function() { mobileMenu.open(); },
        closeMenu: function() { mobileMenu.close(); },
        toggleSearch: function() { mobileSearch.toggle(); },
        openSearch: function() { mobileSearch.open(); },
        closeSearch: function() { mobileSearch.close(); }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
