/* ============================================================
   MURLIDHAR STORE — Main JavaScript (Enhanced v2.0)
   Kohinoor-style animations, hero carousel, performance optimized
   ============================================================ */

/* ------------------------------------------------------------
   0. Utility: Throttle & Debounce
   ------------------------------------------------------------ */
function msThrottle(fn, delay) {
    var last = 0;
    return function () {
        var now = Date.now();
        if (now - last >= delay) {
            last = now;
            fn.apply(this, arguments);
        }
    };
}

/* ------------------------------------------------------------
   1. Announcement Bar — Auto-scroll ticker
   ------------------------------------------------------------ */
(function () {
    'use strict';
    var bar = document.querySelector('.announcement-bar');
    if (!bar) return;

    var close = bar.querySelector('.announcement-bar__close');
    if (close) {
        close.addEventListener('click', function () {
            bar.style.transform = 'translateY(-100%)';
            bar.style.opacity = '0';
            setTimeout(function () {
                bar.style.display = 'none';
                document.body.style.paddingTop = '0';
            }, 400);
        });
    }
}());

/* ------------------------------------------------------------
   2. Hero Carousel — Kohinoor-style with progress bar
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var hero = document.querySelector('.hero-carousel');
    if (!hero) return;

    var slides = Array.from(hero.querySelectorAll('.hero-carousel__slide'));
    var progressBar = hero.querySelector('.hero-carousel__progress-fill');
    var counterCurrent = hero.querySelector('.hero-carousel__counter-current');
    var counterTotal = hero.querySelector('.hero-carousel__counter-total');
    var prevBtn = hero.querySelector('.hero-carousel__arrow--prev');
    var nextBtn = hero.querySelector('.hero-carousel__arrow--next');
    var dotsWrap = hero.querySelector('.hero-carousel__dots');

    if (!slides.length) return;

    var totalSlides = slides.length;
    var activeIndex = 0;
    var autoplayDelay = 6000;
    var autoplayTimer = null;
    var progressTimer = null;
    var progressStart = 0;
    var isHovered = false;
    var isPaused = false;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set counter total
    if (counterTotal) counterTotal.textContent = String(totalSlides).padStart(2, '0');

    // Create dots
    var dots = [];
    if (dotsWrap) {
        slides.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'hero-carousel__dot' + (i === 0 ? ' is-active' : '');
            dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            dot.addEventListener('click', function () {
                goToSlide(i);
                restartAutoplay();
            });
            dotsWrap.appendChild(dot);
            dots.push(dot);
        });
    }

    function goToSlide(index) {
        // Remove active from current
        slides[activeIndex].classList.remove('is-active');
        slides[activeIndex].setAttribute('aria-hidden', 'true');
        slides[activeIndex].inert = true;
        if (dots[activeIndex]) dots[activeIndex].classList.remove('is-active');

        activeIndex = ((index % totalSlides) + totalSlides) % totalSlides;

        // Add active to new
        slides[activeIndex].classList.add('is-active');
        slides[activeIndex].removeAttribute('aria-hidden');
        slides[activeIndex].inert = false;
        if (dots[activeIndex]) dots[activeIndex].classList.add('is-active');

        // Update counter
        if (counterCurrent) counterCurrent.textContent = String(activeIndex + 1).padStart(2, '0');

        // Animate text elements with stagger
        animateSlideContent(slides[activeIndex]);
    }

    function animateSlideContent(slide) {
        var animEls = slide.querySelectorAll('.hero-anim');
        animEls.forEach(function (el) {
            el.classList.remove('is-animated');
        });
        // Force reflow
        void slide.offsetHeight;
        animEls.forEach(function (el, i) {
            setTimeout(function () {
                el.classList.add('is-animated');
            }, i * 120);
        });
    }

    function startProgress() {
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            void progressBar.offsetHeight;
            progressBar.style.transition = 'width ' + autoplayDelay + 'ms linear';
            progressBar.style.width = '100%';
        }
    }

    function resetProgress() {
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
        }
    }

    function startAutoplay() {
        stopAutoplay();
        if (reducedMotion.matches || isHovered || isPaused) return;

        startProgress();
        autoplayTimer = setTimeout(function () {
            goToSlide(activeIndex + 1);
            startAutoplay();
        }, autoplayDelay);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearTimeout(autoplayTimer);
            autoplayTimer = null;
        }
        resetProgress();
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            goToSlide(activeIndex - 1);
            restartAutoplay();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            goToSlide(activeIndex + 1);
            restartAutoplay();
        });
    }

    // Pause on hover
    hero.addEventListener('mouseenter', function () {
        isHovered = true;
        stopAutoplay();
    });
    hero.addEventListener('mouseleave', function () {
        isHovered = false;
        startAutoplay();
    });

    // Touch swipe
    var touchStartX = 0;
    hero.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    hero.addEventListener('touchend', function (e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToSlide(activeIndex + 1);
            else goToSlide(activeIndex - 1);
            restartAutoplay();
        }
    }, { passive: true });

    // Keyboard
    hero.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { goToSlide(activeIndex - 1); restartAutoplay(); }
        if (e.key === 'ArrowRight') { goToSlide(activeIndex + 1); restartAutoplay(); }
    });

    // Visibility
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
    });

    // IntersectionObserver for viewport
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) startAutoplay();
            else stopAutoplay();
        }, { threshold: 0.3 });
        obs.observe(hero);
    }

    // Init
    goToSlide(0);
    animateSlideContent(slides[0]);
    startAutoplay();
}());

/* ------------------------------------------------------------
   3. Sticky Nav — pill → full-width bar on scroll
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var nav = document.querySelector('.main-nav');
    if (!nav) return;

    var SCROLL_THRESHOLD = 60;

    var onScroll = msThrottle(function () {
        if (window.scrollY > SCROLL_THRESHOLD) {
            nav.classList.add('is-scrolled');
        } else {
            nav.classList.remove('is-scrolled');
        }
    }, 16);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}());

// /* ------------------------------------------------------------
//    4. Mobile Nav Toggle
//    ------------------------------------------------------------ */
// (function () {
//     'use strict';

