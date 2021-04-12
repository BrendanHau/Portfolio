// ============================================================================================================
// Page Rendering
// ============================================================================================================

/* Reset to Top of Page */
$(document).ready(function () {
  history.scrollRestoration = "manual";
  $(window).scrollTop(0);
  document.getElementById("content-container").style.display = "block";
});

/* Page Loader */
window.onload = function () {
  $(".loader-wrapper").fadeOut("slow");
  document.getElementsByTagName("body")[0].style.overflowY = "scroll";
};

// ============================================================================================================
// Navigation Bar
// ============================================================================================================

/* Navbar */
const toggleButton = document.getElementsByClassName("toggle-button")[0];
const navbarLinks = document.getElementsByClassName("navbar-links")[0];

toggleButton.addEventListener("click", () => {
  navbarLinks.classList.toggle("active");
});

/* Navbar Selection */
const navbarItems = document.getElementsByClassName("underline");
for (let item of navbarItems) {
  item.addEventListener("click", () => {
    if (navbarLinks.classList.contains("active")) {
      navbarLinks.classList.toggle("active");
    }
  });
}

/* Section Selector */
$(document).ready(function () {
  $(".show-dailies").click(function () {
    $("#dailies").fadeIn(750);
    $("#weeklies").fadeOut(750);
  });
  $(".show-weeklies").click(function () {
    $("#dailies").fadeOut(750);
    $("#weeklies").fadeIn(750);
  });
  $("#dailies").fadeIn(0);
  $("#weeklies").fadeOut(0);
});

// ============================================================================================================
// Code for persistent checkboxes (Dailies)
// ============================================================================================================
var checkboxObjDaily = document.getElementsByClassName("daily");

for (let item of checkboxObjDaily) {
  item.addEventListener("change", function () {
    if (item.checked == false) {
      window.localStorage.setItem(item.id, "unchecked");
    } else {
      window.localStorage.setItem(item.id, "checked");
    }
  });
}

for (let item of checkboxObjDaily) {
  if (window.localStorage.getItem(item.id)) {
    let checkbox = document.getElementById(item.id);
    if (window.localStorage.getItem(item.id) == "unchecked") {
      checkbox.checked = false;
    } else {
      checkbox.checked = true;
    }
  } else {
    window.localStorage.setItem(item.id, "unchecked");
  }
}

function uncheck_all_daily() {
  for (let item of checkboxObjDaily) {
    if (window.localStorage.getItem(item.id)) {
      if (window.localStorage.getItem(item.id) == "checked") {
        document.getElementById(item.id).checked = false;
        window.localStorage.setItem(item.id, "unchecked");
      }
    }
  }
}

// ============================================================================================================
// Code for persistent checkboxes (Weeklies)
// ============================================================================================================
var checkboxObjWeekly = document.getElementsByClassName("weekly_boss");
for (let item of checkboxObjWeekly) {
  item.addEventListener("change", function () {
    if (item.checked == false) {
      window.localStorage.setItem(item.id, "unchecked");
    } else {
      window.localStorage.setItem(item.id, "checked");
    }
  });
}

for (let item of checkboxObjWeekly) {
  if (window.localStorage.getItem(item.id)) {
    let checkbox = document.getElementById(item.id);
    if (window.localStorage.getItem(item.id) == "unchecked") {
      checkbox.checked = false;
    } else {
      checkbox.checked = true;
    }
  } else {
    window.localStorage.setItem(item.id, "unchecked");
  }
}

function uncheck_all_weekly_boss() {
  for (let item of checkboxObjWeekly) {
    if (window.localStorage.getItem(item.id)) {
      if (window.localStorage.getItem(item.id) == "checked") {
        document.getElementById(item.id).checked = false;
        window.localStorage.setItem(item.id, "unchecked");
      }
    }
  }
}

var checkboxObjWeeklyOther = document.getElementsByClassName("weekly_other");
for (let item of checkboxObjWeeklyOther) {
  item.addEventListener("change", function () {
    if (item.checked == false) {
      window.localStorage.setItem(item.id, "unchecked");
    } else {
      window.localStorage.setItem(item.id, "checked");
    }
  });
}

for (let item of checkboxObjWeeklyOther) {
  if (window.localStorage.getItem(item.id)) {
    let checkbox = document.getElementById(item.id);
    if (window.localStorage.getItem(item.id) == "unchecked") {
      checkbox.checked = false;
    } else {
      checkbox.checked = true;
    }
  } else {
    window.localStorage.setItem(item.id, "unchecked");
  }
}

function uncheck_all_weekly_other() {
  for (let item of checkboxObjWeeklyOther) {
    if (window.localStorage.getItem(item.id)) {
      if (window.localStorage.getItem(item.id) == "checked") {
        document.getElementById(item.id).checked = false;
        window.localStorage.setItem(item.id, "unchecked");
      }
    }
  }
}

