/**
 * Cinematic welcome sequence: curtain, dawn sky, particles, gold line, typewriter title.
 */

const TITLE = 'JOGJA SIAGA';

function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function runParticles(canvas) {
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    let raf = 0;
    const particles = [];
    const n = prefersReducedMotion() ? 12 : 42;
    for (let i = 0; i < n; i++) {
        particles.push({
            x: Math.random(),
            y: Math.random(),
            r: 0.3 + Math.random() * 1.2,
            vy: 0.00015 + Math.random() * 0.0004,
            vx: (Math.random() - 0.5) * 0.0002,
            a: 0.08 + Math.random() * 0.2
        });
    }
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const { clientWidth: w, clientHeight: h } = canvas.parentElement || canvas;
        canvas.width = Math.max(1, w) * dpr;
        canvas.height = Math.max(1, h) * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function tick() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(212,160,23,0.35)';
        particles.forEach(p => {
            p.y -= p.vy;
            p.x += p.vx;
            if (p.y < -0.02) p.y = 1.02;
            if (p.x < -0.02 || p.x > 1.02) p.x = (p.x + 1) % 1;
            ctx.globalAlpha = p.a;
            ctx.beginPath();
            ctx.arc(p.x * w, p.y * h, p.r * 2.2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(tick);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement || document.body);
    tick();
    return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
    };
}

function typewriter(el, text, speedMs, done) {
    if (!el) {
        done?.();
        return;
    }
    el.textContent = '';
    let i = 0;
    const tick = () => {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i++;
            setTimeout(tick, speedMs);
        } else done?.();
    };
    tick();
}

export function initWelcomeCinematic() {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;

    if (prefersReducedMotion()) {
        overlay.classList.add('welcome-cinematic', 'welcome-phase-ready');
        const typed = document.getElementById('welcome-title-typed');
        if (typed) typed.textContent = TITLE;
        return;
    }

    const canvas = document.getElementById('welcome-particles');
    let stopParticles = () => {};

    overlay.classList.add('welcome-cinematic', 'welcome-phase-curtain');

    requestAnimationFrame(() => {
        setTimeout(() => overlay.classList.add('welcome-phase-dawn'), 400);
        setTimeout(() => {
            overlay.classList.add('welcome-phase-silhouette');
            stopParticles = runParticles(canvas);
        }, 1200);
        setTimeout(() => overlay.classList.add('welcome-phase-line'), 2200);
        setTimeout(() => {
            const typed = document.getElementById('welcome-title-typed');
            typewriter(typed, TITLE, 95, () => {
                overlay.classList.add('welcome-phase-title-done');
            });
        }, 2800);
        setTimeout(() => overlay.classList.add('welcome-phase-sub'), 4200);
        setTimeout(() => overlay.classList.add('welcome-phase-stats'), 5000);
        setTimeout(() => overlay.classList.add('welcome-phase-cta'), 5600);
    });

    const btn = document.getElementById('welcome-btn');
    const cleanup = () => {
        stopParticles();
        overlay.removeEventListener('welcomeCleanup', cleanup);
    };
    overlay.addEventListener('welcomeCleanup', cleanup);
    btn?.addEventListener('click', () => {
        overlay.dispatchEvent(new Event('welcomeCleanup'));
    }, { once: true });
}
