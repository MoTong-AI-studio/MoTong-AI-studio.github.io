/**
 * 纯JavaScript自定义效果
 * 替代jQuery依赖，使用原生ES6实现
 */

// 轮播图初始化
function initHeroSlider() {
    const heroContainer = document.querySelector('.hero');
    if (!heroContainer) return;
    
    // 检查是否已经初始化
    if (heroContainer.dataset.initialized === 'true') return;
    
    // 使用我们的SimpleSlider
    const slider = new SimpleSlider(heroContainer, {
        autoplay: true,
        interval: 5000,
        animationSpeed: 800,
        pauseOnHover: true,
        showDots: true,
        showArrows: true,
        animation: 'fade'
    });
    
    // 标记为已初始化
    heroContainer.dataset.initialized = 'true';
    
    console.log('Hero slider initialized successfully');
    
    return slider;
}

// 图片延迟加载
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                    }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // 降级方案
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
        });
    }
}

// 平滑滚动效果
function initSmoothScroll() {
    // 只处理真正的锚点链接，排除功能性链接
    document.querySelectorAll('a[href^="#"]:not(.news-more):not(.page-link)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // 检查href是否为有效的锚点选择器
            if (!href || href === '#' || href.length <= 1) {
                // 如果是空链接或只有#，则滚动到顶部
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            // 验证是否为有效的ID选择器格式
            if (!/^#[a-zA-Z][\w\-]*$/.test(href)) {
                // 不是有效的ID格式，不处理
                return;
            }
            
            try {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    // 目标元素不存在，记录警告但不阻止默认行为
                    console.warn('Smooth scroll target not found:', href);
                }
            } catch (error) {
                // 如果选择器无效，记录错误但不中断执行
                console.warn('Invalid selector for smooth scroll:', href, error);
                }
        });
        });
        
    // 为功能性链接添加专门的处理
    initFunctionalLinks();
}

// 处理功能性链接（新闻链接、分页链接等）
function initFunctionalLinks() {
    // 新闻"阅读更多"链接
    document.querySelectorAll('.news-more').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取新闻数据
            const newsItem = this.closest('.news-item');
            const newsTitle = newsItem.querySelector('.news-title').textContent;
            const newsDate = newsItem.querySelector('.news-date').textContent;
            const newsCategory = newsItem.querySelector('.news-category').textContent;
            const newsExcerpt = newsItem.querySelector('.news-excerpt').textContent;
            const newsImage = newsItem.querySelector('.news-image img').getAttribute('data-src');
            
            // 将新闻数据存储到sessionStorage
            const newsData = {
                title: newsTitle,
                date: newsDate,
                category: newsCategory,
                excerpt: newsExcerpt,
                image: newsImage
            };
            sessionStorage.setItem('currentNewsData', JSON.stringify(newsData));
            
            // 跳转到新闻详情页
            window.location.href = 'news-template.html';
        });
    });
    
    // 分页链接已经在index.js中处理，这里不需要重复处理
}

// 视差滚动效果（轻量级）
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;
    
    function updateParallax() {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrollTop * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    // 使用requestAnimationFrame优化性能
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', () => {
        requestTick();
        ticking = false;
    });
}

// 淡入动画效果
function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
            
    if ('IntersectionObserver' in window) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                }
            });
        }, {
            threshold: 0.1
        });
        
        fadeElements.forEach(element => {
            fadeObserver.observe(element);
        });
    }
}

// 导航栏滚动效果
function initNavbarScrollEffect() {
    const header = document.querySelector('.site-header');
    const headerBar = document.querySelector('.header-bar');
    
    if (!header || !headerBar) return;
    
    let lastScrollTop = 0;
    let ticking = false;
    
    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
            headerBar.style.backgroundColor = 'transparent';
            headerBar.style.boxShadow = 'none';
            } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0)';
            header.style.boxShadow = 'none';
            headerBar.style.backgroundColor = 'rgba(255, 255, 255, 0.45)';
            headerBar.style.boxShadow = '0 1px 5px rgba(0, 0, 0, 0.15)';
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
            }
        });
        
    // 初始调用
    updateNavbar();
}

// 响应式轮播图高度调整
function adjustSliderHeight() {
    const heroContainer = document.querySelector('.hero');
    const slides = document.querySelectorAll('.slides li');
    
    if (!heroContainer || slides.length === 0) return;
    
    let height;
    const width = window.innerWidth;
    
    // 根据屏幕宽度设置不同的高度
    if (width <= 375) {
        height = '250px';
    } else if (width <= 576) {
        height = '300px';
    } else if (width <= 768) {
        height = '350px';
    } else if (width <= 992) {
        height = '400px';
    } else {
        height = '500px';
    }
    
    // 同时设置容器和幻灯片的高度
    heroContainer.style.height = height;
    slides.forEach(slide => {
        slide.style.height = height;
    });
    
    console.log(`Slider height adjusted to: ${height} for screen width: ${width}px`);
}

// 初始化所有效果
function initCustomEffects() {
    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
}

function initAll() {
    console.log('Initializing custom effects...');
    
    // 初始化各种效果
    initHeroSlider();
    initLazyLoading();
    initSmoothScroll();
    initParallaxEffect();
    initFadeInAnimations();
    initNavbarScrollEffect();
    
    // 调整轮播图高度
    adjustSliderHeight();
    
    // 窗口大小改变时重新调整
    window.addEventListener('resize', () => {
        adjustSliderHeight();
    });
    
    console.log('Custom effects initialized successfully');
}

// 兼容性检查和降级
function checkCompatibility() {
    // 检查必要的API支持
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        requestAnimationFrame: 'requestAnimationFrame' in window,
        classList: 'classList' in document.createElement('div'),
        querySelector: 'querySelector' in document
    };
    
    console.log('Browser feature support:', features);
        
    // 如果不支持某些功能，提供降级方案
    if (!features.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            return setTimeout(callback, 16);
        };
    }
    
    return features;
}

// 立即执行初始化
checkCompatibility();
initCustomEffects();

// 导出到全局作用域（如果需要）
window.customEffects = {
    initHeroSlider,
    initLazyLoading,
    initSmoothScroll,
    initFunctionalLinks,
    adjustSliderHeight,
    checkCompatibility
}; 