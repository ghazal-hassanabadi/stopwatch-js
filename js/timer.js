import { formatTime } from "./utils.js";

const timeDisplay = document.querySelector("#timerTime");
const message = document.querySelector("#timerMessage");
const toggleBtn = document.querySelector("#timerToggleBtn");
const toggleIcon = toggleBtn.querySelector("i");
const resetBtn = document.querySelector("#timerResetBtn");
const setBtn = document.querySelector("#timerSetBtn");
const minutesInput = document.querySelector("#timerMinutes");
const secondsInput = document.querySelector("#timerSeconds");
const presetBtns = document.querySelectorAll(".presetBtn");

let intervalId = null;
let totalMs = 5 * 60 * 1000;
let remainingMs = totalMs;
let endTimestamp = 0;

let audioCtx = null;

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
}

function updateDisplay(ms) {
    timeDisplay.textContent = formatTime(Math.ceil(ms / 1000) * 1000);
}

function setToggleIcon(isRunning) {
    toggleIcon.classList.toggle("fa-play", !isRunning);
    toggleIcon.classList.toggle("fa-pause", isRunning);
    toggleBtn.setAttribute("aria-label", isRunning ? "pause" : "start");
    toggleBtn.classList.toggle("running", isRunning);
}

updateDisplay(remainingMs);

function finishTimer() {
    clearInterval(intervalId);
    intervalId = null;
    remainingMs = 0;
    updateDisplay(0);
    message.textContent = "Time's up!";
    setToggleIcon(false);
    playAlarm();
}

function tick() {
    const left = endTimestamp - Date.now();

    if (left <= 0) {
        finishTimer();
        return;
    }

    updateDisplay(left);
}

function startTimer() {
    if (intervalId !== null) {
        return;
    }

    if (remainingMs <= 0) {
        remainingMs = totalMs;
    }

    getAudioCtx();

    message.textContent = "";
    endTimestamp = Date.now() + remainingMs;
    intervalId = setInterval(tick, 100);
    setToggleIcon(true);
}

function pauseTimer() {
    if (intervalId === null) {
        return;
    }

    clearInterval(intervalId);
    remainingMs = endTimestamp - Date.now();
    intervalId = null;
    setToggleIcon(false);
}

function toggleTimer() {
    if (intervalId === null) {
        startTimer();
    } else {
        pauseTimer();
    }
}

function resetTimer() {
    clearInterval(intervalId);
    intervalId = null;
    remainingMs = totalMs;
    message.textContent = "";
    updateDisplay(remainingMs);
    setToggleIcon(false);
}

function setDuration(ms) {
    clearInterval(intervalId);
    intervalId = null;
    totalMs = ms;
    remainingMs = ms;
    message.textContent = "";
    updateDisplay(ms);
    setToggleIcon(false);
}

function setCustomTime() {
    const minutes = Number(minutesInput.value) || 0;
    const seconds = Number(secondsInput.value) || 0;
    const ms = (minutes * 60 + seconds) * 1000;

    if (ms <= 0) {
        message.textContent = "Enter a time first";
        return;
    }

    setDuration(ms);
}

presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        setDuration(Number(btn.dataset.minutes) * 60 * 1000);
    });
});

toggleBtn.addEventListener("click", toggleTimer);
resetBtn.addEventListener("click", resetTimer);
setBtn.addEventListener("click", setCustomTime);