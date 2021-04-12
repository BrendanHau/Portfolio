//===============================================================================
// Dependencies
//===============================================================================
const { ipcRenderer, ipcMain } = require("electron");
const config = require("config");
const path = require("path");
const { serialize } = require("v8");

//===============================================================================
// Configurables
//===============================================================================
var DAILY_RESET = { hour: 20, minute: 0, second: 0 }; // 8:00pm EST
var WEEKLY_BOSS_RESET = { day: 3, hour: 20, minute: 0, second: 0 }; // Wednesday 8:00pm EST
var WEEKLY_OTHER_RESET = { day: 0, hour: 20, minute: 0, second: 0 }; // Sunday 8:00pm EST

var checklistItems = {
    // DO NOT ADD/REMOVE ANY CATEGORIES (dailyBosses/dailyOther/weeklyBosses/weeklyOther)
    dailyBosses: {
        zakum: "dailies_zakum.png",
        von_leon: "dailies_von_leon.png",
        horntail: "dailies_horntail.png",
        ranmaru: "dailies_ranmaru.png",
        julietta: "dailies_julieta.png",
        arkarium: "dailies_arkarium.png",
        pinkbean: "dailies_pinkbean.png",
        papulatus: "dailies_papulatus.png",
        crimson_queen: "dailies_crimson_queen.png",
        pierre: "dailies_pierre.png",
        vonbon: "dailies_vonbon.png",
        vellum: "dailies_vellum.png",
        hilla: "dailies_hilla.png",
        magnus: "dailies_magnus.png",
        gollux: "dailies_gollux.png",
    },
    dailyOther: {
        vanishing_journey: "dailies_vj.png",
        chuchu: "dailies_chuchu.png",
        lachelein: "dailies_lach.png",
        arcana: "dailies_arcana.png",
        morass: "dailies_morass.png",
        esfera: "dailies_esfera.png",
        moonbridge: "dailies_moonbridge.png",
        legion: "dailies_legion.png",
        commerci: "dailies_commerci.png",
        monster_park: "dailies_monster_park.png",
        maple_tour: "dailies_maple_tour.png",
        ursus: "dailies_ursus.png",
        monster_collection: "dailies_monster_collection.png",
        phantom_forest: "dailies_phantom_forest.png",
        yu_garden: "dailies_yu_garden.png",
        fairy_bros: "dailies_fairy_bros.png",
        golden_fairy_bros: "dailies_golden_fairy_bros.png",
    },
    weeklyBosses: {
        cygnus: "weeklies_cygnus.png",
        czakum: "weeklies_zakum.png",
        princess_no: "weeklies_princess_no.png",
        cpinkbean: "weeklies_pinkbean.png",
        cpapulatus: "weeklies_papulatus.png",
        ccrimson_queen: "weeklies_crimson_queen.png",
        cpierre: "weeklies_pierre.png",
        cvonbon: "weeklies_vonbon.png",
        cvellum: "weeklies_vellum.png",
        hhilla: "weeklies_hilla.png",
        hmagnus: "weeklies_magnus.png",
        aketchi: "weeklies_aketchi.png",
        lotus: "weeklies_lotus.png",
        damien: "weeklies_damien.png",
        lucid: "weeklies_lucid.png",
        will: "weeklies_will.png",
        gloom: "weeklies_gloom.png",
        darknell: "weeklies_darknell.png",
        verus_hilla: "weeklies_verus_hilla.png",
    },
    weeklyOther: {
        dojo: "weeklies_mu_lung_dojo.png",
        scrapyard: "weeklies_scrapyard.png",
        darkworld_tree: "weeklies_darkworld_tree.png",
        guild_supplies: "weeklies_guild_supplies.png",
        kritias: "weeklies_kritias.png",
    },
};

//===============================================================================
// Globals
//===============================================================================

/* Resources */
var character = "default";
var checklist = {};
var checklistType = 1;

