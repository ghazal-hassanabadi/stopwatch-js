import "./stopwatch.js";
import "./timer.js";



const stopwatchTab = document.querySelector("#stopwatchTab");
const timerTab = document.querySelector("#timerTab");
const stopwatchView = document.querySelector("#stopwatchView");
const timerView = document.querySelector("#timerView");

function showView(name) {
    const isStopwatch = name === "stopwatch";

    stopwatchView.classList.toggle("hidden", !isStopwatch);
    timerView.classList.toggle("hidden", isStopwatch);
    stopwatchTab.classList.toggle("active", isStopwatch);
    timerTab.classList.toggle("active", !isStopwatch);
}

stopwatchTab.addEventListener("click", () => showView("stopwatch"));
timerTab.addEventListener("click", () => showView("timer"));