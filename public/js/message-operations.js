// Message Operations Module
// Purpose: Handles message deletion and saving operations
// Dependencies:
// - Requires window.messages array (defined in main.js)
// - Requires window.renderMessage function (defined in main.js)
// - Requires window.fetchAndRenderMessages function (defined in main.js)
// - Requires window.loadCommentsForMessage function (defined in comment-loader.js)

const deleteMessage = async (id) => {
    const messageElement = document.querySelector(`[data-message-id='${id}']`);
    const originalIndex = window.messages.findIndex(m => m.id == id);
    const originalMessage = window.messages[originalIndex];

    // Optimistically remove from DOM
    if (messageElement) {
        messageElement.remove();
    }
    // And from local state
    window.messages = window.messages.filter(m => m.id != id);

    try {
        const response = await fetch(`/api/messages/${id}`, {
            method: 'DELETE'
        });
        if (response.status !== 204) {
            throw new Error('Server failed to delete message.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        // On error, restore the message in the local array and re-render
        if (originalMessage && originalIndex !== -1) {
            window.messages.splice(originalIndex, 0, originalMessage);
        }
        if (window.fetchAndRenderMessages) {
            window.fetchAndRenderMessages(); // Fallback to full render on error
        }
    }
};

const saveMessage = async (id) => {
    console.log('saveMessage called with id:', id);
    const messageElement = document.querySelector(`[data-message-id='${id}']`);
    console.log('Message element found:', messageElement);

    if (!messageElement) {
        console.error('Message element not found for id:', id);
        return;
    }

    const input = messageElement.querySelector('textarea');
    console.log('Textarea input found:', input);

    if (!input) {
        console.error('Textarea input not found in message element');
        return;
    }

    const content = input.value.trim();
    console.log('Content to save:', content);
    if (!content) {
        console.log('No content to save, returning');
        return;
    }

    try {
        const response = await fetch(`/api/messages/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content
            })
        });
        console.log('PUT response status:', response.status);

        if (response.ok) {
            const updatedMessage = await response.json();
            console.log('Updated message received:', updatedMessage);

            // Update local messages array
            const index = window.messages.findIndex(m => m.id == id);
            console.log('Message index in array:', index);

            if (index !== -1) {
                window.messages[index] = updatedMessage;
                console.log('Messages array updated');
            }

            // Create a new rendered element for the updated message
            console.log('window.renderMessage available:', !!window.renderMessage);
            const newMessageElement = window.renderMessage ? window.renderMessage(updatedMessage) : null;
            console.log('New message element created:', newMessageElement);

            if (newMessageElement) {
                // Replace the old element with the new one
                messageElement.replaceWith(newMessageElement);
                console.log('Message element replaced in DOM');

                // Load comments for the updated message (comments are visible by default)
                console.log('window.loadCommentsForMessage available:', !!window.loadCommentsForMessage);
                if (window.loadCommentsForMessage) {
                    window.loadCommentsForMessage(id);
                    console.log('Comments loaded for message');
                }
            } else {
                console.error('Failed to create new message element');
            }
        } else {
            const errorText = await response.text();
            console.error('Save failed with status:', response.status, 'Error:', errorText);
            throw new Error(`Failed to save message. Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error in saveMessage:', error);
        alert(error.message);
    }
};

// Make functions globally available
window.deleteMessage = deleteMessage;
window.saveMessage = saveMessage;