//     var nav      = document.querySelector('.main-nav');
//     var toggler  = document.querySelector('.main-nav__toggler');
//     var collapse = document.querySelector('.main-nav__collapse');
//     if (!toggler || !collapse || !nav) return;

//     toggler.addEventListener('click', function () {
//         var isOpen = collapse.classList.contains('show');
//         if (isOpen) {
//             collapse.classList.remove('show');
//             toggler.setAttribute('aria-expanded', 'false');
//         } else {
//             collapse.classList.add('show');
//             toggler.setAttribute('aria-expanded', 'true');
//         }
//     });

//     // Close on outside click
//     document.addEventListener('click', function (e) {
//         if (!nav.contains(e.target)) {
//             collapse.classList.remove('show');
//             toggler.setAttribute('aria-expanded', 'false');
//         }
//     });
// }());








/* ------------------------------------------------------------
   4. Smooth Mobile Nav Toggle
   ------------------------------------------------------------ */
(function () {
    'use strict';

    const nav = document.querySelector('.main-nav');
    const toggler = document.querySelector('.main-nav__toggler');
    const collapse = document.querySelector('.main-nav__collapse');

    if (!nav || !toggler || !collapse) return;

    function setMenu(open) {
        collapse.classList.toggle('show', open);
        toggler.classList.toggle('is-active', open);
        toggler.setAttribute('aria-expanded', String(open));
        collapse.setAttribute('aria-hidden', String(!open));
    }

    setMenu(false);

    toggler.addEventListener('click', function () {
        const isOpen = collapse.classList.contains('show');
        setMenu(!isOpen);
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) {
            setMenu(false);
        }
    });

    // Close when a navigation link is clicked
    collapse.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            setMenu(false);
        });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            setMenu(false);
        }
    });

    // Reset menu on desktop
    window.addEventListener('resize', function () {
        if (window.innerWidth > 991) {
            setMenu(false);
        }
    });
}());


