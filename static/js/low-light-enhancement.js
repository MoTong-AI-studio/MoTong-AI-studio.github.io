/**
 * 雨雾去除页面 - 图片对比功能
 * 重构版本：基于正确的"图片重叠+遮罩裁剪"原理
 * 移动端性能优化版本 + 事件隔离保护

 */

// 事件隔离和清理管理器
class EventManager {
    constructor() {
        this.eventListeners = new Map();
        this.isRainFogPage = true;
    }

    // 安全的事件绑定
    addEventListener(element, event, handler, options = {}) {
        if (!element) return;

        const key = `${element.constructor.name}-${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }

        // 添加页面标识，避免与其他页面冲突
        const wrappedHandler = (e) => {
            if (this.isRainFogPage) {
                handler(e);
            }
        };

        element.addEventListener(event, wrappedHandler, options);
        this.eventListeners.get(key).push({ element, handler: wrappedHandler, options });
    }

    // 清理所有事件监听器
    cleanup() {
        this.isRainFogPage = false;

        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, handler, options }) => {
                try {
                    element.removeEventListener(key.split('-')[1], handler, options);
                } catch (e) {
                    // 忽略清理错误
        }
    });
});

        this.eventListeners.clear();
    }

    // 页面离开时清理
    setupPageCleanup() {
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 监听页面隐藏事件（移动端优化）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isRainFogPage = false;
            } else {
                this.isRainFogPage = true;
            }
        });
    }
}

// 全局事件管理器实例
const eventManager = new EventManager();

// 防止与其他页面的jQuery冲突
(function() {
    // 如果检测到jQuery，暂时保存并隔离
    if (typeof window.$ !== 'undefined' && window.$.fn && window.$.fn.jquery) {
        // 清理可能的全局事件监听器冲突
        try {
            // 移除可能冲突的全局scroll事件
            if (window.onscroll) {
                window.onscroll = null;
            }

            // 清理jQuery的全局事件
            if (window.$ && window.$(window).off) {
                window.$(window).off('scroll.conflictCleanup resize.conflictCleanup');
            }
        } catch (e) {
            // 忽略清理错误
        }
    }
})();

class ImageComparison {
    constructor() {
        this.container = document.querySelector('.comparison-image-container');
        this.originalImage = document.getElementById('original-image'); // HTML中这是处理后的图片
        this.resultImage = document.getElementById('result-image');     // HTML中这是原图
        this.overlay = document.getElementById('comparisonOverlay');
        this.slider = document.getElementById('comparisonSlider');

        this.isDragging = false;
        this.containerRect = null;
        this.resizeTimer = null;
        this.lastPosition = 50;

        // 性能优化：缓存计算结果
        this.cachedDimensions = null;
        this.lastUpdateTime = 0;

        this.init();
    }

    init() {
        if (!this.container || !this.originalImage || !this.resultImage || !this.overlay || !this.slider) {
                return;
            }

        this.setupInitialState();
        this.bindEvents();
        this.ensurePerfectOverlap();
    }

    setupInitialState() {
        if (this.isMobile()) {
            this.container.classList.add('mobile-optimized');
            this.originalImage.classList.add('mobile-optimized');
            this.resultImage.classList.add('mobile-optimized');
            this.optimizeMobilePerformance();
            if (this.isUltraSmallScreen()) {
                this.container.classList.add('ultra-compact-mode');
            } else if (this.isVerySmallScreen()) {
                this.container.classList.add('small-screen-optimized');
            }
            this.container.classList.add('mobile-layout');
        }
        this.forceImageOverlap();
        this.forceResetSlider();
        this.container.classList.add('image-comparison-ready');
        this.waitForImagesLoad().then(() => {
            this.ensurePerfectOverlap();
            setTimeout(() => {
                this.forceResetSlider();
                this.forceImageOverlap();
            }, 100);
        });
    }

    forceResetSlider() {
        if (this.slider && this.overlay) {
            this.slider.style.left = '50%';
            this.overlay.style.width = '50%';
            this.slider.setAttribute('aria-valuenow', '50');
            this.lastPosition = 50;
            if (this.isMobile()) {
                this.overlay.style.setProperty('width', '50%', 'important');
                this.slider.style.setProperty('left', '50%', 'important');
            }
        }
    }

    forceImageOverlap() {
        if (!this.originalImage || !this.resultImage || !this.container) return;
        const rect = this.container.getBoundingClientRect();
        let width = Math.round(rect.width);
        let height = Math.round(rect.height);
        if (width === 0 || height === 0) {
            const parent = this.container.parentElement;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                width = Math.round(parentRect.width * 0.9);
                height = Math.round(width * 0.6);
            } else {
                width = window.innerWidth > 768 ? 600 : Math.round(window.innerWidth * 0.9);
                height = Math.round(width * 0.6);
            }
        }
        const imageStyle = { position: 'absolute', top: '0px', left: '0px', width: width + 'px', height: height + 'px', objectFit: 'cover', objectPosition: 'center center', transform: 'translateZ(0)', display: 'block' };
        Object.assign(this.originalImage.style, imageStyle);
        Object.assign(this.resultImage.style, imageStyle);
        if (this.isMobile()) {
            this.originalImage.classList.add('mobile-optimized');
            this.resultImage.classList.add('mobile-optimized');
            this.container.classList.add('mobile-optimized');
            this.originalImage.style.setProperty('position', 'absolute', 'important');
            this.originalImage.style.setProperty('top', '0px', 'important');
            this.originalImage.style.setProperty('left', '0px', 'important');
            this.originalImage.style.setProperty('width', width + 'px', 'important');
            this.originalImage.style.setProperty('height', height + 'px', 'important');
            this.originalImage.style.setProperty('object-fit', 'cover', 'important');
            this.originalImage.style.setProperty('object-position', 'center center', 'important');
            this.resultImage.style.setProperty('position', 'absolute', 'important');
            this.resultImage.style.setProperty('top', '0px', 'important');
            this.resultImage.style.setProperty('left', '0px', 'important');
            this.resultImage.style.setProperty('width', width + 'px', 'important');
            this.resultImage.style.setProperty('height', height + 'px', 'important');
            this.resultImage.style.setProperty('object-fit', 'cover', 'important');
            this.resultImage.style.setProperty('object-position', 'center center', 'important');
            this.container.style.setProperty('min-height', height + 'px', 'important');
        }
    }

    optimizeMobilePerformance() {
        this.container.style.touchAction = 'none';
        this.container.style.webkitTouchCallout = 'none';
        this.container.style.webkitTapHighlightColor = 'transparent';
        this.container.style.userSelect = 'none';
        this.container.style.webkitUserSelect = 'none';
        this.container.style.willChange = 'transform';
        if (this.slider) {
            this.slider.style.width = '12px';
            this.slider.style.touchAction = 'none';
            this.slider.style.willChange = 'transform';
        }
        const handle = this.container.querySelector('.slider-handle');
        if (handle) {
            handle.style.width = '48px';
            handle.style.height = '48px';
            handle.style.touchAction = 'none';
            handle.style.willChange = 'transform';
            handle.style.padding = '20px';
            handle.style.margin = '-20px';
        }
    }

    async waitForImagesLoad() {
        const promises = [this.originalImage, this.resultImage].map(img => {
            return new Promise((resolve) => {
                if (img.complete && img.naturalWidth > 0) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve;
                    setTimeout(resolve, 3000);
                }
            });
        });
        await Promise.all(promises);
    }

    ensurePerfectOverlap() {
        if (!this.container) return;
        const now = performance.now();
        if (now - this.lastUpdateTime < 16) return;
        this.lastUpdateTime = now;
        const rect = this.container.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        if (width === 0 || height === 0) {
            this.forceImageOverlap();
            return;
        }
        if (this.cachedDimensions && this.cachedDimensions.width === width && this.cachedDimensions.height === height) {
            return;
        }
        this.cachedDimensions = { width, height };
        const imageStyle = { position: 'absolute', top: '0px', left: '0px', width: width + 'px', height: height + 'px', objectFit: 'cover', objectPosition: 'center center', transform: 'translateZ(0)' };
        Object.assign(this.originalImage.style, imageStyle);
        Object.assign(this.resultImage.style, imageStyle);
        if (this.isMobile()) {
            this.originalImage.classList.add('mobile-optimized');
            this.resultImage.classList.add('mobile-optimized');
            this.container.classList.add('mobile-optimized');
            this.originalImage.style.setProperty('position', 'absolute', 'important');
            this.originalImage.style.setProperty('top', '0px', 'important');
            this.originalImage.style.setProperty('left', '0px', 'important');
            this.originalImage.style.setProperty('object-fit', 'cover', 'important');
            this.originalImage.style.setProperty('object-position', 'center center', 'important');
            this.resultImage.style.setProperty('position', 'absolute', 'important');
            this.resultImage.style.setProperty('top', '0px', 'important');
            this.resultImage.style.setProperty('left', '0px', 'important');
            this.resultImage.style.setProperty('object-fit', 'cover', 'important');
            this.resultImage.style.setProperty('object-position', 'center center', 'important');
            this.container.style.touchAction = 'pan-y';
            this.slider.style.touchAction = 'none';
        }
    }

    bindEvents() {
        eventManager.addEventListener(this.container, 'mousedown', this.handleMouseDown.bind(this));
        eventManager.addEventListener(document, 'mousemove', this.handleMouseMove.bind(this));
        eventManager.addEventListener(document, 'mouseup', this.handleMouseUp.bind(this));
        if (this.isMobile()) {
            eventManager.addEventListener(this.container, 'touchstart', this.handleTouchStart.bind(this), { passive: false });
            eventManager.addEventListener(document, 'touchmove', this.handleTouchMove.bind(this), { passive: false });
            eventManager.addEventListener(document, 'touchend', this.handleTouchEnd.bind(this), { passive: true });
            eventManager.addEventListener(this.slider, 'touchstart', this.handleTouchStart.bind(this), { passive: false });
        }
        eventManager.addEventListener(window, 'resize', this.handleResize.bind(this));
        [this.originalImage, this.resultImage].forEach(img => {
            eventManager.addEventListener(img, 'dragstart', e => e.preventDefault());
            eventManager.addEventListener(img, 'touchstart', e => e.preventDefault());
        });
    }

    handleMouseDown(e) {
        if (e.button !== 0) return;
        this.startDragging(e.clientX);
        this.updateSliderFromPosition(e.clientX);
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.updateSliderFromPosition(e.clientX);
        e.preventDefault();
    }

    handleMouseUp() {
        this.stopDragging();
    }

    handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        const target = e.target;
        if (!this.isValidTouchTarget(target)) return;
        this.startDragging(touch.clientX);
        this.updateSliderFromPosition(touch.clientX);
        e.preventDefault();
        e.stopPropagation();
    }

    handleTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        this.updateSliderFromPosition(touch.clientX);
        e.preventDefault();
        e.stopPropagation();
    }

    handleTouchEnd(e) {
        if (this.isDragging) {
            this.stopDragging();
        }
    }

    isValidTouchTarget(target) { return this.container.contains(target) || target === this.slider || target === this.container || target.closest('.slider-handle') || target.closest('.comparison-slider') || target.closest('.comparison-image-container'); }
    isMobile() { const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0; const isSmallScreen = window.innerWidth <= 768; const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); return isTouchDevice || isSmallScreen || isMobileUserAgent; }
    isVerySmallScreen() { return window.innerWidth <= 480; }
    isUltraSmallScreen() { return window.innerWidth <= 360; }

    startDragging(clientX) {
        this.isDragging = true;
        this.containerRect = this.container.getBoundingClientRect();
        this.container.classList.add('dragging');
        if (this.isMobile()) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            this.container.style.touchAction = 'none';
        } else {
            document.body.style.cursor = 'ew-resize';
        }
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
    }

    stopDragging() {
        this.isDragging = false;
        this.containerRect = null;
        this.container.classList.remove('dragging');
        if (this.isMobile()) {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            this.container.style.touchAction = 'pan-y';
        } else {
            document.body.style.cursor = '';
        }
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
    }

    updateSliderFromPosition(clientX) {
        if (!this.containerRect) return;
        const x = clientX - this.containerRect.left;
        const percentage = Math.max(0, Math.min(100, (x / this.containerRect.width) * 100));
        if (Math.abs(percentage - this.lastPosition) < 0.1) return;
        this.lastPosition = percentage;
        this.setSliderPosition(percentage);
    }

    setSliderPosition(percentage) {
        if (!this.slider || !this.overlay) return;
        percentage = Math.max(0, Math.min(100, percentage));
        requestAnimationFrame(() => {
            this.slider.style.left = percentage + '%';
            this.overlay.style.width = percentage + '%';
            this.slider.setAttribute('aria-valuenow', Math.round(percentage));
        });
    }

    handleResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.cachedDimensions = null;
            this.ensurePerfectOverlap();
        }, 100);
    }

    reset() {
        this.forceImageOverlap();
        this.forceResetSlider();
        if (this.isMobile()) {
            setTimeout(() => {
                this.forceImageOverlap();
                this.forceResetSlider();
            }, 100);
        }
    }

    // 【修改】此方法现在会正确拼接Flask的静态文件路径
    updateImages(originalSrc, resultSrc) {
        this.container.classList.add('loading');
        this.cachedDimensions = null;

        // 拼接正确的Flask静态文件路径。JS无法使用url_for，所以直接构建路径。
        // data-* 属性中存储的是 'decorate/project1.jpg' 这样的相对路径。
        const staticOriginalSrc = `/static/${originalSrc}`;
        const staticResultSrc = `/static/${resultSrc}`;

        // 根据HTML结构，original-image显示处理结果，result-image显示原图
        this.originalImage.src = staticResultSrc;  // 这是处理后的图片
        this.resultImage.src = staticOriginalSrc; // 这是原图

        setTimeout(() => {
            this.forceImageOverlap();
            this.forceResetSlider();
        }, 50);

        this.waitForImagesLoad().then(() => {
            this.ensurePerfectOverlap();
            this.forceResetSlider();
            this.container.classList.remove('loading');
            if (this.isMobile()) {
                setTimeout(() => {
                    this.forceImageOverlap();
                }, 100);
            }
        });
    }

    // 【新增/整合】获取图像Base64编码的方法
    getImageAsBase64(imgElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        ctx.drawImage(imgElement, 0, 0);
        // 返回JPEG格式的Base64编码，质量为90%
        return canvas.toDataURL('image/jpeg', 0.9);
    }

    // 【新增/整合】调用后端API的方法
    async callYourAIModel(imageData) {
        // 使用Fetch API调用我们在Flask中创建的 /derain 路由
        const response = await fetch("/lowlight", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData
            })
        });

        if (!response.ok) {
            throw new Error(`API调用失败，状态码: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
            throw new Error(`后端返回错误: ${result.error}`);
        }

