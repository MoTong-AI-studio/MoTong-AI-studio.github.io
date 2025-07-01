// 雨雾去除页面交互功能

$(document).ready(function() {
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true
    });
    
    // 克隆主导航到移动导航（只克隆一次，避免重复）
    if ($(".mobile-navigation .menu").length === 0) {
        $(".main-navigation > .menu").clone().appendTo(".mobile-navigation");
    }
    
    // 初始化
    initializePage();
    
    // 绑定事件
    bindEvents();
    
    // 初始化图像对比滑块
    initImageComparison();
    
    // 初始化进度条
    initProgressBar();
    
    // 确保菜单项在初始化时就是可见的 - 与about页面保持一致
    $('.mobile-navigation .menu-item').css({
        'display': 'block',
        'visibility': 'visible',
        'position': 'relative',
        'overflow': 'visible'
    });
    
    // 为菜单切换按钮添加ARIA属性 - 与about页面保持一致
    $('.menu-toggle').attr({
        'aria-label': '切换导航菜单',
        'aria-expanded': 'false',
        'role': 'button'
    });
    
    // 为移动端导航添加ARIA属性
    $('.mobile-navigation').attr({
        'role': 'navigation',
        'aria-label': '移动端导航菜单'
    });
    
    // 调试信息
    console.log('=== 雨雾去除页面初始化完成 ===');
    console.log('jQuery版本:', $.fn.jquery);
    console.log('上传区域元素:', $('#uploadArea').length);
    console.log('上传按钮元素:', $('#uploadBtn').length);
    console.log('文件输入元素:', $('#fileInput').length);
    
    // 添加全局测试函数
    window.testUpload = function() {
        console.log('=== 手动测试上传功能 ===');
        triggerFileUpload();
    };
    
    window.testExistingInput = function() {
        console.log('=== 手动测试现有输入 ===');
        triggerExistingFileInput();
    };
    
    // 检测移动设备
    checkMobileDevice();
    
    // 添加键盘导航支持 - 与about页面保持一致
    // 移动端菜单键盘导航
    $('.mobile-navigation .menu-item a').keydown(function(e) {
        if (e.key === 'Tab') {
            const $menuItems = $('.mobile-navigation .menu-item a');
            const currentIndex = $menuItems.index(this);
            
            if (e.shiftKey) {
                // Shift+Tab - 向上导航
                if (currentIndex === 0) {
                    e.preventDefault();
                    $('.mobile-navigation .close-button').focus();
                }
            } else {
                // Tab - 向下导航
                if (currentIndex === $menuItems.length - 1) {
                    e.preventDefault();
                    $('.mobile-navigation .close-button').focus();
                }
            }
        }
    });
    
    // 关闭按钮键盘导航
    $('.mobile-navigation .close-button').keydown(function(e) {
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            $('.mobile-navigation .menu-item:first-child a').focus();
        }
    });
});

// 检测移动设备并添加相应类
function checkMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        $('body').addClass('mobile-device');
        
        // 针对iOS设备优化
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            $('body').addClass('ios-device');
        }
        
        // 针对安卓设备优化
        const isAndroid = /Android/.test(navigator.userAgent);
        if (isAndroid) {
            $('body').addClass('android-device');
        }
        
        console.log(`检测到移动设备: ${isIOS ? 'iOS' : (isAndroid ? 'Android' : '其他')}`);
    }
}

function initializePage() {
    // 设置默认图片
    enhancedLoadSampleImage($('.sample-item.active'));
    
    // 启动自适应监控
    setTimeout(() => {
        startAdaptiveMonitoring();
    }, 1000);
    
    // 延迟调整图片容器，确保DOM完全加载
    setTimeout(function() {
        enhancedAdjustImageContainer();
        // 初始化时修正遮罩层图片宽度
        fixOverlayImageWidth();
    }, 500);
}

// 图像对比滑块功能 - 移动端优化版本
function initImageComparison() {
    const slider = $('#comparisonSlider');
    const overlay = $('#comparisonOverlay');
    const container = $('.comparison-image-container');
    let isDragging = false;
    let animationFrameId = null;
    let lastUpdateTime = 0;
    let containerRect = null;
    
    // 性能优化：缓存DOM查询
    const sliderElement = slider[0];
    const overlayElement = overlay[0];
    const containerElement = container[0];
    
    // 检测是否是触摸设备
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 节流函数：使用requestAnimationFrame优化性能
    function throttledUpdate(callback) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
            const now = performance.now();
            if (now - lastUpdateTime >= 16) { // 限制在60fps
                callback();
                lastUpdateTime = now;
            }
            animationFrameId = null;
        });
    }
    
    // 优化的位置更新函数
    function updateSliderPosition(e) {
        // 使用缓存的容器尺寸，避免重复计算
        if (!containerRect || !isDragging) {
            containerRect = containerElement.getBoundingClientRect();
        }
        
        const x = (e.clientX || e.pageX || e.touches?.[0]?.clientX || 0) - containerRect.left;
        const percentage = Math.max(0, Math.min(100, (x / containerRect.width) * 100));
        
        // 直接操作样式，避免jQuery开销
        const percentageStr = percentage + '%';
        sliderElement.style.left = percentageStr;
        overlayElement.style.width = percentageStr;
        
        // 延迟修正遮罩层图片宽度，避免频繁调用
        if (!isDragging) {
            setTimeout(() => fixOverlayImageWidth(), 50);
        }
    }
    
    // 优化的节流更新函数
    function throttledUpdateSliderPosition(e) {
        throttledUpdate(() => updateSliderPosition(e));
    }
    
    // 鼠标事件处理 - 桌面端优化
    container.on('mousedown', function(e) {
        if (e.which !== 1) return; // 只处理左键
        
        isDragging = true;
        containerRect = containerElement.getBoundingClientRect();
        
        // 添加拖动状态类，禁用过渡效果
        container.addClass('dragging');
        
        updateSliderPosition(e);
        
        $(document).on('mousemove.slider', throttledUpdateSliderPosition);
        $(document).on('mouseup.slider', handleMouseUp);
        
        e.preventDefault();
        e.stopPropagation();
    });
    
    // 触摸事件处理 - 移动端优化
    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalDrag = false;
    let touchMoveCount = 0;
    
    container.on('touchstart', function(e) {
        const touch = e.originalEvent.touches[0];
        if (!touch) return;
        
        isDragging = true;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchMoveCount = 0;
        isHorizontalDrag = false;
        
        containerRect = containerElement.getBoundingClientRect();
        
        // 添加拖动状态类
        container.addClass('dragging');
        
        updateSliderPosition(touch);
        
        $(document).on('touchmove.slider', handleTouchMove);
        $(document).on('touchend.slider touchcancel.slider', handleTouchEnd);
        
        // 不立即阻止默认行为，等待方向判断
    });
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        const touch = e.originalEvent.touches[0];
        if (!touch) return;
        
        touchMoveCount++;
        
        // 前几次移动用于判断方向
        if (touchMoveCount <= 3) {
            const diffX = Math.abs(touch.clientX - touchStartX);
            const diffY = Math.abs(touch.clientY - touchStartY);
            
            // 判断是否为水平拖动
            if (diffX > diffY && diffX > 10) {
                isHorizontalDrag = true;
                // 确认为水平拖动后，阻止页面滚动
                e.preventDefault();
            } else if (diffY > diffX && diffY > 10) {
                // 确认为垂直滚动，停止滑块操作
                isDragging = false;
                container.removeClass('dragging');
                $(document).off('.slider');
                return;
            }
        } else if (isHorizontalDrag) {
            // 已确认为水平拖动，阻止默认行为并更新位置
            e.preventDefault();
            throttledUpdateSliderPosition(touch);
        }
    }
    
    function handleMouseUp() {
        if (!isDragging) return;
        
        isDragging = false;
        containerRect = null;
        
        // 移除拖动状态类，恢复过渡效果
        container.removeClass('dragging');
        
        $(document).off('.slider');
        
        // 拖动结束后修正图片宽度
        setTimeout(() => fixOverlayImageWidth(), 100);
    }
    
    function handleTouchEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        containerRect = null;
        isHorizontalDrag = false;
        touchMoveCount = 0;
        
        // 移除拖动状态类
        container.removeClass('dragging');
        
        $(document).off('.slider');
        
        // 拖动结束后修正图片宽度
        setTimeout(() => fixOverlayImageWidth(), 100);
    }
    
    // 重置滑块位置 - 优化版本
    $('#resetSlider').on('click', function() {
        // 临时禁用过渡效果，确保重置动画流畅
        container.addClass('resetting');
        
        sliderElement.style.left = '50%';
        overlayElement.style.width = '50%';
        
        // 重置后恢复过渡效果
        setTimeout(() => {
            container.removeClass('resetting');
            fixOverlayImageWidth();
        }, 100);
        
        showNotification('对比滑块已重置到中间位置', 'info');
    });
    
    // 窗口大小改变时更新容器尺寸缓存
    $(window).on('resize.slider', function() {
        containerRect = null;
        // 重置图片宽度缓存
        resetOverlayImageCache();
        // 延迟修正图片宽度
        setTimeout(() => fixOverlayImageWidth(), 200);
    });
    
    // 全屏查看功能
    $('#fullscreenBtn').on('click', function() {
        const container = $('.comparison-image-container')[0];
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    });
    
    // 清理函数
    function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        $(document).off('.slider');
        $(window).off('resize.slider');
        stopAdaptiveMonitoring();
    }
    
    // 页面卸载时清理
    $(window).on('beforeunload', cleanup);
    
    // 监听页面可见性变化，确保从后台切换回来时自适应
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(() => {
                triggerAdaptiveFix();
            }, 200);
        }
    });
    
    // 监听窗口焦点变化
    $(window).on('focus', function() {
        setTimeout(() => {
            triggerAdaptiveFix();
        }, 100);
    });
}

