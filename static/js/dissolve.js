    window.addEventListener('DOMContentLoaded', () => {
        const banner = document.getElementById('banner');
        // Check if not on the index page
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            banner.classList.add('dissolve');
        }
    });
