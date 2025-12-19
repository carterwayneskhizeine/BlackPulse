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

    // Vote buttons logic (manually building to have custom layout if needed, or reusing buttons)
    // We'll use simple text/icon mix here
    const voteContainer = document.createElement('div');
    voteContainer.className = 'flex items-center gap-1 bg-bp-black rounded-full border border-bp-gray px-1';
    
    const upBtn = document.createElement('button');
    upBtn.dataset.action = 'vote';
    upBtn.dataset.vote = 'up';
    upBtn.dataset.id = comment.id;
    upBtn.className = 'p-1 hover:text-bp-gold text-bp-text-muted transition-colors';
    upBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>`;
    
    const score = document.createElement('span');
    score.className = 'text-gray-400 font-mono text-[10px] min-w-[12px] text-center';
    score.textContent = comment.score;
    
    const downBtn = document.createElement('button');
    downBtn.dataset.action = 'vote';
    downBtn.dataset.vote = 'down';
    downBtn.dataset.id = comment.id;
    downBtn.className = 'p-1 hover:text-red-400 text-bp-text-muted transition-colors';
    downBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>`;
    
    voteContainer.appendChild(upBtn);
    voteContainer.appendChild(score);
    voteContainer.appendChild(downBtn);
    
    actionsElement.appendChild(voteContainer);

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


    // Append all parts to the main comment element
    commentElement.appendChild(userElement);
    commentElement.appendChild(textElement);
    commentElement.appendChild(actionsElement);

    return commentElement;
};
