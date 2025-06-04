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