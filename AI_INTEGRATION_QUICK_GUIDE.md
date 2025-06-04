# AI模型集成快速指南

## 🚀 快速开始

### 1. 当前功能状态
- ✅ 图片上传和验证
- ✅ 交互式滑块对比
- ✅ 响应式布局
- ⏳ **AI图片处理** (需要集成)

### 2. 需要修改的核心函数

#### 在 `rain-fog-removal.js` 中找到并替换：

```javascript
// 当前的模拟处理函数 (第778行左右)
function processImage() {
    // ... 现有的UI逻辑
    
    // 🔄 替换这部分
    setTimeout(function() {
        const processedSrc = simulateImageProcessing(currentOriginalSrc);
        $resultImage.attr('src', processedSrc);
        // ... 后续处理
    }, 3000);
}
```

#### 替换为AI处理版本：

```javascript
async function processImage() {
    const $btn = $('#processBtn');
    const $loading = $('#loadingOverlay');
    const $originalImage = $('#original-image');
    const $resultImage = $('#result-image');
    
    // UI状态更新
    $btn.prop('disabled', true).find('span').text('AI处理中...');
    $loading.addClass('active');
    
    try {
        // 📸 获取图片数据
        const imageData = getImageAsBase64($originalImage[0]);
        
        // 🤖 调用您的AI模型
        const processedImageUrl = await callYourAIModel(imageData);
        
        // 🖼️ 更新结果图片
        $resultImage.attr('src', processedImageUrl);
        
        // ✅ 完成处理
        $resultImage.on('load', function() {
            fixOverlayImageWidth(); // 确保图片重叠
            showNotification('AI处理完成！', 'success');
        });
        
    } catch (error) {
        showNotification('处理失败：' + error.message, 'error');
    } finally {
        $loading.removeClass('active');
        $btn.prop('disabled', false).find('span').text('立即生成');
    }
}
```

### 3. 添加AI模型调用函数

```javascript
// 添加到 rain-fog-removal.js 文件末尾
async function callYourAIModel(imageData) {
    // 🚨 替换为您的实际API端点
    const API_ENDPOINT = 'https://your-ai-api.com/deraining';
    
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer YOUR_API_KEY' // 如果需要
        },
        body: JSON.stringify({
            image: imageData,
            task: 'deraining'
        })
    });
    
    if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
    }
    
    const result = await response.json();
    return result.processedImageUrl; // 返回处理后的图片URL
}

function getImageAsBase64(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    ctx.drawImage(imgElement, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.9);
}
```

## 🔧 API接口要求

### 请求格式
```json
{
    "image": "data:image/jpeg;base64,/9j/4AAQ...",
    "task": "deraining"
}
```

### 响应格式
```json
{
    "success": true,
    "processedImageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
    "processingTime": 2.5
}
```

## 🧪 测试步骤

1. **替换API端点**：修改 `API_ENDPOINT` 为您的实际地址
2. **测试上传**：上传一张雨天/雾天图片
3. **点击生成**：验证AI处理是否正常
4. **检查对比**：确认滑块可以正常对比原图和结果

## ⚡ 常用优化

### 添加进度条（可选）
```javascript
// 在loading-overlay中添加进度显示
function updateProgress(percent) {
    $('#loadingOverlay .loading-spinner p').text(`处理中... ${percent}%`);
}
```

### 添加缓存（推荐）
```javascript
const processCache = new Map();

async function callYourAIModelWithCache(imageData) {
    const hash = btoa(imageData.substring(0, 100));
    
    if (processCache.has(hash)) {
        return processCache.get(hash);
    }
    
    const result = await callYourAIModel(imageData);
    processCache.set(hash, result);
    return result;
}
```

## 🆘 故障排除

| 问题 | 解决方案 |
|------|----------|
| API调用失败 | 检查网络连接和API端点 |
| 图片不重叠 | 调用 `fixOverlayImageWidth()` |
| 处理超时 | 增加超时时间或优化图片大小 |
| 跨域错误 | 配置CORS或使用代理 |

---

**快速联系**: 有问题随时询问！ 🚀 