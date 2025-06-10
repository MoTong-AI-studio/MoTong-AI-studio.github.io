// 雨雾去除页面交互功能

$(document).ready(function() {
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true
    });
    
    // 克隆主导航到移动导航
    $(".main-navigation > .menu").clone().appendTo(".mobile-navigation");
    
    // 初始化
    initializePage();
    
    // 绑定事件
    bindEvents();
    
    // 初始化图像对比滑块
    initImageComparison();
    
    // 初始化进度条
    initProgressBar();
    
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
    

});

function initializePage() {
    // 设置默认图片
    loadSampleImage($('.sample-item.active'));
    
    // 延迟调整图片容器，确保DOM完全加载
    setTimeout(function() {
        adjustImageContainer();
        // 初始化时修正遮罩层图片宽度
        fixOverlayImageWidth();
    }, 500);
}

// 图像对比滑块功能
function initImageComparison() {
    const slider = $('#comparisonSlider');
    const overlay = $('#comparisonOverlay');
    const container = $('.comparison-image-container');
    let isDragging = false;
    
    // 鼠标按下事件
    container.on('mousedown', function(e) {
        isDragging = true;
        updateSliderPosition(e);
        $(document).on('mousemove', handleMouseMove);
        $(document).on('mouseup', handleMouseUp);
        e.preventDefault();
    });
    
    // 触摸事件支持
    container.on('touchstart', function(e) {
        isDragging = true;
        const touch = e.originalEvent.touches[0];
        updateSliderPosition(touch);
        $(document).on('touchmove', handleTouchMove);
        $(document).on('touchend', handleTouchEnd);
        e.preventDefault();
    });
    
    function handleMouseMove(e) {
        if (isDragging) {
            updateSliderPosition(e);
        }
    }
    
    function handleTouchMove(e) {
        if (isDragging) {
            const touch = e.originalEvent.touches[0];
            updateSliderPosition(touch);
            e.preventDefault();
        }
    }
    
    function handleMouseUp() {
        isDragging = false;
        $(document).off('mousemove', handleMouseMove);
        $(document).off('mouseup', handleMouseUp);
    }
    
    function handleTouchEnd() {
        isDragging = false;
        $(document).off('touchmove', handleTouchMove);
        $(document).off('touchend', handleTouchEnd);
    }
    
    function updateSliderPosition(e) {
        const containerRect = container[0].getBoundingClientRect();
        const x = (e.clientX || e.pageX) - containerRect.left;
        const percentage = Math.max(0, Math.min(100, (x / containerRect.width) * 100));
        
        // 更新滑块位置
        slider.css('left', percentage + '%');
        
        // 遮罩逻辑：滑条左侧显示处理后图片，右侧显示原图
        // 遮罩宽度 = 滑块位置百分比
        // 滑块在左边(0%)时：遮罩宽度0%，完全显示背景原图
        // 滑块在右边(100%)时：遮罩宽度100%，完全显示遮罩处理后图片
        overlay.css('width', percentage + '%');
        
        // 修正遮罩层内图片宽度
        fixOverlayImageWidth();
    }
    
    // 重置滑块位置
    $('#resetSlider').on('click', function() {
        slider.css('left', '50%');
        overlay.css('width', '50%');
        
        // 修正遮罩层内图片宽度
        fixOverlayImageWidth();
        
        showNotification('对比滑块已重置到中间位置', 'info');
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
}

function bindEvents() {
    // 移动端菜单切换
    $('.menu-toggle').on('click', function() {
        $('.main-navigation').toggleClass('toggled');
        $('.mobile-navigation').slideToggle();
        $(this).toggleClass('active');
    });
    
    // 点击菜单项后关闭移动端菜单
    $('.mobile-navigation .menu-item a').on('click', function() {
        $('.mobile-navigation').slideUp();
        $('.main-navigation').removeClass('toggled');
        $('.menu-toggle').removeClass('active');
    });
    
    // 示例图片选择
    $('.sample-item').on('click', function() {
        $('.sample-item').removeClass('active');
        $(this).addClass('active');
        loadSampleImage($(this));
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
        
        // 导航栏滚动效果
        if (scrollTop > 50) {
            $('.site-header').addClass('scrolled');
        } else {
            $('.site-header').removeClass('scrolled');
        }
    });
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
    
    // 正确分配：背景显示原图，遮罩层显示处理后结果
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
    
    // 重置所有自定义样式
    $container.css({
        width: '',
        height: '',
        maxWidth: '',
        margin: ''
    });
    
    // 移除特殊样式类
    $container.removeClass('width-adjusted');
}

function adjustImageContainer() {
    const $container = $('.comparison-image-container');
    const $originalImage = $('#original-image')[0];
    
    if (!$originalImage || !$originalImage.complete) return;
    
    const containerWidth = $container.width();
    const imageWidth = $originalImage.naturalWidth;
    const imageHeight = $originalImage.naturalHeight;
    
    if (imageWidth === 0 || imageHeight === 0) return;
    
    // 计算图片的宽高比
    const imageRatio = imageWidth / imageHeight;
    
    // 设置合理的高度范围（响应式）
    const isMobile = $(window).width() <= 768;
    const isSmallScreen = $(window).width() <= 480;
    
    let minHeight, maxHeight;
    if (isSmallScreen) {
        minHeight = 200;
        maxHeight = Math.min(window.innerHeight * 0.5, 400);
    } else if (isMobile) {
        minHeight = 250;
        maxHeight = Math.min(window.innerHeight * 0.6, 500);
    } else {
        minHeight = 300;
        maxHeight = Math.min(window.innerHeight * 0.8, 700);
    }
    
    // 根据图片宽高比计算理想的容器高度
    let idealHeight = containerWidth / imageRatio;
    
    // 智能调整策略
    let finalContainerHeight;
    let finalContainerWidth = containerWidth;
    
    if (idealHeight <= maxHeight && idealHeight >= minHeight) {
        // 理想高度在合理范围内，直接使用
        finalContainerHeight = idealHeight;
    } else if (idealHeight > maxHeight) {
        // 图片太高，限制高度，可能会有轻微裁剪
        finalContainerHeight = maxHeight;
        // 计算在最大高度下的理想宽度
        const idealWidth = maxHeight * imageRatio;
        if (idealWidth < containerWidth) {
            // 如果理想宽度小于容器宽度，调整容器宽度以减少裁剪
            finalContainerWidth = Math.max(idealWidth, containerWidth * 0.8);
        }
    } else {
        // 图片太矮，使用最小高度
        finalContainerHeight = minHeight;
    }
    
    // 应用尺寸
    $container.css({
        height: finalContainerHeight + 'px',
        width: finalContainerWidth + 'px',
        maxWidth: '100%' // 确保不超出父容器
    });
    
    // 如果容器宽度被调整，添加特殊样式类
    if (finalContainerWidth < containerWidth) {
        $container.addClass('width-adjusted');
    } else {
        $container.removeClass('width-adjusted');
    }
    
    console.log(`图片尺寸: ${imageWidth}x${imageHeight} (比例: ${imageRatio.toFixed(2)})`);
    console.log(`容器尺寸: ${finalContainerWidth}x${finalContainerHeight}`);
    console.log(`裁剪程度: ${idealHeight > maxHeight ? '轻微垂直裁剪' : '完整显示'}`);
    
    // 容器尺寸调整完成后，修正遮罩层内图片宽度
    setTimeout(() => {
        fixOverlayImageWidth();
    }, 50);
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
    
    // 禁用按钮
    $btn.prop('disabled', true);
    $btn.find('span').text('处理中...');
    
    // 显示加载动画
    $loading.addClass('active');
    
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
            setTimeout(() => {
                adjustImageContainer();
                // 容器调整后修正遮罩层图片宽度
                fixOverlayImageWidth();
            }, 50);
        });
        
        // 隐藏加载动画
        $loading.removeClass('active');
        
        // 恢复按钮
        $btn.prop('disabled', false);
        $btn.find('span').text('立即生成');
        
        // 设置滑块到中间位置以显示对比效果
        $('#comparisonSlider').css('left', '50%');
        $('#comparisonOverlay').css('width', '50%');
        
        // 显示成功提示
        showNotification('图片处理完成！左侧为处理后效果，右侧为原图', 'success');
        
        // 滚动到结果区域
        $('html, body').animate({
            scrollTop: $('.comparison-image-container').offset().top - 100
        }, 800);
        
        // 添加提示动画
        animateSliderHint();
        
    }, 3000); // 模拟3秒处理时间
}

