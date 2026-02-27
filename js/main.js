'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. Track header (and mobile nav) height as CSS variables
          so sticky offsets are always accurate.
    ============================================================ */
    const header       = document.getElementById('site-header');
    const mobileNavBar = document.getElementById('mobileSectionNav');

    function setHeightVars() {
        const hh = header ? header.offsetHeight : 80;
        document.documentElement.style.setProperty('--header-h', hh + 'px');

        if (mobileNavBar) {
            const mh = mobileNavBar.offsetHeight;
            document.documentElement.style.setProperty('--mobile-nav-h', mh + 'px');
        }
    }

    setHeightVars();
    window.addEventListener('resize', setHeightVars);

    /* ============================================================
       2. Logo click → reload page
    ============================================================ */
    document.querySelectorAll('.brand-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            window.location.reload();
        });
    });

    /* ============================================================
       3. Mobile section nav dropdown toggle
    ============================================================ */
    const mobileToggle = document.getElementById('mobileSectionToggle');
    const mobileList   = document.getElementById('mobileSectionList');

    if (mobileToggle && mobileList) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!isOpen));
            if (isOpen) {
                mobileList.hidden = true;
            } else {
                mobileList.hidden = false;
                // Update mobile nav height var after list opens
                setTimeout(setHeightVars, 10);
            }
        });

        // Close dropdown when a link is clicked
        mobileList.querySelectorAll('.mobile-section-nav__link').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileList.hidden = true;
            });
        });
    }

    /* ============================================================
       4. Active section highlighting via IntersectionObserver
    ============================================================ */
    const sections       = document.querySelectorAll('.content-section');
    const desktopLinks   = document.querySelectorAll('.side-nav__link');
    const mobileLinks    = document.querySelectorAll('.mobile-section-nav__link');
    const mobileLabel    = document.getElementById('mobileSectionLabel');

    function setActiveSection(id) {
        // Desktop side nav
        desktopLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('data-target') === id);
        });

        // Mobile nav links + dropdown label
        mobileLinks.forEach(link => {
            const href    = link.getAttribute('href'); // e.g. "#section-1"
            const matches = href === '#' + id;
            link.classList.toggle('is-active', matches);
            if (matches && mobileLabel) {
                mobileLabel.textContent = link.textContent.trim();
            }
        });
    }

    // Use a map to track which sections are currently intersecting
    const visibleSections = new Map();

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            visibleSections.set(entry.target.id, entry.isIntersecting);
        });

        // Highlight the topmost currently visible section
        for (const section of sections) {
            if (visibleSections.get(section.id)) {
                setActiveSection(section.id);
                break;
            }
        }
    }, {
        rootMargin: '-10% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));

    // Activate first section by default
    if (sections.length > 0) {
        setActiveSection(sections[0].id);
    }

});
