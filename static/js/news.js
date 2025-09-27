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
        lazyLoadImages();
        updateFloatingNav();
        handleNavBarScroll(); // 添加导航栏滚动样式变化处理
    };
    
    // 导航栏滚动样式变化
    function handleNavBarScroll() {
        const siteHeader = document.querySelector(".site-header");
        const headerBar = document.querySelector(".header-bar");
        
        if (siteHeader && headerBar) {
            if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                // 滚动时：导航栏变为不透明，有阴影
                siteHeader.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                siteHeader.style.boxShadow = "0 2px 15px rgba(0, 0, 0, 0.1)";
                headerBar.style.backgroundColor = "transparent";
                headerBar.style.boxShadow = "none";
            } else {
                // 顶部时：导航栏透明，header-bar有半透明背景
                siteHeader.style.backgroundColor = "rgba(255, 255, 255, 0)";
                siteHeader.style.boxShadow = "none";
                headerBar.style.backgroundColor = "rgba(255, 255, 255, 0.45)";
                headerBar.style.boxShadow = "0 1px 5px rgba(0, 0, 0, 0.15)";
            }
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
    
    // 移动端导航菜单功能已由 js/app.js 统一处理，此处不重复实现
    
    // 浮动导航高亮
    function updateFloatingNav() {
        var scrollPosition = $(window).scrollTop();
        
        // 计算各部分位置
        var sections = ['article-header', 'article-content', 'related-articles'];
        
        // 找到当前滚动位置所在的部分
        var currentSection = '';
        for (var i = 0; i < sections.length; i++) {
            var section = $('.' + sections[i]);
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
    
    // 图片点击放大查看
    $('.article-featured-image img, .gallery-item img').click(function() {
        var imgSrc = $(this).attr('src');
        var imgAlt = $(this).attr('alt') || '图片查看';
        
        // 创建模态框
        var modal = $('<div class="image-modal"></div>');
        var modalContent = $('<div class="modal-content"></div>');
        var closeBtn = $('<span class="close-modal">&times;</span>');
        var image = $('<img src="' + imgSrc + '" alt="' + imgAlt + '">');
        var caption = $('<div class="modal-caption">' + imgAlt + '</div>');
        
        modalContent.append(closeBtn, image, caption);
        modal.append(modalContent);
        $('body').append(modal);
        
        // 显示模态框
        setTimeout(function() {
            modal.addClass('show');
        }, 10);
        
        // 禁止页面滚动
        $('body').css('overflow', 'hidden');
        
        // 关闭模态框
        closeBtn.click(function() {
            modal.removeClass('show');
            setTimeout(function() {
                modal.remove();
                $('body').css('overflow', 'auto');
            }, 300);
        });
        
        // 点击模态框背景关闭
        modal.click(function(e) {
            if ($(e.target).hasClass('image-modal')) {
                modal.removeClass('show');
                setTimeout(function() {
                    modal.remove();
                    $('body').css('overflow', 'auto');
                }, 300);
            }
        });
    });
    
    // 分享功能
    $('.share-btn').click(function(e) {
        e.preventDefault();
        
        var shareType = '';
        if ($(this).hasClass('wechat')) {
            shareType = 'wechat';
        } else if ($(this).hasClass('weibo')) {
            shareType = 'weibo';
        } else if ($(this).hasClass('qq')) {
            shareType = 'qq';
        } else if ($(this).hasClass('twitter')) {
            shareType = 'twitter';
        } else if ($(this).hasClass('facebook')) {
            shareType = 'facebook';
        }
        
        var url = encodeURIComponent(window.location.href);
        var title = encodeURIComponent(document.title);
        var description = encodeURIComponent($('.article-excerpt p').text());
        var image = encodeURIComponent($('.article-featured-image img').attr('src'));
        
        var shareUrl = '';
        
        switch (shareType) {
            case 'wechat':
                // 微信分享通常需要调用微信JSAPI，这里简化处理
                alert('请使用微信扫一扫功能扫描网页中的二维码进行分享');
                break;
            case 'weibo':
                shareUrl = 'http://service.weibo.com/share/share.php?url=' + url + '&title=' + title + '&pic=' + image;
                window.open(shareUrl, '_blank', 'width=700,height=500');
                break;
            case 'qq':
                shareUrl = 'http://connect.qq.com/widget/shareqq/index.html?url=' + url + '&title=' + title + '&desc=' + description + '&pics=' + image;
                window.open(shareUrl, '_blank', 'width=700,height=500');
                break;
            case 'twitter':
                shareUrl = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title;
                window.open(shareUrl, '_blank', 'width=700,height=500');
                break;
            case 'facebook':
                shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
                window.open(shareUrl, '_blank', 'width=700,height=500');
                break;
        }
    });
    
    // 添加图片查看模态框样式
    var modalStyle = `
    <style>
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .image-modal.show {
            opacity: 1;
        }
        
        .modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        
        .modal-content img {
            max-width: 100%;
            max-height: 80vh;
            display: block;
            margin: 0 auto;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        }
        
        .close-modal {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 30px;
            cursor: pointer;
            z-index: 2001;
        }
        
        .modal-caption {
            color: white;
            text-align: center;
            padding: 15px 0;
            font-size: 16px;
        }
    </style>
    `;
    
    $('head').append(modalStyle);
}); 

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 从sessionStorage获取新闻数据
    const newsData = JSON.parse(sessionStorage.getItem('currentNewsData') || '{}');
    
    // 如果有新闻数据，更新页面内容
    if (newsData.title) {
        // 更新标题
        document.querySelector('.article-title').textContent = newsData.title;
        
        // 更新日期
        document.querySelector('.article-date span').textContent = newsData.date;
        
        // 更新分类
        document.querySelector('.category-badge').textContent = newsData.category;
        
        // 更新摘要
        document.querySelector('.article-excerpt p').textContent = newsData.excerpt;
        
        // 更新特色图片
        const featuredImage = document.querySelector('.article-featured-image img');
        if (featuredImage && newsData.image) {
            featuredImage.src = newsData.image;
            featuredImage.alt = newsData.title;
        }
        
        // 更新页面标题
        document.title = newsData.title + ' - 墨瞳AI工作室';
    }
    
    // 初始化页面效果
    initPageEffects();
});

// 初始化页面效果
function initPageEffects() {
    // 处理导航栏滚动效果
    handleNavBarScroll();
    
    // 初始化进度条
    initProgressBar();
    
    // 初始化回到顶部按钮
    initScrollTop();
    
    // 初始化图片延迟加载
    initLazyLoading();
    
    // 初始化AOS动画
    AOS.init({
        duration: 800,
        once: true
    });
} 