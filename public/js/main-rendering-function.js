import {
    createButton
} from './utils.js';
import {
    youtubeExtension
} from './youtube-extension.js';
import {
    loadCommentsForMessage
} from './comment-loader.js';
import {
    currentUser,
    currentFeedType
} from './state.js';


let extensions = [];
if (youtubeExtension &&
    typeof youtubeExtension === 'object' &&
    youtubeExtension.type &&
    youtubeExtension.regex &&
    youtubeExtension.replace) {
    extensions.push(youtubeExtension);
}

// Mermaid extension for Showdown
const mermaidExtension = {
    type: 'output',
    filter: function (text) {
        // Find code blocks with language-mermaid and convert to div.mermaid
        return text.replace(/<pre><code class="mermaid language-mermaid">([\s\S]+?)<\/code><\/pre>/g, (match, code) => {
            const decodedCode = code
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
            return `<div class="mermaid">${decodedCode}</div>`;
        });
    }
};
extensions.push(mermaidExtension);

export const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    strikethrough: true,
    tasklists: true,
    tables: true,
    noHeaderId: false,
    simplifiedAutoLink: true,
    extensions: extensions
});

// Main message rendering function
export const renderMessage = (message) => {
    // Wrapper: Retro card style
    const messageElement = document.createElement('div');
    messageElement.className = 'card-bp animate-fade-in flex flex-col group';
    messageElement.dataset.messageId = message.id;

    const contentContainer = document.createElement('div');
    contentContainer.className = 'mb-3';

    // Show files if any
    if (message.has_image === 1 && message.image_filename) {
        const fileContainer = document.createElement('div');
        fileContainer.className = 'mb-3';

        const isImage = message.image_mime_type && message.image_mime_type.startsWith('image/');
        const isVideo = message.image_mime_type && message.image_mime_type.startsWith('video/');

        if (isImage) {
            let imageUrl = `/uploads/${message.image_filename}`;
            if (message.is_private === 1 && message.private_key) {
                imageUrl += `?privateKey=${encodeURIComponent(message.private_key)}`;
            }
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Uploaded image';
            img.className = 'w-full max-h-[500px] object-cover border-2 cursor-pointer hover:opacity-90';
            img.style.borderStyle = 'outset';
            img.style.borderColor = '#DFDFDF #808080 #808080 #DFDFDF';

            // Click to enlarge
            img.addEventListener('click', () => {
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-4 animate-fade-in';
                modal.innerHTML = `
                    <div class="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center">
                        <img src="${img.src}" alt="Full size image" class="max-w-full max-h-[85vh] border-2" style="border-style: outset; border-color: #DFDFDF #808080 #808080 #DFDFDF;">
                        <button class="absolute -top-10 right-0 md:top-3 md:right-3 bg-[#C0C0C0] text-black p-1 border-2 text-xs font-bold"
                            style="border-style: outset; border-color: #DFDFDF #808080 #808080 #DFDFDF;">
                            [X] Close
                        </button>
                    </div>
                `;

                const closeBtn = modal.querySelector('button');
                closeBtn.addEventListener('click', () => {
                    document.body.removeChild(modal);
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                    }
                });

                document.body.appendChild(modal);
            });

            const fileNameDisplay = document.createElement('div');
            fileNameDisplay.className = 'text-xs font-bold text-black truncate mt-1 px-1';
            fileNameDisplay.textContent = message.image_filename;
            fileNameDisplay.title = message.image_filename;

            const imageInfo = document.createElement('div');
            imageInfo.className = 'text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 px-1';
            imageInfo.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Image</span>
                <span class="text-gray-400">|</span>
                <span>${message.image_mime_type ? message.image_mime_type.split('/')[1].toUpperCase() : 'JPG'}</span>
                ${message.image_size ? `<span class="text-gray-400">|</span><span>${(message.image_size / 1024).toFixed(1)} KB</span>` : ''}
            `;

            fileContainer.appendChild(img);
            fileContainer.appendChild(fileNameDisplay);
            fileContainer.appendChild(imageInfo);
        } else if (isVideo) {
            let videoUrl = `/uploads/${message.image_filename}`;
            if (message.is_private === 1 && message.private_key) {
                videoUrl += `?privateKey=${encodeURIComponent(message.private_key)}`;
            }

            const video = document.createElement('video');
            video.src = videoUrl;
            video.controls = true;
            video.className = 'w-full border-2 bg-black';
            video.style.borderStyle = 'outset';
            video.style.borderColor = '#DFDFDF #808080 #808080 #DFDFDF';

            const fileNameDisplay = document.createElement('div');
            fileNameDisplay.className = 'text-xs font-bold text-black truncate mt-1 px-1';
            fileNameDisplay.textContent = message.image_filename;
            fileNameDisplay.title = message.image_filename;

            const videoInfo = document.createElement('div');
            videoInfo.className = 'text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 px-1';
            videoInfo.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <span>Video</span>
                ${message.image_size ? `<span class="text-gray-400">|</span><span>${(message.image_size / 1024 / 1024).toFixed(2)} MB</span>` : ''}
            `;

            fileContainer.appendChild(video);
            fileContainer.appendChild(fileNameDisplay);
            fileContainer.appendChild(videoInfo);
        } else {
            // File download link (File Card)
            const fileCard = document.createElement('div');
            fileCard.className = 'p-3 bg-white flex items-center group/file';
            fileCard.style.border = '2px inset #808080';

            const fileIcon = document.createElement('div');
            fileIcon.className = 'mr-3 p-2 bg-[#C0C0C0] text-gray-700';
            fileIcon.style.border = '2px outset #DFDFDF';
            fileIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            `;

            const fileInfo = document.createElement('div');
            fileInfo.className = 'flex-1 min-w-0';

            const fileName = document.createElement('div');
            fileName.className = 'text-xs font-bold text-black truncate mb-0.5';
            fileName.textContent = message.image_filename;
            fileInfo.appendChild(fileName);

            const fileInfoText = document.createElement('div');
            fileInfoText.className = 'text-[10px] text-gray-500 flex gap-1';
            let fileInfoStr = message.image_mime_type || 'File';
            if (message.image_size) {
                fileInfoStr += ` | ${(message.image_size / 1024).toFixed(1)} KB`;
            }
            fileInfoText.textContent = fileInfoStr;
            fileInfo.appendChild(fileInfoText);

            let downloadUrl = `/uploads/${message.image_filename}`;
            if (message.is_private === 1 && message.private_key) {
                downloadUrl += `?privateKey=${encodeURIComponent(message.private_key)}`;
            }
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = message.image_filename;
            downloadLink.className = 'ml-3 btn-bp-icon text-gray-600 hover:text-bp-blue text-xs font-bold underline';
            downloadLink.title = 'Download';
            downloadLink.textContent = '[Download]';

            fileCard.appendChild(fileIcon);
            fileCard.appendChild(fileInfo);
            fileCard.appendChild(downloadLink);

            fileContainer.appendChild(fileCard);
        }

        contentContainer.appendChild(fileContainer);
    }

    // Private message KEY display
    if (message.is_private === 1) {
        const privateLabel = document.createElement('div');
        privateLabel.className = 'mb-2 flex items-center gap-2';

        const badge = document.createElement('span');
        badge.className = 'badge-bp border-bp-blue text-bp-blue text-[10px]';
        badge.textContent = 'PRIVATE';

        const keyDisplay = document.createElement('span');
        keyDisplay.className = 'font-mono text-[10px] text-gray-600 bg-white px-1.5 py-0.5 border border-dashed border-[#808080]';

        if (message.private_key && message.private_key.trim() !== '') {
            keyDisplay.innerHTML = `<span class="text-gray-400 select-none">KEY:</span> <span class="text-black">${message.private_key}</span>`;
            keyDisplay.title = 'Click to copy KEY';
            keyDisplay.style.cursor = 'pointer';

            keyDisplay.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(message.private_key).then(() => {
                    const originalHTML = keyDisplay.innerHTML;
                    keyDisplay.textContent = 'Copied!';
                    keyDisplay.className = 'font-mono text-[10px] text-bp-blue bg-white px-1.5 py-0.5 border border-bp-blue';

                    setTimeout(() => {
                        keyDisplay.innerHTML = originalHTML;
                        keyDisplay.className = 'font-mono text-[10px] text-gray-600 bg-white px-1.5 py-0.5 border border-dashed border-[#808080]';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy KEY:', err);
                });
            });
        } else {
            keyDisplay.textContent = 'KEY: (hidden)';
        }

        privateLabel.appendChild(badge);
        privateLabel.appendChild(keyDisplay);

        contentContainer.appendChild(privateLabel);
    }

    // Convert markdown to HTML
    if (message.content && message.content.trim() !== '') {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'prose prose-retro max-w-none text-black prose-headings:text-black prose-a:text-bp-blue prose-a:underline prose-code:text-bp-blue prose-code:bg-[#E0E0E0] prose-code:px-1 prose-pre:bg-[#E0E0E0] prose-pre:border-2 prose-pre:border-[#808080] break-words text-xs';

        const htmlContent = converter.makeHtml(message.content);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.position = 'absolute';
        tempDiv.style.width = '100%';
        tempDiv.className = 'prose prose-retro max-w-none';
        document.body.appendChild(tempDiv);

        const lineHeight = parseFloat(window.getComputedStyle(tempDiv).lineHeight);
        const totalHeight = tempDiv.offsetHeight;
        const estimatedLines = Math.ceil(totalHeight / lineHeight);

        document.body.removeChild(tempDiv);

        let showMoreButton = null;
        if (estimatedLines > 9) {
            contentDiv.innerHTML = htmlContent;
            contentDiv.style.display = '-webkit-box';
            contentDiv.style.webkitLineClamp = '9';
            contentDiv.style.webkitBoxOrient = 'vertical';
            contentDiv.style.overflow = 'hidden';
            contentDiv.classList.add('content-collapsed');

            showMoreButton = document.createElement('button');
            showMoreButton.className = 'text-bp-blue hover:underline text-xs font-bold mt-1';
            showMoreButton.textContent = '[Show More]';

            showMoreButton.addEventListener('click', () => {
                contentDiv.style.display = 'block';
                contentDiv.style.maxHeight = 'none';
                contentDiv.style.webkitLineClamp = 'unset';
                contentDiv.classList.remove('content-collapsed');
                showMoreButton.style.display = 'none';
            });
        } else {
            contentDiv.innerHTML = htmlContent;
        }

        // Copy buttons for code blocks
        const codeBlocks = contentDiv.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            const pre = codeBlock.parentElement;
            if (pre.querySelector('.copy-code-btn')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'relative';

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
            pre.classList.add('overflow-x-auto');

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn absolute top-1 right-1 bg-[#C0C0C0] text-[10px] px-1.5 py-0.5 text-black font-bold';
            copyButton.style.border = '2px outset #DFDFDF';
            copyButton.innerHTML = 'Copy';
            copyButton.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(codeBlock.textContent.trim())
                    .then(() => {
                        const original = copyButton.innerHTML;
                        copyButton.innerHTML = 'OK!';
                        setTimeout(() => {
                            copyButton.innerHTML = original;
                        }, 2000);
                    })
                    .catch(err => console.error('Copy failed:', err));
            };
            wrapper.appendChild(copyButton);
        });

        contentContainer.appendChild(contentDiv);

        if (showMoreButton) {
            contentContainer.appendChild(showMoreButton);
        }
    }

    // Footer with timestamp and actions
    const footer = document.createElement('div');
    footer.className = 'flex justify-between items-center mt-3 pt-2';
    footer.style.borderTop = '2px solid #808080';
    footer.style.borderRight = '2px solid #FFFFFF';

    const timestamp = document.createElement('div');
    timestamp.className = 'text-[10px] text-gray-500 font-mono';
    const timeString = new Date(message.timestamp + 'Z').toLocaleString('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    });
    const messageId = parseInt(message.id, 10);
    timestamp.textContent = `${timeString} #${messageId}`;

    const actions = document.createElement('div');
    actions.className = 'flex gap-1';

    // Admin-only Private button
    if (currentUser && currentUser.is_admin && currentFeedType === 'latest') {
        const privateBtn = document.createElement('button');
        privateBtn.textContent = 'P';
        privateBtn.dataset.action = 'make-private';
        privateBtn.dataset.id = message.id;
        privateBtn.className = 'text-xs font-bold text-gray-600 hover:text-bp-blue px-1';
        privateBtn.title = 'Make message private';
        actions.appendChild(privateBtn);
    }

    // Like button
    const likeContainer = document.createElement('div');
    likeContainer.className = 'flex items-center gap-0.5';

    const likeBtn = document.createElement('button');
    likeBtn.dataset.action = 'like-message';
    likeBtn.dataset.id = message.id;
    likeBtn.className = `text-xs font-bold hover:text-bp-blue ${message.userHasLiked ? 'text-bp-blue underline' : 'text-gray-600'}`;
    likeBtn.textContent = 'like';

    const likesCount = document.createElement('span');
    likesCount.className = 'text-gray-400 font-mono text-[10px]';
    likesCount.textContent = message.likes || 0;

    likeContainer.appendChild(likeBtn);
    likeContainer.appendChild(likesCount);
    actions.appendChild(likeContainer);

    // Actions
    actions.appendChild(createButton('Copy', message.id, 'copy'));

    const replyButton = createButton('Reply', message.id, 'reply');
    replyButton.classList.add('hidden');
    actions.appendChild(replyButton);

    if (currentUser && (currentUser.is_admin || currentUser.id === message.user_id)) {
        actions.appendChild(createButton('Edit', message.id, 'edit'));
        actions.appendChild(createButton('Delete', message.id, 'delete'));
    }

    footer.appendChild(timestamp);
    footer.appendChild(actions);

    messageElement.appendChild(contentContainer);
    messageElement.appendChild(footer);

    // Comments Container
    const commentsContainer = document.createElement('div');
    commentsContainer.id = `comments-for-${message.id}`;
    commentsContainer.className = 'mt-3 pt-3 hidden bg-[#D4D0C8] -mx-3 -mb-3 p-3';
    commentsContainer.style.borderTop = '2px ridge #C0C0C0';
    messageElement.appendChild(commentsContainer);

    // Load AI replies
    if (message.has_ai_reply) {
        setTimeout(() => {
            loadCommentsForMessage(message.id);
        }, 0);
    }

    // Trigger Mermaid rendering
    if (message.content && message.content.includes('```mermaid')) {
        setTimeout(() => {
            mermaid.run({
                nodes: messageElement.querySelectorAll('.mermaid'),
            });
        }, 0);
    }

    return messageElement;
};
