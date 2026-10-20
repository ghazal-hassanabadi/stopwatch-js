
import { formatParts, initRing, setRing } from "./utils.js";

const clock = document.querySelector("#timerClock");
const timerMain = document.querySelector("#timerMain");
const timerCs = document.querySelector("#timerCs");
const ring = document.querySelector("#timerRing");
const dot = document.querySelector("#timerDot");
const message = document.querySelector("#timerMessage");
const toggleBtn = document.querySelector("#timerToggleBtn");
const toggleIcon = toggleBtn.querySelector("i");
const resetBtn = document.querySelector("#timerResetBtn");
const setBtn = document.querySelector("#timerSetBtn");
const minutesInput = document.querySelector("#timerMinutes");
const secondsInput = document.querySelector("#timerSeconds");
const presetBtns = document.querySelectorAll(".presetBtn");

let isRunning = false;
let rafId = null;
let finishTimeoutId = null;
let totalMs = 5 * 60 * 1000;
let remainingMs = totalMs;
let endAt = 0;
let audioCtx = null;

function now() {
    return performance.now();
}

/* ---------- sound ---------- */

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function playAlarm() {
    try {
        const ctx = getAudioCtx();

        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = ctx.currentTime + i * 0.5;

            osc.type = "sine";
            osc.frequency.value = 880;
            osc.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.start(t);
            osc.stop(t + 0.4);
        }
    } catch (error) {
        console.error("Alarm failed:", error);
    }
}

/* ---------- display ---------- */

function render(ms) {
    const shown = Math.max(0, Math.ceil(ms / 10) * 10);
    const parts = formatParts(shown);

    timerMain.textContent = parts.main;
    timerCs.textContent = parts.cs;
    setRing(ring, dot, totalMs > 0 ? ms / totalMs : 0, true);
}

function updateButtons() {
    toggleIcon.classList.toggle("fa-play", !isRunning);
    toggleIcon.classList.toggle("fa-pause", isRunning);
    toggleBtn.setAttribute("aria-label", isRunning ? "pause" : "start");
    toggleBtn.classList.toggle("running", isRunning);
}

function markPreset(ms) {
    presetBtns.forEach((btn) => {
        const presetMs = Number(btn.dataset.minutes) * 60 * 1000;
        btn.classList.toggle("active", presetMs === ms);
    });
}

/* ---------- loop control ---------- */

function stopLoop() {
    cancelAnimationFrame(rafId);
    clearTimeout(finishTimeoutId);
    rafId = null;
    finishTimeoutId = null;
    isRunning = false;
}

function frame() {
    const left = endAt - now();

    if (left <= 0) {
        finishTimer();
        return;
    }

    render(left);
    rafId = requestAnimationFrame(frame);
}

function finishTimer() {
    if (!isRunning) {
        return;
    }

    stopLoop();
    remainingMs = 0;
    render(0);
    message.textContent = "Time's up!";
    clock.classList.add("done");
    updateButtons();
    playAlarm();
}

function startTimer() {
    if (isRunning) {
        return;
    }

    if (remainingMs <= 0) {
        remainingMs = totalMs;
    }

    getAudioCtx();

    message.textContent = "";
    clock.classList.remove("done");

    endAt = now() + remainingMs;
    isRunning = true;

    // backup: animation frames pause in hidden tabs, this still fires
    finishTimeoutId = setTimeout(finishTimer, remainingMs);
    rafId = requestAnimationFrame(frame);
    updateButtons();
}

function pauseTimer() {
    if (!isRunning) {
        return;
    }

    remainingMs = Math.max(0, endAt - now());
    stopLoop();
    render(remainingMs);
    updateButtons();
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function resetTimer() {
    stopLoop();
    remainingMs = totalMs;
    message.textContent = "";
    clock.classList.remove("done");
    render(remainingMs);
    updateButtons();
}

function setDuration(ms) {
    stopLoop();
    totalMs = ms;
    remainingMs = ms;
    message.textContent = "";
    clock.classList.remove("done");
    markPreset(ms);
    render(ms);
    updateButtons();
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function setCustomTime() {
    const minutes = clamp(Math.floor(Number(minutesInput.value) || 0), 0, 99);
    const seconds = clamp(Math.floor(Number(secondsInput.value) || 0), 0, 59);
    const ms = (minutes * 60 + seconds) * 1000;

    if (ms <= 0) {
        message.textContent = "Enter a time first";
        return;
    }

    setDuration(ms);
    minutesInput.value = "";
    secondsInput.value = "";
}

/* ---------- init + events ---------- */

initRing(ring);
markPreset(totalMs);
render(remainingMs);
updateButtons();

presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        setDuration(Number(btn.dataset.minutes) * 60 * 1000);
    });
});

toggleBtn.addEventListener("click", toggleTimer);
resetBtn.addEventListener("click", resetTimer);
setBtn.addEventListener("click", setCustomTime);

[minutesInput, secondsInput].forEach((input) => {
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            setCustomTime();
        }
    });
});