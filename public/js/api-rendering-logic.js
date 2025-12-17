// API & Rendering Logic Module
// Purpose: Handles fetching messages from API and rendering them to the DOM
// Dependencies: Requires multiple global variables and functions from main.js

// Main function to fetch and render messages from the API
const fetchAndRenderMessages = async (page = 1) => {
    // Note: Dependencies are checked individually when needed to ensure flexibility

    try {
        // Check fundamental dependencies with more lenient approach
        const missingDeps = [];
        if (typeof window.currentPage === 'undefined') missingDeps.push('currentPage');
        if (typeof window.totalPages === 'undefined') missingDeps.push('totalPages');
        if (typeof window.currentPrivateKey === 'undefined') missingDeps.push('currentPrivateKey');
        if (!window.privateKeyInput) missingDeps.push('privateKeyInput');
        if (!window.messageList) missingDeps.push('messageList');
        if (typeof window.messages === 'undefined') missingDeps.push('messages');

        if (missingDeps.length > 0) {
            console.error('fetchAndRenderMessages: Missing dependencies:', missingDeps);
            // Instead of reloading, try to continue with basic error handling
            return;
        }

        // 更新当前页码
        window.currentPage = page;

        // 获取当前输入的 private key
        window.currentPrivateKey = window.privateKeyInput.value.trim();

        // 构建 URL
        let url = `/api/messages?page=${page}&limit=5`;
        if (window.currentPrivateKey) {
            url += `&privateKey=${encodeURIComponent(window.currentPrivateKey)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch messages.');

        const data = await response.json();
        window.messages = data.messages || [];
        window.totalPages = data.pagination?.totalPages || 1;

        // 更新用户状态（如果API返回了userId）
        if (data.userId && !window.currentUser) {
            // 如果API返回了userId但前端不知道，重新检查认证状态
            if (window.checkAuthStatus) {
                await window.checkAuthStatus();
            }
        }

        // 渲染消息
        window.messageList.innerHTML = '';
        if (window.renderMessage) {
            window.messages.forEach(message => {
                window.messageList.appendChild(window.renderMessage(message));
                // 自动加载评论
                if (window.loadCommentsForMessage) {
                    window.loadCommentsForMessage(message.id);
                }
            });
        } else {
            console.error('renderMessage function not available');
        }

        // 渲染分页控件
        if (window.renderPagination) {
            window.renderPagination();
        } else {
            console.error('renderPagination function not available');
        }

        // 错误提示处理
        if (window.currentPrivateKey) {
            // 使用后端返回的 hasPrivateMessages 标志，如果不存在则回退到前端检查
            const hasPrivateMessages = data.hasPrivateMessages !== undefined ?
                data.hasPrivateMessages :
                window.messages.some(m => m.is_private === 1);

            if (!hasPrivateMessages) {
                window.errorMessage.textContent = 'No matching message found';
                window.errorMessage.classList.remove('hidden');
            } else {
                window.errorMessage.classList.add('hidden');
            }
        } else {
            window.errorMessage.classList.add('hidden');
        }

        // 更新URL状态
        if (window.updateURL) {
            window.updateURL();
        }
    } catch (error) {
        console.error('Error:', error);
        window.messageList.innerHTML = '<p class="text-red-500 text-center">Could not load messages.</p>';
        window.errorMessage.classList.add('hidden');
    }
};

// Make function globally available
window.fetchAndRenderMessages = fetchAndRenderMessages;