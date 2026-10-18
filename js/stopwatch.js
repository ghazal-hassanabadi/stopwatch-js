import { formatTime } from "./utils.js";

const timeDisplay = document.querySelector("#time");
const toggleBtn = document.querySelector("#toggleBtn");
const toggleIcon = toggleBtn.querySelector("i");
const resetBtn = document.querySelector("#resetBtn");
const lapBtn = document.querySelector("#lapBtn");
const lapsList = document.querySelector("#lapsList");

let timerId = null;
let elapsedMs = 0;
let startTimestamp = 0;
let lapCount = 0;

function updateDisplay(ms) {
    timeDisplay.textContent = formatTime(ms);
}

function getCurrentMs() {
    return elapsedMs + (Date.now() - startTimestamp);
}

function setToggleIcon(isRunning) {
    toggleIcon.classList.toggle("fa-play", !isRunning);
    toggleIcon.classList.toggle("fa-pause", isRunning);
    toggleBtn.setAttribute("aria-label", isRunning ? "pause" : "start");
    toggleBtn.classList.toggle("running", isRunning);
}

updateDisplay(0);

function startTimer() {
    if (timerId !== null) {
        return;
    }

    startTimestamp = Date.now();

    timerId = setInterval(() => {
        updateDisplay(getCurrentMs());
    }, 100);

    setToggleIcon(true);
}

function pauseTimer() {
    if (timerId === null) {
        return;
    }

    clearInterval(timerId);
    elapsedMs += Date.now() - startTimestamp;
    timerId = null;

    setToggleIcon(false);
}

function toggleTimer() {
    if (timerId === null) {
        startTimer();
    } else {
        pauseTimer();
    }
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    elapsedMs = 0;
    lapCount = 0;
    updateDisplay(0);
    lapsList.textContent = "";
    setToggleIcon(false);
}

function addLap() {
    if (timerId === null) {
        return;
    }

    lapCount++;

    const item = document.createElement("li");
    item.className = "lapItem";

    const number = document.createElement("span");
    number.className = "lapNumber";
    number.textContent = `Lap ${lapCount}`;

    const time = document.createElement("span");
    time.className = "lapTime";
    time.textContent = formatTime(getCurrentMs());

    item.append(number, time);
    lapsList.prepend(item);
}

toggleBtn.addEventListener("click", toggleTimer);
resetBtn.addEventListener("click", resetTimer);
lapBtn.addEventListener("click", addLap);