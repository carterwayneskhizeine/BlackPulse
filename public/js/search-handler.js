import {
    fetchAndRenderSearchResults
} from './api-rendering-logic.js';

let searchTimeout;

export const initSearchHandler = () => {
    const searchInputs = document.querySelectorAll('#desktop-search-input, #mobile-search-input');
    if (searchInputs.length === 0) return;

    const handleSearch = (e) => {
        const currentInput = e.target;
        const query = currentInput.value.trim();

        // Sync the value to the other input
        searchInputs.forEach(input => {
            if (input !== currentInput) {
                input.value = currentInput.value;
            }
        });
        
        clearTimeout(searchTimeout);

        // Instant search on Enter
        if (e.key === 'Enter') {
            fetchAndRenderSearchResults(query, 1);
            return;
        }

        // Debounced search for other keys
        searchTimeout = setTimeout(() => {
            // Only search if query is empty (to reset) or longer than 2 chars
            if (query.length === 0 || query.length > 2) {
                 fetchAndRenderSearchResults(query, 1);
            }
        }, 500); // 500ms delay
    };

    searchInputs.forEach(input => {
        input.addEventListener('keyup', handleSearch);
    });
};
