$(document).ready(function() {
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
    
    // 页面滚动进度条
    window.onscroll = function() {
        updateProgressBar();
        scrollFunction();
    };
    
    function updateProgressBar() {
        var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var scrolled = (winScroll / height) * 100;
        document.getElementById("progressBar").style.width = scrolled + "%";
    }
    
    // 回到顶部按钮显示/隐藏
    function scrollFunction() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            document.getElementById("scrollTop").classList.add("active");
        } else {
            document.getElementById("scrollTop").classList.remove("active");
        }
    }
    
    // 点击回到顶部
    $("#scrollTop").click(function() {
        $("html, body").animate({ scrollTop: 0 }, 800);
    });
    
    // 地图模态框功能
    // 打开模态框
    $(".map-container").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        $("#mapModal").addClass("show");
        $("body").addClass("modal-open");
        
        // 重置地图状态
        resetMapState();
        
        return false;
    });
    
    // 关闭模态框
    $("#closeMapModal").click(function() {
        $("#mapModal").removeClass("show");
        $("body").removeClass("modal-open");
    });
    
    // 点击模态框外部关闭
    $(window).click(function(e) {
        if ($(e.target).hasClass("map-modal")) {
            $("#mapModal").removeClass("show");
            $("body").removeClass("modal-open");
        }
    });
    
    // ESC键关闭模态框
    $(document).keydown(function(e) {
        if (e.keyCode === 27 && $("#mapModal").hasClass("show")) { // ESC key
            $("#mapModal").removeClass("show");
            $("body").removeClass("modal-open");
        }
    });
    
    // 地图缩放和拖拽功能
    let currentZoom = 1;
    let isDragging = false;
    let startX, startY, currentX = 0, currentY = 0;
    let lastMoveTime = 0;
    let lastMoveX = 0, lastMoveY = 0;
    let velocityX = 0, velocityY = 0;
    let animationFrame = null;
    let cachedBounds = null; // 缓存边界计算结果
    let lastZoom = 1; // 记录上次缩放级别
    const minZoom = 1;
    const maxZoom = 3;
    const zoomStep = 0.5;
    
    // 惯性滑动参数（优化后）
    const friction = 0.92; // 提高摩擦系数，让减速更平滑
    const minVelocity = 0.1; // 降低最小速度阈值，减少突然停止
    const bounceStrength = 0.2; // 降低反弹强度，减少突变
    const maxVelocity = 25; // 降低最大速度，提高控制精度
    
    // 地图控制按钮事件
    $("#zoomIn").click(function() {
        stopInertiaAnimation(); // 停止惯性动画
        if (currentZoom < maxZoom) {
            currentZoom += zoomStep;
            invalidateBounds(); // 缩放时清除边界缓存
            constrainPosition();
            updateMapTransform();
            showZoomIndicator();
        }
    });
    
    $("#zoomOut").click(function() {
        stopInertiaAnimation(); // 停止惯性动画
        if (currentZoom > minZoom) {
            currentZoom -= zoomStep;
            invalidateBounds(); // 缩放时清除边界缓存
            constrainPosition();
            updateMapTransform();
            showZoomIndicator();
        }
    });
    
    $("#resetZoom").click(function() {
        resetMapState();
        showZoomIndicator();
    });
    
    // 重置地图状态
    function resetMapState() {
        currentZoom = 1;
        currentX = 0;
        currentY = 0;
        velocityX = 0;
        velocityY = 0;
        invalidateBounds();
        stopInertiaAnimation();
        updateMapTransform();
    }
    
    // 优化的变换更新函数
    function updateMapTransform() {
        const $mapImage = $("#modalMapImage");
        
        // 使用 will-change 属性优化性能
        $mapImage.css({
            'transform': `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentZoom})`,
            'will-change': 'transform'
        });
        
        // 添加缩放类
        if (currentZoom > 1) {
            $mapImage.addClass('zoomed');
        } else {
            $mapImage.removeClass('zoomed');
        }
    }
    
    // 清除边界缓存
    function invalidateBounds() {
        cachedBounds = null;
        lastZoom = currentZoom;
    }
    
    // 优化的速度计算函数
    function calculateVelocity(currentTime, currentPosX, currentPosY) {
        if (lastMoveTime > 0) {
            const timeDiff = currentTime - lastMoveTime;
            if (timeDiff > 0 && timeDiff < 100) { // 放宽时间限制
                const rawVelocityX = (currentPosX - lastMoveX) / timeDiff * 16;
                const rawVelocityY = (currentPosY - lastMoveY) / timeDiff * 16;
                
                // 使用更平滑的插值算法
                const smoothing = Math.min(timeDiff / 16, 1); // 时间归一化
                velocityX = velocityX * (1 - smoothing * 0.4) + rawVelocityX * (smoothing * 0.4);
                velocityY = velocityY * (1 - smoothing * 0.4) + rawVelocityY * (smoothing * 0.4);
                
                // 限制最大速度
                velocityX = Math.max(-maxVelocity, Math.min(maxVelocity, velocityX));
                velocityY = Math.max(-maxVelocity, Math.min(maxVelocity, velocityY));
            }
        }
        lastMoveTime = currentTime;
        lastMoveX = currentPosX;
        lastMoveY = currentPosY;
    }
    
    // 高性能惯性动画
    function startInertiaAnimation() {
        if (Math.abs(velocityX) < minVelocity && Math.abs(velocityY) < minVelocity) {
            return;
        }
        
        let lastTime = performance.now();
        
        function animate(currentTime) {
            const deltaTime = Math.min(currentTime - lastTime, 16); // 限制最大时间差
            const timeScale = deltaTime / 16; // 时间比例因子
            
            // 获取边界（使用缓存）
            const bounds = getBounds();
            
            // 应用速度（考虑时间因子）
            currentX += velocityX * timeScale;
            currentY += velocityY * timeScale;
            
            // 平滑的边界处理
            let dampingX = 1;
            let dampingY = 1;
            
            // X轴边界处理
            if (currentX > bounds.maxX) {
                const overflow = currentX - bounds.maxX;
                currentX = bounds.maxX + overflow * 0.1; // 允许轻微越界
                velocityX *= -bounceStrength;
                dampingX = 0.6; // 增加阻尼
            } else if (currentX < bounds.minX) {
                const overflow = bounds.minX - currentX;
                currentX = bounds.minX - overflow * 0.1;
                velocityX *= -bounceStrength;
                dampingX = 0.6;
            }
            
            // Y轴边界处理
            if (currentY > bounds.maxY) {
                const overflow = currentY - bounds.maxY;
                currentY = bounds.maxY + overflow * 0.1;
                velocityY *= -bounceStrength;
                dampingY = 0.6;
            } else if (currentY < bounds.minY) {
                const overflow = bounds.minY - currentY;
                currentY = bounds.minY - overflow * 0.1;
                velocityY *= -bounceStrength;
                dampingY = 0.6;
            }
            
            // 应用平滑摩擦力
            const currentFriction = Math.pow(friction, timeScale);
            velocityX *= currentFriction * dampingX;
            velocityY *= currentFriction * dampingY;
            
            // 更新变换
            updateMapTransform();
            
            lastTime = currentTime;
            
            // 继续动画或停止
            if (Math.abs(velocityX) > minVelocity || Math.abs(velocityY) > minVelocity) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                animationFrame = null;
                // 最终回弹到边界内
                smoothBounceBack();
            }
        }
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    // 平滑回弹到边界内
    function smoothBounceBack() {
        const bounds = getBounds();
        const targetX = Math.max(bounds.minX, Math.min(bounds.maxX, currentX));
        const targetY = Math.max(bounds.minY, Math.min(bounds.maxY, currentY));
        
        if (Math.abs(currentX - targetX) > 0.5 || Math.abs(currentY - targetY) > 0.5) {
            let bounceFrame = null;
            const startX = currentX;
            const startY = currentY;
            const startTime = performance.now();
            const duration = 300; // 300ms的回弹动画
            
            function bounceAnimate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 使用缓动函数
                const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                
                currentX = startX + (targetX - startX) * eased;
                currentY = startY + (targetY - startY) * eased;
                
                updateMapTransform();
                
                if (progress < 1) {
                    bounceFrame = requestAnimationFrame(bounceAnimate);
                } else {
                    currentX = targetX;
                    currentY = targetY;
                    updateMapTransform();
                }
            }
            
            requestAnimationFrame(bounceAnimate);
        }
    }
    
    // 停止惯性动画
    function stopInertiaAnimation() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        velocityX = 0;
        velocityY = 0;
    }
    
    // 优化的边界计算（使用缓存）
    function getBounds() {
        // 如果缩放级别没有变化，返回缓存的边界
        if (cachedBounds && lastZoom === currentZoom) {
            return cachedBounds;
        }
        
        const $container = $(".map-image-container");
        const $image = $("#modalMapImage");
        
        const containerWidth = $container.width();
        const containerHeight = $container.height();
        
        // 获取图片的自然尺寸和当前显示尺寸
        const imageNaturalWidth = $image[0].naturalWidth;
        const imageNaturalHeight = $image[0].naturalHeight;
        
        // 计算图片在容器中的实际显示尺寸
        const containerRatio = containerWidth / containerHeight;
        const imageRatio = imageNaturalWidth / imageNaturalHeight;
        
        let displayWidth, displayHeight;
        
        if (imageRatio > containerRatio) {
            displayWidth = containerWidth;
            displayHeight = containerWidth / imageRatio;
        } else {
            displayHeight = containerHeight;
            displayWidth = containerHeight * imageRatio;
        }
        
        // 缩放后的实际尺寸
        const scaledWidth = displayWidth * currentZoom;
        const scaledHeight = displayHeight * currentZoom;
        
        // 计算可移动的边界
        const maxMoveX = Math.max(0, (scaledWidth - containerWidth) / 2);
        const maxMoveY = Math.max(0, (scaledHeight - containerHeight) / 2);
        
        // 缓存结果
        cachedBounds = {
            maxX: maxMoveX,
            minX: -maxMoveX,
            maxY: maxMoveY,
            minY: -maxMoveY
        };
        
        lastZoom = currentZoom;
        return cachedBounds;
    }
    
    // 约束位置到边界内
    function constrainPosition() {
        const bounds = getBounds();
        currentX = Math.max(bounds.minX, Math.min(bounds.maxX, currentX));
        currentY = Math.max(bounds.minY, Math.min(bounds.maxY, currentY));
    }
    
    // 鼠标拖拽事件（优化版本）
    $("#modalMapImage").on('mousedown', function(e) {
        if (currentZoom > 1) {
            stopInertiaAnimation(); // 停止任何正在进行的惯性动画
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            lastMoveTime = performance.now(); // 使用高精度时间
            lastMoveX = e.clientX;
            lastMoveY = e.clientY;
            velocityX = 0;
            velocityY = 0;
            $(this).css('cursor', 'grabbing');
            e.preventDefault();
        }
    });
    
    $(document).on('mousemove', function(e) {
        if (isDragging && currentZoom > 1) {
            const newX = e.clientX - startX;
            const newY = e.clientY - startY;
            
            // 计算速度
            calculateVelocity(performance.now(), e.clientX, e.clientY);
            
            currentX = newX;
            currentY = newY;
            
            // 实时约束位置，但允许轻微越界以提供视觉反馈
            const bounds = getBounds();
            const overflowDamping = 0.3; // 越界时的阻尼系数
            
            if (currentX > bounds.maxX) {
                currentX = bounds.maxX + (currentX - bounds.maxX) * overflowDamping;
            } else if (currentX < bounds.minX) {
                currentX = bounds.minX + (currentX - bounds.minX) * overflowDamping;
            }
            
            if (currentY > bounds.maxY) {
                currentY = bounds.maxY + (currentY - bounds.maxY) * overflowDamping;
            } else if (currentY < bounds.minY) {
                currentY = bounds.minY + (currentY - bounds.minY) * overflowDamping;
            }
            
            updateMapTransform();
        }
    });
    
    $(document).on('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            $("#modalMapImage").css('cursor', currentZoom > 1 ? 'grab' : 'default');
            
            // 启动惯性滑动
            if (currentZoom > 1) {
                startInertiaAnimation();
            }
        }
    });
    
    // 触摸事件（移动端支持）
    $("#modalMapImage").on('touchstart', function(e) {
        if (currentZoom > 1 && e.touches.length === 1) {
            stopInertiaAnimation(); // 停止任何正在进行的惯性动画
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX - currentX;
            startY = touch.clientY - currentY;
            lastMoveTime = performance.now(); // 使用高精度时间
            lastMoveX = touch.clientX;
            lastMoveY = touch.clientY;
            velocityX = 0;
            velocityY = 0;
            e.preventDefault();
        }
    });
    
    $(document).on('touchmove', function(e) {
        if (isDragging && currentZoom > 1 && e.touches.length === 1) {
            const touch = e.touches[0];
            const newX = touch.clientX - startX;
            const newY = touch.clientY - startY;
            
            // 计算速度
            calculateVelocity(performance.now(), touch.clientX, touch.clientY);
            
            currentX = newX;
            currentY = newY;
            
            // 实时约束位置，允许轻微越界
            const bounds = getBounds();
            const overflowDamping = 0.3;
            
            if (currentX > bounds.maxX) {
                currentX = bounds.maxX + (currentX - bounds.maxX) * overflowDamping;
            } else if (currentX < bounds.minX) {
                currentX = bounds.minX + (currentX - bounds.minX) * overflowDamping;
            }
            
            if (currentY > bounds.maxY) {
                currentY = bounds.maxY + (currentY - bounds.maxY) * overflowDamping;
            } else if (currentY < bounds.minY) {
                currentY = bounds.minY + (currentY - bounds.minY) * overflowDamping;
            }
            
            updateMapTransform();
            e.preventDefault();
        }
    });
    
    $(document).on('touchend', function() {
        if (isDragging) {
            isDragging = false;
            
            // 启动惯性滑动
            if (currentZoom > 1) {
                startInertiaAnimation();
            }
        }
    });
    
    // 鼠标滚轮缩放
    $(".map-image-container").on('wheel', function(e) {
        e.preventDefault();
        
        stopInertiaAnimation(); // 停止惯性动画
        
        const delta = e.originalEvent.deltaY;
        const oldZoom = currentZoom;
        
        if (delta < 0 && currentZoom < maxZoom) {
            // 放大
            currentZoom += zoomStep;
        } else if (delta > 0 && currentZoom > minZoom) {
            // 缩小
            currentZoom -= zoomStep;
        }
        
        if (oldZoom !== currentZoom) {
            // 缩放后约束位置
            constrainPosition();
            updateMapTransform();
            showZoomIndicator();
        }
    });
    
    // 双击放大/还原
    $("#modalMapImage").on('dblclick', function(e) {
        e.preventDefault();
        
        stopInertiaAnimation(); // 停止惯性动画
        
        if (currentZoom === 1) {
            // 双击放大到2倍
            currentZoom = 2;
            
            // 计算点击位置作为缩放中心
            const rect = this.getBoundingClientRect();
            const containerRect = $(".map-image-container")[0].getBoundingClientRect();
            
            // 相对于容器的点击位置
            const clickX = e.clientX - containerRect.left - containerRect.width / 2;
            const clickY = e.clientY - containerRect.top - containerRect.height / 2;
            
            // 设置新的位置，使点击点成为缩放中心
            currentX = -clickX * (currentZoom - 1);
            currentY = -clickY * (currentZoom - 1);
            
            // 约束到边界内
            constrainPosition();
        } else {
            // 双击还原
            resetMapState();
        }
        
        updateMapTransform();
        showZoomIndicator();
    });
    
    // 联系表单验证
    $("#contactForm").submit(function(e) {
        var isValid = true;
        var name = $("#name").val().trim();
        var email = $("#email").val().trim();
        var subject = $("#subject").val().trim();
        var message = $("#message").val().trim();
        
        // 清除之前的错误提示
        $(".error-message").remove();
        
        // 姓名验证
        if (name === "") {
            isValid = false;
            $("#name").after('<span class="error-message">请输入您的姓名</span>');
        }
        
        // 邮箱验证
        if (email === "") {
            isValid = false;
            $("#email").after('<span class="error-message">请输入您的邮箱</span>');
        } else if (!isValidEmail(email)) {
            isValid = false;
            $("#email").after('<span class="error-message">请输入有效的邮箱地址</span>');
        }
        
        // 主题验证
        if (subject === "") {
            isValid = false;
            $("#subject").after('<span class="error-message">请输入主题</span>');
        }
        
        // 消息验证
        if (message === "") {
            isValid = false;
            $("#message").after('<span class="error-message">请输入您的消息</span>');
        }
        
        // 如果验证不通过，阻止表单提交
        if (!isValid) {
            e.preventDefault();
        } else {
            // 这里可以添加AJAX提交表单的代码
            // 示例中仅做模拟，实际使用时根据需要调整
            e.preventDefault(); // 模拟时阻止表单提交
            showFormSuccess();
        }
    });
    
    // 辅助函数：验证邮箱格式
    function isValidEmail(email) {
        var regex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return regex.test(email);
    }
    
    // 辅助函数：显示提交成功信息
    function showFormSuccess() {
        $("#contactForm").hide();
        $(".contact-form-container").append(
            '<div class="success-message" data-aos="fade-up">' +
            '<div class="icon"><i class="fas fa-check"></i></div>' +
            '<h3>消息已发送！</h3>' +
            '<p>感谢您的留言，我们会尽快回复您。</p>' +
            '<button class="submit-btn" id="sendAnother">发送另一条消息</button>' +
            '</div>'
        );
        
        // 重置表单
        $("#contactForm")[0].reset();
        
        // 点击"发送另一条消息"按钮
        $("#sendAnother").click(function() {
            $(".success-message").remove();
            $("#contactForm").show();
        });
    }
    
    // 联系信息卡片动画
    $(".contact-info-card").each(function(index) {
        $(this).attr("data-aos", "fade-up");
        $(this).attr("data-aos-delay", index * 100);
    });
    
    // 联系表单输入动画
    $(".form-control").focus(function() {
        $(this).parent(".form-group").addClass("focused");
    }).blur(function() {
        if ($(this).val() === "") {
            $(this).parent(".form-group").removeClass("focused");
        }
    });
    
    // 如果输入框已有内容，添加focused类
    $(".form-control").each(function() {
        if ($(this).val() !== "") {
            $(this).parent(".form-group").addClass("focused");
        }
    });
    
    // 添加点击地址卡片复制地址功能
    $(".copy-address").click(function(e) {
        e.preventDefault();
        var address = $(this).data("address");
        copyToClipboard(address);
        showCopyMessage($(this), "地址已复制");
    });
    
    // 复制到剪贴板功能
    function copyToClipboard(text) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }
    
    // 显示复制成功消息
    function showCopyMessage($element, message) {
        var $message = $("<div class='copy-message'>" + message + "</div>");
        $element.append($message);
        setTimeout(function() {
            $message.fadeOut(function() {
                $(this).remove();
            });
        }, 2000);
    }
    
    // 显示缩放指示器
    function showZoomIndicator() {
        const $container = $(".map-image-container");
        let $indicator = $container.find('.zoom-indicator');
        
        if ($indicator.length === 0) {
            $indicator = $('<div class="zoom-indicator"></div>');
            $container.append($indicator);
        }
        
        $indicator.text(`${Math.round(currentZoom * 100)}%`);
        $indicator.addClass('show');
        
        // 2秒后隐藏指示器
        setTimeout(() => {
            $indicator.removeClass('show');
        }, 2000);
    }
}); 