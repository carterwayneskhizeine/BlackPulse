// Message Reply Button Module
// Purpose: Manages visibility of reply buttons for messages in the message board
// Dependencies: None

// Hide the reply button for a specific message
export const hideMessageReplyButton = (messageId) => {
    const messageElement = document.querySelector(`[data-message-id='${messageId}']`);
    if (!messageElement) return;

    const replyButton = messageElement.querySelector('button[data-action="reply"]');
    if (replyButton) {
        replyButton.classList.add('hidden');
    }
};

// Show the reply button for a specific message
export const showMessageReplyButton = (messageId) => {
    const messageElement = document.querySelector(`[data-message-id='${messageId}']`);
    if (!messageElement) return;

    const replyButton = messageElement.querySelector('button[data-action="reply"]');
    if (replyButton) {
        replyButton.classList.remove('hidden');
    }
};