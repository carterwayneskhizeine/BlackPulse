// Reply Handler Module
// Purpose: Handles reply functionality for comments in the message board
// Dependencies: handlePostComment function (should be available globally)

// Handle reply functionality for comments
const handleReply = (commentId, messageId, parentElement) => {
    // Remove existing reply forms
    const existingForm = parentElement.querySelector('.reply-form');
    if (existingForm) {
        existingForm.remove();
        return;
    }

    // Check the nesting depth of the parent element to determine styling
    const isDeepNesting = parentElement.closest('[data-comment-id]') ?
                         (parentElement.closest('[data-comment-id]').className.includes('bg-black')) : false;

    const replyForm = document.createElement('form');
    if (isDeepNesting) {
        // Use the same styling as regular messages for deep nesting
        replyForm.className = 'reply-form mt-2 ml-3 p-3 bg-black border border-gray-800 rounded-lg';
    } else {
        replyForm.className = 'reply-form mt-2 ml-4 pt-2 border-l-2 border-gray-700 pl-3';
    }

    replyForm.innerHTML = `
        <textarea class="w-full p-2 bg-black border border-gray-800 rounded text-sm mb-2 min-w-[180px]" rows="2" placeholder="Write a reply..."></textarea>
        <div class="flex justify-end gap-2">
            <button type="button" class="cancel-reply border px-2 py-1 rounded text-xs">Cancel</button>
            <button type="submit" class="post-reply border px-2 py-1 rounded text-xs">Reply</button>
        </div>
        <div class="comment-error-message hidden text-red-400 text-center"></div>
    `;

    parentElement.querySelector('.replies-container').appendChild(replyForm);

    replyForm.querySelector('.cancel-reply').addEventListener('click', () => {
        replyForm.remove();
    });

    replyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = replyForm.querySelector('textarea');
        const errorDiv = replyForm.querySelector('.comment-error-message');
        // Use global handlePostComment function from main.js
        if (window.handlePostComment) {
            window.handlePostComment(messageId, commentId, input, errorDiv);
        } else {
            console.error('handlePostComment function not found');
            errorDiv.textContent = 'Error: Reply functionality not available';
            errorDiv.classList.remove('hidden');
        }
    });
};