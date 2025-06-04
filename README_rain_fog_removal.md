# 雨雾去除功能 - 技术文档



### 文件结构
```
├── rain-fog-removal.html    # 主页面HTML
├── rain-fog-removal.css     # 专用样式文件
├── rain-fog-removal.js      # 核心交互逻辑
└── decorate/                # 示例图片资源
    ├── project1.jpg         # 示例原图
    ├── slider-1.jpg         # 示例处理结果
    └── ...
```

### 核心HTML结构
```html
<div class="comparison-image-container">
    <!-- 背景图片 - 显示原图 -->
    <img id="original-image" src="..." class="comparison-image original-image">
    
    <!-- 前景遮罩层 - 显示处理后图片 -->
    <div class="comparison-overlay" id="comparisonOverlay">
        <img id="result-image" src="..." class="comparison-image result-image">
    </div>
    
    <!-- 滑块控制器 -->
    <div class="comparison-slider" id="comparisonSlider">
        <div class="slider-line"></div>
        <div class="slider-handle">
            <div class="handle-icon">
                <i class="fas fa-arrows-alt-h"></i>
            </div>
        </div>
    </div>
</div>
```

## 图片替换逻辑详解

### 1. 图片显示原理

#### 叠层结构
- **背景层** (`#original-image`): 显示原始图片
- **遮罩层** (`#result-image`): 显示处理后的图片
- **控制层** (`#comparisonSlider`): 滑块控制界面

#### 遮罩逻辑
```javascript
// 滑块位置 → 遮罩宽度映射
// 滑块在左边(0%): 遮罩宽度0%, 完全显示背景(原图)
// 滑块在右边(100%): 遮罩宽度100%, 完全显示遮罩(处理后图片)
overlay.css('width', percentage + '%');
```

### 2. 关键函数说明

#### `handleFileUpload(file)` - 文件上传处理
```javascript
function handleFileUpload(file) {
    // 1. 文件验证（类型、大小、尺寸）
    // 2. 读取文件数据
    // 3. 更新两个图片元素的src为同一张上传图片
    // 4. 调整容器尺寸
    // 5. 修正遮罩层图片宽度
}
```

#### `processImage()` - 图片处理（待实现）
```javascript
function processImage() {
    // 当前: 模拟处理，返回示例结果图片
    // 待实现: 调用AI模型API进行实际处理
    
    // 1. 获取当前原图
    const currentOriginalSrc = $('#original-image').attr('src');
    
    // 2. 发送到AI模型处理 (待实现)
    // const processedResult = await callAIModel(currentOriginalSrc);
    
    // 3. 更新结果图片
    $('#result-image').attr('src', processedResult);
    
    // 4. 修正遮罩层图片宽度
    fixOverlayImageWidth();
}
```

#### `fixOverlayImageWidth()` - 图片重叠修正
```javascript
function fixOverlayImageWidth() {
    const $container = $('.comparison-image-container');
    const $resultImage = $('#result-image');
    
    // 确保遮罩层内的图片宽度与容器一致，实现重叠
    const containerWidth = $container[0].getBoundingClientRect().width;
    $resultImage.css('width', containerWidth + 'px');
}
```

#### `updateSliderPosition(e)` - 滑块控制
```javascript
function updateSliderPosition(e) {
    // 1. 计算鼠标/触摸位置百分比
    const percentage = (x / containerWidth) * 100;
    
    // 2. 更新滑块位置
    slider.css('left', percentage + '%');
    
    // 3. 更新遮罩层宽度
    overlay.css('width', percentage + '%');
    
    // 4. 修正图片重叠
    fixOverlayImageWidth();
}
```

### 3. 图片状态管理

#### 状态流转
```
初始状态: 示例图片 (原图 + 处理结果)
    ↓
用户上传: 上传图片 → 两层都显示上传的原图
    ↓
AI处理: 保持原图 → 更新处理后图片
    ↓
结果展示: 原图 + 处理结果 (叠放)
```

#### 图片更新时机
1. **示例选择**: `loadSampleImage()` - 加载预设的原图和结果
2. **文件上传**: `handleFileUpload()` - 两层都显示上传图片
3. **图片处理**: `processImage()` - 仅更新结果层图片
4. **容器调整**: `adjustImageContainer()` - 响应式尺寸调整

## 模型集成指南

### 1. API接口设计建议

#### 请求格式
```javascript
// 推荐的API调用方式
async function callAIDerainingModel(imageData) {
    const formData = new FormData();
    formData.append('image', imageData);
    formData.append('task', 'deraining'); // 去雨
    // formData.append('task', 'defogging'); // 去雾
    
    const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    
    const result = await response.json();
    return result.processedImageUrl;
}
```

