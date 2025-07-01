$(document).ready(function() {
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true
    });
    
    // 克隆主导航到移动导航
    $(".main-navigation > .menu").clone().appendTo(".mobile-navigation");
    
    // 页面滚动进度条
    window.onscroll = function() {
        updateProgressBar();
        scrollFunction();
        handleNavBarScroll();
        lazyLoadImages();
    };
    
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
    
    // 窗口大小改变时处理导航菜单
    $(window).resize(function() {
        if ($(window).width() > 768) {
            $(".main-navigation").removeClass("toggled");
            $(".mobile-navigation").hide();
        }
        
        // 调整轮播图高度以适应不同屏幕
        adjustSliderHeight();
    });
    
    // 调整轮播图高度
    function adjustSliderHeight() {
        if ($(window).width() <= 375) {
            $('.slides li').height(250);
        } else if ($(window).width() <= 576) {
            $('.slides li').height(300);
        } else if ($(window).width() <= 768) {
            $('.slides li').height(350);
        } else if ($(window).width() <= 992) {
            $('.slides li').height(400);
        } else {
            $('.slides li').height(500);
        }
    }
    
    // 初始调整轮播图高度
    adjustSliderHeight();
    
    // 图片延迟加载
    function lazyLoadImages() {
        let lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
        let active = false;
        
        if (active === false) {
            active = true;
            
            setTimeout(function() {
                lazyImages.forEach(function(lazyImage) {
                    if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.classList.add("loaded");
                        lazyImage.classList.remove("lazy");
                        
                        lazyImages = lazyImages.filter(function(image) {
                            return image !== lazyImage;
                        });
                        
                        if (lazyImages.length === 0) {
                            document.removeEventListener("scroll", lazyLoadImages);
                            window.removeEventListener("resize", lazyLoadImages);
                            window.removeEventListener("orientationChange", lazyLoadImages);
                        }
                    }
                });
                
                active = false;
            }, 200);
        }
    }
    
    // 初始执行一次图片延迟加载
    lazyLoadImages();

    // 分页功能
    initPagination();
    
    function initPagination() {
        // 绑定分页点击事件
        $('.pagination .page-link').on('click', function(e) {
            e.preventDefault();
            
            const page = $(this).data('page');
            changePage(page);
        });
    }
    
    function changePage(page) {
        // 处理"下一页"和"最后一页"特殊情况
        if (page === 'next') {
            let currentPage = $('.pagination .page-link.active').data('page');
            let totalPages = $('.pagination .page-link').not('.next, .last').length;
            
            if (currentPage < totalPages) {
                page = currentPage + 1;
            } else {
                return; // 已经是最后一页
            }
        } else if (page === 'last') {
            page = $('.pagination .page-link').not('.next, .last').length;
        }
        
        // 更新活动页码样式
        $('.pagination .page-link').removeClass('active');
        $(`.pagination .page-link[data-page="${page}"]`).addClass('active');
        
        // 隐藏所有新闻项
        $('.news-item').hide();
        
        // 显示当前页的新闻项
        $(`.news-item.page-${page}`).fadeIn(500);
        
        // 滚动到新闻列表顶部
        $('html, body').animate({
            scrollTop: $('#news-section').offset().top - 100
        }, 500);
    }
}); 