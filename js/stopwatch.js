import { formatTime } from "./utils.js";

const timeDisplay = document.querySelector("#time");
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
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

updateDisplay(0);

function startTimer() {
    startTimestamp = Date.now();

    timerId = setInterval(() => {
        updateDisplay(Date.now() - startTimestamp);
    }, 100);
}

startBtn.addEventListener("click", startTimer);