function bindEvents() {
    // 移动端导航菜单优化 - 完全独立定位模式
    let mobileMenuOpen = false;
    
    // 动态计算导航栏高度并设置菜单正确位置的函数
    function updateMobileNavPosition() {
        const $siteHeader = $('.site-header');
        const headerHeight = $siteHeader.outerHeight() || 80; // 获取导航栏实际高度，默认80px
        
        $('.mobile-navigation').css({
            'top': headerHeight + 'px' // 设置菜单在导航栏下方，而不是覆盖导航栏
        });
    }
    
    $(".menu-toggle").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $toggle = $(this);
        const $mobileNav = $(".mobile-navigation");
        
        if (!mobileMenuOpen) {
            // 更新菜单位置，确保在导航栏下方
            updateMobileNavPosition();
            
            // 打开下拉菜单
            $toggle.addClass('active').attr('aria-expanded', 'true');
            
            // 显示下拉菜单
            $mobileNav.addClass('show');
            
            mobileMenuOpen = true;
            
            // 确保所有菜单项都可见
            $mobileNav.find('.menu-item').each(function(index) {
                $(this).css({
                    'display': 'block',
                    'visibility': 'visible',
                    'opacity': '1',
                    'position': 'relative'
                });
            });
            
            // 为可访问性添加焦点管理
            setTimeout(() => {
                $mobileNav.find('.menu-item:first-child a').focus();
            }, 300);
            
        } else {
            // 关闭菜单
            closeMobileMenu();
        }
    });
    
    // 关闭移动端菜单的函数
    function closeMobileMenu() {
        const $toggle = $(".menu-toggle");
        const $mobileNav = $(".mobile-navigation");
        
        $toggle.removeClass('active').attr('aria-expanded', 'false');
        $mobileNav.removeClass('show');
        
        mobileMenuOpen = false;
        
        // 返回焦点到切换按钮
        $toggle.focus();
    }
    
    // 点击导航链接后自动关闭菜单（移动端）
    $(".mobile-navigation .menu-item a").click(function() {
        closeMobileMenu();
    });
    
    // ESC键关闭菜单
    $(document).keydown(function(e) {
        if (e.key === 'Escape' && mobileMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // 点击菜单外部区域关闭菜单
    $(document).click(function(e) {
        if (mobileMenuOpen && 
            !$(e.target).closest('.mobile-navigation').length && 
            !$(e.target).closest('.menu-toggle').length) {
            closeMobileMenu();
        }
    });
    
    // 窗口大小改变时处理导航菜单
    $(window).resize(function() {
        if ($(window).width() > 768) {
            // 大屏幕时自动关闭移动端菜单
            if (mobileMenuOpen) {
                closeMobileMenu();
            }
        } else {
            // 移动端时更新菜单位置，确保始终在导航栏下方
            if (mobileMenuOpen) {
                updateMobileNavPosition();
            }
        }
    });
    
    // 示例图片选择
    $('.sample-item').on('click', function() {
        $('.sample-item').removeClass('active');
        $(this).addClass('active');
        enhancedLoadSampleImage($(this));
    });
    
    // 处理按钮点击
    $('#processBtn').on('click', function() {
        processImage();
    });
    
    // 文件上传功能 - 浏览器兼容的可靠版本
    let uploadInProgress = false;
    
    function triggerFileUpload() {
        console.log('=== 触发文件上传 ===');
        
        if (uploadInProgress) {
            console.log('上传正在进行中，跳过...');
            return;
        }
        
        uploadInProgress = true;
        
        // 使用最兼容的方法：直接触发现有的文件输入
        const existingInput = document.getElementById('fileInput');
        if (existingInput) {
            console.log('使用现有文件输入...');
            try {
                // 重置文件输入
                existingInput.value = '';
                
                // 确保元素在可访问位置但不可见
                existingInput.style.position = 'fixed';
                existingInput.style.left = '0px';
                existingInput.style.top = '0px';
                existingInput.style.width = '1px';
                existingInput.style.height = '1px';
                existingInput.style.opacity = '0';
                existingInput.style.zIndex = '-1';
                existingInput.style.display = 'block';
                existingInput.style.pointerEvents = 'auto';
                
                // 直接触发点击，不使用延迟
                existingInput.click();
                console.log('现有文件输入点击已触发');
                
                // 重置状态
                setTimeout(() => {
                    uploadInProgress = false;
                }, 1000);
                
                return;
            } catch (error) {
                console.error('现有文件输入触发失败:', error);
            }
        }
        
        // 备用方案：创建新的文件输入
        createBrowserCompatibleFileInput();
    }
    
    function createBrowserCompatibleFileInput() {
        console.log('创建浏览器兼容的文件输入...');
        
        // 清理之前的临时输入
        const oldInputs = document.querySelectorAll('.temp-upload-input');
        oldInputs.forEach(input => input.remove());
        
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
        input.className = 'temp-upload-input';
        input.multiple = false;
        
        // 使用更兼容的定位方式
        input.style.cssText = `
            position: fixed !important;
            left: 0px !important;
            top: 0px !important;
            width: 1px !important;
            height: 1px !important;
            opacity: 0 !important;
            z-index: -1 !important;
            pointer-events: auto !important;
            display: block !important;
            visibility: hidden !important;
        `;
        
        // 文件选择事件
        input.addEventListener('change', function(e) {
            console.log('动态文件输入变化:', e.target.files);
            uploadInProgress = false;
            
            if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
            
            // 清理元素
            setTimeout(() => {
                if (input.parentNode) {
                    input.parentNode.removeChild(input);
                }
            }, 100);
        });
        
        // 取消选择事件（某些浏览器支持）
        input.addEventListener('cancel', function() {
            console.log('文件选择被取消');
            uploadInProgress = false;
            
            setTimeout(() => {
                if (input.parentNode) {
                    input.parentNode.removeChild(input);
                }
            }, 100);
        });
        
        // 添加到DOM
        document.body.appendChild(input);
        
        // 立即触发点击
        try {
            // 确保元素已经添加到DOM
            input.offsetHeight; // 强制重排
            input.click();
            console.log('动态文件输入点击已触发');
        } catch (error) {
            console.error('动态文件输入触发失败:', error);
            uploadInProgress = false;
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
        }
        
        // 安全网：5秒后重置状态
        setTimeout(() => {
            if (uploadInProgress) {
                console.log('文件选择超时，重置状态');
                uploadInProgress = false;
                if (input.parentNode) {
                    input.parentNode.removeChild(input);
                }
            }
        }, 5000);
    }
    
    // 上传区域点击事件 - 移除阻止默认行为
    $('#uploadArea').off('click.upload').on('click.upload', function(e) {
        console.log('=== 上传区域被点击 ===');
        // 不阻止默认行为，让浏览器正常处理用户交互
        
        // 添加视觉反馈
        $(this).addClass('clicking');
        setTimeout(() => {
            $(this).removeClass('clicking');
        }, 200);
        
        // 直接触发文件上传
        triggerFileUpload();
    });
    
    // 上传按钮点击事件 - 移除阻止默认行为
    $('#uploadBtn').off('click.upload').on('click.upload', function(e) {
        console.log('=== 上传按钮被点击 ===');
        // 不阻止默认行为，让浏览器正常处理用户交互
        
        // 添加按钮点击效果
        $(this).addClass('active');
        setTimeout(() => {
            $(this).removeClass('active');
        }, 150);
        
        // 直接触发文件上传
        triggerFileUpload();
    });
    
    // 现有文件输入变化事件
    $('#fileInput').off('change.upload').on('change.upload', function(e) {
        console.log('现有文件输入变化:', e.target.files);
        uploadInProgress = false;
        
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // 为现有文件输入添加直接点击功能
    function triggerExistingFileInput() {
        console.log('=== 触发现有文件输入 ===');
        
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            try {
                // 重置文件输入
                fileInput.value = '';
                
                // 使用最简单的方式，确保元素可以被点击
                fileInput.style.cssText = `
                    position: fixed !important;
                    left: 0px !important;
                    top: 0px !important;
                    width: 1px !important;
                    height: 1px !important;
                    opacity: 0 !important;
                    z-index: 9999 !important;
                    display: block !important;
                    pointer-events: auto !important;
                `;
                
                // 强制重排，确保样式生效
                fileInput.offsetHeight;
                
                // 触发点击
                fileInput.click();
                console.log('现有文件输入点击已触发');
                return true;
            } catch (error) {
                console.error('现有文件输入触发失败:', error);
                return false;
            }
        }
        return false;
    }
    
    // 拖拽上传功能优化
    $('#uploadArea').off('dragover.upload').on('dragover.upload', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });
    
    $('#uploadArea').off('dragenter.upload').on('dragenter.upload', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });
    
    $('#uploadArea').off('dragleave.upload').on('dragleave.upload', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // 检查是否真的离开了拖拽区域
        const rect = this.getBoundingClientRect();
        const x = e.originalEvent.clientX;
        const y = e.originalEvent.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            $(this).removeClass('dragover');
        }
    });
    
    $('#uploadArea').off('drop.upload').on('drop.upload', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
        
        const files = e.originalEvent.dataTransfer.files;
        console.log('Files dropped:', files);
        
        if (files.length > 0) {
            // 验证文件类型
            const file = files[0];
            if (file.type.match('image.*')) {
                handleFileUpload(file);
            } else {
                showNotification('请拖拽图片文件！支持JPG、PNG、WebP格式', 'error');
            }
        } else {
            showNotification('未检测到文件，请重试', 'error');
        }
    });
    

    

    
    // 回到顶部
    $('#scrollTop').on('click', function() {
        $('html, body').animate({scrollTop: 0}, 800);
    });
    
    // 滚动显示回到顶部按钮和导航栏效果
    $(window).scroll(function() {
        var scrollTop = $(this).scrollTop();
        
        // 回到顶部按钮
        if (scrollTop > 300) {
            $('#scrollTop').fadeIn();
        } else {
            $('#scrollTop').fadeOut();
        }
        
        // 导航栏滚动效果 - 与about页面保持一致
        handleNavBarScroll();
    });
    
    // 导航栏滚动样式变化
    function handleNavBarScroll() {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            document.querySelector(".site-header").style.backgroundColor = "rgba(255, 255, 255, 0.95)";
            document.querySelector(".site-header").style.boxShadow = "0 2px 15px rgba(0, 0, 0, 0.1)";
            document.querySelector(".header-bar").style.backgroundColor = "transparent";
            document.querySelector(".header-bar").style.boxShadow = "none";
        } else {
            document.querySelector(".site-header").style.backgroundColor = "rgba(255, 255, 255, 0)";
            document.querySelector(".site-header").style.boxShadow = "none";
            document.querySelector(".header-bar").style.backgroundColor = "rgba(255, 255, 255, 0.45)";
            document.querySelector(".header-bar").style.boxShadow = "0 1px 5px rgba(0, 0, 0, 0.15)";
        }
    }
    
    // 页面加载时初始化导航栏样式
    handleNavBarScroll();
}