/* ------------------------------------------------------------
   5. Universal Scroll Animations (IntersectionObserver)
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var animClasses = [
        '.anim-fade-up',
        '.anim-fade-left',
        '.anim-fade-right',
        '.anim-scale-in',
        '.anim-fade-down'
    ];
    var els = document.querySelectorAll(animClasses.join(', '));
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var delay = parseFloat(entry.target.getAttribute('data-anim-delay') || '0');
                setTimeout(function () {
                    entry.target.classList.add('is-visible');
                }, delay * 1000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
}());

/* ------------------------------------------------------------
   6. Feature Cards — Scroll-in via IntersectionObserver
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var cards = document.querySelectorAll('.feature-card-col');
    if (!cards.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                setTimeout(function () {
                    entry.target.classList.add('is-visible');
                }, 300);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(function (card) { observer.observe(card); });
}());

/* ------------------------------------------------------------
   7. About Section — Scroll Animations
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var imgWrap = document.querySelector('.about-section__img-wrap');
    var img     = imgWrap ? imgWrap.querySelector('.about-section__img') : null;
    var fadeEls = document.querySelectorAll('.about-section__badge-anim');

    // Scroll-driven zoom: image zooms OUT as section scrolls into view
    if (imgWrap && img) {
        var onScrollZoom = msThrottle(function () {
            var rect = imgWrap.getBoundingClientRect();
            var winH = window.innerHeight;
            var progress = Math.min(Math.max((winH - rect.top) / (winH + rect.height), 0), 1);
            var scale = 1.48 - (progress * 0.48);
            img.style.transform = 'scale(' + scale.toFixed(4) + ')';
        }, 16);

        window.addEventListener('scroll', onScrollZoom, { passive: true });
        onScrollZoom();
    }

    if (!fadeEls.length) return;

    var fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    fadeEls.forEach(function (el) { fadeObserver.observe(el); });
}());

/* ------------------------------------------------------------
   8. Stats Section — Count-up Animation
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var nums = document.querySelectorAll('.stats-item__num');
    if (!nums.length) return;

    function countUp(el) {
        var target   = parseInt(el.getAttribute('data-target'), 10);
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out quad
            var eased = 1 - (1 - progress) * (1 - progress);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { observer.observe(el); });
}());

/* ------------------------------------------------------------
   9. Brand Cards — Staggered Scroll Animation
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var brandCards = document.querySelectorAll('.brand-card-reveal');
    if (!brandCards.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var card = entry.target;
                var index = parseInt(card.getAttribute('data-brand-index') || '0', 10);
                setTimeout(function () {
                    card.classList.add('is-visible');
                }, index * 70);
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.1 });

    brandCards.forEach(function (card) { observer.observe(card); });
}());

/* ------------------------------------------------------------
   10. Featured Brands — Continuous logo carousel
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var carousel = document.querySelector('[data-brand-carousel]');
    if (!carousel) return;

    var viewport = carousel.querySelector('.brands-showcase__viewport');
    var track = carousel.querySelector('.brands-showcase__track');
    var previousButton = carousel.querySelector('.brands-showcase__arrow--previous');
    var nextButton = carousel.querySelector('.brands-showcase__arrow--next');
    if (!viewport || !track || !previousButton || !nextButton) return;

    var originalCards = Array.prototype.slice.call(track.children);
    if (!originalCards.length) return;

    var duplicateCards = document.createDocumentFragment();
    originalCards.forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('tabindex', '-1');
        clone.querySelectorAll('a, button').forEach(function (control) {
            control.setAttribute('tabindex', '-1');
        });
        clone.querySelectorAll('img').forEach(function (image) {
            image.alt = '';
        });
        duplicateCards.appendChild(clone);
    });
    track.appendChild(duplicateCards);

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var cycleWidth = 0;
    var animationFrame = null;
    var lastFrameTime = 0;
    var isHovered = false;
    var hasFocus = false;
    var isInteracting = false;
    var isVisible = false;

    function measureCycle() {
        if (originalCards.length > 0) {
            cycleWidth = track.children[originalCards.length].getBoundingClientRect().left -
                originalCards[0].getBoundingClientRect().left;
        }
    }

    function canAutoScroll() {
        return isVisible && !isHovered && !hasFocus && !isInteracting &&
            !document.hidden && !reducedMotion.matches;
    }

    function stopAutoScroll() {
        if (animationFrame !== null) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        lastFrameTime = 0;
    }

    function animate(timestamp) {
        if (!canAutoScroll()) {
            stopAutoScroll();
            return;
        }

        if (lastFrameTime) {
            viewport.scrollLeft += Math.min(timestamp - lastFrameTime, 50) * 0.035;
            if (cycleWidth && viewport.scrollLeft >= cycleWidth) {
                viewport.scrollLeft -= cycleWidth;
            }
        }
        lastFrameTime = timestamp;
        animationFrame = window.requestAnimationFrame(animate);
    }

    function updateAutoScroll() {
        if (canAutoScroll() && animationFrame === null) {
            animationFrame = window.requestAnimationFrame(animate);
        } else if (!canAutoScroll()) {
            stopAutoScroll();
        }
    }

    function moveByCard(direction) {
        var firstCard = originalCards[0];
        var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
        var distance = firstCard.getBoundingClientRect().width + gap;

        if (direction < 0 && viewport.scrollLeft < distance) {
            viewport.scrollLeft = cycleWidth;
        }

        viewport.scrollBy({
            left: distance * direction,
            behavior: reducedMotion.matches ? 'auto' : 'smooth'
        });
    }

    previousButton.addEventListener('click', function () { moveByCard(-1); });
    nextButton.addEventListener('click', function () { moveByCard(1); });

    carousel.addEventListener('mouseenter', function () {
        isHovered = true;
        updateAutoScroll();
    });
    carousel.addEventListener('mouseleave', function () {
        isHovered = false;
        updateAutoScroll();
    });
    carousel.addEventListener('focusin', function () {
        hasFocus = true;
        updateAutoScroll();
    });
    carousel.addEventListener('focusout', function (event) {
        hasFocus = carousel.contains(event.relatedTarget);
        updateAutoScroll();
    });

    viewport.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'touch') {
            isInteracting = true;
            updateAutoScroll();
        }
    });
    viewport.addEventListener('pointerup', function () {
        isInteracting = false;
        updateAutoScroll();
    });
    viewport.addEventListener('pointercancel', function () {
        isInteracting = false;
        updateAutoScroll();
    });
    viewport.addEventListener('scroll', function () {
        if (cycleWidth && viewport.scrollLeft >= cycleWidth) {
            viewport.scrollLeft -= cycleWidth;
        }
    }, { passive: true });

    document.addEventListener('visibilitychange', updateAutoScroll);
    reducedMotion.addEventListener('change', updateAutoScroll);
    window.addEventListener('resize', measureCycle, { passive: true });

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
            updateAutoScroll();
        });
        observer.observe(carousel);
    } else {
        isVisible = true;
    }

    measureCycle();
    updateAutoScroll();
}());

/* ------------------------------------------------------------
   11. Parallax Floating Elements
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;

    var onScroll = msThrottle(function () {
        var scrollY = window.scrollY;
        parallaxEls.forEach(function (el) {
            var speed = parseFloat(el.getAttribute('data-parallax') || '0.1');
            var rect = el.getBoundingClientRect();
            var offset = (scrollY - el.offsetTop + window.innerHeight) * speed;
            el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
        });
    }, 16);

    window.addEventListener('scroll', onScroll, { passive: true });
}());

/* ------------------------------------------------------------
   12. Smooth Reveal for New Arrivals / Offers Cards
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var cards = document.querySelectorAll('.product-launch-card, .offer-card, .service-card');
    if (!cards.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(function (card) { observer.observe(card); });
}());

/* ------------------------------------------------------------
   13. WhatsApp Floating Button — Show after scroll
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var waBtn = document.querySelector('.whatsapp-float');
    if (!waBtn) return;

    var shown = false;
    var onScroll = msThrottle(function () {
        if (window.scrollY > 400 && !shown) {
            waBtn.classList.add('is-visible');
            shown = true;
        }
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
}());

/* ------------------------------------------------------------
   14. Tilt Effect on Product Cards (desktop only)
   ------------------------------------------------------------ */
