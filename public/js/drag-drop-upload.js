// Drag and Drop File Upload Module
// Purpose: Enables drag-and-drop file upload functionality for the message form
// Dependencies:
// - Requires messageForm DOM element (from ui-elements.js)
// - Requires updateFilePreview function (from file-preview.js)

import { messageForm } from './ui-elements.js';
import { updateFilePreview } from './file-preview.js';

// Drag-over style class name
const DRAG_OVER_CLASS = 'drag-over-active';

/**
 * Handles dragover events on the message form
 * Prevents default behavior and adds visual feedback
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (messageForm) {
        messageForm.classList.add(DRAG_OVER_CLASS);
    }
}

/**
 * Handles dragleave events on the message form
 * Removes visual feedback only when leaving the form entirely
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (messageForm) {
        // Only remove the class if we're leaving the form entirely
        // (not just moving between child elements)
        if (!messageForm.contains(e.relatedTarget)) {
            messageForm.classList.remove(DRAG_OVER_CLASS);
        }
    }
}

/**
 * Handles drop events on the message form
 * Processes the dropped file and triggers the file preview
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    // Remove drag-over styling
    if (messageForm) {
        messageForm.classList.remove(DRAG_OVER_CLASS);
    }

    // Get dropped files
    const files = e.dataTransfer.files;
    if (files.length === 0) {
        return;
    }

    // Only handle the first file
    const file = files[0];

    // Validate file size (50MB limit - same as existing upload)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
        alert('File is too large. Maximum size is 50MB.');
        return;
    }

    // Use existing file preview logic
    updateFilePreview(file);
}

/**
 * Initializes drag-and-drop file upload functionality
 * Sets up event listeners on the message form
 */
export const initDragDropUpload = () => {
    if (!messageForm) {
        console.error('Message form element not found');
        return;
    }

    // Add drag event listeners
    messageForm.addEventListener('dragover', handleDragOver);
    messageForm.addEventListener('dragleave', handleDragLeave);
    messageForm.addEventListener('drop', handleDrop);

    console.log('Drag-and-drop file upload initialized');
};