function loadSampleImage($item) {
    const originalSrc = $item.data('original') || $item.find('img').attr('src');
    const resultSrc = $item.data('result') || $item.find('img').attr('src');
    
    // 更新图片：左侧处理后，右侧原图的遮罩逻辑
    // 背景显示原图，遮罩层显示处理后的图片
    const $originalImage = $('#original-image');
    const $resultImage = $('#result-image');
    
    // 重置容器样式
    resetImageContainer();
    
    // 正确分配：背景显示原图，遮罩层显示处理后的结果
    $originalImage.attr('src', originalSrc);
    $resultImage.attr('src', resultSrc);
    
    // 初始滑块位置到中间 - 左侧显示处理后，右侧显示原图
    $('#comparisonSlider').css('left', '50%');
    $('#comparisonOverlay').css('width', '50%');
    
    // 图片加载完成后调整容器尺寸
    let loadedCount = 0;
    function onImageLoad() {
        loadedCount++;
        if (loadedCount === 2) {
            // 延迟调整，确保DOM更新完成
            setTimeout(() => {
                adjustImageContainer();
            }, 50);
        }
    }
    
    $originalImage.off('load').on('load', function() {
        $(this).addClass('loaded');
        onImageLoad();
    });
    
    $resultImage.off('load').on('load', function() {
        $(this).addClass('loaded');
        onImageLoad();
    });
    
    // 如果图片已经缓存，立即触发加载事件
    if ($originalImage[0].complete) {
        $originalImage.addClass('loaded');
        loadedCount++;
    }
    if ($resultImage[0].complete) {
        $resultImage.addClass('loaded');
        loadedCount++;
    }
    if (loadedCount === 2) {
        setTimeout(() => {
            adjustImageContainer();
        }, 50);
    }
}



function resetImageContainer() {
    const $container = $('.comparison-image-container');
    
    // 完全重置所有可能影响尺寸的样式
    $container.css({
        width: '',
        height: '',
        maxWidth: '',
        minWidth: '',
        maxHeight: '',
        minHeight: '',
        margin: '',
        padding: '',
        transform: '',
        flex: '',
        flexBasis: '',
        flexGrow: '',
        flexShrink: ''
    });
    
    // 移除所有响应式相关的样式类
    $container.removeClass([
        'width-adjusted', 
        'responsive-scaling', 
        'small-screen-optimized', 
        'perfect-overlap',
        'mobile-layout',
        'ultra-compact-mode',
        'alignment-warning',
        'alignment-success',
        'fixing-alignment',
        'adaptive-checking'
    ].join(' '));
    
    // 重置图片样式
    const $images = $('.comparison-image');
    $images.removeClass([
        'responsive-optimized', 
        'mobile-optimized', 
        'force-cover'
    ].join(' '));
    
    // 重置图片的内联样式
    $('#original-image, #result-image').each(function() {
        this.style.width = '';
        this.style.height = '';
        this.style.objectFit = '';
        this.style.objectPosition = '';
        this.style.transform = '';
    });
    
    console.log('容器和图片样式已完全重置');
}

