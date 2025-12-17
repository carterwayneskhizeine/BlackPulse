import {
    loadCommentsForMessage
} from './comment-loader.js';

// Handle posting a new comment (top-level or reply)
export const handlePostComment = async (messageId, parentId, inputElement, errorElement) => {
    const content = inputElement.value.trim();
    if (!content) {
        errorElement.textContent = 'Comment cannot be empty.';
        errorElement.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageId,
                pid: parentId,
                text: content
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to post comment');
        }

        inputElement.value = '';
        errorElement.classList.add('hidden');

        // 不再刷新页面，直接重新加载该消息的评论
        await loadCommentsForMessage(messageId, 1, true); // Force refresh

    } catch (error) {
        console.error('Error posting comment:', error);
        errorElement.textContent = error.message;
        errorElement.classList.remove('hidden');
    }
};