        // 返回处理后的图片数据URL (格式: "data:image/jpeg;base64,xxxxxxxx...")
        return result.processedImageUrl;
    }

    // 【新增/整合】处理图片并更新UI的完整流程
    async processImage() {
        const btn = document.getElementById('processBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (!btn || !loadingOverlay || !this.resultImage) return;

        // 1. 更新UI，显示加载状态
        btn.disabled = true;
        btn.querySelector('span').textContent = 'AI处理中...';
        loadingOverlay.classList.add('active');

        try {
            // 2. 获取原图 (即resultImage) 的Base64编码
            const imageData = this.getImageAsBase64(this.resultImage);

            // 3. 调用后端AI模型API
            console.log("正在向后端发送图片数据...");
            const processedImageUrl = await this.callYourAIModel(imageData);
            console.log("从后端接收到处理结果。");

            // 4. 更新处理后的图片 (即originalImage)
            this.originalImage.src = processedImageUrl;

            // 5. 等待新图片加载完成
            await new Promise((resolve, reject) => {
                this.originalImage.onload = resolve;
                this.originalImage.onerror = reject;
            });

            this.ensurePerfectOverlap(); // 确保图片重叠
            this.showNotification('AI处理完成！', 'success');

        } catch (error) {
            console.error('处理失败:', error);
            this.showNotification('处理失败：' + error.message, 'error');
        } finally {
            // 6. 恢复UI
            loadingOverlay.classList.remove('active');
            btn.disabled = false;
            btn.querySelector('span').textContent = '立即生成';
        }
    }

    // 【新增】一个简单的通知函数，方便在类内部调用
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 文件上传处理器
class FileUploadHandler {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.init();
    }

    init() {
        if (!this.uploadArea || !this.fileInput) return;
        this.bindEvents();
    }

    bindEvents() {
        eventManager.addEventListener(this.uploadArea, 'click', () => { this.fileInput.click(); });
        eventManager.addEventListener(this.fileInput, 'change', (e) => { if (e.target.files.length > 0) this.handleFile(e.target.files[0]); });
        eventManager.addEventListener(this.uploadArea, 'dragover', (e) => { e.preventDefault(); this.uploadArea.classList.add('dragover'); });
        eventManager.addEventListener(this.uploadArea, 'dragleave', (e) => { e.preventDefault(); this.uploadArea.classList.remove('dragover'); });
        eventManager.addEventListener(this.uploadArea, 'drop', (e) => { e.preventDefault(); this.uploadArea.classList.remove('dragover'); if (e.dataTransfer.files.length > 0) this.handleFile(e.dataTransfer.files[0]); });
    }

    handleFile(file) {
        if (!this.validateFile(file)) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (window.imageComparison) {
                // 上传的图片作为原图和“处理后”的图，等待用户点击生成
                window.imageComparison.originalImage.src = e.target.result;
                window.imageComparison.resultImage.src = e.target.result;
                window.imageComparison.reset();
            }
            this.showNotification('图片上传成功！请点击"立即生成"进行处理。', 'success');
        };
        reader.onerror = () => { this.showNotification('文件读取失败，请重试', 'error'); };
        reader.readAsDataURL(file);
    }

    validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('请选择图片文件（JPG、PNG、GIF、WebP）', 'error');
            return false;
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showNotification('文件大小不能超过10MB', 'error');
            return false;
        }
        return true;
    }

    showNotification(message, type = 'info') {
        // 使用主类的通知方法，保持一致性
        if (window.imageComparison) {
            window.imageComparison.showNotification(message, type);
        }
    }
}