function adjustImageContainer() {
    const $container = $('.comparison-image-container');
    const $originalImage = $('#original-image')[0];
    
    if (!$originalImage || !$originalImage.complete) return;
    
    // 获取容器的父元素宽度作为基准，而不是当前容器宽度
    const $parentContainer = $container.parent();
    const parentWidth = $parentContainer.width();
    let containerWidth = $container.width();
    
    // 如果容器宽度异常小（可能是设备切换导致的），使用父容器宽度
    if (containerWidth < parentWidth * 0.5) {
        containerWidth = parentWidth;
        console.log(`检测到容器宽度异常 (${$container.width()}px)，使用父容器宽度 (${parentWidth}px)`);
    }
    
    const imageWidth = $originalImage.naturalWidth;
    const imageHeight = $originalImage.naturalHeight;
    
    if (imageWidth === 0 || imageHeight === 0) return;
    
    // 计算图片的宽高比
    const imageRatio = imageWidth / imageHeight;
    
    // 设置合理的高度范围（优化响应式）
    const windowWidth = $(window).width();
    const windowHeight = window.innerHeight;
    const isUltraSmall = windowWidth <= 360;
    const isSmallScreen = windowWidth <= 480;
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth <= 1024;
    const isLargeScreen = windowWidth >= 1200;
    
    let minHeight, maxHeight, responsiveMode = 'desktop';
    
    if (isUltraSmall) {
        // 超小屏幕（≤360px）
        minHeight = 150;
        maxHeight = Math.min(windowHeight * 0.28, 300);
        responsiveMode = 'ultra-small';
    } else if (isSmallScreen) {
        // 小屏幕（≤480px）
        minHeight = 180;
        maxHeight = Math.min(windowHeight * 0.35, 350);
        responsiveMode = 'small';
    } else if (isMobile) {
        // 移动端（≤768px）
        minHeight = 220;
        maxHeight = Math.min(windowHeight * 0.45, 450);
        responsiveMode = 'mobile';
    } else if (isTablet) {
        // 平板（≤1024px）
        minHeight = 280;
        maxHeight = Math.min(windowHeight * 0.55, 550);
        responsiveMode = 'tablet';
    } else if (isLargeScreen) {
        // 大屏幕（≥1200px）
        minHeight = 350;
        maxHeight = Math.min(windowHeight * 0.65, 650);
        responsiveMode = 'large';
    } else {
        // 中等屏幕（769px-1199px）
        minHeight = 300;
        maxHeight = Math.min(windowHeight * 0.6, 600);
        responsiveMode = 'medium';
    }
    
    // 根据图片宽高比计算理想的容器高度
    let idealHeight = containerWidth / imageRatio;
    
    // 智能调整策略 - 完全重叠优化的同比例缩放
    let finalContainerHeight;
    let finalContainerWidth = containerWidth;
    let scalingApplied = false;
    let perfectOverlapMode = false;
    
    // 检查图片尺寸差异，决定是否启用完全重叠模式
    const aspectRatioTolerance = 0.1; // 10%的宽高比容差
    
    if (idealHeight <= maxHeight && idealHeight >= minHeight) {
        // 理想高度在合理范围内，直接使用
        finalContainerHeight = idealHeight;
        perfectOverlapMode = true; // 启用完全重叠模式
    } else if (idealHeight > maxHeight) {
        // 图片太高，需要进行智能缩放
        finalContainerHeight = maxHeight;
        
        // 计算在最大高度下的理想宽度（同比例缩放）
        const idealWidth = maxHeight * imageRatio;
        
        if (idealWidth < containerWidth * 0.95) {
            // 如果理想宽度明显小于容器宽度，调整容器宽度保持比例
            finalContainerWidth = Math.max(idealWidth, containerWidth * 0.7);
            scalingApplied = true;
            perfectOverlapMode = true; // 启用完全重叠模式
        } else {
            // 保持容器宽度，使用cover模式确保填充
            perfectOverlapMode = true;
        }
    } else {
        // 图片太矮，使用最小高度但保持比例
        finalContainerHeight = minHeight;
        
        // 检查是否需要调整宽度以保持比例
        const idealWidth = minHeight * imageRatio;
        if (idealWidth > containerWidth * 1.2) {
            // 如果理想宽度太大，重新计算高度
            finalContainerHeight = containerWidth / imageRatio;
            finalContainerHeight = Math.max(finalContainerHeight, minHeight * 0.8);
        }
        perfectOverlapMode = true; // 启用完全重叠模式
    }
    
    // 应用响应式样式类
    $container.removeClass('responsive-scaling width-adjusted small-screen-optimized perfect-overlap');
    
    if (scalingApplied) {
        $container.addClass('responsive-scaling width-adjusted');
    }
    
    if (isUltraSmall || isSmallScreen) {
        $container.addClass('small-screen-optimized');
    }
    
    // 应用完全重叠模式
    if (perfectOverlapMode) {
        $container.addClass('perfect-overlap');
        console.log('启用完全重叠模式 - 确保两张图片像素级对齐');
    }
    
    // 应用尺寸
    $container.css({
        height: finalContainerHeight + 'px',
        width: finalContainerWidth + 'px',
        maxWidth: '100%' // 确保不超出父容器
    });
    
    // 为图片和滑块添加响应式优化类
    const $images = $('.comparison-image');
    const $originalImg = $('#original-image');
    const $resultImg = $('#result-image');
    const $slider = $('.comparison-slider');
    const $handle = $('.slider-handle');
    const $overlay = $('.comparison-overlay');
    
    $images.removeClass('responsive-optimized mobile-optimized force-cover');
    $slider.removeClass('responsive-optimized');
    $handle.removeClass('responsive-optimized');
    $overlay.removeClass('responsive-optimized');
    
    // 应用完全重叠模式的图片样式
    if (perfectOverlapMode) {
        $originalImg.addClass('force-cover');
        $resultImg.addClass('force-cover');
        console.log('应用强制覆盖模式 - 确保图片完全填充容器');
    }
    
    if (isMobile || isSmallScreen || isUltraSmall) {
        $images.addClass('mobile-optimized');
        $slider.addClass('responsive-optimized');
        $handle.addClass('responsive-optimized');
        $overlay.addClass('responsive-optimized');
    } else {
        $images.addClass('responsive-optimized');
        $slider.addClass('responsive-optimized');
        $handle.addClass('responsive-optimized');
        $overlay.addClass('responsive-optimized');
    }
    
    console.log(`=== 响应式图片容器调整 ===`);
    console.log(`设备类型: ${responsiveMode} (${windowWidth}x${windowHeight})`);
    console.log(`图片尺寸: ${imageWidth}x${imageHeight} (比例: ${imageRatio.toFixed(2)})`);
    console.log(`容器尺寸: ${finalContainerWidth}x${finalContainerHeight}`);
    console.log(`缩放模式: ${scalingApplied ? '同比例缩放' : '自适应显示'}`);
    console.log(`高度范围: ${minHeight}px - ${maxHeight}px`);
    
    // 容器尺寸调整完成后，修正遮罩层内图片宽度
    // 使用RAF确保平滑渲染
    requestAnimationFrame(() => {
        fixOverlayImageWidth();
        
        // 额外的移动端优化
        if (isMobile || isSmallScreen) {
            optimizeMobileDisplay();
        }
    });
}

// 移动端显示优化函数
function optimizeMobileDisplay() {
    const $container = $('.comparison-image-container');
    const $images = $('.comparison-image');
    
    // 检查容器是否过小
    const containerRect = $container[0].getBoundingClientRect();
    const windowWidth = $(window).width();
    
    if (containerRect.height < 180 && windowWidth <= 480) {
        // 超小屏幕特殊处理
        $container.addClass('ultra-compact-mode');
        $images.css({
            'object-fit': 'contain',
            'object-position': 'center center'
        });
        
        console.log('启用超紧凑模式以适应小屏幕');
    } else {
        $container.removeClass('ultra-compact-mode');
    }
}



