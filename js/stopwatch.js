
import { formatParts, formatTime, initRing, setRing } from "./utils.js";

const timeMain = document.querySelector("#timeMain");
const timeCs = document.querySelector("#timeCs");
const ring = document.querySelector("#ring");
const dot = document.querySelector("#dot");
const toggleBtn = document.querySelector("#toggleBtn");
const toggleIcon = toggleBtn.querySelector("i");
const resetBtn = document.querySelector("#resetBtn");
const lapBtn = document.querySelector("#lapBtn");
const lapsList = document.querySelector("#lapsList");

const MINUTE_MS = 60 * 1000;

let isRunning = false;
let rafId = null;
let elapsedMs = 0;
let startedAt = 0;
let lastLapMs = 0;
const laps = [];

function now() {
    return performance.now();
}

function getCurrentMs() {
    return isRunning ? elapsedMs + (now() - startedAt) : elapsedMs;
}

function render(ms) {
    const parts = formatParts(ms);
    timeMain.textContent = parts.main;
    timeCs.textContent = parts.cs;
    setRing(ring, dot, (ms % MINUTE_MS) / MINUTE_MS);
}

function updateButtons() {
    toggleIcon.classList.toggle("fa-play", !isRunning);
    toggleIcon.classList.toggle("fa-pause", isRunning);
    toggleBtn.setAttribute("aria-label", isRunning ? "pause" : "start");
    toggleBtn.classList.toggle("running", isRunning);

    lapBtn.disabled = !isRunning;
    resetBtn.disabled = !isRunning && elapsedMs === 0;
}

function frame() {
    render(getCurrentMs());
    rafId = requestAnimationFrame(frame);
}

function startTimer() {
    if (isRunning) {
        return;
    }

    startedAt = now();
    isRunning = true;
    rafId = requestAnimationFrame(frame);
    updateButtons();
}

function pauseTimer() {
    if (!isRunning) {
        return;
    }

    elapsedMs = getCurrentMs();
    isRunning = false;
    cancelAnimationFrame(rafId);
    rafId = null;

    render(elapsedMs);
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
    cancelAnimationFrame(rafId);
    rafId = null;
    isRunning = false;
    elapsedMs = 0;
    lastLapMs = 0;
    laps.length = 0;

    lapsList.textContent = "";
    render(0);
    updateButtons();
}

function renderLaps() {
    lapsList.textContent = "";

    const splits = laps.map((lap) => lap.split);
    const fastest = Math.min(...splits);
    const slowest = Math.max(...splits);
    const canCompare = laps.length >= 2 && fastest !== slowest;

    for (let i = laps.length - 1; i >= 0; i--) {
        const lap = laps[i];

        const item = document.createElement("li");
        item.className = "lapItem";

        if (canCompare && lap.split === fastest) {
            item.classList.add("best");
        }
        if (canCompare && lap.split === slowest) {
            item.classList.add("worst");
        }

        const number = document.createElement("span");
        number.className = "lapNumber";
        number.textContent = `Lap ${i + 1}`;

        const split = document.createElement("span");
        split.className = "lapSplit";
        split.textContent = formatTime(lap.split);

        const total = document.createElement("span");
        total.className = "lapTotal";
        total.textContent = formatTime(lap.total);

        item.append(number, split, total);
        lapsList.append(item);
    }
}

function addLap() {
    if (!isRunning) {
        return;
    }

    const total = getCurrentMs();
    const split = total - lastLapMs;
    lastLapMs = total;

    laps.push({ split, total });
    renderLaps();
}

initRing(ring);
render(0);
updateButtons();

toggleBtn.addEventListener("click", toggleTimer);
resetBtn.addEventListener("click", resetTimer);
lapBtn.addEventListener("click", addLap);