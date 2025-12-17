import {
    loadCommentsForMessage
} from './comment-loader.js';

// Handle voting on a comment (upvote or downvote)
export const handleVote = async (commentId, vote, messageId) => {
    try {
        const response = await fetch(`/api/comments/${commentId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vote
            }),
        });
        if (!response.ok) throw new Error('Failed to vote');

        loadCommentsForMessage(messageId, 1, true); // Refresh
    } catch (error) {
        console.error('Vote error:', error);
    }
};