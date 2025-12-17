import {
    handlePostComment
} from './comment-post.js';

// Handle reply functionality for comments in a flat structure
export const handleReply = (commentId, messageId, parentElement) => {
    // Globally remove any existing reply form to ensure only one is open at a time
    const existingForm = document.querySelector('.reply-form');
    if (existingForm) {
        // If the user clicks the same reply button twice, just close the form
        if (existingForm.dataset.replyTo === commentId) {
            existingForm.remove();
            return;
        }
        existingForm.remove();
    }

    const replyForm = document.createElement('form');
    // Simple, consistent styling for the reply form
    replyForm.className = 'reply-form mt-2 mb-3 p-3 bg-black border border-gray-700 rounded-lg';
    replyForm.dataset.replyTo = commentId; // Keep track of which comment this form is for

    replyForm.innerHTML = `
        <textarea class="w-full p-2 bg-black border border-gray-800 rounded text-sm mb-2 min-w-[180px]" rows="2" placeholder="Write a reply..."></textarea>
        <div class="flex justify-end gap-2">
            <button type="button" class="cancel-reply border px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-100">Cancel</button>
            <button type="submit" class="post-reply border px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-100">Reply</button>
        </div>
        <div class="comment-error-message hidden text-red-400 text-center"></div>
    `;

    // Insert the form directly after the comment element being replied to
    parentElement.after(replyForm);
    replyForm.querySelector('textarea').focus();


    replyForm.querySelector('.cancel-reply').addEventListener('click', () => {
        replyForm.remove();
    });

    replyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = replyForm.querySelector('textarea');
        const errorDiv = replyForm.querySelector('.comment-error-message');
        // The `commentId` here is the ID of the parent comment
        handlePostComment(messageId, commentId, input, errorDiv);
    });
};