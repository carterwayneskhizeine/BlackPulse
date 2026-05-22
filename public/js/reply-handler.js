import {
    handlePostComment
} from './comment-post.js';
import {
    createStackEditButton
} from './utils.js';

// Handle reply functionality for comments in a flat structure
export const handleReply = (commentId, messageId, parentElement) => {
    const existingForm = document.querySelector('.reply-form');
    if (existingForm) {
        if (existingForm.dataset.replyTo === commentId) {
            existingForm.remove();
            return;
        }
        existingForm.remove();
    }

    const replyForm = document.createElement('form');
    replyForm.className = 'reply-form mt-2 mb-3 p-2 bg-white';
    replyForm.style.border = '2px inset #808080';
    replyForm.dataset.replyTo = commentId;

    replyForm.innerHTML = `
        <textarea class="reply-textarea w-full p-2 bg-white text-sm mb-2 min-w-[180px] text-xs" style="border: 2px inset #808080;" rows="2" placeholder="Write a reply..."></textarea>
        <div class="flex justify-end gap-2" id="reply-form-actions">
            <button type="submit" class="post-reply btn-bp-primary text-[10px] py-0.5 px-2">Reply</button>
        </div>
        <div class="comment-error-message hidden text-red-800 text-center text-[10px] font-bold p-1 bg-[#FFC0C0]" style="border: 2px inset #808080;"></div>
    `;

    parentElement.after(replyForm);
    replyForm.querySelector('textarea').focus();

    const textarea = replyForm.querySelector('textarea');
    const actionsContainer = replyForm.querySelector('#reply-form-actions');
    const replyBtn = actionsContainer.querySelector('.post-reply');

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel-reply btn-bp-outline text-[10px] py-0.5 px-2';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        replyForm.remove();
    });
    actionsContainer.insertBefore(cancelBtn, replyBtn);

    const stackeditBtn = createStackEditButton(textarea, replyForm);
    actionsContainer.insertBefore(stackeditBtn, cancelBtn);

    replyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = replyForm.querySelector('textarea');
        const errorDiv = replyForm.querySelector('.comment-error-message');
        handlePostComment(messageId, commentId, input, errorDiv);
    });
};
