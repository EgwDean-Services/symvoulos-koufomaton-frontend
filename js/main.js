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
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');

                // Close dropdown first
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileList.hidden = true;

                // Recalculate heights now that the dropdown is closed,
                // then scroll so the section lands below the actual sticky bars.
                setHeightVars();
                requestAnimationFrame(() => {
                    const target = document.querySelector(targetId);
                    if (!target) return;
                    const headerH    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))    || 80;
                    const mobileNavH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--mobile-nav-h')) || 44;
                    const offset     = target.getBoundingClientRect().top + window.scrollY - headerH - mobileNavH - 16;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                });
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

    /* ============================================================
       5. Package tab selector
    ============================================================ */
    const pkgStrip = document.getElementById('pkgStrip');
    const pkgTabs  = document.querySelectorAll('.pkg-tab');

    pkgTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const idx = parseInt(tab.dataset.pkg, 10);

            // Update tab active state
            pkgTabs.forEach(t => {
                t.classList.remove('is-active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('is-active');
            tab.setAttribute('aria-selected', 'true');

            // Slide the strip
            if (pkgStrip) {
                // Each panel = 1/3 of the 300%-wide strip → offset = idx * (100/3)%
                pkgStrip.style.transform = `translateX(-${idx * (100 / 3)}%)`;
            }
        });
    });

    /* ============================================================
       6. Background image carousel – always slides right, seamless
          loop via clone technique. Advances every 7 s.
    ============================================================ */
    const bgStrip    = document.getElementById('bgCarouselStrip');
    const bgTotal    = 5;          // number of real slides
    const bgStep     = 100 / 6;    // each slide = 1/6 of the 600%-wide strip
    const bgDuration = 1800;       // ms – must match CSS transition
    let   bgIndex    = 0;
    let   bgLocked   = false;

    function bgAdvance() {
        if (bgLocked) return;
        bgIndex++;
        bgStrip.style.transition = `transform ${bgDuration}ms ease-in-out`;
        bgStrip.style.transform  = `translateX(-${bgIndex * bgStep}%)`;

        // When we land on the clone of frame_1 (index 5),
        // silently jump back to index 0 after the transition finishes.
        if (bgIndex === bgTotal) {
            bgLocked = true;
            setTimeout(() => {
                bgStrip.style.transition = 'none';
                bgStrip.style.transform  = 'translateX(0%)';
                bgIndex  = 0;
                // Force reflow so the next transition isn't skipped
                void bgStrip.offsetWidth;
                bgStrip.style.transition = `transform ${bgDuration}ms ease-in-out`;
                bgLocked = false;
            }, bgDuration + 50);
        }
    }

    if (bgStrip) {
        setInterval(bgAdvance, 7000);
    }

});
