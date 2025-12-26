import {
    handlePostComment
} from './comment-post.js';
import {
    createStackEditButton
} from './utils.js';

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
    replyForm.className = 'reply-form mt-2 mb-3 p-3 bg-bp-dark border border-bp-gray rounded-lg';
    replyForm.dataset.replyTo = commentId; // Keep track of which comment this form is for

    replyForm.innerHTML = `
        <textarea class="reply-textarea w-full p-2 bg-bp-black border border-bp-gray rounded text-sm mb-2 min-w-[180px]" rows="2" placeholder="Write a reply..."></textarea>
        <div class="flex justify-end gap-2" id="reply-form-actions">
            <button type="submit" class="post-reply border px-2 py-1 rounded text-xs text-bp-text-muted hover:text-bp-gold hover:border-bp-gold">Reply</button>
        </div>
        <div class="comment-error-message hidden text-red-400 text-center"></div>
    `;

    // Insert the form directly after the comment element being replied to
    parentElement.after(replyForm);
    replyForm.querySelector('textarea').focus();

    // Get textarea and actions container
    const textarea = replyForm.querySelector('textarea');
    const actionsContainer = replyForm.querySelector('#reply-form-actions');
    const replyBtn = actionsContainer.querySelector('.post-reply');

    // Create Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel-reply border border-bp-gray px-2 py-1 rounded text-xs text-bp-text-muted hover:text-bp-gold hover:border-bp-gold';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        replyForm.remove();
    });
    // Insert Cancel before Reply
    actionsContainer.insertBefore(cancelBtn, replyBtn);

    // Create and add StackEdit button
    const stackeditBtn = createStackEditButton(textarea, replyForm);
    // Insert StackEdit before Cancel
    actionsContainer.insertBefore(stackeditBtn, cancelBtn);

    replyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = replyForm.querySelector('textarea');
        const errorDiv = replyForm.querySelector('.comment-error-message');
        // The `commentId` here is the ID of the parent comment
        handlePostComment(messageId, commentId, input, errorDiv);
    });
};