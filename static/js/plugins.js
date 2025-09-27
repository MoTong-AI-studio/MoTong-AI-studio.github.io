/**
 * 纯JavaScript轮播图插件
 * 替代jQuery flexslider，实现基本的轮播功能
 */

class SimpleSlider {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;
        
        this.options = {
            autoplay: true,
            interval: 5000,
            animationSpeed: 800,
            pauseOnHover: true,
            showDots: true,
            showArrows: true,
            animation: 'fade', // 'fade' or 'slide'
            ...options
        };
        
        this.currentSlide = 0;
        this.slides = [];
        this.isPlaying = false;
        this.timer = null;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.setupSlides();
        this.createControls();
        this.bindEvents();
        this.start();
    }
    
    setupSlides() {
        const slidesList = this.container.querySelector('.slides');
        if (!slidesList) return;
        
        this.slides = Array.from(slidesList.children);
        
        // 设置容器样式
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        
        // 设置幻灯片样式
        this.slides.forEach((slide, index) => {
            // 基础样式
            slide.style.position = 'absolute';
            slide.style.top = '0';
            slide.style.left = '0';
            slide.style.width = '100%';
            slide.style.opacity = index === 0 ? '1' : '0';
            slide.style.transition = `opacity ${this.options.animationSpeed}ms ease-in-out`;
            
            // 使用flex布局居中内容
            slide.style.display = 'flex';
            slide.style.alignItems = 'center';
            slide.style.justifyContent = 'center';
            
            // 设置背景图片
            const bgImage = slide.getAttribute('data-bg-image');
            if (bgImage) {
                slide.style.backgroundImage = `url(${bgImage})`;
                slide.style.backgroundSize = 'cover';
                slide.style.backgroundPosition = 'center';
                slide.style.backgroundRepeat = 'no-repeat';
            }
            
            // 处理遮罩层
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))';
            overlay.style.zIndex = '1';
            slide.insertBefore(overlay, slide.firstChild);
            
            // 确保文字内容的z-index和样式正确
            const container = slide.querySelector('.container');
            if (container) {
                container.style.position = 'relative';
                container.style.zIndex = '2';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
            }
            
            const slideContent = slide.querySelector('.slide-content');
            if (slideContent) {
                slideContent.style.position = 'relative';
                slideContent.style.zIndex = '2';
                slideContent.style.color = 'white';
                slideContent.style.textAlign = 'center';
                slideContent.style.maxWidth = '800px';
                slideContent.style.width = '80%';
                slideContent.style.margin = '0 auto';
                slideContent.style.padding = '0 20px 60px 20px'; // 底部留出空间给导航点
                slideContent.style.opacity = '1';
                slideContent.style.transform = 'none';
                
                // 设置文字阴影效果
                const title = slideContent.querySelector('.slide-title');
                const paragraph = slideContent.querySelector('p');
                
                if (title) {
                    title.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
                    title.style.marginBottom = '20px';
                    title.style.opacity = '1';
                }
                
                if (paragraph) {
                    paragraph.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
                    paragraph.style.lineHeight = '1.6';
                    paragraph.style.opacity = '1';
                    paragraph.style.maxWidth = '90%';
                    paragraph.style.margin = '0 auto';
                }
            }
        });
    }
    
    createControls() {
        // 创建导航点
        if (this.options.showDots && this.slides.length > 1) {
            const dotsContainer = document.createElement('ul');
            dotsContainer.className = 'flex-control-nav flex-control-paging';
            dotsContainer.style.cssText = `
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
                list-style: none;
                margin: 0;
                padding: 5px 15px;
                z-index: 10;
            `;
            
            this.slides.forEach((_, index) => {
                const dot = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = index + 1;
                link.style.cssText = `
                    display: block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    text-indent: -9999px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                `;
                
                if (index === 0) {
                    link.style.background = 'white';
                    link.classList.add('flex-active');
                }
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.goToSlide(index);
                });
                
                dot.appendChild(link);
                dotsContainer.appendChild(dot);
            });
            
            this.container.appendChild(dotsContainer);
            this.dotsContainer = dotsContainer;
        }
        
        // 创建左右箭头
        if (this.options.showArrows && this.slides.length > 1) {
            const arrowsContainer = document.createElement('ul');
            arrowsContainer.className = 'flex-direction-nav';
            
            // 上一张按钮
            const prevLi = document.createElement('li');
            const prevLink = document.createElement('a');
            prevLink.href = '#';
            prevLink.className = 'flex-prev';
            prevLink.setAttribute('aria-label', '上一张');
            
            prevLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.prev();
            });
            
            prevLi.appendChild(prevLink);
            arrowsContainer.appendChild(prevLi);
            
            // 下一张按钮
            const nextLi = document.createElement('li');
            const nextLink = document.createElement('a');
            nextLink.href = '#';
            nextLink.className = 'flex-next';
            nextLink.setAttribute('aria-label', '下一张');
            
            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.next();
            });
            
            nextLi.appendChild(nextLink);
            arrowsContainer.appendChild(nextLi);
            
            this.container.appendChild(arrowsContainer);
        }
        
        // 触摸支持
        let startX = 0;
        let endX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // 最小滑动距离
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });
    }
    
    bindEvents() {
        if (this.options.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => {
                this.pause();
            });
            
            this.container.addEventListener('mouseleave', () => {
                this.play();
            });
        }
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });
    }
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentSlide) return;
        
        this.isAnimating = true;
        
        // 更新导航点
        if (this.dotsContainer) {
            const dots = this.dotsContainer.querySelectorAll('a');
            dots[this.currentSlide].style.background = 'rgba(255, 255, 255, 0.5)';
            dots[this.currentSlide].classList.remove('flex-active');
            dots[index].style.background = 'white';
            dots[index].classList.add('flex-active');
        }
        
        // 执行动画
        this.slides[this.currentSlide].style.opacity = '0';
        this.slides[index].style.opacity = '1';
        
        this.currentSlide = index;
        
        setTimeout(() => {
            this.isAnimating = false;
        }, this.options.animationSpeed);
    }
    
    next() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prev() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    play() {
        if (!this.options.autoplay || this.isPlaying) return;
        
        this.isPlaying = true;
        this.timer = setInterval(() => {
            this.next();
        }, this.options.interval);
    }
    
    pause() {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    start() {
        this.play();
    }
    
    destroy() {
        this.pause();
        // 移除事件监听器和控件
        const controls = this.container.querySelectorAll('.flex-control-nav, .flex-direction-nav');
        controls.forEach(control => control.remove());
    }
}

// 全局暴露
window.SimpleSlider = SimpleSlider;

// jQuery兼容层（如果需要）
if (typeof $ !== 'undefined') {
    $.fn.simpleSlider = function(options) {
        return this.each(function() {
            new SimpleSlider(this, options);
        });
    };
} 