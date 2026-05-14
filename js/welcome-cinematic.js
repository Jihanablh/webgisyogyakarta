/**
 * Cinematic welcome: curtain, dawn, layered silhouettes, ash/star particles,
 * gold lines, typewriter + shimmer title, parallax, CTA phases.
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
    const n = prefersReducedMotion() ? 10 : 68;
    for (let i = 0; i < n; i++) {
        const ash = Math.random() < 0.62;
        particles.push({
            kind: ash ? 'ash' : 'star',
            x: Math.random(),
            y: Math.random(),
            r: ash ? 0.25 + Math.random() * 1.1 : 0.35 + Math.random() * 0.9,
            vy: ash
                ? 0.00008 + Math.random() * 0.00035
                : 0.00003 + Math.random() * 0.00012,
            vx: (Math.random() - 0.5) * (ash ? 0.00035 : 0.00008),
            tw: Math.random() * Math.PI * 2,
            a: ash ? 0.06 + Math.random() * 0.14 : 0.12 + Math.random() * 0.35
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
        particles.forEach((p) => {
            p.y -= p.vy;
            p.x += p.vx + Math.sin(p.tw) * 0.00006;
            p.tw += 0.02;
            if (p.y < -0.02) p.y = 1.02;
            if (p.x < -0.02 || p.x > 1.02) p.x = (p.x + 1) % 1;
            const px = p.x * w;
            const py = p.y * h;
            ctx.globalAlpha = p.a;
            if (p.kind === 'ash') {
                ctx.fillStyle = 'rgba(180,188,200,0.85)';
                ctx.beginPath();
                ctx.arc(px, py, p.r * 1.8, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(212,160,23,0.9)';
                ctx.beginPath();
                ctx.arc(px, py, p.r * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,250,230,0.5)';
                ctx.beginPath();
                ctx.arc(px - p.r, py - p.r, p.r * 0.45, 0, Math.PI * 2);
                ctx.fill();
            }
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

function bindSilhouetteParallax(overlay) {
    const root = document.getElementById('welcome-silhouette-root');
    if (!root || prefersReducedMotion()) return () => {};

    let lx = 0;
    let ly = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    function frame() {
        raf = 0;
        lx += (tx - lx) * 0.08;
        ly += (ty - ly) * 0.08;
        root.style.setProperty('--sil-px', `${(lx * 16).toFixed(2)}px`);
        root.style.setProperty('--sil-py', `${(ly * 12).toFixed(2)}px`);
    }

    const onMove = (e) => {
        const r = overlay.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        tx = Math.max(-1, Math.min(1, nx));
        ty = Math.max(-1, Math.min(1, ny));
        if (!raf) raf = requestAnimationFrame(frame);
    };

    overlay.addEventListener('pointermove', onMove);
    return () => {
        overlay.removeEventListener('pointermove', onMove);
        if (raf) cancelAnimationFrame(raf);
    };
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
    let stopParallax = () => {};

    overlay.classList.add('welcome-cinematic', 'welcome-phase-curtain');
    stopParallax = bindSilhouetteParallax(overlay);

    requestAnimationFrame(() => {
        setTimeout(() => overlay.classList.add('welcome-phase-dawn'), 400);
        setTimeout(() => {
            overlay.classList.add('welcome-phase-silhouette');
            stopParticles = runParticles(canvas);
        }, 1200);
        setTimeout(() => overlay.classList.add('welcome-phase-line'), 2200);
        setTimeout(() => {
            const typed = document.getElementById('welcome-title-typed');
            typewriter(typed, TITLE, 88, () => {
                overlay.classList.add('welcome-phase-title-done');
                const h1 = document.getElementById('welcome-title-display');
                h1?.classList.add('welcome-title-shimmer');
                setTimeout(() => h1?.classList.remove('welcome-title-shimmer'), 2200);
            });
        }, 2800);
        setTimeout(() => overlay.classList.add('welcome-phase-sub'), 4200);
        setTimeout(() => overlay.classList.add('welcome-phase-stats'), 5000);
        setTimeout(() => overlay.classList.add('welcome-phase-cta'), 5600);
    });

    const btn = document.getElementById('welcome-btn');
    const cleanup = () => {
        stopParticles();
        stopParallax();
        overlay.removeEventListener('welcomeCleanup', cleanup);
    };
    overlay.addEventListener('welcomeCleanup', cleanup);
    btn?.addEventListener(
        'click',
        () => {
            overlay.dispatchEvent(new Event('welcomeCleanup'));
        },
        { once: true }
    );
}
