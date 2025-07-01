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
        
        // 调整团队卡片
        adjustTeamCards();
    });
    
    // 初始化团队卡片
    adjustTeamCards();
    
    // 页面滚动进度条
    window.onscroll = function() {
        updateProgressBar();
        scrollFunction();
        handleNavBarScroll(); // 添加导航栏滚动样式变化处理
        updateFloatingNav();
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
    
    // 调整团队卡片高度一致
    function adjustTeamCards() {
        // 为不同部分分别计算
        adjustCardsInSection('#student-section');
        adjustCardsInSection('#graduate-section');
        
        // 确保按钮位置正确
        positionEmailButtons();
    }
    
    // 调整指定部分的卡片高度
    function adjustCardsInSection(sectionId) {
        // 跳过指导老师部分的卡片高度调整
        if (sectionId === '#teacher-section') {
            return;
        }
        
        // 重置卡片高度
        $(sectionId + ' .team').css('height', '');
        
        // 只在大屏幕上进行调整
        if ($(window).width() > 768) {
            // 获取每一行的卡片
            var rowSize = 3; // 每行3个卡片
            var cards = $(sectionId + ' .team');
            
            // 按行处理
            for (var i = 0; i < cards.length; i += rowSize) {
                var rowCards = cards.slice(i, i + rowSize);
                var maxHeight = 0;
                
                // 找出当前行中的最大高度
                rowCards.each(function() {
                    var cardHeight = $(this).outerHeight();
                    maxHeight = Math.max(maxHeight, cardHeight);
                });
                
                // 设置当前行所有卡片高度一致
                rowCards.css('height', maxHeight + 'px');
            }
        }
    }
    
    // 确保邮箱按钮位置正确
    function positionEmailButtons() {
        $('.team').each(function() {
            // 获取邮箱链接按钮
            var btn = $(this).find('a[href^="mailto:"]');
            if (btn.length) {
                // 给按钮添加电子邮件样式类
                if (!btn.hasClass('btn-email')) {
                    btn.removeClass('btn btn-sm btn-outline-primary mt-2')
                       .addClass('btn-email');
                    
                    // 如果还没有图标，添加一个
                    if (btn.find('i.fas.fa-envelope').length === 0) {
                        var emailText = btn.text().trim();
                        btn.html('<i class="fas fa-envelope"></i> ' + emailText);
                    }
                }
                
                // 根据屏幕大小调整样式
                if ($(window).width() <= 768) {
                    btn.css({
                        'position': 'absolute',
                        'bottom': '15px',
                        'left': '50%',
                        'transform': 'translateX(-50%)',
                        'width': '85%'
                    });
                } else {
                    btn.css({
                        'position': 'absolute',
                        'bottom': '15px',
                        'left': '50%',
                        'transform': 'translateX(-50%)',
                        'width': '75%'
                    });
                }
            }
        });
    }
    
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
    
    // 浮动导航高亮
    function updateFloatingNav() {
        var scrollPosition = $(window).scrollTop();
        
        // 计算各部分位置
        var sections = ['teacher-section', 'student-section', 'graduate-section', 'photos-section'];
        
        // 找到当前滚动位置所在的部分
        var currentSection = '';
        for (var i = 0; i < sections.length; i++) {
            var section = $('#' + sections[i]);
            if (section.length && scrollPosition >= section.offset().top - 200) {
                currentSection = sections[i];
            }
        }
        
        // 更新浮动导航高亮
        if (currentSection) {
            $('.floating-nav-item').removeClass('active');
            $('.floating-nav-item[data-target="' + currentSection + '"]').addClass('active');
        }
    }
    
    // 点击浮动导航项目滚动到对应部分
    $('.floating-nav-item a').click(function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - 100
        }, 800);
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
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            $('.mobile-navigation .menu-item:first-child a').focus();
        }
    });
    
    // 为菜单切换按钮添加ARIA属性
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
    
    // 确保菜单项在初始化时就是可见的
    $('.mobile-navigation .menu-item').css({
        'display': 'block',
        'visibility': 'visible',
        'position': 'relative',
        'overflow': 'visible'
    });
}); 