(function () {
    'use strict';

    if (window.matchMedia('(hover: none)').matches) return;

    var tiltCards = document.querySelectorAll('.bento-item, .product-launch-card');
    if (!tiltCards.length) return;

    tiltCards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = 'perspective(600px) rotateY(' + (x * 6).toFixed(1) + 'deg) rotateX(' + (-y * 6).toFixed(1) + 'deg) scale(1.02)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });
}());

/* ------------------------------------------------------------
   15. Smooth Scroll for Anchor Links
   ------------------------------------------------------------ */
(function () {
    'use strict';
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
                target.scrollIntoView({ behavior: behavior, block: 'start' });
            }
        });
    });
}());

/* ------------------------------------------------------------
   16. Image Lazy Load Enhancement
   ------------------------------------------------------------ */
(function () {
    'use strict';
    if ('loading' in HTMLImageElement.prototype) return; // Native support

    var images = document.querySelectorAll('img[loading="lazy"]');
    if (!images.length) return;

    var imgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                imgObserver.unobserve(img);
            }
        });
    }, { rootMargin: '200px' });

    images.forEach(function (img) { imgObserver.observe(img); });
}());

/* ------------------------------------------------------------
   17. Section Header Reveal Animation
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var headers = document.querySelectorAll('.section-title');
    if (!headers.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    headers.forEach(function (h) { observer.observe(h); });
}());

/* ------------------------------------------------------------
   18. Back to Top Button
   ------------------------------------------------------------ */
(function () {
    'use strict';
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    var onScroll = msThrottle(function () {
        if (window.scrollY > 600) {
            btn.classList.add('is-visible');
        } else {
            btn.classList.remove('is-visible');
        }
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
        var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        window.scrollTo({ top: 0, behavior: behavior });
    });
}());

/* ------------------------------------------------------------
   19. Product Rails Navigation (Smooth Scroll, Drag & Boundaries)
   ------------------------------------------------------------ */
