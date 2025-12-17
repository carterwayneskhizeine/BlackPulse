import {
    loadCommentsForMessage
} from './comment-loader.js';

// Handle deletion of a comment with confirmation and refresh
export const handleDeleteComment = async (commentId, messageId) => {
    if (!confirm('Are you sure?')) return;
    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete comment');

        // Refresh comments
        const commentsContainer = document.getElementById(`comments-for-${messageId}`);
        if (commentsContainer) {
            // Clear loaded flag to force reload
            delete commentsContainer.dataset.loaded;
        }

        loadCommentsForMessage(messageId, 1, true); // Refresh
    } catch (error) {
        console.error('Delete error:', error);
    }
};