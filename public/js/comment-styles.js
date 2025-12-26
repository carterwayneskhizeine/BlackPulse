// Comment Styles Module
// Purpose: Provides CSS styles for comments and animations in the message board
// Dependencies: None

// Add a simple fade-in animation using CSS and styles for deep nesting
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fade-in 0.5s ease-out forwards;
    }

    /* Prevent excessive nesting from becoming too narrow */
    .comment-nesting-limit {
        max-width: calc(100% - 40px); /* Prevent content from becoming too narrow */
    }

    /* Ensure reply forms don't get too narrow */
    .reply-form {
        min-width: 200px;
    }

    /* Reply textarea focus gold border */
    .reply-textarea:focus {
        outline: none;
        border-color: #FFD700;
        box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.1);
    }
`;
document.head.appendChild(style);