// 示例图片选择器
class SampleImageSelector {
    constructor() {
        this.sampleItems = document.querySelectorAll('.sample-item');
        this.init();
    }

    init() {
        if (this.sampleItems.length === 0) return;
        this.bindEvents();
    }

    bindEvents() {
        this.sampleItems.forEach(item => {
            eventManager.addEventListener(item, 'click', () => { this.selectSample(item); });
        });
    }


    selectSample(selectedItem) {
        this.sampleItems.forEach(item => item.classList.remove('active'));
        selectedItem.classList.add('active');

        const originalSrc = selectedItem.dataset.original;
        const resultSrc = selectedItem.dataset.result;

        if (window.imageComparison) {

            window.imageComparison.updateImages(originalSrc, resultSrc);
        }
    }
}

// 回到顶部功能
class ScrollToTop {
    constructor() {
        this.scrollTopBtn = document.getElementById('scrollTop');
        this.progressBar = document.getElementById('progressBar');
        this.throttleTimer = null;
        this.init();
    }

    init() {
        if (this.scrollTopBtn) {
            eventManager.addEventListener(this.scrollTopBtn, 'click', this.scrollToTop.bind(this));
        }
        eventManager.addEventListener(window, 'scroll', this.throttledHandleScroll.bind(this));
    }