// ============================================================================================================
// Helper Functions
// ============================================================================================================

/* Takes in 'year/month/day/hour/minute/second/weekday' and converts it into a custom object with UTC time.
        Input:  date -> Date
        Output: TimeObject
 */
function TimeObject(year, month, day, hour, minute, second, weekday) {
  this.year = year;
  this.month = month;
  this.day = day;
  this.hour = hour;
  this.minute = minute;
  this.second = second;
  this.weekday = weekday;

  this.string = function () {
    return (
      this.year +
      "," +
      this.month +
      "," +
      this.day +
      "," +
      this.hour +
      "," +
      this.minute +
      "," +
      this.second +
      "," +
      this.weekday
    );
  };
}

/* Takes in a Date and converts it into a custom object.
        Input:  date -> Date
        Output: TimeObject
 */
function getTimeObject(date) {
  return new TimeObject(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCDay()
  );
}

function getTimeObjectEST(date) {
  return new TimeObject(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getDay()
  );
}

/* Takes in a TimeObject and a integer (0 = daily, 1 = weekly other, 2 = weekly boss)
   and outputs a new TimeObject with the remaining time needed before reset.
        Input:  time -> TimeObject
                type -> Integer
        Output: TimeObject
 */
function calculateReset(time, type) {
  switch (type) {
    // Daily
    case 0:
      var returnVal = new TimeObject(
        0,
        0,
        0,
        23 - time.hour,
        59 - time.minute,
        60 - time.second,
        0
      );
      return returnVal;
      break;
    // Weekly Other
    case 1:
      var day;
      if (time.weekday == 0) {
        day = 0;
      } else {
        day = 7 - time.weekday;
      }
      var returnVal = new TimeObject(
        0,
        0,
        day,
        23 - time.hour,
        59 - time.minute,
        60 - time.second,
        0
      );
      return returnVal;
      break;
    // Weekly Boss
    case 2:
      var day;
      switch (time.weekday) {
        case 0:
          day = 3;
          break;
        case 1:
          day = 2;
          break;
        case 2:
          day = 1;
          break;
        case 3:
          day = 0;
          break;
        case 4:
          day = 6;
          break;
        case 5:
          day = 5;
          break;
        case 6:
          day = 4;
          break;
      }
      var returnVal = new TimeObject(
        0,
        0,
        day,
        23 - time.hour,
        59 - time.minute,
        60 - time.second,
        0
      );
      return returnVal;
      break;
    default:
  }
}

/* Takes in a TimeObject and converts the total time into seconds (only up to days).
        Input:  time -> TimeObject
        Output: Integer
 */
function calculateSeconds(time) {
  var days = time.day * 86400;
  var hours = time.hour * 3600;
  var minutes = time.minute * 60;
  var seconds = time.second;
  return days + hours + minutes + seconds;
}

// ============================================================================================================
// Code for daily/weekly reset (storage)
// ============================================================================================================

function getDate(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
}

// Takes a Date and puts it into local storage as "last_reset"
function resetSerialize(time) {
  var dateString =
    time.year +
    "," +
    time.month +
    "," +
    time.day +
    "," +
    time.hour +
    "," +
    time.minute +
    "," +
    time.second;
  window.localStorage.setItem("last_reset", dateString);
}

// Create a Date object using "last_reset" in localStorage
function resetDeserialize() {
  var last_reset = window.localStorage.getItem("last_reset").split(",");
  const year = parseInt(last_reset[0]);
  const month = parseInt(last_reset[1]);
  const day = parseInt(last_reset[2]);
  const hour = parseInt(last_reset[3]);
  const minute = parseInt(last_reset[4]);
  const second = parseInt(last_reset[5]);

  var returnVal = new Date(year, month, day, hour);
  return returnVal;
}

