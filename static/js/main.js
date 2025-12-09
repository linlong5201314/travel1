document.addEventListener('DOMContentLoaded', function() {
    // 自动隐藏闪现消息
    const flashMessages = document.querySelectorAll('.flash-message');
    if (flashMessages.length > 0) {
        setTimeout(function() {
            flashMessages.forEach(message => {
                message.style.opacity = '0';
                message.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    message.style.display = 'none';
                }, 500);
            });
        }, 2000);
    }
    
    // 处理字体图标加载
    handleFontLoading();
}); 

// 处理字体加载的函数
function handleFontLoading() {
    // 创建Font Awesome检测元素
    const fontAwesomeDetector = document.createElement('i');
    fontAwesomeDetector.className = 'fas fa-circle';
    fontAwesomeDetector.style.visibility = 'hidden';
    fontAwesomeDetector.style.position = 'absolute';
    fontAwesomeDetector.style.top = '-9999px';
    fontAwesomeDetector.style.left = '-9999px';
    document.body.appendChild(fontAwesomeDetector);
    
    // 字体检测函数
    function checkFontLoaded() {
        const loaded = isFontLoaded('FontAwesome') || 
                       isFontLoaded('Font Awesome 5 Free') || 
                       isFontLoaded('Font Awesome 6 Free');
        
        if (loaded) {
            document.documentElement.classList.add('fonts-loaded');
            console.log('字体图标已成功加载');
            
            // 移除检测元素
            if (fontAwesomeDetector) {
                document.body.removeChild(fontAwesomeDetector);
            }
            
            return true;
        }
        
        return false;
    }
    
    // 立即检测一次
    if (!checkFontLoaded()) {
        // 如果没有加载，设置定时检测
        const checkInterval = setInterval(function() {
            if (checkFontLoaded()) {
                clearInterval(checkInterval);
            }
        }, 100);
        
        // 设置超时，最多等待3秒
        setTimeout(function() {
            clearInterval(checkInterval);
            if (!document.documentElement.classList.contains('fonts-loaded')) {
                document.documentElement.classList.add('fonts-loaded');
                console.log('字体加载超时，已启用后备显示');
                
                // 移除检测元素
                if (fontAwesomeDetector) {
                    document.body.removeChild(fontAwesomeDetector);
                }
            }
        }, 3000);
    }
    
    // 使用更可靠的方式检测字体是否加载完成
    function isFontLoaded(fontFamily) {
        // 创建两个元素，一个使用目标字体，一个使用后备字体
        const fontTest = document.createElement('span');
        fontTest.style.fontFamily = fontFamily + ', monospace';
        fontTest.style.fontSize = '40px';
        fontTest.style.visibility = 'hidden';
        fontTest.style.position = 'absolute';
        fontTest.style.top = '-9999px';
        fontTest.style.left = '-9999px';
        fontTest.innerHTML = '千万';
        
        const fallbackTest = document.createElement('span');
        fallbackTest.style.fontFamily = 'monospace';
        fallbackTest.style.fontSize = '40px';
        fallbackTest.style.visibility = 'hidden';
        fallbackTest.style.position = 'absolute';
        fallbackTest.style.top = '-9999px';
        fallbackTest.style.left = '-9999px';
        fallbackTest.innerHTML = '千万';
        
        document.body.appendChild(fontTest);
        document.body.appendChild(fallbackTest);
        
        // 比较两个元素的宽度，如果不同，则说明目标字体已加载
        const widthsDiffer = fontTest.offsetWidth !== fallbackTest.offsetWidth;
        
        // 清理
        document.body.removeChild(fontTest);
        document.body.removeChild(fallbackTest);
        
        return widthsDiffer;
    }
} 