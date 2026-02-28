'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. Track header (and mobile nav toggle) height as CSS variables
       FIX: Measure only the toggle bar, not the whole open list!
    ============================================================ */
    const header       = document.getElementById('site-header');
    const mobileToggle = document.getElementById('mobileSectionToggle');

    function setHeightVars() {
        const hh = header ? header.offsetHeight : 80;
        document.documentElement.style.setProperty('--header-h', hh + 'px');

        if (mobileToggle) {
            const mh = mobileToggle.offsetHeight;
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
       3. Mobile section nav dropdown toggle & Smooth Scrolling
    ============================================================ */
    const mobileList = document.getElementById('mobileSectionList');

    if (mobileToggle && mobileList) {
        // Handle opening/closing the menu
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!isOpen));
            mobileList.hidden = isOpen;
        });
    }

    // Handle all anchor links to scroll smoothly and accurately
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            // If it's a mobile link, close the menu first
            if (this.classList.contains('mobile-section-nav__link') && mobileToggle && mobileList) {
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileList.hidden = true;
            }

            // Calculate exact position: Target top + Current Scroll - Header Heights
            const headerH = header ? header.offsetHeight : 0;
            const mobileNavH = (mobileToggle && window.innerWidth <= 767) ? mobileToggle.offsetHeight : 0;
            const offset = headerH + mobileNavH + 20; // 20px extra breathing room

            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });

    /* ============================================================
       4. Active section highlighting via IntersectionObserver
    ============================================================ */
    const sections       = document.querySelectorAll('.content-section');
    const desktopLinks   = document.querySelectorAll('.side-nav__link');
    const mobileLinks    = document.querySelectorAll('.mobile-section-nav__link');
    const mobileLabel    = document.getElementById('mobileSectionLabel');

    function setActiveSection(id) {
        desktopLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('data-target') === id);
        });

        mobileLinks.forEach(link => {
            const href = link.getAttribute('href');
            const matches = (href === '#' + id);
            link.classList.toggle('is-active', matches);
            if (matches && mobileLabel) {
                mobileLabel.textContent = link.textContent.trim();
            }
        });
    }

    const visibleSections = new Map();

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            visibleSections.set(entry.target.id, entry.isIntersecting);
        });

        for (const section of sections) {
            if (visibleSections.get(section.id)) {
                setActiveSection(section.id);
                break;
            }
        }
    }, {
        // Ignores the top portion of the screen covered by sticky headers
        rootMargin: '-150px 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));

    if (sections.length > 0) {
        setActiveSection(sections[0].id);
    }

    /* ============================================================
       5. Package tab selector
    ============================================================ */
    const pkgStrip = document.getElementById('pkgStrip');
    const pkgTabs  = document.querySelectorAll('.pkg-tab');

    pkgTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const idx = parseInt(tab.dataset.pkg, 10);

            pkgTabs.forEach(t => {
                t.classList.remove('is-active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('is-active');
            tab.setAttribute('aria-selected', 'true');

            if (pkgStrip) {
                pkgStrip.style.transform = `translateX(-${idx * (100 / 3)}%)`;
            }
        });
    });

    /* ============================================================
       6. Background image carousel
    ============================================================ */
    const bgStrip    = document.getElementById('bgCarouselStrip');
    const bgTotal    = 5;
    const bgStep     = 100 / 6;
    const bgDuration = 1800;
    let   bgIndex    = 0;
    let   bgLocked   = false;

    function bgAdvance() {
        if (bgLocked) return;
        bgIndex++;
        if(bgStrip) {
            bgStrip.style.transition = `transform ${bgDuration}ms ease-in-out`;
            bgStrip.style.transform  = `translateX(-${bgIndex * bgStep}%)`;
        }

        if (bgIndex === bgTotal) {
            bgLocked = true;
            setTimeout(() => {
                if(bgStrip) {
                    bgStrip.style.transition = 'none';
                    bgStrip.style.transform  = 'translateX(0%)';
                    bgIndex  = 0;
                    void bgStrip.offsetWidth;
                    bgStrip.style.transition = `transform ${bgDuration}ms ease-in-out`;
                }
                bgLocked = false;
            }, bgDuration + 50);
        }
    }

    if (bgStrip) {
        setInterval(bgAdvance, 7000);
    }
});