/* Constants */
const imageDirectory = "./assets/";
const validCategories = {
    dailyBosses: 0,
    dailyOther: 0,
    weeklyBosses: 0,
    weeklyOther: 0,
};

/* HTML Targets */
const navCharacterHTML = document.getElementById("nav-item--character");
const navDailyHTML = document.getElementById("nav-header--dailies");
const navWeeklyHTML = document.getElementById("nav-header--weeklies");
const navIconHTML = document.getElementById("nav-header--icon");
const navTimerHTML = document.getElementById("nav-item--timer");
const navEditHTML = document.getElementById("nav-item--edit");
const navConfigHTML = document.getElementById("nav-item--config");
const contentDailyHTML = document.getElementById("content--dailies");
const contentWeeklyHTML = document.getElementById("content--weeklies");
const clockDailyContainerHTML = document.getElementById("clock--daily");
const clockWeeklyContainerHTML = document.getElementById("clock--weekly");
const clockDailyContentHTML = "clock--daily-all";
const clockWeeklyBossContentHTML = "clock--weekly-bosses";
const clockWeeklyOtherContentHTML = "clock--weekly-other";
//===============================================================================
// Helper Function
//===============================================================================

/* Time Conversions */
function findDailyReset(date) {
    var result = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() +
            (date.getHours() < DAILY_RESET.hour ||
            (date.getHours() == DAILY_RESET.hour && date.getMinutes() < DAILY_RESET.minute) ||
            (date.getMinutes() == DAILY_RESET.minute && date.getSeconds() < DAILY_RESET.second)
                ? 0
                : 1),
        DAILY_RESET.hour,
        DAILY_RESET.minute,
        DAILY_RESET.second
    );
    return result;
}
function findWeeklyReset(date, type) {
    var weeklyType = type ? WEEKLY_BOSS_RESET : WEEKLY_OTHER_RESET;
    var result = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + ((7 + weeklyType.day - date.getDay()) % 7),
        weeklyType.hour,
        weeklyType.minute,
        weeklyType.second
    );
    if (result < date) {
        result.setDate(result.getDate() + 7);
    }
    return result;
}
function timeBetween(currentDate, targetDate) {
    return Math.floor((targetDate.getTime() - currDate.getTime()) / 1000);
}
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
function initializeDailyClock(clockContainer, targetDate) {
    const clock = document.getElementById(clockContainer);
    const daysSpan = clock.querySelector(".days");
    const hoursSpan = clock.querySelector(".hours");
    const minutesSpan = clock.querySelector(".minutes");
    const secondsSpan = clock.querySelector(".seconds");
    var timer = targetDate;

    function updateClock() {
        var t = getTimeRemaining(timer);

        daysSpan.innerHTML = t.days;
        hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
        minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
        secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

        if (t.total <= 0) {
            timer = new Date(Date.parse(new Date()) + 86400 * 1000);
            resetDailies();
        }
    }

    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
}
function initializeWeeklyClock(clockContainer, targetDate) {
    const clock = document.getElementById(clockContainer);
    const daysSpan = clock.querySelector(".days");
    const hoursSpan = clock.querySelector(".hours");
    const minutesSpan = clock.querySelector(".minutes");
    const secondsSpan = clock.querySelector(".seconds");
    var timer = targetDate;

    function updateClock() {
        var t = getTimeRemaining(timer);

        daysSpan.innerHTML = t.days;
        hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
        minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
        secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

        if (t.total <= 0) {
            timer = new Date(Date.parse(new Date()) + 7 * 86400 * 1000);
            if (clockContainer == "clock--weekly-bosses") {
                resetWeeklyBosses();
            } else {
                resetWeeklyOther();
            }
        }
    }

    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
}

