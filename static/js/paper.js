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
    
    // 展开/折叠摘要功能
    $('.abstract-toggle').click(function(e) {
        e.stopPropagation(); // 阻止事件冒泡到卡片
        e.preventDefault(); // 阻止默认行为，防止链接跳转
        const abstract = $(this).prev('.abstract');
        abstract.toggleClass('expanded');
        $(this).text(abstract.hasClass('expanded') ? '收起' : '展开');
        return false; // 确保不会触发父元素的点击事件
    });
    
    // 论文过滤和排序功能
    $("#paperCategory").on("change", function() {
        filterPapers();
    });
    
    $("#paperSort").on("change", function() {
        sortPapers();
    });
    
    $("#clearFilters, #resetSearch").on("click", function() {
        $("#paperCategory").val("all");
        $("#paperSort").val("date-desc");
        filterPapers();
        
        // 更新浮动标签选中状态
        $(".floating-tags .tag-item").removeClass("active");
        $(".floating-tags .tag-item[data-filter='all']").addClass("active");
    });
    
    // 浮动标签点击事件
    $(".floating-tags .tag-item").on("click", function() {
        $(".floating-tags .tag-item").removeClass("active");
        $(this).addClass("active");
        
        var filter = $(this).data("filter");
        $("#paperCategory").val(filter);
        filterPapers();
    });
    
    function filterPapers() {
        var category = $("#paperCategory").val();
        var visibleCount = 0;
        
        $(".paper-item").each(function() {
            var itemCategory = $(this).data("category");
            var categoryMatch = category === "all" || itemCategory === category;
            
            if (categoryMatch) {
                $(this).show();
                visibleCount++;
            } else {
                $(this).hide();
            }
        });
        
        // 显示/隐藏无结果提示
        if (visibleCount === 0) {
            $("#noResults").show();
        } else {
            $("#noResults").hide();
        }
        
        sortPapers();
    }
    
    function sortPapers() {
        var sortValue = $("#paperSort").val();
        var $container = $("#papersContainer");
        var $items = $container.children(".paper-item:visible").get();
        
        $items.sort(function(a, b) {
            if (sortValue === "date-desc") {
                return $(b).data("date") > $(a).data("date") ? 1 : -1;
            } else if (sortValue === "date-asc") {
                return $(a).data("date") > $(b).data("date") ? 1 : -1;
            } else if (sortValue === "title-asc") {
                return $(a).find(".card-title").text() > $(b).find(".card-title").text() ? 1 : -1;
            } else if (sortValue === "title-desc") {
                return $(b).find(".card-title").text() > $(a).find(".card-title").text() ? 1 : -1;
            }
        });
        
        $.each($items, function(i, item) {
            $container.append(item);
        });
    }
}); 