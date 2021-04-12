//===============================================================================
// Dependencies
//===============================================================================
const { ipcRenderer, remote, app } = require("electron");

//===============================================================================
// Variables
//===============================================================================
var totalTime = {
    hours: 0,
    minutes: 0,
    seconds: 0,
};
var notifTimer = -9999;
var originalDate = new Date();
var targetDate = new Date();

var pause = false;
var updateTimer = false;

var window = remote.getCurrentWindow();
const minBtnHTML = document.getElementById("minimize-btn");
const closeBtnHTML = document.getElementById("close-btn");
const inputHTML = document.getElementById("timer--input");
const inputHourHTML = document.getElementById("hour-input");
const inputMinuteHTML = document.getElementById("minute-input");
const inputSecondHTML = document.getElementById("second-input");
const startBtnHTML = document.getElementById("startBtn");
const displayHTML = document.getElementById("timer--display");

const radio15HTML = document.getElementById("radio-15m");
const radio30HTML = document.getElementById("radio-30m");
const radio60HTML = document.getElementById("radio-60m");

const pauseHTML = document.getElementById("pauseBtn");
const resetHTML = document.getElementById("resetBtn");

//===============================================================================
// Helper Function
//===============================================================================

function getTimeRemaining(targetDate) {
    const total = Date.parse(targetDate) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
        total,
        days,
        hours,
        minutes,
        seconds,
    };
}

function initializeClock(clockContainer, lastContainer, nextContainer) {
    /* Main clock container */
    const clock = document.getElementById(clockContainer);
    const hoursSpan = clock.querySelector(".hours");
    const minutesSpan = clock.querySelector(".minutes");
    const secondsSpan = clock.querySelector(".seconds");

    /* Last clock container */
    const lastClock = document.getElementById(lastContainer);
    const lastHoursSpan = lastClock.querySelector(".hours");
    const lastMinutesSpan = lastClock.querySelector(".minutes");
    const lastSecondsSpan = lastClock.querySelector(".seconds");

    /* Next clock container */
    const nextClock = document.getElementById(nextContainer);
    const nextHoursSpan = nextClock.querySelector(".hours");
    const nextMinutesSpan = nextClock.querySelector(".minutes");
    const nextSecondsSpan = nextClock.querySelector(".seconds");

    var timer = targetDate;
    var notificationCounter = notifTimer;
    var iteration = 0;

    function updateClock() {
        var t = getTimeRemaining(timer);

        hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
        minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
        secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

        /* If we need to update the timer, set the timer to the
         * new time and change the notificationCounter to the new
         * value. Set updateTimer to false.
         */
        if (updateTimer) {
            timer = targetDate;
            iteration = 0;

            t = getTimeRemaining(timer);
            hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
            minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
            secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

            if (t.total >= notificationCounter) {
                notificationCounter = notifTimer + 1000;
            } else {
                notificationCounter = -9999;
            }

            /* Update Last Timer */
            lastHoursSpan.innerHTML = ("0" + totalTime.hours).slice(-2);
            lastMinutesSpan.innerHTML = ("0" + totalTime.minutes).slice(-2);
            lastSecondsSpan.innerHTML = ("0" + totalTime.seconds).slice(-2);

            /* Update Next Timer */
            if (t.total >= notifTimer) {
                const total =
                    totalTime.hours * 60 * 60 * 1000 +
                    totalTime.minutes * 60 * 1000 +
                    totalTime.seconds * 1000 -
                    notifTimer;
                const seconds = Math.floor((total / 1000) % 60);
                const minutes = Math.floor((total / 1000 / 60) % 60);
                const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

                nextHoursSpan.innerHTML = ("0" + hours).slice(-2);
                nextMinutesSpan.innerHTML = ("0" + minutes).slice(-2);
                nextSecondsSpan.innerHTML = ("0" + seconds).slice(-2);
            } else {
                nextHoursSpan.innerHTML = "--";
                nextMinutesSpan.innerHTML = "--";
                nextSecondsSpan.innerHTML = "--";
            }

            updateTimer = false;
        }

        /* If application is paused, update the targetDate to delay
         * the countdown.
         */
        if (pause || t.total <= 0) {
            timer = new Date(timer.getTime() + 1000);
        }

        /* If the application is not paused and there is still time left,
         * countdown on the notification.
         */
        if (!pause && notificationCounter > 0) {
            notificationCounter -= 1000;
        }

        /* If the notificationCounter hits 0, send out a notification.
         * Only add a new countdown if the remaining time is greater
         * than the notification timer.
         */
        if (notificationCounter === 0) {
            new Notification("Checklist - Timer", {
                icon: "./assets/icon.ico",
            });

            if (t.total > 0 && t.total >= notifTimer) {
                notificationCounter = notifTimer;
                iteration += 1;

                const total =
                    totalTime.hours * 60 * 60 * 1000 +
                    totalTime.minutes * 60 * 1000 +
                    totalTime.seconds * 1000 -
                    notifTimer * iteration;
                const seconds = Math.floor((total / 1000) % 60);
                const minutes = Math.floor((total / 1000 / 60) % 60);
                const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

                nextHoursSpan.innerHTML = ("0" + hours).slice(-2);
                nextMinutesSpan.innerHTML = ("0" + minutes).slice(-2);
                nextSecondsSpan.innerHTML = ("0" + seconds).slice(-2);
            } else {
                notificationCounter = -9999;

                nextHoursSpan.innerHTML = "--";
                nextMinutesSpan.innerHTML = "--";
                nextSecondsSpan.innerHTML = "--";
            }

            lastHoursSpan.innerHTML = nextHoursSpan.innerHTML;
            lastMinutesSpan.innerHTML = nextMinutesSpan.innerHTML;
            lastSecondsSpan.innerHTML = nextSecondsSpan.innerHTML;
        }
    }

    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
}

//===============================================================================
// Application
//===============================================================================

minBtnHTML.addEventListener("click", () => {
    ipcRenderer.send("timer->main:TimerMinimize");
});

closeBtnHTML.addEventListener("click", () => {
    window.close();
});

// User clicks submit, get the input times
startBtnHTML.addEventListener("click", () => {
    inputHTML.classList.add("hidden");
    displayHTML.classList.remove("hidden");

    pause = false;

    totalTime.hours = parseInt(inputHourHTML.value);
    totalTime.minutes = parseInt(inputMinuteHTML.value);
    totalTime.seconds = parseInt(inputSecondHTML.value);

    oringalDate = new Date();
    targetDate = new Date(
        oringalDate.getTime() +
            totalTime.hours * 60 * 60 * 1000 +
            totalTime.minutes * 60 * 1000 +
            totalTime.seconds * 1000
    );

    if (radio15HTML.checked) {
        notifTimer = 15 * 60 * 1000;
    } else if (radio60HTML.checked) {
        notifTimer = 60 * 60 * 1000;
    } else {
        notifTimer = 30 * 60 * 1000;
    }

    updateTimer = true;
});

pauseHTML.addEventListener("click", () => {
    if (!pause) {
        pause = true;
    } else {
        pause = false;
    }
});

resetHTML.addEventListener("click", () => {
    inputHTML.classList.remove("hidden");
    displayHTML.classList.add("hidden");

    pause = true;
});

// Set the times into the clocks
// Change Page display
// Add event listeners to radio buttons that:
//  -   If clicked, reset the "Next Update" field accordingly

initializeClock("clock-remainder", "clock-last-update", "clock-next-update");
