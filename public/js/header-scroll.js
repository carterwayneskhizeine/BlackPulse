// Header scroll hide/show functionality
let lastScrollY = window.scrollY;
let isHeaderHidden = false;

const initHeaderScroll = () => {
    const header = document.querySelector('body > header');
    if (!header) return;

    // Add base transition styles if not present
    header.style.transition = 'transform 0.3s ease-in-out';

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const scrollThreshold = 100; // Minimum scroll to trigger hide

        // Hide header when scrolling down
        if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold && !isHeaderHidden) {
            header.style.transform = 'translateY(-100%)';
            isHeaderHidden = true;
        }
        // Show header when scrolling up or at top
        else if ((currentScrollY < lastScrollY || currentScrollY < scrollThreshold) && isHeaderHidden) {
            header.style.transform = 'translateY(0)';
            isHeaderHidden = false;
        }

        lastScrollY = currentScrollY;
    };

    // Use requestAnimationFrame for better performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
};

export { initHeaderScroll };
