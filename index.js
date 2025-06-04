$(document).ready(function() {
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true
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