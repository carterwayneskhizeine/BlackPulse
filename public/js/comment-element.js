// Comment Element Module
// Purpose: Handles creating DOM elements for comments with nesting support
// Dependencies: createButton function and converter instance (should be available globally)

// Create a DOM element for a comment (handles nesting and recursion)
const createCommentElement = (comment, messageId, depth = 0) => {
    const commentElement = document.createElement('div');
    // Use the same styling as regular messages for all depths
    commentElement.className = 'mb-3 bg-black border border-gray-800 rounded-lg p-3';
    commentElement.dataset.commentId = comment.id;

    // Format time for display
    const commentTime = new Date(comment.time).toLocaleString();

    // User info
    const userElement = document.createElement('div');
    userElement.className = 'mb-2';
    userElement.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-200">${comment.user.name}</span>
            ${comment.user.verified ? '<span class="ml-2 text-blue-400 text-sm">✓ Verified</span>' : ''}
        </div>
        <div class="flex items-center justify-between mt-1">
            <span class="text-gray-500 text-sm">${commentTime}</span>
        </div>
    `;

    // Comment text
    const textElement = document.createElement('div');
    textElement.className = 'mb-3 text-gray-300';
    // Use global converter from main.js
    if (window.converter) {
        textElement.innerHTML = window.converter.makeHtml(comment.text);
    } else {
        // Fallback: use plain text if converter not available
        textElement.textContent = comment.text;
        console.error('converter instance not found, using plain text for comment content');
    }

    // Action buttons
    const actionsElement = document.createElement('div');
    actionsElement.className = 'flex items-center gap-2 text-sm';

    // Vote buttons
    actionsElement.innerHTML = `
        <button data-action="vote" data-vote="up" data-id="${comment.id}" class="text-gray-400 hover:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
        </button>
        <span class="text-gray-400">${comment.score}</span>
        <button data-action="vote" data-vote="down" data-id="${comment.id}" class="text-gray-400 hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
    `;

    // Edit, Delete, Reply buttons
    if (window.createButton) {
        if (comment.editable) {
            const editButton = window.createButton('Edit', comment.id, 'edit');
            actionsElement.appendChild(editButton);
        }
        if (comment.deletable) {
            const deleteButton = window.createButton('Delete', comment.id, 'delete');
            actionsElement.appendChild(deleteButton);
        }
        // Only show reply button if nesting depth is less than 2
        if (depth < 2) {
            const replyButton = window.createButton('Reply', comment.id, 'reply');
            actionsElement.appendChild(replyButton);
        }
    } else {
        console.error('createButton function not found, comment action buttons will not work');
    }
    // For depth 2 and above, no reply button is shown

    // Replies container - limit nesting to 2 levels maximum
    const repliesContainer = document.createElement('div');

    if (depth >= 2) { // After 2 levels of nesting, stop creating nested styling
        // Still render the replies but without the nesting indentation and styling
        repliesContainer.className = 'mt-2 replies-container';
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(reply => {
                // Use global function for recursive call
                if (window.createCommentElement) {
                    repliesContainer.appendChild(window.createCommentElement(reply, messageId, depth + 1)); // Recursive call with incremented depth
                } else {
                    console.error('createCommentElement function not found for recursive call');
                }
            });
        }
    } else {
        // For nesting levels 0-5, use increasing indentation
        const marginLeftClass = ['ml-2', 'ml-3', 'ml-4', 'ml-5', 'ml-6', 'ml-6'][depth] || 'ml-6';
        repliesContainer.className = `${marginLeftClass} mt-2 border-l-2 border-gray-700 pl-2 replies-container`;

        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(reply => {
                // Use global function for recursive call
                if (window.createCommentElement) {
                    repliesContainer.appendChild(window.createCommentElement(reply, messageId, depth + 1)); // Recursive call with incremented depth
                } else {
                    console.error('createCommentElement function not found for recursive call');
                }
            });
        }
    }

    commentElement.appendChild(userElement);
    commentElement.appendChild(textElement);
    commentElement.appendChild(actionsElement);
    commentElement.appendChild(repliesContainer);

    return commentElement;
};

// Make function globally available for use in main.js and for recursive calls
window.createCommentElement = createCommentElement;