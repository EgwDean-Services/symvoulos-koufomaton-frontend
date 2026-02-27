'use strict';

/* ============================================================
   Logo – click reloads the current page
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const logoLinks = document.querySelectorAll('.brand-link');
    logoLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.reload();
        });
    });
});
