import {
    setSelectedFile
} from './state.js';
import {
    filePreviewContent,
    filePreviewContainer,
    fileStatus
} from './ui-elements.js';
import {
    clearSelectedFile
} from './utils.js';

// File preview update function
export const updateFilePreview = (file) => {
    // Clear previous file
    clearSelectedFile();

    // Determine if file is an image
    const isImage = file.type.startsWith('image/');

    // Update state
    const newSelectedFile = {
        file: file,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
        uploadedData: null,
        isImage: isImage
    };
    setSelectedFile(newSelectedFile);

    // Update UI
    if (isImage) {
        filePreviewContent.innerHTML = `
            <img src="${newSelectedFile.previewUrl}" alt="File preview" class="max-h-40 border-2" style="border-style: outset; border-color: #DFDFDF #808080 #808080 #DFDFDF;">
            <div class="text-xs text-gray-600 mt-1">${file.name}</div>
            <div class="text-[10px] text-gray-500">${(file.size / 1024).toFixed(1)} KB | ${file.type}</div>
        `;
    } else {
        filePreviewContent.innerHTML = `
            <div class="text-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div class="text-center text-xs text-black break-all">${file.name}</div>
            <div class="text-center text-[10px] text-gray-500 mt-0.5">${file.type || 'Unknown type'}</div>
            <div class="text-center text-[10px] text-gray-500 mt-0.5">${(file.size / 1024).toFixed(1)} KB</div>
        `;
    }

    filePreviewContainer.classList.remove('hidden');
    fileStatus.textContent = 'File selected';
    fileStatus.classList.remove('text-gray-500');
    fileStatus.classList.add('text-green-600');
};