(function () {
    'use strict';
    var rails = document.querySelectorAll('.ms-rail');
    rails.forEach(function (rail) {
        var sec = rail.closest('.ms-section') || rail.parentElement;
        var prevBtn = sec ? sec.querySelector('.ms-rail__btn[data-dir="-1"]') : null;
        var nextBtn = sec ? sec.querySelector('.ms-rail__btn[data-dir="1"]') : null;

        function updateButtons() {
            if (rail.getAttribute('data-marquee') === 'on') {
                if (prevBtn) prevBtn.disabled = false;
                if (nextBtn) nextBtn.disabled = false;
                return;
            }
            var scrollLeft = rail.scrollLeft;
            var maxScroll = rail.scrollWidth - rail.clientWidth - 4;
            if (prevBtn) {
                prevBtn.disabled = scrollLeft <= 4;
            }
            if (nextBtn) {
                nextBtn.disabled = scrollLeft >= maxScroll;
            }
        }

        function getStep() {
            var card = rail.querySelector('.ms-card');
            if (card) {
                var style = window.getComputedStyle(rail);
                var gap = parseFloat(style.gap) || 20;
                var cardWidth = card.offsetWidth + gap;
                // On wider screens scroll by 2 cards, on smaller scroll by 1 card
                return rail.clientWidth > 768 ? cardWidth * 2 : cardWidth;
            }
            return 320;
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function (e) {
                e.preventDefault();
                rail.scrollBy({ left: -getStep(), behavior: 'smooth' });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function (e) {
                e.preventDefault();
                rail.scrollBy({ left: getStep(), behavior: 'smooth' });
            });
        }

        // Smooth drag-to-scroll for desktop mouse
        var isDown = false;
        var startX = 0;
        var scrollLeftVal = 0;
        var hasMoved = false;

        rail.addEventListener('mousedown', function (e) {
            // Ignore clicks directly on buttons or links so clicks always register
            if (e.target.closest('a, button, input, textarea, select')) return;
            if (e.button !== 0) return; // only left click
            isDown = true;
            hasMoved = false;
            rail.classList.add('is-dragging');
            startX = e.pageX - rail.offsetLeft;
            scrollLeftVal = rail.scrollLeft;
        });

        window.addEventListener('mouseup', function () {
            if (isDown) {
                isDown = false;
                rail.classList.remove('is-dragging');
                setTimeout(function () {
                    hasMoved = false;
                }, 50);
            }
        });

        rail.addEventListener('mouseleave', function () {
            if (isDown) {
                isDown = false;
                rail.classList.remove('is-dragging');
            }
        });

        rail.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            var x = e.pageX - rail.offsetLeft;
            var walk = (x - startX);
            if (Math.abs(walk) > 5) {
                hasMoved = true;
                e.preventDefault();
                rail.scrollLeft = scrollLeftVal - (walk * 1.3);
            }
        });

        // Prevent accidental clicks when dragging
        rail.addEventListener('click', function (e) {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Update on scroll & resize
        rail.addEventListener('scroll', msThrottle(updateButtons, 50), { passive: true });
        window.addEventListener('resize', msThrottle(updateButtons, 150));
        updateButtons();
    });
}());

/* ------------------------------------------------------------
   20. Product Rails: infinite auto-scroll marquee (pause on hover)
   Works on the real wrapper: .ms-rail  (cards: .ms-card)
   Layout built at runtime:  [clones] [ORIGINAL CARDS] [clones]
   so the rail loops endlessly in both directions (arrows included).
   ------------------------------------------------------------ */
