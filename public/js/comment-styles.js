// Comment Styles Module - Retro 90s Edition

const style = document.createElement('style');
style.innerHTML = `
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-fade-in {
        animation: fade-in 0.3s ease-out forwards;
    }

    .comment-nesting-limit {
        max-width: calc(100% - 30px);
    }

    .reply-form {
        min-width: 200px;
    }

    .reply-textarea:focus {
        outline: none;
        border-color: #000000;
    }



    /* ── AI Reply Notification Banner ── */
    .ai-reply-notify {
        position: fixed;
        top: 58px;
        left: 50%;
        transform: translateX(-50%) translateY(-12px);
        background: #000080;
        color: #FFFFFF;
        border: 2px solid;
        border-color: #4444CC #000033 #000033 #4444CC;
        padding: 5px 14px 5px 10px;
        font-size: 11px;
        font-family: Tahoma, Verdana, Arial, sans-serif;
        font-weight: bold;
        cursor: pointer;
        z-index: 9997;
        opacity: 0;
        transition: transform 0.28s ease, opacity 0.28s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
        box-shadow: 2px 2px 0 #000000;
        user-select: none;
    }
    .ai-reply-notify.ai-notify-visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    .ai-reply-notify:hover {
        background: #0000AA;
    }
    .ai-notify-icon {
        font-size: 13px;
        line-height: 1;
    }
    .ai-notify-close {
        background: none;
        border: 1px solid rgba(255,255,255,0.4);
        color: #FFFFFF;
        font-size: 9px;
        cursor: pointer;
        padding: 1px 4px;
        line-height: 1.2;
        font-family: inherit;
    }
    .ai-notify-close:hover {
        background: rgba(255,255,255,0.2);
    }

    /* ── AI comment highlight flash ── */
    @keyframes ai-highlight-flash {
        0%   { background-color: transparent; }
        20%  { background-color: #FFFF80; }
        80%  { background-color: #FFFF80; }
        100% { background-color: transparent; }
    }
    .ai-comment-highlight {
        animation: ai-highlight-flash 2s ease forwards;
    }

    /* ── "GoldieRill is thinking…" dots animation ── */
    .ai-waiting-dots::after {
        content: '.';
        animation: ai-waiting-dots-anim 1.2s step-end infinite;
    }
    @keyframes ai-waiting-dots-anim {
        0%   { content: '.'; }
        33%  { content: '..'; }
        66%  { content: '...'; }
        100% { content: '.'; }
    }
`;
document.head.appendChild(style);
