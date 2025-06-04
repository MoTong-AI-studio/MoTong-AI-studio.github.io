document.addEventListener('DOMContentLoaded', function() {
    // 获取所有导航项和进度条
    const navItems = document.querySelectorAll('.floating-nav-item');
    const progressActive = document.querySelector('.progress-active');
    const progressLine = document.querySelector('.progress-line');
    const sections = [];
    
    // 当前活跃的导航项索引和上一个活跃的导航项索引
    let currentActiveIndex = 0;
    let previousActiveIndex = 0;
    
    // 判断是否为移动设备
    const isMobile = window.innerWidth < 992;
    
    // 收集所有目标部分
    navItems.forEach((item, index) => {
        const targetId = item.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            sections.push({
                id: targetId,
                element: targetSection,
                navItem: item,
                index: index
            });
        }
    });
    
    // 点击导航项时滚动到对应部分
    navItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            // 有时阻止默认行为，使用自定义滚动行为
            if (e.target.tagName === 'A') {
                e.preventDefault();
                
                const targetId = item.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // 保存先前的活跃索引
                    previousActiveIndex = currentActiveIndex;
                    currentActiveIndex = index;
                    
                    // 计算目标位置，考虑页面头部和移动设备底部导航
                    const header = document.querySelector('.site-header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    let offset = headerHeight + 20;
                    
                    // 移动设备上滚动位置需要调整
                    if (isMobile) {
                        offset = headerHeight + 10;
                    }
                    
                    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    // 平滑滚动到目标位置
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // 更新活动状态和进度线
                    updateActiveNavItem(targetId, index);
                }
            }
        });
    });
    
    // 滚动时更新活动导航项
    window.addEventListener('scroll', function() {
        // 如果没有部分，则不执行
        if (sections.length === 0) return;
        
        const scrollPosition = window.scrollY + window.innerHeight / 3;
        
        // 找到当前所在部分
        let currentSection = sections[0].id;
        let currentIndex = 0;
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            // 计算偏移量，移动设备上使用更小的偏移
            const offset = isMobile ? 100 : 200;
            if (section.element.offsetTop - offset <= scrollPosition) {
                currentSection = section.id;
                currentIndex = section.index;
            }
        }
        
        // 保存先前活跃的索引
        if (currentIndex !== currentActiveIndex) {
            previousActiveIndex = currentActiveIndex;
            currentActiveIndex = currentIndex;
        }
        
        // 更新活动状态和进度线
        updateActiveNavItem(currentSection, currentIndex);
    });
    
    // 更新进度条和活动状态
    function updateActiveNavItem(activeId, activeIndex) {
        navItems.forEach((item, index) => {
            const itemId = item.getAttribute('data-target');
            
            // 更新活跃状态类
            if (itemId === activeId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
            
            // 为已访问的项添加"已访问"类
            if (index <= activeIndex) {
                item.classList.add('visited');
            } else {
                item.classList.remove('visited');
            }
        });
        
        // 仅在非移动设备上更新进度线
        if (!isMobile && progressActive && progressLine) {
            const totalItems = navItems.length;
            
            // 不再使用top属性定位，而是总是从顶部开始延伸
            // 我们只改变高度来创造流动效果
            
            // 计算进度线高度
            let progressHeight = 0;
            
            // 如果是最后一个导航项，进度线填满100%
            if (activeIndex === navItems.length - 1) {
                progressHeight = 100;
            } else if (activeIndex === 0) {
                // 第一项 - 进度线高度刚好覆盖第一个点
                progressHeight = 20;
            } else {
                // 计算进度线应该延伸的高度
                // 这里我们计算从顶部到当前活动项中心点的百分比
                const lineHeight = progressLine.offsetHeight;
                const dotPositions = Array.from(navItems).map((item, i) => {
                    const rect = item.getBoundingClientRect();
                    const lineTop = progressLine.getBoundingClientRect().top;
                    // 计算点相对于进度线的垂直中心位置
                    return ((rect.top + rect.height / 2) - lineTop) / lineHeight * 100;
                });
                
                progressHeight = dotPositions[activeIndex];
            }
            
            // 设置进度条高度，使用动画过渡效果
            progressActive.style.height = progressHeight + '%';
        }
    }
    
    // 窗口大小改变时更新移动状态
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth < 992;
        if (newIsMobile !== isMobile) {
            // 页面刷新以应用新布局
            location.reload();
        }
    });
    
    // 为导航点添加视觉效果，使已访问的项有不同的样式
    const style = document.createElement('style');
    style.textContent = `
        .floating-nav-item.visited:before {
            background-color: #e0e0e0;
        }
        .floating-nav-item.visited.active:before {
            background-color: #0070E0;
        }
    `;
    document.head.appendChild(style);
    
    // 初始检查当前位置并更新导航
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 100);
}); 