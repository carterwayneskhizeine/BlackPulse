import {
    createButton
} from './utils.js';
import {
    converter
} from './main-rendering-function.js';

// Create a DOM element for a single, flat comment
export const createCommentElement = (comment, messageId, parentId, commentMap) => {
    const commentElement = document.createElement('div');
    commentElement.className = 'mb-1 p-2 border-b border-[#808080] last:border-0 hover:bg-[#D4D0C8]';
    commentElement.dataset.commentId = comment.id;
    commentElement.id = `comment-${comment.id}`;

    // Format time
    const commentTime = new Date(comment.time).toLocaleString();

    // User info header
    const userElement = document.createElement('div');
    userElement.className = 'flex items-center justify-between mb-1';

    const userInfo = document.createElement('div');
    userInfo.className = 'flex items-center gap-2';

    const name = document.createElement('span');
    name.className = 'font-bold text-xs text-bp-blue';
    name.textContent = comment.user.name;

    userInfo.appendChild(name);

    if (comment.user.verified) {
        const verified = document.createElement('span');
        verified.className = 'text-bp-blue text-[10px] font-bold';
        verified.textContent = '[OK]';
        userInfo.appendChild(verified);
    }

    const time = document.createElement('span');
    time.className = 'text-[10px] text-gray-500';
    time.textContent = commentTime;

    userElement.appendChild(userInfo);
    userElement.appendChild(time);

    // Comment text
    const textElement = document.createElement('div');
    let commentText = comment.text;

    // If it's a reply, prepend @mention
    if (parentId && commentMap.has(parentId)) {
        const parentComment = commentMap.get(parentId);
        const parentAuthor = parentComment.user.name;
        const mentionLink = `<a href="#comment-${parentId}" class="text-bp-blue underline mr-1 text-[10px] font-bold">@${parentAuthor}</a>`;
        commentText = `${mentionLink} ${comment.text}`;
    }

    const htmlContent = converter.makeHtml(commentText);

    // Check line count
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    tempDiv.style.width = '100%';
    tempDiv.className = 'prose prose-retro prose-sm max-w-none';
    document.body.appendChild(tempDiv);

    const lineHeight = parseFloat(window.getComputedStyle(tempDiv).lineHeight);
    const totalHeight = tempDiv.offsetHeight;
    const estimatedLines = Math.ceil(totalHeight / lineHeight);

    document.body.removeChild(tempDiv);

    textElement.className = 'prose prose-retro prose-sm max-w-none text-black text-xs mb-1 leading-relaxed break-words';

    let showMoreButton = null;
    if (estimatedLines > 9) {
        textElement.innerHTML = htmlContent;
        textElement.style.display = '-webkit-box';
        textElement.style.webkitLineClamp = '9';
        textElement.style.webkitBoxOrient = 'vertical';
        textElement.style.overflow = 'hidden';
        textElement.classList.add('content-collapsed');

        showMoreButton = document.createElement('button');
        showMoreButton.className = 'text-bp-blue hover:underline text-[10px] font-bold mt-0.5';
        showMoreButton.textContent = '[Show More]';

        showMoreButton.addEventListener('click', () => {
            textElement.style.display = 'block';
            textElement.style.maxHeight = 'none';
            textElement.style.webkitLineClamp = 'unset';
            textElement.classList.remove('content-collapsed');
            showMoreButton.style.display = 'none';
            textElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    } else {
        textElement.innerHTML = htmlContent;
    }

    // Copy buttons for code blocks
    const codeBlocks = textElement.querySelectorAll('pre code');
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

    // Trigger Mermaid rendering
    if (commentText && commentText.includes('```mermaid')) {
        setTimeout(() => {
            mermaid.run({
                nodes: textElement.querySelectorAll('.mermaid'),
            });
        }, 0);
    }

    // Action buttons
    const actionsElement = document.createElement('div');
    actionsElement.className = 'flex items-center gap-2 text-[10px]';

    // Like button
    const likeContainer = document.createElement('div');
    likeContainer.className = 'flex items-center gap-0.5';

    const likeBtn = document.createElement('button');
    likeBtn.dataset.action = 'like';
    likeBtn.dataset.id = comment.id;
    likeBtn.className = `font-bold hover:text-bp-blue ${comment.userHasLiked ? 'text-bp-blue underline' : 'text-gray-600'}`;
    likeBtn.textContent = 'like';

    const likesCount = document.createElement('span');
    likesCount.className = 'text-gray-400 font-mono text-[10px]';
    likesCount.textContent = comment.likes || 0;

    likeContainer.appendChild(likeBtn);
    likeContainer.appendChild(likesCount);

    actionsElement.appendChild(likeContainer);

    // Copy button
    actionsElement.appendChild(createButton('Copy', comment.id, 'copy'));

    if (comment.editable) {
        actionsElement.appendChild(createButton('Edit', comment.id, 'edit'));
    }
    if (comment.deletable) {
        actionsElement.appendChild(createButton('Delete', comment.id, 'delete'));
    }

    const replyButton = createButton('Reply', comment.id, 'reply');
    actionsElement.appendChild(replyButton);

    commentElement.appendChild(userElement);
    commentElement.appendChild(textElement);

    if (showMoreButton) {
        commentElement.appendChild(showMoreButton);
    }

    // Store raw text for editing
    const rawTextElement = document.createElement('div');
    rawTextElement.className = 'raw-comment-text hidden';
    rawTextElement.textContent = comment.text || '';
    commentElement.appendChild(rawTextElement);

    commentElement.appendChild(actionsElement);

    return commentElement;
};