function handleFileUpload(file) {
    console.log('Handling file upload:', file);
    
    if (!file) {
        showNotification('请选择一个文件！', 'error');
        return;
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type) && !file.type.match('image.*')) {
        showNotification('请选择图片文件！支持JPG、PNG、GIF、WebP格式', 'error');
        return;
    }
    
    // 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        showNotification(`文件大小${sizeMB}MB超过限制！请选择小于10MB的图片`, 'error');
        return;
    }
    
    // 显示上传中提示
    showNotification('正在处理图片...', 'info');
    
    // 添加上传状态指示
    const $uploadArea = $('#uploadArea');
    $uploadArea.addClass('uploading');
    
    // 读取文件
    const reader = new FileReader();
    
    reader.onerror = function(error) {
        console.error('File reading error:', error);
        showNotification('文件读取失败，请重试！', 'error');
        $uploadArea.removeClass('uploading');
    };
    
    reader.onabort = function() {
        console.log('File reading aborted');
        showNotification('文件读取被中断', 'warning');
        $uploadArea.removeClass('uploading');
    };
    
    reader.onload = function(e) {
        try {
            const imageSrc = e.target.result;
            
            // 验证是否为有效的图片数据
            if (!imageSrc || !imageSrc.startsWith('data:image/')) {
                throw new Error('Invalid image data');
            }
            
            // 创建临时图片对象验证图片是否可以正常加载
            const tempImg = new Image();
            
            tempImg.onerror = function() {
                showNotification('图片格式不支持或文件已损坏！', 'error');
                $uploadArea.removeClass('uploading');
            };
            
            tempImg.onload = function() {
                // 检查图片尺寸
                if (tempImg.width < 50 || tempImg.height < 50) {
                    showNotification('图片尺寸太小！请选择至少50x50像素的图片', 'error');
                    $uploadArea.removeClass('uploading');
                    return;
                }
                
                if (tempImg.width > 4096 || tempImg.height > 4096) {
                    showNotification('图片尺寸过大！请选择小于4096x4096像素的图片', 'warning');
                }
                
                // 更新图片显示
                const $originalImage = $('#original-image');
                const $resultImage = $('#result-image');
                
                // 重置容器样式
                resetImageContainer();
                
                // 移除之前的加载事件监听器
                $originalImage.off('load.upload error.upload');
                $resultImage.off('load.upload error.upload');
                
                // 上传时，背景和遮罩层都显示上传的原图（等待处理）
                $originalImage.attr('src', imageSrc);
                $resultImage.attr('src', imageSrc);
                
                // 滑块位置到中间
                $('#comparisonSlider').css('left', '50%');
                $('#comparisonOverlay').css('width', '50%');
                
                // 取消示例图片选中状态
                $('.sample-item').removeClass('active');
                
                // 图片加载完成后调整容器尺寸
                let imageLoadCount = 0;
                const onImageLoadComplete = function() {
                    imageLoadCount++;
                    if (imageLoadCount >= 2) {
                        setTimeout(() => {
                            adjustImageContainer();
                            showNotification(`图片上传成功！尺寸：${tempImg.width}x${tempImg.height}px`, 'success');
                            $uploadArea.removeClass('uploading');
                        }, 50);
                    }
                };
                
                $originalImage.on('load.upload', function() {
                    $(this).addClass('loaded');
                    onImageLoadComplete();
                }).on('error.upload', function() {
                    showNotification('原图加载失败！', 'error');
                    $uploadArea.removeClass('uploading');
                });
                
                $resultImage.on('load.upload', function() {
                    $(this).addClass('loaded');
                    onImageLoadComplete();
                }).on('error.upload', function() {
                    showNotification('结果图加载失败！', 'error');
                    $uploadArea.removeClass('uploading');
                });
                
                // 如果图片已经缓存，立即触发加载事件
                if ($originalImage[0].complete) {
                    $originalImage.addClass('loaded');
                    onImageLoadComplete();
                }
                if ($resultImage[0].complete) {
                    $resultImage.addClass('loaded');
                    onImageLoadComplete();
                }
            };
            
            tempImg.src = imageSrc;
            
        } catch (error) {
            console.error('Error processing uploaded file:', error);
            showNotification('图片处理失败，请重试！', 'error');
            $uploadArea.removeClass('uploading');
        }
    };
    
    // 开始读取文件
    try {
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error starting file read:', error);
        showNotification('无法读取文件，请重试！', 'error');
        $uploadArea.removeClass('uploading');
    }
}

function processImage() {
    const $btn = $('#processBtn');
    const $loading = $('#loadingOverlay');
    const $originalImage = $('#original-image'); // 背景，显示原图
    const $resultImage = $('#result-image'); // 遮罩层，将显示处理后的图片
    const $container = $('.comparison-image-container');
    const $slider = $('#comparisonSlider');
    const $overlay = $('#comparisonOverlay');
    
    // 禁用按钮
    $btn.prop('disabled', true);
    $btn.find('span').text('处理中...');
    
    // 显示加载动画
    $loading.addClass('active');
    
    // 暂时禁用滑块动画，避免加载时出现过渡效果
    $container.addClass('slider-no-animation');
    
    // 获取当前的原图（从背景层获取）
    const currentOriginalSrc = $originalImage.attr('src');
    
    // 模拟处理过程
    setTimeout(function() {
        // 模拟处理结果（这里应该调用实际的API）
        const processedSrc = simulateImageProcessing(currentOriginalSrc);
        
        // 更新遮罩层图片为处理后的结果
        $resultImage.attr('src', processedSrc);
        
        // 结果图片加载完成后调整容器
        $resultImage.off('load.process').on('load.process', function() {
            // 使用RAF确保浏览器有时间处理新图像
            requestAnimationFrame(() => {
                adjustImageContainer();
                // 容器调整后修正遮罩层图片宽度
                fixOverlayImageWidth();
                
                // 隐藏加载动画
                $loading.removeClass('active');
                
                // 恢复按钮
                $btn.prop('disabled', false);
                $btn.find('span').text('立即生成');
                
                // 移除禁用动画类
                $container.removeClass('slider-no-animation');
                
                // 设置滑块到中间位置以显示对比效果
                $slider.css('left', '50%');
                $overlay.css('width', '50%');
                
                // 显示成功提示
                showNotification('图片处理完成！左侧为处理后效果，右侧为原图', 'success');
                
                // 滚动到结果区域
                $('html, body').animate({
                    scrollTop: $('.comparison-image-container').offset().top - 100
                }, 800);
                
                // 不再调用动画提示函数
                // animateSliderHint();
            });
        });
    }, 3000); // 模拟3秒处理时间
}

// 滑块提示动画 - 完全禁用，不再显示动画
function animateSliderHint() {
    // 函数保留但不执行任何动画，仅保持固定在中间位置
    const $slider = $('#comparisonSlider');
    const $overlay = $('#comparisonOverlay');
    
    // 确保滑块在中间位置
    $slider.css('left', '50%');
    $overlay.css('width', '50%');
    
    // 确保图片对齐
    fixOverlayImageWidth();
}

function simulateImageProcessing(originalSrc) {
    // 这里应该调用实际的图像处理API
    // 现在只是返回一个模拟的处理结果
    
    // 如果是示例图片，返回对应的结果图片
    const $activeItem = $('.sample-item.active');
    if ($activeItem.length > 0) {
        const resultSrc = $activeItem.data('result');
        if (resultSrc) {
            return resultSrc;
        }
    }
    
    // 否则返回原图（实际应用中这里会是处理后的图片）
    return originalSrc;
}

