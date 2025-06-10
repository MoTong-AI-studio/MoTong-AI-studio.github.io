$(document).ready(function() {
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true
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
    
    // 监听窗口大小变化，自动调整卡片高度
    $(window).resize(function() {
        adjustTeamCards();
    });
    
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
}); 