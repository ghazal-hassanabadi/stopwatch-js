
export const RING_RADIUS = 120;
export const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function pad(n) {
    return String(n).padStart(2, "0");
}


export function formatParts(ms) {
    const centis = Math.max(0, Math.floor(ms / 10));
    const minutes = Math.floor(centis / 6000);
    const seconds = Math.floor(centis / 100) % 60;
    const cs = centis % 100;

    return {
        main: `${pad(minutes)}:${pad(seconds)}`,
        cs: `.${pad(cs)}`,
    };
}

export function formatTime(ms) {
    const { main, cs } = formatParts(ms);
    return main + cs;
}

export function initRing(ring) {
    ring.style.strokeDasharray = RING_LENGTH;
    ring.style.strokeDashoffset = RING_LENGTH;
}


export function setRing(ring, dot, progress, hideDotAtZero = false) {
    const p = Math.min(1, Math.max(0, progress));

    ring.style.strokeDashoffset = RING_LENGTH * (1 - p);
    ring.style.opacity = p === 0 ? 0 : 1;

    dot.setAttribute("transform", `rotate(${p * 360} 150 150)`);
    dot.style.opacity = hideDotAtZero && p === 0 ? 0 : 1;
}