    throttledHandleScroll() {
        if (this.throttleTimer) return;
        this.throttleTimer = setTimeout(() => {
            this.handleScroll();
            this.throttleTimer = null;
        }, 16);
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        if (this.progressBar) {
            const progress = (scrolled / (documentHeight - windowHeight)) * 100;
            this.progressBar.style.width = Math.min(progress, 100) + '%';
        }
        if (this.scrollTopBtn) {
            if (scrolled > 300) {
                this.scrollTopBtn.classList.add('active');
            } else {
                this.scrollTopBtn.classList.remove('active');
            }
        }
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    eventManager.setupPageCleanup();

    requestAnimationFrame(() => {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                disable: window.innerWidth < 768
            });
        }

        // 初始化所有组件
        window.imageComparison = new ImageComparison();
        window.fileUploadHandler = new FileUploadHandler();
        window.sampleImageSelector = new SampleImageSelector();
        window.scrollToTop = new ScrollToTop();

        setTimeout(() => {
            if (window.imageComparison) {
                window.imageComparison.forceResetSlider();
                window.imageComparison.forceImageOverlap();
            }
        }, 500);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.imageComparison) {
                    const container = window.imageComparison.container;
                    if (container) {
                        container.classList.remove('ultra-compact-mode', 'small-screen-optimized', 'mobile-layout');
                        if (window.imageComparison.isMobile()) {
                            container.classList.add('mobile-layout');
                            if (window.imageComparison.isUltraSmallScreen()) container.classList.add('ultra-compact-mode');
                            else if (window.imageComparison.isVerySmallScreen()) container.classList.add('small-screen-optimized');
                        }
                    }
                    window.imageComparison.forceImageOverlap();
                    window.imageComparison.forceResetSlider();
                }
            }, 150);
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (window.imageComparison) {
                    window.imageComparison.forceImageOverlap();
                    window.imageComparison.forceResetSlider();
                }
            }, 300);
        });

        // 绑定按钮事件
        const resetBtn = document.getElementById('resetSlider');
        if (resetBtn) {
            eventManager.addEventListener(resetBtn, 'click', () => { window.imageComparison?.reset(); });
        }

        // 【重要】将 "立即生成" 按钮的点击事件绑定到 processImage 方法
        const processBtn = document.getElementById('processBtn');
        if (processBtn) {
            eventManager.addEventListener(processBtn, 'click', () => {
                if (window.imageComparison) {
                    window.imageComparison.processImage();
                }
            });
        }

        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            eventManager.addEventListener(fullscreenBtn, 'click', () => {
                const container = document.querySelector('.comparison-image-container');
                if (container && container.requestFullscreen) {
                    container.requestFullscreen();
                }
            });
        }
    });
});
