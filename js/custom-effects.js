(function($, document, window){
    
    $(document).ready(function(){
        // 首先确保原始的初始化被移除
        if($(".hero").data('flexslider')) {
            $(".hero").flexslider('destroy');
        }
        
        // 为轮播图添加左右导航按钮HTML结构
        if ($(".hero .flex-direction-nav").length === 0) {
            $(".hero").append('<ul class="flex-direction-nav"><li><a href="#" class="flex-prev">Previous</a></li><li><a href="#" class="flex-next">Next</a></li></ul>');
        }
        
        // 增强轮播图效果配置
        var heroSlider = $(".hero").flexslider({
            directionNav: true,       // 开启左右导航
            controlNav: true,         // 开启底部控制器
            slideshow: true,          // 自动播放
            slideshowSpeed: 5000,     // 切换间隔时间（5秒）
            animationSpeed: 800,      // 动画速度
            pauseOnHover: true,       // 鼠标悬停暂停
            animation: "fade",        // 使用淡入淡出效果
            easing: "swing",          // 动画缓动效果
            touch: true,              // 支持触摸滑动
            useCSS: true,             // 使用CSS动画效果
            keyboard: true,           // 支持键盘控制
            
            start: function(slider){
                // 初始化时对第一个slide应用动画
                $(".hero .slides li").eq(slider.currentSlide).addClass('flex-active-slide');
                console.log("轮播初始化完成");
                
                // 确保轮播图自动播放
                setTimeout(function(){
                    if(!slider.playing) {
                        slider.play();
                        console.log("强制开始自动轮播");
                    }
                }, 100);
            },
            
            before: function(slider){
                // 切换前的动作
                console.log("开始切换轮播");
                // 添加动画类
                $(".hero").addClass("animating");
                
                // 避免连续快速点击导致的动画问题
                $(".hero .flex-direction-nav a").css('pointer-events', 'none');
                setTimeout(function(){
                    $(".hero .flex-direction-nav a").css('pointer-events', 'auto');
                }, 800);
            },
            
            after: function(slider){
                // 当前活动的slide
                console.log("轮播切换到:", slider.currentSlide);
                
                // 切换完成后移除动画类
                setTimeout(function(){
                    $(".hero").removeClass("animating");
                }, 100);
                
                // 确保自动播放继续
                if(!slider.playing && !$(".hero:hover").length) {
                    slider.play();
                }
            }
        });
        
        // 监听左右导航按钮的点击事件，添加自定义过渡效果
        $(".hero .flex-direction-nav a").on('click', function(e){
            e.preventDefault();
            // 添加点击动画效果
            $(this).addClass('clicked');
            setTimeout(function(){
                $(".hero .flex-direction-nav a").removeClass('clicked');
            }, 300);
            
            if($(this).hasClass('flex-prev')) {
                $(".hero").flexslider('prev');
            } else {
                $(".hero").flexslider('next');
            }
        });
        
        // 移除鼠标悬停在控制点上预览对应的轮播图功能
        // 取消原有的mouseenter绑定，仅保留点击功能
        $(".hero .flex-control-nav li a").off('mouseenter');
        
        // 确保主轮播图控件正常工作
        // 检查并恢复轮播图功能
        setInterval(function(){
            var slider = $(".hero").data('flexslider');
            if(slider && !slider.playing && !$(".hero:hover").length) {
                slider.play();
            }
        }, 5000);
        
        // 这里覆盖app.js中的初始化
        window.heroInitialized = true;
    });

})(jQuery, document, window); 