(function () {
    'use strict';

    var rails = document.querySelectorAll('.ms-rail');
    if (!rails.length) return;
    // Respect users who turned animations off in their OS
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var SPEED = 80;          // pixels per second (raise for faster)
    var RESUME_DELAY = 1800; // ms before resuming after arrow click / touch / drag
    var items = [];

    function makeClone(node) {
        var c = node.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('data-clone', '');
        c.querySelectorAll('a, button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
        return c;
    }

    rails.forEach(function (rail) {
        var originals = Array.prototype.slice.call(rail.children);
        if (originals.length < 2) return;

        var s = { rail: rail, loop: 0, n: 1, pos: 0, last: 0, hover: false, focus: false, until: 0, visible: true };

        function build() {
            var keep = s.loop ? (rail.scrollLeft - s.n * s.loop) : 0;      // position inside the set
            rail.querySelectorAll('[data-clone]').forEach(function (c) { c.remove(); });

            var cs = getComputedStyle(rail);
            var gap = parseFloat(cs.columnGap || cs.gap) || 0;
            var first = originals[0], last = originals[originals.length - 1];
            var setW = (last.offsetLeft + last.offsetWidth) - first.offsetLeft + gap;  // one full set incl. trailing gap
            if (setW <= 0) return;

            var n = Math.max(1, Math.ceil(rail.clientWidth / setW));
            var pre = document.createDocumentFragment(), post = document.createDocumentFragment();
            for (var i = 0; i < n; i++) {
                originals.forEach(function (o) { pre.appendChild(makeClone(o)); post.appendChild(makeClone(o)); });
            }
            rail.insertBefore(pre, first);
            rail.appendChild(post);

            s.loop = setW; s.n = n;
            s.pos = n * setW + Math.max(0, Math.min(keep, setW - 1));
            rail.scrollLeft = s.pos;
            s.last = rail.scrollLeft;
            rail.setAttribute('data-marquee', 'on');
            var sec = rail.closest('.ms-section') || rail.parentElement;
            if (sec) sec.querySelectorAll('.ms-rail__btn').forEach(function (b) { b.disabled = false; });
        }
        build();
        if (!s.loop) return;

        // ---- Pause on hover (mouse only: touch "hover" would stick) ----
        rail.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') s.hover = true; });
        rail.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') s.hover = false; });
        // Pause for keyboard users tabbing through the buttons
        rail.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) s.focus = true; });
        rail.addEventListener('focusout', function () { s.focus = false; });
        // Touch: pause while the finger is down, resume shortly after
        ['touchstart', 'touchend', 'touchcancel'].forEach(function (ev) {
            rail.addEventListener(ev, function () { s.until = performance.now() + RESUME_DELAY; }, { passive: true });
        });
        // Arrow buttons: let the smooth scroll finish first
        var sec = rail.closest('.ms-section') || rail.parentElement;
        if (sec) sec.querySelectorAll('.ms-rail__btn').forEach(function (b) {
            b.addEventListener('click', function () { s.until = performance.now() + RESUME_DELAY; });
        });

        // Don't animate rails that are off screen
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) { s.visible = en[0].isIntersecting; }).observe(rail);
        }

        var t;
        window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 200); });
        items.push(s);
    });

    if (!items.length) return;

    var prev = performance.now();
    function tick(now) {
        requestAnimationFrame(tick);
        var dt = Math.min(now - prev, 64) / 1000;   // seconds (capped so tab-switch doesn't jump)
        prev = now;

        items.forEach(function (s) {
            if (!s.visible) return;
            var rail = s.rail, cur = rail.scrollLeft;

            // Someone else moved the rail (arrows, drag, touch, wheel): adopt it and wait
            if (Math.abs(cur - s.last) > 1.5) { s.pos = cur; s.until = now + RESUME_DELAY; }
            var busy = rail.classList.contains('is-dragging') || now < s.until;

            // Seamless wrap: always keep position inside the ORIGINAL set (jump by one set = invisible)
            if (!busy) {
                var lo = s.n * s.loop, hi = lo + s.loop;
                if (s.pos >= hi) { s.pos -= s.loop; rail.scrollLeft = s.pos; }
                else if (s.pos < lo) { s.pos += s.loop; rail.scrollLeft = s.pos; }
            }

            if (!busy && !s.hover && !s.focus) {
                s.pos += SPEED * dt;
                rail.scrollLeft = s.pos;
                s.last = rail.scrollLeft;
            } else {
                s.pos = rail.scrollLeft;   // resume from the exact spot
                s.last = s.pos;
            }
        });
    }
    requestAnimationFrame(tick);
}());


