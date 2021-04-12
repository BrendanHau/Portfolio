//===============================================================================
// Dependencies
//===============================================================================
const { ipcRenderer, remote } = require("electron");

//===============================================================================
// Globals
//===============================================================================
var DAILY_RESET = {};
var WEEKLY_BOSS_RESET = {};
var WEEKLY_OTHER_RESET = {};
var checklistItems = {};
var window = remote.getCurrentWindow();

//===============================================================================
// Constants
//===============================================================================
const checklistHTML = document.getElementById("config-checklist");
const exitBtnHTML = document.getElementById("exitBtn");
const submitBtnHTML = document.getElementById("submitBtn");

window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        window.close();
    }
});

ipcRenderer.on("main->config:ConfigWindow", (event, payload) => {
    // Set payload variables
    DAILY_RESET = payload[0];
    WEEKLY_BOSS_RESET = payload[1];
    WEEKLY_OTHER_RESET = payload[2];
    checklistItems = payload[3];
    // Display the contents
    checklistHTML.value = JSON.stringify(checklistItems, null, 4);
    auto_grow(checklistHTML);
});

exitBtnHTML.addEventListener("click", () => {
    window.close();
});

submitBtnHTML.addEventListener("click", () => {
    ipcRenderer.send("config->main:ConfigSubmit", [checklistHTML.value]);
    window.close();
});

function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = element.scrollHeight + "px";
}