// current_time = A Date object with 'year'/'month'/'day'/'hour'/'minute'/'second' properties
function resetUpdate(current_time) {
  var last_reset;

  // Check localStorage for last reset
  if ((last_reset = window.localStorage.getItem("last_reset"))) {
  } else {
    window.localStorage.setItem(
      "last_reset",
      resetSerialize(getTimeObject(new Date()))
    );
    last_reset = window.localStorage.getItem("last_reset");
  }
  // Change last reset into an object
  last_reset = resetDeserialize();

  // Difference in time (milliseconds) between current_time and last_reset
  var time_difference = Math.abs(current_time - last_reset);
  var current_time_UTC = getTimeObject(current_time);
  var last_reset_UTC = getTimeObject(last_reset);

  // Over 7 days has passed since the last reset
  if (time_difference >= 7 * 24 * 60 * 60 * 1000) {
    uncheck_all_daily();
    uncheck_all_weekly_boss();
    uncheck_all_weekly_other();
  }
  // Over 1 day has passed OR same day but hour crossed over 20 UTC
  if (
    time_difference >= 24 * 60 * 60 * 1000 ||
    current_time_UTC.day != last_reset_UTC.day
  ) {
    uncheck_all_daily();
  }
  var upcoming_weekly_other_reset =
    calculateSeconds(calculateReset(last_reset_UTC, 1)) * 1000;
  var upcoming_weekly_boss_reset =
    calculateSeconds(calculateReset(last_reset_UTC, 2)) * 1000;
  // Check if total time elapsed since last reset is larger than the first possible weekly (other) reset
  if (time_difference > upcoming_weekly_other_reset) {
    uncheck_all_weekly_other();
  }
  // Check if total time elapsed since last reset is larger than the first possible weekly (boss) reset
  if (time_difference > upcoming_weekly_boss_reset) {
    uncheck_all_weekly_boss();
  }
}

resetUpdate(getDate(new Date()));
resetSerialize(getTimeObjectEST(new Date()));

// ============================================================================================================
// Clock Helper Functions (Online)
// ============================================================================================================
function getTimeRemaining(endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date());
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

// Daily Clock Initializer
function initializeDailyClock(id, endtime) {
  const clock = document.getElementById(id);
  const daysSpan = clock.querySelector(".days");
  const hoursSpan = clock.querySelector(".hours");
  const minutesSpan = clock.querySelector(".minutes");
  const secondsSpan = clock.querySelector(".seconds");
  var timer = endtime;

  function updateClock() {
    var t = getTimeRemaining(timer);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
    minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
    secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

    if (t.total <= 0) {
      uncheck_all_daily();
      resetSerialize(getTimeObjectEST(new Date()));
      timer = new Date(Date.parse(new Date()) + 86400 * 1000);
    }
    // Ursus x2 Time
    if (
      (82800000 >= t.total && t.total >= 75600000) ||
      (21600000 >= t.total && t.total >= 14400000)
    ) {
      document.getElementById("ursus").style.backgroundImage =
        "url(./assets/img/dailies_ursus_x2v2.png)";
    } else {
      document.getElementById("ursus").style.backgroundImage =
        "url(./assets/img/dailies_ursus.png)";
    }
  }

  updateClock();
  const timeinterval = setInterval(updateClock, 1000);
}

const daily_deadline = new Date(
  Date.parse(new Date()) +
    calculateSeconds(calculateReset(getTimeObject(new Date()), 0)) * 1000
);
initializeDailyClock("dailies--clock", daily_deadline);

// Weekly (Other) Block Initializer
function initializeWeeklyOtherClock(id, endtime) {
  const clock = document.getElementById(id);
  const daysSpan = clock.querySelector(".days");
  const hoursSpan = clock.querySelector(".hours");
  const minutesSpan = clock.querySelector(".minutes");
  const secondsSpan = clock.querySelector(".seconds");
  var timer = endtime;

  function updateClock() {
    var t = getTimeRemaining(timer);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
    minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
    secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

    if (t.total <= 0) {
      uncheck_all_weekly_other();
      resetSerialize(getTimeObjectEST(new Date()));
      timer = new Date(Date.parse(new Date()) + 604800 * 1000);
    }
  }

  updateClock();
  const timeinterval = setInterval(updateClock, 1000);
}

const weekly_other_deadline = new Date(
  Date.parse(new Date()) +
    calculateSeconds(calculateReset(getTimeObject(new Date()), 1)) * 1000
);
initializeWeeklyOtherClock("weeklies--clock--other", weekly_other_deadline);

// Weekly (Boss) Clock Initializer
function initializeWeeklyBossClock(id, endtime) {
  const clock = document.getElementById(id);
  const daysSpan = clock.querySelector(".days");
  const hoursSpan = clock.querySelector(".hours");
  const minutesSpan = clock.querySelector(".minutes");
  const secondsSpan = clock.querySelector(".seconds");
  var timer = endtime;

  function updateClock() {
    var t = getTimeRemaining(timer);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
    minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
    secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

    if (t.total <= 0) {
      uncheck_all_weekly_boss();
      resetSerialize(getTimeObjectEST(new Date()));
      timer = new Date(Date.parse(new Date()) + 604800 * 1000);
    }
  }

  updateClock();
  const timeinterval = setInterval(updateClock, 1000);
}

const weekly_boss_deadline = new Date(
  Date.parse(new Date()) +
    calculateSeconds(calculateReset(getTimeObject(new Date()), 2)) * 1000
);
initializeWeeklyBossClock("weeklies--clock--boss", weekly_boss_deadline);
