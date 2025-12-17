/**
 * 图片优化脚本 - Image Optimization Script
 * 功能：懒加载、错误处理、渐进式加载、性能优化
 */

(function() {
    'use strict';

    // 配置选项
    const config = {
        rootMargin: '200px 0px',
        threshold: 0.01,
        errorImage: '/static/img/default.jpg',
        maxRetries: 2,
        retryDelay: 1500
    };

    const imageLoadState = new Map();

    /**
     * 为所有图片添加原生懒加载
     */
    function enableNativeLazyLoading() {
        document.querySelectorAll('img:not([loading])').forEach(img => {
            // 首屏图片不懒加载
            const rect = img.getBoundingClientRect();
            if (rect.top > window.innerHeight) {
                img.loading = 'lazy';
                img.decoding = 'async';
            }
        });
    }

    /**
     * 全局图片错误处理
     */
    function addGlobalErrorHandling() {
        document.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG') {
                const img = e.target;
                const originalSrc = img.src;
                
                // 避免无限循环
                if (originalSrc.includes('default.jpg') || img.classList.contains('error-handled')) {
                    return;
                }
                
                const retryCount = imageLoadState.get(img) || 0;
                
                if (retryCount < config.maxRetries) {
                    // 重试加载
                    imageLoadState.set(img, retryCount + 1);
                    setTimeout(() => {
                        img.src = originalSrc + '?retry=' + (retryCount + 1);
                    }, config.retryDelay);
                } else {
                    // 使用占位图
                    img.classList.add('error-handled');
                    img.src = config.errorImage;
                    img.classList.add('lazy-error');
                }
            }
        }, true);
    }

    /**
     * 图片加载完成后添加淡入效果
     */
    function addLoadAnimation() {
        document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                img.classList.add('lazy-loaded');
            } else {
                img.addEventListener('load', function() {
                    this.classList.add('lazy-loaded');
                }, { once: true });
            }
        });
    }

    /**
     * 优化轮播图 - 延迟加载非首屏轮播
     */
    function optimizeCarousel() {
        const carousel = document.querySelector('.carousel');
        if (!carousel) return;

        const carouselItems = carousel.querySelectorAll('.carousel-item');
        
        carouselItems.forEach((item, index) => {
            if (index > 0) {
                // 延迟加载非首张轮播图背景
                const bgImage = item.style.backgroundImage;
                if (bgImage) {
                    const url = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                    if (url && url[1]) {
                        item.dataset.bg = url[1];
                        item.style.backgroundImage = 'none';
                        item.style.backgroundColor = '#e0e0e0';
                    }
                }
            }
        });

        // 预加载下一张轮播图
        let currentIndex = 0;
        const preloadNext = () => {
            const nextIndex = (currentIndex + 1) % carouselItems.length;
            const nextItem = carouselItems[nextIndex];
            
            if (nextItem && nextItem.dataset.bg) {
                const img = new Image();
                img.onload = () => {
                    nextItem.style.backgroundImage = `url('${nextItem.dataset.bg}')`;
                    nextItem.style.backgroundColor = '';
                    delete nextItem.dataset.bg;
                };
                img.src = nextItem.dataset.bg;
            }
        };

        // 首次加载后预加载第二张
        setTimeout(preloadNext, 1000);

        // 监听轮播切换
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    currentIndex = Array.from(carouselItems).indexOf(mutation.target);
                    preloadNext();
                }
            });
        });

        carouselItems.forEach(item => {
            observer.observe(item, { attributes: true, attributeFilter: ['class'] });
        });
    }

    /**
     * 使用 IntersectionObserver 实现高级懒加载
     */
    function initAdvancedLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    
                    // 处理背景图片
                    if (el.dataset.bg) {
                        el.style.backgroundImage = `url('${el.dataset.bg}')`;
                        el.style.backgroundColor = '';
                        delete el.dataset.bg;
                    }
                    
                    // 处理 data-src 图片
                    if (el.tagName === 'IMG' && el.dataset.src) {
                        el.src = el.dataset.src;
                        delete el.dataset.src;
                    }
                    
                    el.classList.add('lazy-loaded');
                    lazyObserver.unobserve(el);
                }
            });
        }, {
            rootMargin: config.rootMargin,
            threshold: config.threshold
        });

        // 观察所有带 data-bg 或 data-src 的元素
        document.querySelectorAll('[data-bg], img[data-src]').forEach(el => {
            el.classList.add('lazy-loading');
            lazyObserver.observe(el);
        });
    }

    /**
     * 网络自适应
     */
    function adaptToNetwork() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            const effectiveType = connection.effectiveType;
            
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                // 慢速网络：减少预加载距离
                config.rootMargin = '50px 0px';
                // 可以在这里添加低质量图片加载逻辑
            }
        }
    }

    /**
     * 初始化
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }

    function onReady() {
        adaptToNetwork();
        addGlobalErrorHandling();
        enableNativeLazyLoading();
        addLoadAnimation();
        optimizeCarousel();
        initAdvancedLazyLoading();
    }

    // 暴露 API
    window.ImageOptimization = {
        init: init,
        config: config
    };

    // 自动初始化
    init();

})();
