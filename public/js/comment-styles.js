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
`;
document.head.appendChild(style);