/* Checklist */
function createCharacter(name) {
    checklist[name] = {};
    for (const category in checklistItems) {
        checklist[name][category] = {};
        for (const item in checklistItems[category]) {
            checklist[name][category][item] = {
                image: checklistItems[category][item],
                completion: "false",
                display: "true",
            };
        }
    }
    checklist[name].last_visit = new Date();
    serializeChecklist();
}
function updateChecklist(name, category, item, field, value) {
    checklist[name][category][item][field] = value;
}
function serializeChecklist() {
    window.localStorage.setItem("checklist", JSON.stringify(checklist));
}
function serializeChecklistConfig() {
    window.localStorage.setItem("checklistConfig", JSON.stringify(checklistItems));
    window.localStorage.setItem("dailyConfig", JSON.stringify(DAILY_RESET));
    window.localStorage.setItem("weeklyBossConfig", JSON.stringify(WEEKLY_BOSS_RESET));
    window.localStorage.setItem("weeklyOtherConfig", JSON.stringify(WEEKLY_OTHER_RESET));
}
function deserializeChecklist() {
    var result = JSON.parse(window.localStorage.getItem("checklist"));
    if (result) {
        // Checklist exists, replace local copy
        checklist = result;
    } else {
        // Checklist doesn't exist, create a default version
        createCharacter(character);
    }
}
function deserializeChecklistConfig() {
    if (window.localStorage.getItem("checklistConfig")) {
        checklistItems = JSON.parse(window.localStorage.getItem("checklistConfig"));
        DAILY_RESET = JSON.parse(window.localStorage.getItem("dailyConfig"));
        WEEKLY_BOSS_RESET = JSON.parse(window.localStorage.getItem("weeklyBossConfig"));
        WEEKLY_OTHER_RESET = JSON.parse(window.localStorage.getItem("weeklyOtherConfig"));
    } else {
        checklistItems = config.get("checklistItems");
        DAILY_RESET = config.get("DAILY_RESET");
        WEEKLY_BOSS_RESET = config.get("WEEKLY_BOSS_RESET");
        WEEKLY_OTHER_RESET = config.get("WEEKLY_OTHER_RESET");

        serializeChecklistConfig();
    }
}
function resetDailies() {
    if (checklist.hasOwnProperty(character)) {
        for (const category in checklistItems) {
            if (category == "dailyBosses" || category == "dailyOther") {
                for (const item in checklistItems[category]) {
                    checklist[character][category][item]["completion"] = "false";
                    document.getElementById(item).checked = false;
                }
            }
        }
        checklist[character].last_visit = new Date();
        serializeChecklist();
    }
}
function resetWeeklyBosses() {
    if (checklist.hasOwnProperty(character)) {
        for (const category in checklistItems) {
            if (category == "weeklyBosses") {
                for (const item in checklistItems[category]) {
                    checklist[character][category][item]["completion"] = "false";
                    document.getElementById(item).checked = false;
                }
            }
        }
        checklist[character].last_visit = new Date();
        serializeChecklist();
    }
}
function resetWeeklyOther() {
    if (checklist.hasOwnProperty(character)) {
        for (const category in checklistItems) {
            if (category == "weeklyOther") {
                for (const item in checklistItems[category]) {
                    checklist[character][category][item]["completion"] = "false";
                    document.getElementById(item).checked = false;
                }
            }
        }
        checklist[character].last_visit = new Date();
        serializeChecklist();
    }
}
function scanConfig() {
    // If checklist is missing items, add them
    for (const char in checklist) {
        for (const category in checklistItems) {
            for (const item in checklistItems[category]) {
                if (!checklist[char][category].hasOwnProperty(item)) {
                    checklist[char][category][item] = {
                        image: checklistItems[category][item],
                        completion: "false",
                        display: "true",
                    };
                }
            }
        }
    }
    // If checklist has additional items, remove them
    for (const char in checklist) {
        for (const category in checklist[char]) {
            if (category in validCategories) {
                for (const item in checklist[char][category]) {
                    if (!checklistItems[category].hasOwnProperty(item)) {
                        delete checklist[char][category][item];
                    }
                }
            }
        }
    }
    serializeChecklist();
}