function showNotification(message, type = 'info') {
    // 创建通知元素
    const $notification = $(`
        <div class="notification notification-${type}">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `);
    
    // 添加样式
    $notification.css({
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // 添加到页面
    $('body').append($notification);
    
    // 显示动画
    setTimeout(() => {
        $notification.css('transform', 'translateX(0)');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        $notification.css('transform', 'translateX(100%)');
        setTimeout(() => {
            $notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || colors.info;
}

// 图片预加载
function preloadImages() {
    const imageUrls = [
        'decorate/project1.jpg',
        'decorate/project2.jpg',
        'decorate/project3.jpg',
        'decorate/project4.jpg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// 页面加载完成后预加载图片
$(window).on('load', function() {
    preloadImages();
});

// 添加页面动画效果
function addPageAnimations() {
    // 滚动动画
    $(window).scroll(function() {
        const scrollTop = $(this).scrollTop();
        const windowHeight = $(this).height();
        
        $('.demo-container, .doc-item').each(function() {
            const elementTop = $(this).offset().top;
            const elementHeight = $(this).height();
            
            if (scrollTop + windowHeight > elementTop + elementHeight / 4) {
                $(this).addClass('animate-in');
            }
        });
    });
}

// 初始化动画
$(document).ready(function() {
    addPageAnimations();
});

// 响应式处理 - 优化版本
function handleResponsive() {
    const windowWidth = $(window).width();
    const windowHeight = window.innerHeight;
    const isUltraSmall = windowWidth <= 360;
    const isSmallScreen = windowWidth <= 480;
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth <= 1024;
    
    const $container = $('.comparison-image-container');
    
    // 移除所有响应式类
    $container.removeClass('mobile-layout small-screen ultra-compact-mode responsive-scaling width-adjusted small-screen-optimized');
    
    // 根据屏幕尺寸应用相应的类
    if (isUltraSmall) {
        $container.addClass('mobile-layout small-screen small-screen-optimized');
        console.log('应用超小屏幕布局 (≤360px)');
    } else if (isSmallScreen) {
        $container.addClass('mobile-layout small-screen');
        console.log('应用小屏幕布局 (≤480px)');
    } else if (isMobile) {
        $container.addClass('mobile-layout');
        console.log('应用移动端布局 (≤768px)');
    } else if (isTablet) {
        console.log('应用平板布局 (≤1024px)');
    } else {
        console.log('应用桌面端布局 (>1024px)');
    }
    
    // 处理导航菜单
    if (!isMobile) {
        $('.main-navigation').removeClass('toggled');
        $('.mobile-navigation').removeClass('show');
    }
    
    // 响应式变化时重新调整图片容器
    // 使用RAF确保平滑渲染，并添加延迟以确保CSS类生效
    requestAnimationFrame(() => {
        setTimeout(() => {
            enhancedAdjustImageContainer();
            
            // 检查是否需要启用超紧凑模式
            if (isUltraSmall || isSmallScreen) {
                setTimeout(() => {
                    optimizeMobileDisplay();
                }, 100);
            }
        }, 50);
    });
    
    console.log(`响应式处理完成: ${windowWidth}x${windowHeight}, 设备类型: ${getDeviceType(windowWidth)}`);
}

// 获取设备类型的辅助函数
function getDeviceType(width) {
    if (width <= 360) return 'ultra-small';
    if (width <= 480) return 'small';
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    if (width >= 1200) return 'large';
    return 'medium';
}

// 优化resize事件处理，避免频繁调用 - 响应式优化版本
let resizeTimer;
let lastWindowSize = { width: $(window).width(), height: $(window).height() };

$(window).resize(function() {
    clearTimeout(resizeTimer);
    
    const currentSize = { width: $(window).width(), height: $(window).height() };
    
    // 检查是否有显著的尺寸变化
    const widthChange = Math.abs(currentSize.width - lastWindowSize.width);
    const heightChange = Math.abs(currentSize.height - lastWindowSize.height);
    
    // 检测设备类型变化（移动端 ↔ 桌面端切换）
    const wasDesktop = lastWindowSize.width > 768;
    const isDesktop = currentSize.width > 768;
    const deviceTypeChanged = wasDesktop !== isDesktop;
    
    // 如果是设备类型切换，立即处理；否则根据变化大小决定延迟
    const isSignificantChange = widthChange > 50 || heightChange > 50 || deviceTypeChanged;
    const delay = deviceTypeChanged ? 50 : (isSignificantChange ? 150 : 300);
    
    resizeTimer = setTimeout(function() {
        console.log(`=== 窗口尺寸变化 ===`);
        console.log(`从 ${lastWindowSize.width}x${lastWindowSize.height} 变为 ${currentSize.width}x${currentSize.height}`);
        console.log(`变化量: 宽度${widthChange}px, 高度${heightChange}px`);
        
        if (deviceTypeChanged) {
            console.log(`🔄 检测到设备类型切换: ${wasDesktop ? '桌面端' : '移动端'} → ${isDesktop ? '桌面端' : '移动端'}`);
            
            // 使用专用的设备切换处理函数
            handleDeviceSwitch(!wasDesktop, !isDesktop);
        }
        
        // 更新响应式布局
        handleResponsive();
        
        // 重置相关缓存和状态
        resetOverlayImageCache();
        lastContainerState = null;
        
        // 延迟执行图片容器调整，确保响应式类已生效
        const adjustmentDelay = deviceTypeChanged ? 200 : 100;
        setTimeout(() => {
            requestAnimationFrame(() => {
                enhancedAdjustImageContainer();
                
                // 设备切换时强制重新对齐
                if (deviceTypeChanged) {
                    forceImagePerfectOverlap();
                }
                
                fixOverlayImageWidth();
                
                // 触发自适应修复
                setTimeout(() => {
                    triggerAdaptiveFix();
                }, 150);
            });
        }, adjustmentDelay);
        
        // 更新记录的窗口尺寸
        lastWindowSize = currentSize;
        
    }, delay);
});

// 进度条功能
function initProgressBar() {
    // 页面滚动进度条
    window.onscroll = function() {
        updateProgressBar();
        scrollFunction();
        updateHeaderStyle();
    };
    
    function updateProgressBar() {
        var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var scrolled = (winScroll / height) * 100;
        if (document.getElementById("progressBar")) {
            document.getElementById("progressBar").style.width = scrolled + "%";
        }
    }
    
    // 回到顶部按钮显示/隐藏
    function scrollFunction() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            document.getElementById("scrollTop").classList.add("active");
        } else {
            document.getElementById("scrollTop").classList.remove("active");
        }
    }
    
    // 导航栏滚动效果
    function updateHeaderStyle() {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            document.querySelector('.site-header').classList.add('scrolled');
        } else {
            document.querySelector('.site-header').classList.remove('scrolled');
        }
    }
}

// 修正遮罩层内图片宽度，确保完全重叠覆盖 - 完全重叠优化版本
let overlayImageWidthCache = null;
let overlayImageFixTimer = null;

function fixOverlayImageWidth() {
    // 节流处理，避免频繁调用
    if (overlayImageFixTimer) {
        clearTimeout(overlayImageFixTimer);
    }
    
    overlayImageFixTimer = setTimeout(() => {
        const $container = $('.comparison-image-container');
        const $resultImage = $('#result-image');
        const $originalImage = $('#original-image');
        
        if ($container.length === 0 || $resultImage.length === 0) {
            return;
        }
        
        const containerElement = $container[0];
        const resultImageElement = $resultImage[0];
        const originalImageElement = $originalImage[0];
        
        // 使用getBoundingClientRect获取实际渲染宽度
        const containerRect = containerElement.getBoundingClientRect();
        const containerWidth = Math.round(containerRect.width);
        const containerHeight = Math.round(containerRect.height);
        
        // 缓存机制：如果宽度没有变化，跳过更新
        if (overlayImageWidthCache === containerWidth) {
            return;
        }
        
        // 检查是否启用了完全重叠模式
        const isPerfectOverlap = $container.hasClass('perfect-overlap');
        
        if (isPerfectOverlap) {
            // 完全重叠模式：确保两张图片使用完全相同的尺寸和位置
            const imageStyle = {
                width: containerWidth + 'px',
                height: containerHeight + 'px',
                position: 'absolute',
                left: '0px',
                top: '0px',
                objectFit: 'cover',
                objectPosition: 'center center'
            };
            
            // 同步应用样式到两张图片
            Object.assign(originalImageElement.style, imageStyle);
            Object.assign(resultImageElement.style, imageStyle);
            
            console.log('完全重叠模式：两张图片尺寸已同步为', containerWidth + 'x' + containerHeight + 'px');
        } else {
            // 标准模式：只调整结果图片宽度
            const resultImageStyle = resultImageElement.style;
            resultImageStyle.width = containerWidth + 'px';
            resultImageStyle.position = 'absolute';
            resultImageStyle.left = '0';
            resultImageStyle.top = '0';
            
            console.log('标准模式：遮罩层图片宽度已修正为', containerWidth + 'px');
        }
        
        // 更新缓存
        overlayImageWidthCache = containerWidth;
        
        overlayImageFixTimer = null;
    }, 50); // 50ms延迟，避免频繁调用
}

// 重置缓存的函数
function resetOverlayImageCache() {
    overlayImageWidthCache = null;
    if (overlayImageFixTimer) {
        clearTimeout(overlayImageFixTimer);
        overlayImageFixTimer = null;
    }
}

// 滑块自适应检测和修复系统
let adaptiveCheckTimer = null;
let lastContainerState = null;

// 检测容器状态变化
function detectContainerChanges() {
    const $container = $('.comparison-image-container');
    if ($container.length === 0) return null;
    
    const containerRect = $container[0].getBoundingClientRect();
    return {
        width: Math.round(containerRect.width),
        height: Math.round(containerRect.height),
        left: Math.round(containerRect.left),
        top: Math.round(containerRect.top)
    };
}

// 智能自适应修复滑块
function adaptiveSliderFix() {
    const currentState = detectContainerChanges();
    if (!currentState) return;
    
    // 如果是首次检测或容器状态发生变化
    if (!lastContainerState || 
        currentState.width !== lastContainerState.width ||
        currentState.height !== lastContainerState.height) {
        
        console.log('检测到容器尺寸变化，执行自适应修复...');
        console.log('旧状态:', lastContainerState);
        console.log('新状态:', currentState);
        
        // 重置所有缓存
        resetOverlayImageCache();
        overlayImageWidthCache = null;
        
        // 修复滑块位置和遮罩层
        requestAnimationFrame(() => {
            fixSliderAlignment();
            fixOverlayImageWidth();
            
            // 验证修复结果
            setTimeout(() => {
                validateSliderAlignment();
            }, 100);
        });
        
        lastContainerState = currentState;
    }
}

// 修复滑块对齐
function fixSliderAlignment() {
    const $container = $('.comparison-image-container');
    const $slider = $('#comparisonSlider');
    const $overlay = $('#comparisonOverlay');
    
    if ($container.length === 0 || $slider.length === 0 || $overlay.length === 0) {
        return;
    }
    
    // 获取当前滑块位置百分比
    const currentLeft = $slider.css('left');
    const currentWidth = $overlay.css('width');
    
    // 如果位置值不是百分比格式，重置为50%
    if (!currentLeft.includes('%') || !currentWidth.includes('%')) {
        console.log('检测到滑块位置异常，重置为中间位置');
        $slider.css('left', '50%');
        $overlay.css('width', '50%');
        return;
    }
    
    // 强制重新应用样式，确保渲染正确
    const leftPercentage = currentLeft;
    const widthPercentage = currentWidth;
    
    // 临时移除过渡效果
    $container.addClass('fixing-alignment');
    
    // 重新设置位置
    $slider[0].style.left = leftPercentage;
    $overlay[0].style.width = widthPercentage;
    
    // 恢复过渡效果
    setTimeout(() => {
        $container.removeClass('fixing-alignment');
    }, 50);
    
    console.log(`滑块位置已修复: left=${leftPercentage}, width=${widthPercentage}`);
}

// 验证滑块对齐是否正确
function validateSliderAlignment() {
    const $container = $('.comparison-image-container');
    const $slider = $('#comparisonSlider');
    const $overlay = $('#comparisonOverlay');
    
    if ($container.length === 0) return;
    
    const containerRect = $container[0].getBoundingClientRect();
    const sliderRect = $slider[0].getBoundingClientRect();
    const overlayRect = $overlay[0].getBoundingClientRect();
    
    // 计算滑块中心位置
    const sliderCenter = sliderRect.left + sliderRect.width / 2;
    const expectedOverlayWidth = sliderCenter - containerRect.left;
    const actualOverlayWidth = overlayRect.width;
    
    // 允许2px的误差（增加容差）
    const tolerance = 2;
    const isAligned = Math.abs(expectedOverlayWidth - actualOverlayWidth) <= tolerance;
    
    if (!isAligned) {
        console.warn('滑块对齐验证失败，执行强制修复...');
        console.log(`期望遮罩宽度: ${expectedOverlayWidth}px, 实际宽度: ${actualOverlayWidth}px`);
        
        // 显示警告状态
        $container.addClass('alignment-warning');
        
        // 强制修复
        const correctPercentage = (expectedOverlayWidth / containerRect.width) * 100;
        $slider.css('left', correctPercentage + '%');
        $overlay.css('width', correctPercentage + '%');
        
        // 重新修正图片宽度
        setTimeout(() => {
            fixOverlayImageWidth();
            
            // 移除警告状态，显示成功状态
            $container.removeClass('alignment-warning').addClass('alignment-success');
            
            // 3秒后移除成功状态
            setTimeout(() => {
                $container.removeClass('alignment-success');
            }, 2000);
        }, 50);
    } else {
        console.log('滑块对齐验证通过 ✓');
        
        // 确保移除所有状态类
        $container.removeClass('alignment-warning alignment-success');
    }
}

// 启动自适应监控
function startAdaptiveMonitoring() {
    // 清除之前的定时器
    if (adaptiveCheckTimer) {
        clearInterval(adaptiveCheckTimer);
    }
    
    // 初始化状态
    lastContainerState = detectContainerChanges();
    
    // 定期检测（每500ms检查一次，性能友好）
    adaptiveCheckTimer = setInterval(() => {
        adaptiveSliderFix();
    }, 500);
    
    console.log('滑块自适应监控已启动');
}

// 停止自适应监控
function stopAdaptiveMonitoring() {
    if (adaptiveCheckTimer) {
        clearInterval(adaptiveCheckTimer);
        adaptiveCheckTimer = null;
        console.log('滑块自适应监控已停止');
    }
}

// 手动触发自适应修复
function triggerAdaptiveFix() {
    console.log('手动触发滑块自适应修复...');
    adaptiveSliderFix();
}

// 处理设备类型切换的专用函数
function handleDeviceSwitch(fromMobile, toMobile) {
    console.log(`=== 设备切换处理 ===`);
    console.log(`从 ${fromMobile ? '移动端' : '桌面端'} 切换到 ${toMobile ? '移动端' : '桌面端'}`);
    
    const $container = $('.comparison-image-container');
    
    // 完全重置容器状态
    resetImageContainer();
    
    // 清除所有缓存
    resetOverlayImageCache();
    lastContainerState = null;
    overlayImageWidthCache = null;
    
    // 如果切换到桌面端，确保容器能够使用全宽
    if (!toMobile) {
        const $parentContainer = $container.parent();
        const parentWidth = $parentContainer.width();
        
        // 强制重置容器宽度为父容器宽度
        $container.css({
            width: '100%',
            maxWidth: '100%',
            minWidth: 'auto'
        });
        
        console.log(`桌面端模式：容器宽度重置为父容器宽度 (${parentWidth}px)`);
    }
    
    // 延迟重新计算布局
    setTimeout(() => {
        requestAnimationFrame(() => {
            // 重新调整容器
            enhancedAdjustImageContainer();
            
            // 强制图片重新对齐
            setTimeout(() => {
                forceImagePerfectOverlap();
                
                // 验证最终效果
                setTimeout(() => {
                    validateImageOverlap();
                }, 200);
            }, 100);
        });
    }, 100);
    
    console.log('设备切换处理完成');
}

// 强制图片完全重叠 - 确保像素级对齐
function forceImagePerfectOverlap() {
    const $container = $('.comparison-image-container');
    const $originalImage = $('#original-image');
    const $resultImage = $('#result-image');
    
    if ($container.length === 0 || $originalImage.length === 0 || $resultImage.length === 0) {
        return;
    }
    
    // 获取容器的精确尺寸
    const containerRect = $container[0].getBoundingClientRect();
    const containerWidth = Math.round(containerRect.width);
    const containerHeight = Math.round(containerRect.height);
    
    // 强制设置相同的样式参数
    const perfectOverlapStyle = {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: containerWidth + 'px',
        height: containerHeight + 'px',
        objectFit: 'cover',
        objectPosition: 'center center',
        transform: 'translateZ(0)', // 硬件加速
        imageRendering: '-webkit-optimize-contrast'
    };
    
    // 同步应用到两张图片
    Object.assign($originalImage[0].style, perfectOverlapStyle);
    Object.assign($resultImage[0].style, perfectOverlapStyle);
    
    // 添加完全重叠样式类
    $container.addClass('perfect-overlap');
    $originalImage.addClass('force-cover');
    $resultImage.addClass('force-cover');
    
    console.log(`强制图片完全重叠: ${containerWidth}x${containerHeight}px`);
    console.log('原图和结果图已设置为完全相同的显示参数');
    
    // 验证重叠效果
    setTimeout(() => {
        validateImageOverlap();
    }, 100);
}

// 验证图片重叠效果
function validateImageOverlap() {
    const $container = $('.comparison-image-container');
    const $originalImage = $('#original-image');
    const $resultImage = $('#result-image');
    
    if ($container.length === 0) return;
    
    const containerRect = $container[0].getBoundingClientRect();
    const originalRect = $originalImage[0].getBoundingClientRect();
    const resultRect = $resultImage[0].getBoundingClientRect();
    
    // 检查尺寸是否完全一致（允许1px误差）
    const tolerance = 1;
    const widthMatch = Math.abs(originalRect.width - resultRect.width) <= tolerance;
    const heightMatch = Math.abs(originalRect.height - resultRect.height) <= tolerance;
    const positionMatch = Math.abs(originalRect.left - resultRect.left) <= tolerance && 
                         Math.abs(originalRect.top - resultRect.top) <= tolerance;
    
    if (widthMatch && heightMatch && positionMatch) {
        console.log('✅ 图片重叠验证通过 - 两张图片完全对齐');
        $container.removeClass('alignment-warning').addClass('alignment-success');
        
        // 3秒后移除成功状态
        setTimeout(() => {
            $container.removeClass('alignment-success');
        }, 3000);
    } else {
        console.warn('❌ 图片重叠验证失败');
        console.log('原图尺寸:', originalRect.width + 'x' + originalRect.height);
        console.log('结果图尺寸:', resultRect.width + 'x' + resultRect.height);
        console.log('位置偏差:', Math.abs(originalRect.left - resultRect.left), Math.abs(originalRect.top - resultRect.top));
        
        $container.addClass('alignment-warning');
        
        // 重新强制对齐
        setTimeout(() => {
            forceImagePerfectOverlap();
        }, 200);
    }
}

// 在关键时机触发自适应检测
function enhancedAdjustImageContainer() {
    // 先执行原有的容器调整
    adjustImageContainer();
    
    // 延迟执行自适应修复
    setTimeout(() => {
        triggerAdaptiveFix();
    }, 100);
}

// 增强版图片加载函数
function enhancedLoadSampleImage($item) {
    const originalSrc = $item.data('original') || $item.find('img').attr('src');
    const resultSrc = $item.data('result') || $item.find('img').attr('src');
    
    // 更新图片：左侧处理后，右侧原图的遮罩逻辑
    // 背景显示原图，遮罩层显示处理后的图片
    const $originalImage = $('#original-image');
    const $resultImage = $('#result-image');
    
    // 重置容器样式
    resetImageContainer();
    
    // 正确分配：背景显示原图，遮罩层显示处理后的结果
    $originalImage.attr('src', originalSrc);
    $resultImage.attr('src', resultSrc);
    
    // 初始滑块位置到中间 - 左侧显示处理后，右侧显示原图
    $('#comparisonSlider').css('left', '50%');
    $('#comparisonOverlay').css('width', '50%');
    
    // 重置自适应状态
    lastContainerState = null;
    
    // 预先启用完全重叠模式（图片加载前）
    const $container = $('.comparison-image-container');
    $container.addClass('perfect-overlap');
    
    // 图片加载完成后调整容器尺寸
    let loadedCount = 0;
    function onImageLoad() {
        loadedCount++;
        if (loadedCount === 2) {
            // 延迟调整，确保DOM更新完成
            setTimeout(() => {
                enhancedAdjustImageContainer();
                
                // 确保图片完全重叠
                forceImagePerfectOverlap();
            }, 50);
            
            // 额外的自适应检测
            setTimeout(() => {
                triggerAdaptiveFix();
            }, 200);
        }
    }
    
    $originalImage.off('load').on('load', function() {
        $(this).addClass('loaded');
        onImageLoad();
    });
    
    $resultImage.off('load').on('load', function() {
        $(this).addClass('loaded');
        onImageLoad();
    });
    
    // 如果图片已经缓存，立即触发加载事件
    if ($originalImage[0].complete) {
        $originalImage.addClass('loaded');
        loadedCount++;
    }
    if ($resultImage[0].complete) {
        $resultImage.addClass('loaded');
        loadedCount++;
    }
    if (loadedCount === 2) {
        setTimeout(() => {
            enhancedAdjustImageContainer();
        }, 50);
        
        setTimeout(() => {
            triggerAdaptiveFix();
        }, 200);
    }
}

// 调试工具：查看滑块状态
window.debugSliderAlignment = function() {
    const $container = $('.comparison-image-container');
    const $slider = $('#comparisonSlider');
    const $overlay = $('#comparisonOverlay');
    
    if ($container.length === 0) {
        console.log('❌ 容器未找到');
        return;
    }
    
    const containerRect = $container[0].getBoundingClientRect();
    const sliderRect = $slider[0].getBoundingClientRect();
    const overlayRect = $overlay[0].getBoundingClientRect();
    
    console.log('=== 滑块对齐状态调试 ===');
    console.log('容器:', {
        width: containerRect.width,
        height: containerRect.height,
        left: containerRect.left,
        top: containerRect.top
    });
    
    console.log('滑块:', {
        width: sliderRect.width,
        height: sliderRect.height,
        left: sliderRect.left,
        center: sliderRect.left + sliderRect.width / 2,
        cssLeft: $slider.css('left')
    });
    
    console.log('遮罩层:', {
        width: overlayRect.width,
        cssWidth: $overlay.css('width')
    });
    
    const sliderCenter = sliderRect.left + sliderRect.width / 2;
    const expectedOverlayWidth = sliderCenter - containerRect.left;
    const actualOverlayWidth = overlayRect.width;
    const difference = Math.abs(expectedOverlayWidth - actualOverlayWidth);
    
    console.log('对齐分析:', {
        expectedOverlayWidth: expectedOverlayWidth,
        actualOverlayWidth: actualOverlayWidth,
        difference: difference,
        isAligned: difference <= 2,
        status: difference <= 2 ? '✅ 对齐正确' : '❌ 对齐错误'
    });
    
    console.log('自适应状态:', {
        monitoringActive: adaptiveCheckTimer !== null,
        lastContainerState: lastContainerState,
        overlayImageWidthCache: overlayImageWidthCache
    });
};

// 调试工具：手动触发完整修复
window.debugFullRepair = function() {
    console.log('=== 执行完整滑块修复 ===');
    
    // 重置所有状态
    lastContainerState = null;
    resetOverlayImageCache();
    
    // 执行完整修复流程
    setTimeout(() => {
        console.log('1. 调整容器尺寸...');
        enhancedAdjustImageContainer();
    }, 0);
    
    setTimeout(() => {
        console.log('2. 修复滑块对齐...');
        fixSliderAlignment();
    }, 100);
    
    setTimeout(() => {
        console.log('3. 修正图片宽度...');
        fixOverlayImageWidth();
    }, 200);
    
    setTimeout(() => {
        console.log('4. 验证对齐结果...');
        validateSliderAlignment();
    }, 300);
    
    setTimeout(() => {
        console.log('5. 显示最终状态...');
        window.debugSliderAlignment();
    }, 500);
};

// 调试工具：切换自适应监控
window.debugToggleMonitoring = function() {
    if (adaptiveCheckTimer) {
        stopAdaptiveMonitoring();
        console.log('🔴 自适应监控已停止');
    } else {
        startAdaptiveMonitoring();
        console.log('🟢 自适应监控已启动');
    }
};

// 调试工具：强制图片完全重叠
window.debugForceOverlap = function() {
    console.log('=== 强制图片完全重叠 ===');
    forceImagePerfectOverlap();
};

// 调试工具：验证图片重叠状态
window.debugValidateOverlap = function() {
    console.log('=== 验证图片重叠状态 ===');
    validateImageOverlap();
};

// 调试工具：查看图片详细信息
window.debugImageInfo = function() {
    const $container = $('.comparison-image-container');
    const $originalImage = $('#original-image');
    const $resultImage = $('#result-image');
    const $parent = $container.parent();
    
    console.log('=== 图片详细信息 ===');
    console.log('父容器信息:', {
        width: $parent.width(),
        rect: $parent[0].getBoundingClientRect()
    });
    
    console.log('容器信息:', {
        classes: $container[0].className,
        rect: $container[0].getBoundingClientRect(),
        cssWidth: $container.css('width'),
        cssHeight: $container.css('height'),
        perfectOverlap: $container.hasClass('perfect-overlap')
    });
    
    console.log('原图信息:', {
        src: $originalImage.attr('src'),
        naturalSize: $originalImage[0].naturalWidth + 'x' + $originalImage[0].naturalHeight,
        displaySize: $originalImage[0].getBoundingClientRect().width + 'x' + $originalImage[0].getBoundingClientRect().height,
        style: {
            width: $originalImage[0].style.width,
            height: $originalImage[0].style.height,
            objectFit: $originalImage[0].style.objectFit
        }
    });
    
    console.log('结果图信息:', {
        src: $resultImage.attr('src'),
        naturalSize: $resultImage[0].naturalWidth + 'x' + $resultImage[0].naturalHeight,
        displaySize: $resultImage[0].getBoundingClientRect().width + 'x' + $resultImage[0].getBoundingClientRect().height,
        style: {
            width: $resultImage[0].style.width,
            height: $resultImage[0].style.height,
            objectFit: $resultImage[0].style.objectFit
        }
    });
};

// 调试工具：模拟设备切换
window.debugDeviceSwitch = function(toMobile = false) {
    console.log('=== 模拟设备切换 ===');
    const currentWidth = $(window).width();
    const isMobile = currentWidth <= 768;
    
    if (toMobile === isMobile) {
        console.log(`当前已经是${toMobile ? '移动端' : '桌面端'}模式`);
        return;
    }
    
    handleDeviceSwitch(isMobile, toMobile);
};

// 调试工具：重置容器尺寸
window.debugResetContainer = function() {
    console.log('=== 重置容器尺寸 ===');
    resetImageContainer();
    setTimeout(() => {
        enhancedAdjustImageContainer();
        setTimeout(() => {
            forceImagePerfectOverlap();
        }, 100);
    }, 50);
};

// 在控制台显示可用的调试命令
console.log('=== 雨雾去除调试工具已加载 ===');
console.log('滑块调试:');
console.log('debugSliderAlignment() - 查看当前对齐状态');
console.log('debugFullRepair() - 执行完整修复流程');
console.log('debugToggleMonitoring() - 切换自适应监控');
console.log('triggerAdaptiveFix() - 手动触发自适应修复');
console.log('');
console.log('图片重叠调试:');
console.log('debugForceOverlap() - 强制图片完全重叠');
console.log('debugValidateOverlap() - 验证图片重叠状态');
console.log('debugImageInfo() - 查看图片详细信息');
console.log('');
console.log('设备切换调试:');
console.log('debugDeviceSwitch(false) - 模拟切换到桌面端');
console.log('debugDeviceSwitch(true) - 模拟切换到移动端');
console.log('debugResetContainer() - 重置容器尺寸');
console.log('=====================================');