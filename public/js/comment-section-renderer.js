// Comment Section Renderer Module
// Purpose: Handles rendering of comment sections with forms, pagination, and event delegation
// Dependencies: Multiple comment handling functions (should be available globally)

// Render the complete comment section structure
const renderCommentSection = (container, messageId, comments, pagination) => {
    container.innerHTML = ''; // Clear previous content

    // 1. Comments List
    const commentsListContainer = document.createElement('div');
    commentsListContainer.className = 'comments-list';
    if (comments.length === 0) {
        commentsListContainer.innerHTML = '<p class="text-gray-500 text-center">No comments yet.</p>';

        // If no comments, add the form at the top (visible when container is shown)
        // 2. Comment Form
        const commentForm = document.createElement('form');
        commentForm.className = 'flex flex-col gap-4 mb-8';
        commentForm.innerHTML = `
            <textarea
                class="w-full p-4 bg-black border border-gray-800 rounded-lg focus:ring-2 focus:ring-gray-100 focus:outline-none transition-shadow text-gray-400 placeholder:text-gray-600"
                rows="3"
                placeholder="Add a comment..."></textarea>
            <div class="flex justify-end">
                <button type="submit" class="border border-gray-700 hover:border-gray-100 text-gray-400 hover:text-gray-100 font-bold py-2 px-4 rounded-lg transition-colors">
                    Post Comment
                </button>
            </div>
            <div class="comment-error-message hidden text-red-400 text-center font-bold p-3 bg-black rounded-lg border border-red-800" role="alert"></div>
        `;
        container.appendChild(commentForm);
    } else {
        // If there are comments, add them first
        comments.forEach(comment => {
            if (window.createCommentElement) {
                commentsListContainer.appendChild(window.createCommentElement(comment, messageId, 0)); // Start with depth 0 for top-level comments
            } else {
                console.error('createCommentElement function not found, skipping comment rendering');
            }
        });
        container.appendChild(commentsListContainer);

        // Then add the comment form at the bottom
        // 2. Comment Form (at the bottom when there are comments)
        const commentForm = document.createElement('form');
        commentForm.className = 'flex flex-col gap-4 mt-8';
        commentForm.innerHTML = `
            <textarea
                class="w-full p-4 bg-black border border-gray-800 rounded-lg focus:ring-2 focus:ring-gray-100 focus:outline-none transition-shadow text-gray-400 placeholder:text-gray-600"
                rows="3"
                placeholder="Add a comment..."></textarea>
            <div class="flex justify-end">
                <button type="submit" class="border border-gray-700 hover:border-gray-100 text-gray-400 hover:text-gray-100 font-bold py-2 px-4 rounded-lg transition-colors">
                    Post Comment
                </button>
            </div>
            <div class="comment-error-message hidden text-red-400 text-center font-bold p-3 bg-black rounded-lg border border-red-800" role="alert"></div>
        `;
        container.appendChild(commentForm);
    }

    // 3. Comments Pagination
    const commentsPaginationContainer = document.createElement('div');
    commentsPaginationContainer.className = 'comments-pagination-container mt-4';
    if (pagination && pagination.totalPages > 1) {
        // Simplified pagination for now
        const paginationElement = document.createElement('div');
        paginationElement.className = 'flex justify-center items-center gap-2';
        paginationElement.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
        commentsPaginationContainer.appendChild(paginationElement);
    }
    container.appendChild(commentsPaginationContainer);

    // 4. Add event listener for the new form - needs to be added in both cases
    const formToUse = container.querySelector('form'); // Get the form that was just added
    formToUse.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = formToUse.querySelector('textarea');
        const errorDiv = formToUse.querySelector('.comment-error-message');

        if (window.handlePostComment) {
            window.handlePostComment(messageId, null, input, errorDiv);
        } else {
            console.error('handlePostComment function not found, comment submission will not work');
        }
    });

    // 5. Delegated event listeners for comment actions
    commentsListContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const commentId = button.dataset.id;

        if (action === 'vote') {
            const vote = button.dataset.vote === 'up' ? 1 : -1;
            if (window.handleVote) {
                window.handleVote(commentId, vote, messageId);
            } else {
                console.error('handleVote function not found, voting will not work');
            }
        } else if (action === 'edit') {
            if (window.handleEditComment) {
                window.handleEditComment(commentId, messageId, commentsListContainer);
            } else {
                console.error('handleEditComment function not found, editing will not work');
            }
        } else if (action === 'delete') {
            if (window.handleDeleteComment) {
                window.handleDeleteComment(commentId, messageId);
            } else {
                console.error('handleDeleteComment function not found, deletion will not work');
            }
        } else if (action === 'reply') {
            const commentElement = button.closest('[data-comment-id]');
            if (window.handleReply) {
                window.handleReply(commentId, messageId, commentElement);
            } else {
                console.error('handleReply function not found, replying will not work');
            }
        }
    });
};

// Make function globally available for use in main.js
window.renderCommentSection = renderCommentSection;