#### 响应格式
```json
{
    "success": true,
    "processedImageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
    "processingTime": 2.34,
    "confidence": 0.92,
    "metadata": {
        "originalSize": "1920x1080",
        "processedSize": "1920x1080",
        "algorithm": "DeRain-Net-v2"
    }
}
```

### 2. 集成实现步骤

#### Step 1: 修改 `processImage()` 函数
```javascript
async function processImage() {
    const $btn = $('#processBtn');
    const $loading = $('#loadingOverlay');
    const $originalImage = $('#original-image');
    const $resultImage = $('#result-image');
    
    // 禁用按钮并显示加载状态
    $btn.prop('disabled', true).find('span').text('AI处理中...');
    $loading.addClass('active');
    
    try {
        // 获取当前图片数据
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = $originalImage[0];
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        
        // 调用AI模型API
        const processedImageUrl = await callAIDerainingModel(imageData);
        
        // 更新结果图片
        $resultImage.attr('src', processedImageUrl);
        
        // 图片加载完成后的处理
        $resultImage.off('load.ai-process').on('load.ai-process', function() {
            setTimeout(() => {
                adjustImageContainer();
                fixOverlayImageWidth();
                showNotification('AI处理完成！拖动滑块查看对比效果', 'success');
            }, 50);
        });
        
    } catch (error) {
        console.error('AI处理失败:', error);
        showNotification('AI处理失败，请重试', 'error');
    } finally {
        // 恢复按钮状态
        $loading.removeClass('active');
        $btn.prop('disabled', false).find('span').text('立即生成');
    }
}
```

#### Step 2: 添加进度指示器
```javascript
// 在CSS中添加进度条样式
.loading-overlay .progress-bar {
    width: 200px;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    margin: 10px auto;
    overflow: hidden;
}

.loading-overlay .progress-fill {
    height: 100%;
    background: var(--primary-color);
    width: 0%;
    transition: width 0.3s ease;
}

// JavaScript中更新进度
function updateProcessingProgress(percentage) {
    $('.loading-overlay .progress-fill').css('width', percentage + '%');
}
```

#### Step 3: 错误处理和重试机制
```javascript
async function processImageWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await processImage();
        } catch (error) {
            console.warn(`处理尝试 ${attempt} 失败:`, error);
            
            if (attempt === maxRetries) {
                throw new Error('多次尝试后仍然失败');
            }
            
            // 指数退避重试
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
}
```

### 3. 性能优化建议

#### 图片预处理
```javascript
function preprocessImage(imageElement, maxSize = 1024) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 计算压缩尺寸
    let { width, height } = imageElement;
    if (Math.max(width, height) > maxSize) {
        const ratio = maxSize / Math.max(width, height);
        width *= ratio;
        height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 绘制压缩后的图片
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.8);
}
```

#### 缓存机制
```javascript
const processedImageCache = new Map();

function getCacheKey(imageData) {
    // 使用图片哈希或URL作为缓存键
    return btoa(imageData.substring(0, 100));
}

async function processImageWithCache(imageData) {
    const cacheKey = getCacheKey(imageData);
    
    if (processedImageCache.has(cacheKey)) {
        return processedImageCache.get(cacheKey);
    }
    
    const result = await callAIDerainingModel(imageData);
    processedImageCache.set(cacheKey, result);
    
    return result;
}
```

## 测试和调试

### 1. 功能测试清单
- [ ] 示例图片切换正常
- [ ] 文件上传功能正常（拖拽 + 点击）
- [ ] 图片格式验证有效
- [ ] 滑块拖拽流畅
- [ ] 图片完美重叠
- [ ] 响应式布局适配
- [ ] AI处理按钮交互
- [ ] 错误提示显示正确

### 2. 调试工具
```javascript
// 开发者调试函数
window.debugImageComparison = function() {
    console.log('=== 图片对比调试信息 ===');
    console.log('容器尺寸:', $('.comparison-image-container')[0].getBoundingClientRect());
    console.log('原图尺寸:', $('#original-image')[0].getBoundingClientRect());
    console.log('结果图尺寸:', $('#result-image')[0].getBoundingClientRect());
    console.log('遮罩层宽度:', $('#comparisonOverlay').css('width'));
    console.log('滑块位置:', $('#comparisonSlider').css('left'));
};

// 强制重新计算图片宽度
window.forceFixImageWidth = function() {
    fixOverlayImageWidth();
    console.log('已强制修正图片宽度');
};
```