document.addEventListener("DOMContentLoaded", function () {
    const viewport = document.querySelector(".mfs-brands-viewport");
    const track = document.querySelector(".mfs-brands-track");
    const prev = document.querySelector(".mfs-brand-prev");
    const next = document.querySelector(".mfs-brand-next");

    if (!viewport || !track || !prev || !next) {
        console.error("Featured Brands: carousel elements not found.");
        return;
    }

    if (track.dataset.ready === "true") return;
    track.dataset.ready = "true";

    const originalCards = Array.from(track.children);
    if (!originalCards.length) return;

    // Duplicate cards for seamless looping.
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a, button").forEach(el => {
            el.setAttribute("tabindex", "-1");
        });
        track.appendChild(clone);
    });

    let paused = false;
    let frame = null;
    let lastTime = 0;
    let loopWidth = 0;

    const speed = 45;
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    function measure() {
        loopWidth = track.scrollWidth / 2;
    }

    function animate(time) {
        if (!lastTime) lastTime = time;
        const delta = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;

        if (!paused && !reducedMotion.matches && loopWidth > 0) {
            viewport.scrollLeft += speed * delta;

            if (viewport.scrollLeft >= loopWidth) {
                viewport.scrollLeft -= loopWidth;
            }
        }

        frame = requestAnimationFrame(animate);
    }

    function start() {
        if (frame === null) {
            lastTime = 0;
            frame = requestAnimationFrame(animate);
        }
    }

    function stop() {
        if (frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
        }
    }

    function move(direction) {
        paused = true;

        const distance = Math.max(220, viewport.clientWidth * 0.65);
        const half = loopWidth;

        if (half > 0 && direction < 0 && viewport.scrollLeft < 2) {
            viewport.scrollLeft += half;
        }

        viewport.scrollBy({
            left: direction * distance,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });

        clearTimeout(move.resumeTimer);
        move.resumeTimer = setTimeout(() => {
            paused = false;
        }, 1000);
    }

    prev.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));

    viewport.addEventListener("mouseenter", () => {
        paused = true;
    });

    viewport.addEventListener("mouseleave", () => {
        paused = false;
    });

    viewport.addEventListener("focusin", () => {
        paused = true;
    });

    viewport.addEventListener("focusout", () => {
        paused = false;
    });

    window.addEventListener("resize", measure);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else start();
    });

    // Wait until logo dimensions are available.
    Promise.all(
        Array.from(track.querySelectorAll("img")).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
            });
        })
    ).then(() => {
        measure();
        start();
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const section = document.querySelector("#our-services");
    if (!section) return;

    const viewport = section.querySelector(".ms-services-viewport");
    const track = section.querySelector(".ms-services-track");
    const prev = section.querySelector(".ms-service-prev");
    const next = section.querySelector(".ms-service-next");
    const dotsWrap = section.querySelector(".ms-service-dots");

    if (!viewport || !track || !prev || !next || !dotsWrap) return;

    const cards = Array.from(track.children);
    let index = 0;
    let timer;
    let isPaused = false;

    cards.forEach((card, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "ms-service-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Show service " + (i + 1));
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.children);

    function cardStep() {
        const card = track.querySelector(".ms-service-card");
        if (!card) return 300;

        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.getBoundingClientRect().width + gap;
    }

    function goTo(i) {
        index = (i + cards.length) % cards.length;

        viewport.scrollTo({
            left: index * cardStep(),
            behavior: "smooth"
        });

        dots.forEach((dot, j) => {
            dot.classList.toggle("active", j === index);
        });
    }

    prev.addEventListener("click", () => goTo(index - 1));
    next.addEventListener("click", () => goTo(index + 1));

    function startAutoScroll() {
        clearInterval(timer);
        timer = setInterval(() => {
            if (!isPaused &&
                !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                goTo(index + 1);
            }
        }, 3500);
    }

    section.addEventListener("mouseenter", () => isPaused = true);
    section.addEventListener("mouseleave", () => isPaused = false);
    section.addEventListener("focusin", () => isPaused = true);
    section.addEventListener("focusout", () => isPaused = false);

    viewport.addEventListener("touchstart", () => isPaused = true, {
        passive: true
    });

    viewport.addEventListener("touchend", () => isPaused = false, {
        passive: true
    });

    startAutoScroll();
});





(function () {
  function initAboutAnimations() {
    const about = document.querySelector(".murlidhar-about");

    if (!about || about.dataset.initialized === "true") {
      return;
    }

    about.dataset.initialized = "true";

    const revealItems = about.querySelectorAll(".ma-reveal");
    const timeline = about.querySelector(".ma-timeline");
    const progress = about.querySelector(".ma-timeline-progress");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      revealItems.forEach(el => el.classList.add("ma-visible"));

      if (progress) {
        progress.style.height = "100%";
      }

      return;
    }

    // Reveal elements when they enter the viewport
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("ma-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -30px 0px"
        }
      );

      revealItems.forEach(el => observer.observe(el));
    } else {
      revealItems.forEach(el => el.classList.add("ma-visible"));
    }

    // Timeline fills as user scrolls
    let ticking = false;

    function updateTimeline() {
      ticking = false;

      if (!timeline || !progress) return;

      const rect = timeline.getBoundingClientRect();
      const viewportTrigger = window.innerHeight * 0.65;

      const traveled = viewportTrigger - rect.top;
      const percentage = Math.max(
        0,
        Math.min(100, (traveled / rect.height) * 100)
      );

      progress.style.height = percentage + "%";
    }

    function requestTimelineUpdate() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateTimeline);
      }
    }

    window.addEventListener(
      "scroll",
      requestTimelineUpdate,
      { passive: true }
    );

    window.addEventListener("resize", requestTimelineUpdate);

    updateTimeline();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initAboutAnimations
    );
  } else {
    initAboutAnimations();
  }
})();


