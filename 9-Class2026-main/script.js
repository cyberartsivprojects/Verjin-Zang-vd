let lastHeight = 0;

function reportHeight() {
    const height = Math.ceil(document.documentElement.scrollHeight || document.body.scrollHeight);

    if (Math.abs(height - lastHeight) > 5) {
        window.parent.postMessage({ type: 'SET_HEIGHT', height }, '*');
        lastHeight = height;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = document.getElementById('hero');
    const envelope = document.getElementById('envelope');
    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    const siteContent = document.getElementById('site-content');
    const music = document.getElementById('bg-music');
    const rsvpButton = document.getElementById('rsvp-btn');
    let invitationOpened = false;

    function openInvitation() {
        if (invitationOpened || !envelope) {
            return;
        }

        invitationOpened = true;
        envelope.classList.add('open');
        hero?.classList.add('is-open');
        envelopeWrapper?.setAttribute('aria-expanded', 'true');
        launchSparks(envelopeWrapper, prefersReducedMotion ? 0 : 54);

        if (music) {
            music.volume = 0.42;
            music.play().catch(() => {});
        }

        window.setTimeout(() => {
            if (siteContent) {
                siteContent.hidden = false;
                requestAnimationFrame(() => {
                    siteContent.classList.add('is-visible');
                    reportHeight();
                });

                if (!prefersReducedMotion) {
                    window.setTimeout(() => {
                        if (window.scrollY < 40) {
                            siteContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 2550);
                }
            }
        }, prefersReducedMotion ? 0 : 1450);

        window.setTimeout(reportHeight, prefersReducedMotion ? 80 : 2300);
    }

    if (envelopeWrapper) {
        envelopeWrapper.addEventListener('click', openInvitation);
        envelopeWrapper.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openInvitation();
            }
        });

        if (!prefersReducedMotion && envelope) {
            envelopeWrapper.addEventListener('pointermove', event => {
                if (invitationOpened) {
                    return;
                }

                const rect = envelopeWrapper.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;

                envelope.style.setProperty('--tilt-y', `${x * 9}deg`);
                envelope.style.setProperty('--tilt-x', `${y * -7}deg`);
            });

            envelopeWrapper.addEventListener('pointerleave', () => {
                envelope.style.setProperty('--tilt-y', '0deg');
                envelope.style.setProperty('--tilt-x', '0deg');
            });
        }
    }

    setupCountdown();
    setupRevealAnimations();
    setupTiltCards(prefersReducedMotion);
    setupRsvp(rsvpButton, prefersReducedMotion);
    setupFloatingBubbles(prefersReducedMotion);
    reportHeight();
});

function setupCountdown() {
    const targetDate = new Date('2026-05-22T09:00:00+04:00').getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const countdownContainer = document.querySelector('.countdown-container');
    const counters = [daysEl, hoursEl, minutesEl, secondsEl];

    if (!daysEl) {
        return;
    }

    function setCounters(values) {
        counters.forEach((counter, index) => {
            if (counter) {
                counter.textContent = values[index].toString().padStart(2, '0');
            }
        });
    }

    function updateCountdown() {
        const distance = targetDate - Date.now();

        if (distance <= 0) {
            setCounters([0, 0, 0, 0]);
            countdownContainer?.classList.add('is-over');
            window.clearInterval(timer);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCounters([days, hours, minutes, seconds]);
    }

    const timer = window.setInterval(updateCountdown, 1000);
    updateCountdown();
}

function setupRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach((reveal, index) => {
        reveal.style.setProperty('--reveal-delay', `${Math.min(index * 90, 360)}ms`);
    });

    if (!('IntersectionObserver' in window)) {
        reveals.forEach(reveal => reveal.classList.add('active'));
        return;
    }

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -70px 0px'
    });

    reveals.forEach(reveal => revealObserver.observe(reveal));
}

