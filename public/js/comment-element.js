import {
    createButton
} from './utils.js';
import {
    converter
} from './main-rendering-function.js';

// Create a DOM element for a single, flat comment
export const createCommentElement = (comment, messageId, parentId, commentMap) => {
    const commentElement = document.createElement('div');
    // Minimalist list style for comments
    commentElement.className = 'mb-2 p-3 rounded hover:bg-bp-gray/20 transition-colors border-b border-bp-gray/30 last:border-0';
    commentElement.dataset.commentId = comment.id;
    commentElement.id = `comment-${comment.id}`; 

    // Format time
    const commentTime = new Date(comment.time).toLocaleString();

    // User info header
    const userElement = document.createElement('div');
    userElement.className = 'flex items-center justify-between mb-1';
    
    const userInfo = document.createElement('div');
    userInfo.className = 'flex items-center gap-2';
    
    // Avatar placeholder or just name
    const name = document.createElement('span');
    name.className = 'font-bold text-sm text-bp-gold';
    name.textContent = comment.user.name;
    
    userInfo.appendChild(name);
    
    if (comment.user.verified) {
        const verified = document.createElement('span');
        verified.className = 'text-blue-400 text-xs bg-blue-400/10 px-1 rounded';
        verified.textContent = '✓';
        userInfo.appendChild(verified);
    }
    
    const time = document.createElement('span');
    time.className = 'text-xs text-bp-text-muted';
    time.textContent = commentTime;
    
    userElement.appendChild(userInfo);
    userElement.appendChild(time);

    // Comment text
    const textElement = document.createElement('div');
    let commentText = comment.text;

    // If it's a reply, find the parent and prepend an @-mention
    if (parentId && commentMap.has(parentId)) {
        const parentComment = commentMap.get(parentId);
        const parentAuthor = parentComment.user.name;
        // The mention is a link
        const mentionLink = `<a href="#comment-${parentId}" class="text-bp-gold hover:underline mr-1 no-underline bg-bp-gold/10 px-1 rounded text-xs font-bold">@${parentAuthor}</a>`;
        commentText = `${mentionLink} ${comment.text}`;
    }

    // 转换markdown内容为HTML
    const htmlContent = converter.makeHtml(commentText);

    // 创建一个临时元素来检测行数
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    tempDiv.style.width = '100%';
    tempDiv.className = 'prose prose-invert prose-sm max-w-none';
    document.body.appendChild(tempDiv);

    // 检测行数（使用line-height和高度计算）
    const lineHeight = parseFloat(window.getComputedStyle(tempDiv).lineHeight);
    const totalHeight = tempDiv.offsetHeight;
    const estimatedLines = Math.ceil(totalHeight / lineHeight);

    document.body.removeChild(tempDiv);

    // Apply Tailwind's typography styles
    textElement.className = 'prose prose-invert prose-sm max-w-none text-gray-300 mb-2 leading-relaxed break-words';

    // 如果超过9行，应用折叠样式
    let showMoreButton = null;
    if (estimatedLines > 9) {
        textElement.innerHTML = htmlContent;
        textElement.style.display = '-webkit-box';
        textElement.style.webkitLineClamp = '9';
        textElement.style.webkitBoxOrient = 'vertical';
        textElement.style.overflow = 'hidden';
        textElement.classList.add('content-collapsed');

        // 创建"显示更多"按钮
        showMoreButton = document.createElement('button');
        showMoreButton.className = 'text-bp-gold hover:text-bp-gold/80 text-xs font-medium transition-colors mt-1';
        showMoreButton.textContent = '显示更多';
        showMoreButton.dataset.expanded = 'false';

        showMoreButton.addEventListener('click', () => {
            if (showMoreButton.dataset.expanded === 'false') {
                // 展开内容
                textElement.style.display = 'block';
                textElement.style.maxHeight = 'none';
                textElement.style.webkitLineClamp = 'unset';
                textElement.classList.remove('content-collapsed');
                showMoreButton.style.display = 'none';
            }
        });
    } else {
        textElement.innerHTML = htmlContent;
    }

    // Add copy buttons to code blocks
    const codeBlocks = textElement.querySelectorAll('pre code');
    codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        if (pre.querySelector('.copy-code-btn')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'relative group/code';

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        pre.classList.add('overflow-x-auto');

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn absolute top-2 right-2 bg-bp-gray text-xs px-2 py-1 rounded text-gray-300 opacity-0 group-hover/code:opacity-100 transition-all z-10 hover:bg-bp-gold hover:text-black font-medium';
        copyButton.innerHTML = 'Copy';
        copyButton.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(codeBlock.textContent.trim())
                .then(() => {
                    const original = copyButton.innerHTML;
                    copyButton.innerHTML = 'Copied!';
                    setTimeout(() => {
                        copyButton.innerHTML = original;
                    }, 2000);
                })
                .catch(err => console.error('Copy failed:', err));
        };
        wrapper.appendChild(copyButton);
    });

    // Trigger Mermaid rendering for comments
    if (commentText && commentText.includes('```mermaid')) {
        setTimeout(() => {
            mermaid.run({
                nodes: textElement.querySelectorAll('.mermaid'),
            });
        }, 0);
    }


    // Action buttons
    const actionsElement = document.createElement('div');
    actionsElement.className = 'flex items-center gap-3 text-xs';

    // Like button logic
    const likeContainer = document.createElement('div');
    likeContainer.className = 'flex items-center gap-1';
    
    const likeBtn = document.createElement('button');
    likeBtn.dataset.action = 'like';
    likeBtn.dataset.id = comment.id;
    likeBtn.className = `transition-colors font-medium text-xs hover:text-bp-gold ${comment.userHasLiked ? 'text-bp-gold' : 'text-bp-text-muted'}`;
    likeBtn.textContent = 'like';
    
    const likesCount = document.createElement('span');
    likesCount.className = 'text-gray-400 font-mono text-[10px] min-w-[12px] text-center';
    likesCount.textContent = comment.likes || 0;
    
    likeContainer.appendChild(likeBtn);
    likeContainer.appendChild(likesCount);
    
    actionsElement.appendChild(likeContainer);

    // Divider
    // const divider = document.createElement('span');
    // divider.className = 'text-bp-gray';
    // divider.textContent = '|';
    // actionsElement.appendChild(divider);

    // Copy button
    actionsElement.appendChild(createButton('Copy', comment.id, 'copy'));

    // Edit, Delete, Reply buttons (Using utils.createButton which returns btn-bp-icon)
    // We might want text buttons here for clarity in comments?
    // Let's stick to icons to keep it clean.

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

    // 如果有"显示更多"按钮，添加到文本后面
    if (showMoreButton) {
        commentElement.appendChild(showMoreButton);
    }

    // Store raw text for editing, so it can be retrieved by the edit handler
    const rawTextElement = document.createElement('div');
    rawTextElement.className = 'raw-comment-text hidden';
    rawTextElement.textContent = comment.text || '';
    commentElement.appendChild(rawTextElement);

    commentElement.appendChild(actionsElement);

    return commentElement;
};