document.addEventListener("DOMContentLoaded", function () {
    const hero = document.querySelector("#msHero");
    if (!hero) return;

    const track = hero.querySelector("#msHeroTrack");
    const viewport = hero.querySelector(".ms-hero__viewport");
    const prevBtn = hero.querySelector(".ms-hero__prev");
    const nextBtn = hero.querySelector(".ms-hero__next");
    const dotsContainer = hero.querySelector("#msHeroDots");

    if (!track || !viewport || !prevBtn || !nextBtn || !dotsContainer) return;

    // Keep only original cards
    const cards = Array.from(track.children).filter(card =>
        card.classList.contains("ms-product-card") &&
        !card.hasAttribute("aria-hidden")
    );

    track.replaceChildren(...cards);

    const total = cards.length;
    if (!total) return;

    let currentIndex = 0;
    let autoScroll = null;
    let paused = false;

    dotsContainer.innerHTML = "";

    cards.forEach((card, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Show product " + (index + 1));

        dot.addEventListener("click", () => {
            goTo(index);
            restartAuto();
        });

        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function getStep() {
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return cards[0].getBoundingClientRect().width + gap;
    }

    function getVisibleCards() {
        const step = getStep();
        return Math.max(1, Math.floor((viewport.clientWidth +
            (parseFloat(getComputedStyle(track).gap) || 0)) / step));
    }

    function updateSlider() {
        const visibleCards = getVisibleCards();
        const maxIndex = Math.max(0, total - visibleCards);

        currentIndex = Math.min(currentIndex, maxIndex);

        const offset = currentIndex * getStep();

        track.style.transform = `translate3d(-${offset}px, 0, 0)`;

        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });
    }

    function goTo(index) {
        const maxIndex = Math.max(0, total - getVisibleCards());

        if (index > maxIndex) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = maxIndex;
        } else {
            currentIndex = index;
        }

        updateSlider();
    }

    function nextSlide() {
        goTo(currentIndex + 1);
    }

    function prevSlide() {
        goTo(currentIndex - 1);
    }

    function stopAuto() {
        clearInterval(autoScroll);
        autoScroll = null;
    }

    function startAuto() {
        stopAuto();

        if (paused || document.hidden ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        autoScroll = setInterval(nextSlide, 2800);
    }

    function restartAuto() {
        stopAuto();
        startAuto();
    }

    nextBtn.addEventListener("click", () => {
        nextSlide();
        restartAuto();
    });

    prevBtn.addEventListener("click", () => {
        prevSlide();
        restartAuto();
    });

    hero.addEventListener("mouseenter", () => {
        paused = true;
        stopAuto();
    });

    hero.addEventListener("mouseleave", () => {
        paused = false;
        startAuto();
    });

    hero.addEventListener("focusin", () => {
        paused = true;
        stopAuto();
    });

    hero.addEventListener("focusout", (event) => {
        if (!hero.contains(event.relatedTarget)) {
            paused = false;
            startAuto();
        }
    });

    let startX = 0;

    viewport.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        stopAuto();
    }, { passive: true });

    viewport.addEventListener("touchend", (e) => {
        const difference = startX - e.changedTouches[0].clientX;

        if (Math.abs(difference) > 40) {
            if (difference > 0) nextSlide();
            else prevSlide();
        }

        restartAuto();
    }, { passive: true });

    window.addEventListener("resize", updateSlider);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAuto();
        else startAuto();
    });

    updateSlider();
    startAuto();
});








/* ==========================================
   MURLIDHAR — AUTO OFFER SLIDER
========================================== */

(function () {
  "use strict";

  function initOfferSlider() {
    const slider = document.getElementById("msOfferSlider");
    if (!slider || slider.dataset.initialized === "true") return;

    const track = slider.querySelector(".ms-offer-track");
    const slides = [...slider.querySelectorAll(".ms-offer-slide")];
    const dots = [...slider.querySelectorAll(".ms-offer-dot")];
    const prev = slider.querySelector(".ms-offer-arrow--prev");
    const next = slider.querySelector(".ms-offer-arrow--next");

    if (!track || slides.length < 2) return;

    slider.dataset.initialized = "true";

    let index = 0;
    let timer = null;
    let startX = 0;
    let startY = 0;

    const delay = 3500;

    function showSlide(newIndex) {
      index = (newIndex + slides.length) % slides.length;

      track.style.transform =
        `translate3d(-${index * 100}%, 0, 0)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        if (i === index) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function stopAuto() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAuto() {
      stopAuto();

      if (document.hidden) return;

      timer = setInterval(() => {
        showSlide(index + 1);
      }, delay);
    }

    function navigate(newIndex) {
      showSlide(newIndex);
      startAuto();
    }

    prev?.addEventListener("click", () => {
      navigate(index - 1);
    });

    next?.addEventListener("click", () => {
      navigate(index + 1);
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        navigate(i);
      });
    });

    // Pause on hover
    slider.addEventListener("mouseenter", stopAuto);
    slider.addEventListener("mouseleave", startAuto);

    // Swipe on mobile
    slider.addEventListener(
      "touchstart",
      (e) => {
        startX = e.changedTouches[0].clientX;
        startY = e.changedTouches[0].clientY;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;

        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          navigate(index + (dx < 0 ? 1 : -1));
        }
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    showSlide(0);
    startAuto();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOfferSlider);
  } else {
    initOfferSlider();
  }
})();