/* Display Functions */
function initializeDisplay() {
    // Create the interactable elements
    for (const category in checklistItems) {
        for (const item in checklistItems[category]) {
            var itemHTML = document.createElement("INPUT");
            itemHTML.setAttribute("type", "checkbox");
            itemHTML.className = "content-item";
            itemHTML.id = item;
            itemHTML.style.backgroundImage =
                "url('" + imageDirectory + checklistItems[category][item] + "')";
            if (category == "dailyBosses" || category == "dailyOther") {
                contentDailyHTML.appendChild(itemHTML);
            } else {
                contentWeeklyHTML.appendChild(itemHTML);
            }
        }
    }

    for (const category in checklistItems) {
        for (const item in checklistItems[category]) {
            document.getElementById(item).addEventListener("click", function () {
                updateDisplay(checklist, character, category, item);
            });
        }
    }
}
function resetDisplay() {
    for (const category in checklistItems) {
        for (const item in checklistItems[category]) {
            document.getElementById(item).remove();
        }
    }
}
function updateDisplay(list, char, category, item) {
    if (list.hasOwnProperty(char)) {
        if (list[char][category][item]["completion"] == "true") {
            list[char][category][item]["completion"] = "false";
            console.log("Completed");
        } else {
            list[char][category][item]["completion"] = "true";
            console.log("Not Completed");
        }
        serializeChecklist();
    }
}

//===============================================================================
// Event Listeners / IPC
//===============================================================================

/* Character Page */
navCharacterHTML.addEventListener("click", () => {
    ipcRenderer.send("index->main:CharWindow");
});

/* Daily/Weekly Display */
navIconHTML.addEventListener("click", () => {
    if (!checklistType) {
        navDailyHTML.classList.remove("hidden");
        navWeeklyHTML.classList.add("hidden");
        contentDailyHTML.classList.remove("hidden");
        contentWeeklyHTML.classList.add("hidden");
        clockDailyContainerHTML.classList.remove("hidden");
        clockWeeklyContainerHTML.classList.add("hidden");

        checklistType = 1;
    } else {
        navDailyHTML.classList.add("hidden");
        navWeeklyHTML.classList.remove("hidden");
        contentDailyHTML.classList.add("hidden");
        contentWeeklyHTML.classList.remove("hidden");
        clockDailyContainerHTML.classList.add("hidden");
        clockWeeklyContainerHTML.classList.remove("hidden");

        checklistType = 0;
    }
});
ipcRenderer.on("main->index:SwapType", () => {
    if (!checklistType) {
        navDailyHTML.classList.remove("hidden");
        navWeeklyHTML.classList.add("hidden");
        contentDailyHTML.classList.remove("hidden");
        contentWeeklyHTML.classList.add("hidden");
        clockDailyContainerHTML.classList.remove("hidden");
        clockWeeklyContainerHTML.classList.add("hidden");

        checklistType = 1;
    } else {
        navDailyHTML.classList.add("hidden");
        navWeeklyHTML.classList.remove("hidden");
        contentDailyHTML.classList.add("hidden");
        contentWeeklyHTML.classList.remove("hidden");
        clockDailyContainerHTML.classList.add("hidden");
        clockWeeklyContainerHTML.classList.remove("hidden");

        checklistType = 0;
    }
});

/* Timer Page */
/*
navTimerHTML.addEventListener("click", () => {
    ipcRenderer.send("index->main:TimerWindow");
});
*/

/* Edit */
navEditHTML.addEventListener("click", () => {
    ipcRenderer.send("index->main:EditWindow", [checklist, checklistItems, character]);
});

/* Config */
/*
navConfigHTML.addEventListener("click", () => {
    ipcRenderer.send("index->main:ConfigWindow", [
        DAILY_RESET,
        WEEKLY_BOSS_RESET,
        WEEKLY_OTHER_RESET,
        checklistItems,
    ]);
});
*/

