(function(document, window) {
	'use strict';
	
	// 等待DOM加载完成
	document.addEventListener('DOMContentLoaded', function() {

		// 克隆主导航到移动导航（只克隆一次，避免重复）
		const mobileNavigation = document.querySelector('.mobile-navigation');
		const mainNavMenu = document.querySelector('.main-navigation .menu');
		
		if (mobileNavigation && mainNavMenu && !mobileNavigation.querySelector('.menu')) {
			const clonedMenu = mainNavMenu.cloneNode(true);
			mobileNavigation.appendChild(clonedMenu);
		}

		// 移动端导航菜单优化 - 完全独立定位模式
		let mobileMenuOpen = false;

		// 动态计算导航栏高度并设置菜单正确位置的函数
		function updateMobileNavPosition() {
			const siteHeader = document.querySelector('.site-header');
			const headerHeight = siteHeader ? siteHeader.offsetHeight : 80; // 获取导航栏实际高度，默认80px
			
			const mobileNav = document.querySelector('.mobile-navigation');
			if (mobileNav) {
				mobileNav.style.top = headerHeight + 'px'; // 设置菜单在导航栏下方，而不是覆盖导航栏
			}
		}

		// Mobile menu toggle - 全屏菜单切换逻辑
		const menuToggle = document.querySelector('.menu-toggle');
		if (menuToggle) {
			menuToggle.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			
				const mobileNav = document.querySelector('.mobile-navigation');
			
			if (!mobileMenuOpen) {
				// 更新菜单位置
				updateMobileNavPosition();
				
				// 打开下拉菜单
					menuToggle.classList.add('active');
					menuToggle.setAttribute('aria-expanded', 'true');
				
				// 显示下拉菜单
					if (mobileNav) {
						mobileNav.classList.add('show');
					}
				
				mobileMenuOpen = true;
				
				// 确保所有菜单项都可见
					const menuItems = mobileNav ? mobileNav.querySelectorAll('.menu-item') : [];
					menuItems.forEach(item => {
						item.style.display = 'block';
						item.style.visibility = 'visible';
						item.style.opacity = '1';
						item.style.position = 'relative';
				});
				
				// 为可访问性添加焦点管理
				setTimeout(() => {
						const firstMenuItem = mobileNav ? mobileNav.querySelector('.menu-item:first-child a') : null;
						if (firstMenuItem) {
							firstMenuItem.focus();
						}
				}, 300);
				
			} else {
				// 关闭菜单
				closeMobileMenu();
			}
		});
		}
		
		// 关闭移动端菜单的函数
		function closeMobileMenu() {
			const menuToggle = document.querySelector('.menu-toggle');
			const mobileNav = document.querySelector('.mobile-navigation');
			
			if (menuToggle) {
				menuToggle.classList.remove('active');
				menuToggle.setAttribute('aria-expanded', 'false');
			}
			
			if (mobileNav) {
				mobileNav.classList.remove('show');
			}
			
			mobileMenuOpen = false;
			
			// 返回焦点到切换按钮
			if (menuToggle) {
				menuToggle.focus();
			}
		}
		
		// 点击导航链接后自动关闭菜单（移动端）
		const mobileNavLinks = document.querySelectorAll('.mobile-navigation .menu-item a');
		mobileNavLinks.forEach(link => {
			link.addEventListener('click', function() {
			closeMobileMenu();
			});
		});
		
		// ESC键关闭菜单
		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape' && mobileMenuOpen) {
				closeMobileMenu();
			}
		});

		// 点击菜单外部区域关闭菜单
		document.addEventListener('click', function(e) {
			if (mobileMenuOpen && 
				!e.target.closest('.mobile-navigation') && 
				!e.target.closest('.menu-toggle')) {
				closeMobileMenu();
			}
		});
		
		// 监听窗口大小变化，重新适应布局
		window.addEventListener('resize', function() {
			if (window.innerWidth > 768) {
				if (mobileMenuOpen) {
					closeMobileMenu();
				}
				const mainNav = document.querySelector('.main-navigation');
				if (mainNav) {
					mainNav.classList.remove('toggled');
				}
			} else {
				// 移动端时更新菜单位置
				if (mobileMenuOpen) {
					updateMobileNavPosition();
				}
			}
		});
		
		// 确保菜单项在初始化时就是可见的
		const mobileMenuItems = document.querySelectorAll('.mobile-navigation .menu-item');
		mobileMenuItems.forEach(item => {
			item.style.display = 'block';
			item.style.visibility = 'visible';
			item.style.position = 'relative';
			item.style.overflow = 'visible';
		});
		
		// 为菜单切换按钮添加ARIA属性
		const menuToggleBtn = document.querySelector('.menu-toggle');
		if (menuToggleBtn) {
			menuToggleBtn.setAttribute('aria-label', '切换导航菜单');
			menuToggleBtn.setAttribute('aria-expanded', 'false');
			menuToggleBtn.setAttribute('role', 'button');
		}
		
		// 为移动端导航添加ARIA属性
		const mobileNavElement = document.querySelector('.mobile-navigation');
		if (mobileNavElement) {
			mobileNavElement.setAttribute('role', 'navigation');
			mobileNavElement.setAttribute('aria-label', '移动端导航菜单');
		}
	});

	// 等待所有资源加载完成
	window.addEventListener('load', function() {
		// 可以在这里添加需要在页面完全加载后执行的代码
	});

})(document, window);