// Shows a manual refresh button in the message footer's action row
// while waiting for an AI reply. All inline styles — no CSS dependency.
// Dynamic import for comment-loader avoids circular deps.

const _flatten = (list) =>
    (list || []).flatMap(c => [c, ..._flatten(c.replies)]);

export const showAIRefreshButton = (messageId, messageEl) => {
    const btnId = `ai-refresh-${messageId}`;
    if (document.getElementById(btnId)) return;

    // Find the footer actions row (.flex.gap-1) — this is the "P / like / copy" bar
    const actions = messageEl.querySelector('.flex.gap-1');
    if (!actions) return;

    const btn = document.createElement('button');
    btn.id = btnId;
    btn.type = 'button';
    btn.title = 'Waiting for AI reply — click to refresh comments';

    Object.assign(btn.style, {
        fontSize:   '10px',
        fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        fontWeight: 'bold',
        color:      '#000080',
        background: 'none',
        border:     'none',
        cursor:     'pointer',
        padding:    '0 4px 0 0',
        lineHeight: '1',
    });
    btn.textContent = '↻';

    btn.addEventListener('click', async () => {
        btn.textContent = '…';
        btn.style.opacity = '0.5';
        btn.disabled = true;

        try {
            const { loadCommentsForMessage } = await import('./comment-loader.js');
            await loadCommentsForMessage(messageId, 1, true);

            const container = document.getElementById(`comments-for-${messageId}`);
            const cached = container?.dataset.comments
                ? JSON.parse(container.dataset.comments) : [];
            const aiComment = _flatten(cached).find(c => c.username === 'GoldieRill');

            if (aiComment) {
                btn.remove();
                setTimeout(() => {
                    const el = document.querySelector(`[data-comment-id="${aiComment.id}"]`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.style.transition = 'background-color 0.3s ease';
                        el.style.backgroundColor = '#FFFF80';
                        setTimeout(() => { el.style.backgroundColor = ''; }, 2000);
                    }
                }, 150);
            } else {
                btn.textContent = '↻';
                btn.style.opacity = '1';
                btn.disabled = false;
            }
        } catch {
            btn.textContent = '↻';
            btn.style.opacity = '1';
            btn.disabled = false;
        }
    });

    // Prepend = leftmost position in the actions row
    actions.prepend(btn);
};
