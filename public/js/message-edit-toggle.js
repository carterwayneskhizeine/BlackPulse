// Message Edit Toggle Module
// Purpose: Handles toggling the edit view for messages (switching between display and edit modes)
// Dependencies: Requires window.createButton and window.messages to be available globally

(function() {
    'use strict';

    const toggleEditView = (id) => {
        // Access the global messages array
        const originalMessage = window.messages.find(m => m.id == id);
        if (!originalMessage) return;

        // If message has file (has_image is 1), don't allow editing (because a message can only have one file and files can't be deleted during editing)
        if (originalMessage.has_image === 1) {
            alert('Cannot edit messages with files. You can only edit the text content of file messages by deleting and reposting.');
            return;
        }

        const messageElement = document.querySelector(`[data-message-id='${id}']`);
        const contentContainer = messageElement.querySelector('.mb-2');
        const footer = messageElement.querySelector('.flex.justify-between');

        // Find the text content div (if it exists)
        const contentDiv = contentContainer.querySelector('.prose');
        if (!contentDiv) {
            alert('No text content to edit');
            return;
        }

        // Create an input area with the raw markdown
        const editInput = document.createElement('textarea');
        editInput.className = 'w-full p-2 bg-black border border-gray-800 rounded-lg focus:ring-2 focus:ring-gray-100 focus:outline-none transition-shadow text-gray-200';
        editInput.value = originalMessage.content;
        editInput.rows = 8;

        // Create new action buttons
        const saveButton = window.createButton('Save', id, 'save');
        const cancelButton = window.createButton('Cancel', id, 'cancel');
        const newActions = document.createElement('div');
        newActions.className = 'flex gap-2 mt-2 self-end';
        newActions.appendChild(saveButton);
        newActions.appendChild(cancelButton);

        // Replace elements
        contentDiv.replaceWith(editInput);
        footer.style.display = 'none'; // Hide the original footer
        messageElement.appendChild(newActions);
        editInput.focus();
    };

    // Expose the function globally so it can be used by other modules
    window.toggleEditView = toggleEditView;
})();