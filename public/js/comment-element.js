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

    // Apply Tailwind's typography styles
    textElement.className = 'prose prose-invert prose-sm max-w-none text-gray-300 mb-2 leading-relaxed break-words';
    textElement.innerHTML = converter.makeHtml(commentText);


    // Action buttons
    const actionsElement = document.createElement('div');
    actionsElement.className = 'flex items-center gap-3 text-xs';

    // Like button logic
    const likeBtn = document.createElement('button');
    likeBtn.dataset.action = 'like';
    likeBtn.dataset.id = comment.id;
    likeBtn.className = 'btn-bp-icon p-1 text-bp-text-muted transition-colors hover:text-red-400';
    likeBtn.innerHTML = `<svg id='Heart_Outline_24' width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(0.77 0 0 0.77 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(220,220,220); fill-rule: nonzero; opacity: 1;" transform=" translate(-16, -17.08)" d="M 16 28.15625 L 15.5 27.863281 C 14.988281 27.570313 3 20.53125 3 13 C 3 9.140625 6.140625 6 10 6 C 12.542969 6 14.773438 7.363281 16 9.398438 C 17.226563 7.363281 19.457031 6 22 6 C 25.859375 6 29 9.140625 29 13 C 29 20.53125 17.011719 27.570313 16.5 27.863281 Z M 10 8 C 7.242188 8 5 10.242188 5 13 C 5 18.605469 13.785156 24.445313 16 25.828125 C 18.214844 24.445313 27 18.605469 27 13 C 27 10.242188 24.757813 8 22 8 C 19.242188 8 17 10.242188 17 13 L 15 13 C 15 10.242188 12.757813 8 10 8 Z" stroke-linecap="round" /></g></svg>`;

    const likesCount = document.createElement('span');
    likesCount.className = 'text-gray-400 font-mono text-[10px] min-w-[12px] text-center';
    likesCount.textContent = comment.likes || 0;

    actionsElement.appendChild(likeBtn);
    actionsElement.appendChild(likesCount);

    // Divider
    // const divider = document.createElement('span');
    // divider.className = 'text-bp-gray';
    // divider.textContent = '|';
    // actionsElement.appendChild(divider);

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

    // Store raw text for editing, so it can be retrieved by the edit handler
    const rawTextElement = document.createElement('div');
    rawTextElement.className = 'raw-comment-text hidden';
    rawTextElement.textContent = comment.text || '';
    commentElement.appendChild(rawTextElement);

    commentElement.appendChild(actionsElement);

    return commentElement;
};