/* IPC Events */
ipcRenderer.on("main->index:CharName", function (event, arg) {
    // Check if character already exists...
    if (!checklist.hasOwnProperty(arg)) {
        createCharacter(arg);
    }

    // Set the new character
    character = arg;

    // Check if resets need to occur
    const currDate = new Date();
    const lastReset = new Date(checklist[character].last_visit);
    const nextDailyReset = findDailyReset(lastReset);
    const nextWeeklyBossReset = findWeeklyReset(lastReset, 1);
    const nextWeeklyOtherReset = findWeeklyReset(lastReset, 0);

    if (nextDailyReset - currDate < 0) {
        resetDailies();
    }
    if (nextWeeklyBossReset - currDate < 0) {
        resetWeeklyBosses();
    }
    if (nextWeeklyOtherReset - currDate < 0) {
        resetWeeklyOther();
    }

    // Update the view with the corresponding "display" and "completion"
    for (const category in checklistItems) {
        for (const item in checklistItems[category]) {
            // Update depending on completion status
            if (checklist[character][category][item]["completion"] == "true") {
                document.getElementById(item).checked = true;
            } else {
                document.getElementById(item).checked = false;
            }
            // Update depending on display status
            if (checklist[character][category][item]["display"] == "true") {
                document.getElementById(item).classList.remove("hidden");
            } else {
                document.getElementById(item).classList.add("hidden");
            }
        }
    }
});

ipcRenderer.on("main->edit:EditSubmit", function (event, arg) {
    // Update checklist
    checklist = arg;
    // Loop through the character's items, and if the display field is false,
    // hide the element in the view
    for (const category in checklistItems) {
        for (const item in checklistItems[category]) {
            if (checklist.hasOwnProperty(character)) {
                if (checklist[character][category][item]["display"] == "false") {
                    document.getElementById(item).classList.add("hidden");
                } else {
                    document.getElementById(item).classList.remove("hidden");
                }
            }
        }
    }
    serializeChecklist();
});

/*
ipcRenderer.on("main->index:ConfigSubmit", function (event, arg) {
    // Remove checklist items from display
    resetDisplay();
    // Update the checklist to the new version
    checklistItems = JSON.parse(arg[0]);
    console.log("ChecklistItems: " + arg[0]);
    // Update all the characters with the corresponding config
    scanConfig();
    // Reinitialize the display
    initializeDisplay();
    // Update the display with the completion/display statuses
    for (const category in checklistItems) {
        for (const item in checklistItems[category]) {
            // Update depending on completion status
            if (checklist[character][category][item]["completion"] == "true") {
                document.getElementById(item).checked = true;
            } else {
                document.getElementById(item).checked = false;
            }
            // Update depending on display status
            if (checklist[character][category][item]["display"] == "true") {
                document.getElementById(item).classList.remove("hidden");
            } else {
                document.getElementById(item).classList.add("hidden");
            }
        }
    }
    // Serialize the checklistItems
    serializeChecklistConfig();
    serializeChecklist();
});
*/

//===============================================================================
// Application
//===============================================================================
function onStart() {
    /* Update Checklist from Storage */
    deserializeChecklistConfig();
    deserializeChecklist();
    /* Scan Config for Changes */
    scanConfig();
    /* Create the Items */
    initializeDisplay();
    /* Initialize the Clocks */
    initializeDailyClock(clockDailyContentHTML, findDailyReset(new Date()));
    initializeWeeklyClock(clockWeeklyBossContentHTML, findWeeklyReset(new Date(), 1));
    initializeWeeklyClock(clockWeeklyOtherContentHTML, findWeeklyReset(new Date(), 0));
    /* Input initial character */
    ipcRenderer.send("index->main:CharWindow");
}
onStart();
