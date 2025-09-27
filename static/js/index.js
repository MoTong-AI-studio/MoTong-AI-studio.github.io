/**
 * 首页主要功能 - 纯ES6实现
 * 移除jQuery依赖，使用原生JavaScript
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Index page loading...');
    
    // 初始化AOS动画（如果可用）
    if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        once: true
    });
    }
    
    // 初始化所有功能
    initNavigation();
    initScrollEffects();
    initLazyLoading();
    initPagination();
    initResponsiveSlider();
    
    console.log('Index page initialized successfully');
});

// 导航功能初始化
function initNavigation() {
    // 克隆主导航到移动导航
    const mainMenu = document.querySelector('.main-navigation .menu');
    const mobileNav = document.querySelector('.mobile-navigation');
    const menuToggle = document.querySelector('.menu-toggle');
    const siteHeader = document.querySelector('.site-header');
    
    console.log('Initializing navigation...', { 
        mainMenu: mainMenu ? 'found' : 'not found',
        mobileNav: mobileNav ? 'found' : 'not found',
        menuToggle: menuToggle ? 'found' : 'not found'
    });

    // 确保移动导航中有菜单
    if (mainMenu && mobileNav) {
        // 检查移动导航中的菜单
        const existingMenu = mobileNav.querySelector('.menu');
        if (!existingMenu) {
            // 如果没有菜单，则克隆主菜单
            const clonedMenu = mainMenu.cloneNode(true);
            mobileNav.appendChild(clonedMenu);
            console.log('Menu cloned to mobile navigation');
        } else {
            console.log('Mobile navigation already has a menu');
        }

        // 计算并设置导航栏高度
        const headerHeight = siteHeader.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        console.log('Header height set to:', headerHeight);
    } else {
        console.error('Failed to initialize mobile navigation - missing elements');
        return; // 如果缺少必要元素，提前返回
    }

    // 移除可能存在的旧事件监听器
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

    // 初始化菜单状态
    newMenuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('show');
    
    // 添加菜单切换功能
    if (newMenuToggle) {
        newMenuToggle.addEventListener('click', function(e) {
            console.log('Menu toggle clicked - start');
            // 阻止事件冒泡和默认行为
            e.stopPropagation();
            e.preventDefault();
            
            // 重新计算导航栏高度
            const headerHeight = siteHeader.offsetHeight;
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            
            // 切换菜单状态
            const isExpanded = newMenuToggle.getAttribute('aria-expanded') === 'true';
            newMenuToggle.setAttribute('aria-expanded', !isExpanded);
            newMenuToggle.classList.toggle('active');
            mobileNav.classList.toggle('show');
            
            console.log('Menu toggle clicked, show:', !isExpanded);
            
            // 添加一次性事件监听器，处理下一次点击
            if (!isExpanded) {
                const hideMenu = function(event) {
                    if (!event.target.closest('.mobile-navigation') && 
                        !event.target.closest('.menu-toggle')) {
                        newMenuToggle.setAttribute('aria-expanded', 'false');
                        newMenuToggle.classList.remove('active');
                        mobileNav.classList.remove('show');
                        document.removeEventListener('click', hideMenu);
                        console.log('Menu hidden');
                    }
                };
                
                // 延迟添加点击事件，避免立即触发
                setTimeout(() => {
                    document.addEventListener('click', hideMenu);
                }, 0);
            }
        });
    }

    // 点击菜单项时关闭移动端菜单
    if (mobileNav) {
        mobileNav.addEventListener('click', function(e) {
            if (e.target.closest('a')) {
                newMenuToggle.setAttribute('aria-expanded', 'false');
                newMenuToggle.classList.remove('active');
                mobileNav.classList.remove('show');
                console.log('Menu item clicked, closing mobile navigation');
            }
        });
    }

    // 监听窗口大小变化，重新计算导航栏高度
    window.addEventListener('resize', function() {
        const headerHeight = siteHeader.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    });
}

// 滚动相关效果
function initScrollEffects() {
    let ticking = false;
    
    function updateOnScroll() {
        updateProgressBar();
        updateScrollTopButton();
        updateNavBarStyle();
        updateLazyImages();
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });
    
    // 初始调用
    updateOnScroll();
}

// 进度条更新
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;
    
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
}

// 回到顶部按钮控制
function updateScrollTopButton() {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (!scrollTopBtn) return;
    
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        scrollTopBtn.classList.add('active');
    } else {
        scrollTopBtn.classList.remove('active');
    }
}

// 导航栏样式更新
function updateNavBarStyle() {
    const header = document.querySelector('.site-header');
    const headerBar = document.querySelector('.header-bar');
    
    if (!header || !headerBar) return;
    
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    
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
    }
    
// 回到顶部点击事件
document.addEventListener('click', function(e) {
    if (e.target.closest('#scrollTop')) {
        e.preventDefault();
        smoothScrollTo(0, 800);
    }
});

// 平滑滚动函数
function smoothScrollTo(targetY, duration) {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    const startTime = performance.now();
    
    function step() {
        const progress = (performance.now() - startTime) / duration;
        const ease = easeInOutCubic(progress);
        
        if (progress < 1) {
            window.scrollTo(0, startY + difference * ease);
            requestAnimationFrame(step);
        } else {
            window.scrollTo(0, targetY);
        }
    }
    
    requestAnimationFrame(step);
    }
    
// 缓动函数
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
    
// 窗口大小改变处理
window.addEventListener('resize', function() {
    adjustResponsiveElements();
});

function adjustResponsiveElements() {
    // 调整轮播图高度
    adjustSliderHeight();
    
    // 处理移动端导航
    const width = window.innerWidth;
    const mainNav = document.querySelector('.main-navigation');
    const mobileNav = document.querySelector('.mobile-navigation');
    
    if (width > 768) {
        if (mainNav) mainNav.classList.remove('toggled');
        if (mobileNav) mobileNav.style.display = 'none';
    }
}

// 轮播图高度调整
    function adjustSliderHeight() {
    const slides = document.querySelectorAll('.slides li');
    if (slides.length === 0) return;
    
    const width = window.innerWidth;
    let height;
    
    if (width <= 375) {
        height = 250;
    } else if (width <= 576) {
        height = 300;
    } else if (width <= 768) {
        height = 350;
    } else if (width <= 992) {
        height = 400;
        } else {
        height = 500;
    }
    
    slides.forEach(slide => {
        slide.style.height = height + 'px';
    });
    }
    
// 初始化轮播图响应式
function initResponsiveSlider() {
    adjustSliderHeight();
}
    
    // 图片延迟加载
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy');
        
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // 降级方案 - 直接加载所有图片
        lazyImages.forEach(loadImage);
    }
}

function loadImage(img) {
    if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.add('loaded');
        img.classList.remove('lazy');
    }
}

// 滚动时更新延迟加载图片（降级方案）
function updateLazyImages() {
    if ('IntersectionObserver' in window) return; // 如果支持IntersectionObserver就不需要这个
    
    const lazyImages = document.querySelectorAll('img.lazy');
    
    lazyImages.forEach(img => {
        if (isElementInViewport(img)) {
            loadImage(img);
        }
    });
}

// 检查元素是否在视口中
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
        }

    // 分页功能
function initPagination() {
    const paginationLinks = document.querySelectorAll('.pagination .page-link');
    
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.dataset.page;
            changePage(page);
        });
        });
    }
    
    function changePage(page) {
    // 处理特殊页码
        if (page === 'next') {
        const currentActive = document.querySelector('.pagination .page-link.active');
        if (!currentActive) return;
        
        const currentPage = parseInt(currentActive.dataset.page);
        const totalPages = document.querySelectorAll('.pagination .page-link:not(.next):not(.last)').length;
            
            if (currentPage < totalPages) {
                page = currentPage + 1;
            } else {
                return; // 已经是最后一页
            }
        } else if (page === 'last') {
        const allPages = document.querySelectorAll('.pagination .page-link:not(.next):not(.last)');
        page = allPages.length;
        }
        
        // 更新活动页码样式
    document.querySelectorAll('.pagination .page-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const targetLink = document.querySelector(`.pagination .page-link[data-page="${page}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }
        
        // 隐藏所有新闻项
    document.querySelectorAll('.news-item').forEach(item => {
        item.style.display = 'none';
    });
        
        // 显示当前页的新闻项
    const currentPageItems = document.querySelectorAll(`.news-item.page-${page}`);
    currentPageItems.forEach(item => {
        item.style.display = 'block';
        // 添加淡入效果
        item.style.opacity = '0';
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease';
            item.style.opacity = '1';
        }, 10);
    });
        
        // 滚动到新闻列表顶部
    const newsSection = document.getElementById('news-section');
    if (newsSection) {
        const targetY = newsSection.offsetTop - 100;
        smoothScrollTo(targetY, 500);
    }
}

// 初始化时调用一次调整
document.addEventListener('DOMContentLoaded', function() {
    adjustResponsiveElements();
});

// 页面可见性变化处理（性能优化）
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时暂停动画
        console.log('Page hidden, pausing animations');
    } else {
        // 页面显示时恢复动画
        console.log('Page visible, resuming animations');
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    const errorInfo = {
        message: e.message || 'Unknown error',
        filename: e.filename || 'Unknown file',
        lineno: e.lineno || 'Unknown line',
        colno: e.colno || 'Unknown column',
        error: e.error || null
    };
    
    console.error('JavaScript error occurred:', errorInfo);
    
    // 可选：发送错误报告到服务器
    // sendErrorReport(errorInfo);
});

// 处理未捕获的Promise拒绝
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    
    // 防止错误在控制台显示
    e.preventDefault();
});

// 导出到全局作用域（调试用）
window.indexPageFunctions = {
    updateProgressBar,
    updateScrollTopButton,
    adjustSliderHeight,
    changePage,
    smoothScrollTo
}; 