function setupTiltCards(prefersReducedMotion) {
    if (prefersReducedMotion) {
        return;
    }

    document.querySelectorAll('.photo-item, .classmate-item').forEach(card => {
        card.addEventListener('pointermove', event => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            card.style.setProperty('--ry', `${x * 7}deg`);
            card.style.setProperty('--rx', `${y * -7}deg`);
        });

        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--ry', '0deg');
            card.style.setProperty('--rx', '0deg');
        });
    });
}

function setupRsvp(button, prefersReducedMotion) {
    if (!button) {
        return;
    }

    button.addEventListener('click', () => {
        button.classList.add('is-confirmed');
        button.textContent = 'Շնորհակալություն';
        showToast('Շնորհակալություն, Ձեր ներկայությունը սպասված է');
        launchSparks(button, prefersReducedMotion ? 0 : 34);
        reportHeight();
    });
}

function setupFloatingBubbles(prefersReducedMotion) {
    if (prefersReducedMotion) {
        return;
    }

    const palette = [
        'rgba(255, 139, 164, 0.78)',
        'rgba(87, 169, 255, 0.72)',
        'rgba(255, 202, 92, 0.72)',
        'rgba(112, 214, 181, 0.68)',
        'rgba(255, 255, 255, 0.82)'
    ];
    const presets = [
        [4, 118, 0, 23, 2.4, -26],
        [12, 74, -9, 18, 1.6, 18],
        [21, 152, -16, 27, 3.2, 34],
        [31, 92, -5, 21, 2, -18],
        [43, 186, -22, 31, 3.8, 26],
        [56, 84, -12, 20, 1.8, -30],
        [68, 138, -4, 26, 2.8, 24],
        [82, 108, -18, 22, 2.2, -22],
        [93, 170, -8, 29, 3.4, 18],
        [16, 126, -27, 25, 2.6, -16],
        [47, 76, -32, 19, 1.6, 20],
        [74, 204, -36, 34, 4, -28]
    ];

    presets.forEach((preset, index) => {
        const bubble = document.createElement('span');
        const [x, size, delay, duration, blur, drift] = preset;

        bubble.className = 'floating-bubble';
        bubble.style.setProperty('--bubble-x', `${x}%`);
        bubble.style.setProperty('--bubble-size', `${size}px`);
        bubble.style.setProperty('--bubble-delay', `${delay}s`);
        bubble.style.setProperty('--bubble-duration', `${duration}s`);
        bubble.style.setProperty('--bubble-blur', `${blur}px`);
        bubble.style.setProperty('--bubble-drift', `${drift}vw`);
        bubble.style.setProperty('--bubble-opacity', `${0.28 + (index % 4) * 0.045}`);
        bubble.style.setProperty('--bubble-color', palette[index % palette.length]);
        document.body.appendChild(bubble);
    });
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');

    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('is-visible'));

    window.setTimeout(() => {
        toast.classList.remove('is-visible');
        window.setTimeout(() => toast.remove(), 280);
    }, 2600);
}

function launchSparks(origin, count = 38) {
    if (!origin || count <= 0) {
        return;
    }

    const rect = origin.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const colors = ['#b32739', '#245aa8', '#d99a2b', '#5f9479', '#fff4cf'];

    for (let index = 0; index < count; index += 1) {
        const spark = document.createElement('span');
        const angle = (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.45;
        const distance = 110 + Math.random() * 210;
        const fall = 70 + Math.random() * 150;

        spark.className = 'spark';
        spark.style.left = `${startX}px`;
        spark.style.top = `${startY}px`;
        spark.style.background = colors[index % colors.length];
        spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance + fall}px`);
        spark.style.setProperty('--spark-rotate', `${Math.random() * 520 - 260}deg`);
        spark.style.setProperty('--spark-speed', `${900 + Math.random() * 700}ms`);
        document.body.appendChild(spark);

        window.setTimeout(() => spark.remove(), 1700);
    }
}

window.addEventListener('resize', reportHeight);
window.addEventListener('load', reportHeight);
window.setInterval(reportHeight, 1500);

if (document.body) {
    const heightObserver = new MutationObserver(reportHeight);
    heightObserver.observe(document.body, { attributes: true, childList: true, subtree: true });
}