// 滑块提示动画
function animateSliderHint() {
    const $slider = $('#comparisonSlider');
    const $overlay = $('#comparisonOverlay');
    
    // 演示左右对比效果：滑块左侧是处理后，右侧是原图
    setTimeout(() => {
        // 先向左滑动到20%，更多显示原图
        $slider.css('left', '20%');
        $overlay.css('width', '20%');
        fixOverlayImageWidth();
        
        setTimeout(() => {
            // 再向右滑动到80%，更多显示处理后图片
            $slider.css('left', '80%');
            $overlay.css('width', '80%');
            fixOverlayImageWidth();
            
            setTimeout(() => {
                // 最后回到中间位置，左右各一半
                $slider.css('left', '50%');
                $overlay.css('width', '50%');
                fixOverlayImageWidth();
            }, 500);
        }, 500);
    }, 500);
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

// 响应式处理
function handleResponsive() {
    const isMobile = $(window).width() <= 768;
    
    if (isMobile) {
        // 移动端特殊处理
        $('.comparison-image-container').addClass('mobile-layout');
    } else {
        $('.comparison-image-container').removeClass('mobile-layout');
        $('.main-navigation').removeClass('toggled');
        $('.mobile-navigation').hide();
    }
    
    // 响应式变化时重新调整图片容器
    setTimeout(() => {
        adjustImageContainer();
    }, 100);
}

$(window).resize(function() {
    handleResponsive();
    // 窗口大小变化时重新调整图片容器
    setTimeout(() => {
        adjustImageContainer();
        // 容器调整后修正遮罩层图片宽度
        fixOverlayImageWidth();
    }, 100);
});

// 初始化响应式
$(document).ready(function() {
    handleResponsive();
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

// 修正遮罩层内图片宽度，确保与容器完全重叠
function fixOverlayImageWidth() {
    const $container = $('.comparison-image-container');
    const $resultImage = $('#result-image');
    
    if ($container.length > 0 && $resultImage.length > 0) {
        const containerWidth = $container[0].getBoundingClientRect().width;
        $resultImage.css('width', containerWidth + 'px');
        console.log('遮罩层图片宽度已修正为:', containerWidth + 'px');
    }
} 