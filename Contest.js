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