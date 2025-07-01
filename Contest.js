$(document).ready(function() {
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
    
    // 移动端导航菜单功能 - 与about页面完全一致
    function initMobileNavigation() {
        // 智能菜单克隆，避免重复
        if ($(".mobile-navigation .menu").length === 0) {
            $(".main-navigation .menu").clone().appendTo(".mobile-navigation");
        }
        
        // 动态设置移动端菜单位置
        function updateMobileNavPosition() {
            const headerHeight = $('.site-header').outerHeight() || 80;
            $('.mobile-navigation').css('top', headerHeight + 'px');
        }
        
        let mobileMenuOpen = false;
        
        // 菜单切换按钮点击事件
        $(".menu-toggle").off('click').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!mobileMenuOpen) {
                // 打开菜单
                updateMobileNavPosition();
                $('.mobile-navigation').addClass('show');
                $(this).addClass('active').attr('aria-expanded', 'true');
                $('body').addClass('mobile-nav-open');
                mobileMenuOpen = true;
            } else {
                // 关闭菜单
                closeMobileMenu();
            }
        });
        
        // 关闭移动端菜单
        function closeMobileMenu() {
            $('.mobile-navigation').removeClass('show');
            $('.menu-toggle').removeClass('active').attr('aria-expanded', 'false');
            $('body').removeClass('mobile-nav-open');
            mobileMenuOpen = false;
        }
        
        // ESC键关闭菜单
        $(document).off('keydown.mobileNav').on('keydown.mobileNav', function(e) {
            if (e.key === 'Escape' && mobileMenuOpen) {
                closeMobileMenu();
            }
        });
        
        // 点击菜单外部关闭
        $(document).off('click.mobileNav').on('click.mobileNav', function(e) {
            if (mobileMenuOpen && !$(e.target).closest('.mobile-navigation, .menu-toggle').length) {
                closeMobileMenu();
            }
        });
        
        // 窗口大小改变时更新位置
        $(window).off('resize.mobileNav').on('resize.mobileNav', function() {
            if (mobileMenuOpen) {
                updateMobileNavPosition();
            }
        });
        
        // 菜单项点击后关闭菜单
        $(document).off('click.mobileNavItem').on('click.mobileNavItem', '.mobile-navigation .menu-item a', function() {
            setTimeout(closeMobileMenu, 100);
        });
        
        // 初始化位置
        updateMobileNavPosition();
    }
    
    // 初始化移动端导航
    initMobileNavigation();
    
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
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift+Tab - 回到最后一个菜单项
                e.preventDefault();
                $('.mobile-navigation .menu-item a').last().focus();
            } else {
                // Tab - 回到第一个菜单项
                e.preventDefault();
                $('.mobile-navigation .menu-item a').first().focus();
            }
        }
    });
    
    // 移动端菜单项点击后关闭菜单
    $(document).on('click', '.mobile-navigation .menu-item a', function() {
        // 延迟关闭，让页面跳转生效
        setTimeout(closeMobileMenu, 100);
    });
    
    // 确保焦点管理
    $(document).on('shown.mobile-nav', function() {
        $('.mobile-navigation .menu-item a').first().focus();
    });
    
    $(document).on('hidden.mobile-nav', function() {
        $('.menu-toggle').focus();
    });
}); 