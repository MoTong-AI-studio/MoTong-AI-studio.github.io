$(document).ready(function() {
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
    
    // 克隆主导航到移动导航
    $(".main-navigation > .menu").clone().appendTo(".mobile-navigation");
    
    // 菜单按钮点击事件
    $(".menu-toggle").click(function() {
        $(".mobile-navigation").slideToggle();
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
    
    // 统计数字动画
    function animateStats() {
        $('.stat-number').each(function() {
            var $this = $(this);
            var target = parseInt($this.text());
            var suffix = $this.attr('data-suffix') || '';
            
            $({ Counter: 0 }).animate({
                Counter: target
            }, {
                duration: 2000,
                easing: 'swing',
                step: function() {
                    $this.text(Math.ceil(this.Counter));
                },
                complete: function() {
                    $this.text(target);
                }
            });
        });
    }
    
    // 当统计区域进入视口时触发动画
    if ('IntersectionObserver' in window) {
        var statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    setTimeout(animateStats, 500);
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(document.querySelector('.contest-stats'));
    } else {
        // 对于不支持IntersectionObserver的浏览器，直接执行动画
        $(window).on('scroll', function() {
            var $stats = $('.contest-stats');
            if ($stats.length && $(window).scrollTop() + $(window).height() > $stats.offset().top) {
                setTimeout(animateStats, 500);
                $(window).off('scroll'); // 移除滚动监听，避免重复触发
            }
        });
        
        // 初始检查，如果统计区域已在视口中
        if ($('.contest-stats').length && 
            $(window).scrollTop() + $(window).height() > $('.contest-stats').offset().top) {
            setTimeout(animateStats, 500);
        }
    }
    
    // 设置Lightbox选项
    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'albumLabel': "图片 %1 / %2",
        'fadeDuration': 300,
        'maxWidth': 1200,
        'maxHeight': 900,
        'fitImagesInViewport': true,
        'imageFadeDuration': 300,
        'disableScrolling': false,
        'showImageNumberLabel': true
    });
    
    // 平滑滚动到年份区域
    $('.year-nav a').on('click', function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - 100
        }, 800);
    });
    
    // 图片加载完成后的动画
    $('.project-image img').on('load', function() {
        $(this).parent().addClass('loaded');
    });
    
    // 滚动到年份时触发动画
    $(window).on('scroll', function() {
        $('.year-divider').each(function() {
            if ($(this).offset().top < ($(window).scrollTop() + $(window).height() * 0.8)) {
                $(this).addClass('active');
            }
        });
    });
    
    // 添加图片悬停音效（轻微的相机快门声）
    $('.project').on('mouseenter', function() {
        if ($('#hoverSound').length === 0) {
            $('body').append('<audio id="hoverSound" src="data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV" preload="auto"></audio>');
        }
        document.getElementById('hoverSound').volume = 0.2;
        document.getElementById('hoverSound').play();
    });
    
    // 图片点击高光效果
    $('.project-image').on('click', function() {
        $(this).addClass('clicked');
        setTimeout(function() {
            $('.project-image').removeClass('clicked');
        }, 600);
    });
}); 