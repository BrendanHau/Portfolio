//===============================================================================
// Dependencies
//===============================================================================
const { ipcRenderer, remote } = require("electron");

//===============================================================================
// Globals
//===============================================================================
var checklist = {};
var checklistItems = {};
var character = "default";
const imageDirectory = "./assets/";
var window = remote.getCurrentWindow();

//===============================================================================
// Constants
//===============================================================================
const dailyBossHTML = document.getElementById("edit--daily-boss");
const dailyOtherHTML = document.getElementById("edit--daily-other");
const weeklyBossHTML = document.getElementById("edit--weekly-boss");
const weeklyOtherHTML = document.getElementById("edit--weekly-other");
const exitBtnHTML = document.getElementById("exitBtn");
const submitBtnHTML = document.getElementById("submitBtn");

window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        window.close();
    }
});

ipcRenderer.on("main->edit:EditWindow", (event, payload) => {
    // Set payload variables
    checklist = payload[0];
    checklistItems = payload[1];
    character = payload[2];
    // Initiate the items in their categories and add eventlisteners
    for (const category in checklistItems) {
        for (const item in checklistItems[category]) {
            var itemHTML = document.createElement("INPUT");
            itemHTML.setAttribute("type", "checkbox");
            itemHTML.className = "content-item";
            itemHTML.id = item;
            itemHTML.style.backgroundImage =
                "url('" + imageDirectory + checklistItems[category][item] + "')";
            if (category == "dailyBosses") {
                dailyBossHTML.appendChild(itemHTML);
            } else if (category == "dailyOther") {
                dailyOtherHTML.appendChild(itemHTML);
            } else if (category == "weeklyBosses") {
                weeklyBossHTML.appendChild(itemHTML);
            } else {
                weeklyOtherHTML.appendChild(itemHTML);
            }
        }
    }
    // Update view based on character preferences
    for (const category in checklist[character]) {
        for (item in checklist[character][category]) {
            if (checklist[character][category][item]["display"] == "false") {
                document.getElementById(item).checked = true;
            }
        }
    }
    // Append eventlisteners to the elements
    for (const category in checklistItems) {
        for (const item in checklistItems[category]) {
            document.getElementById(item).addEventListener("click", () => {
                if (checklist.hasOwnProperty(character)) {
                    if (checklist[character][category][item]["display"] == "true") {
                        checklist[character][category][item]["display"] = "false";
                    } else {
                        checklist[character][category][item]["display"] = "true";
                    }
                }
            });
        }
    }
});

exitBtnHTML.addEventListener("click", () => {
    window.close();
});

submitBtnHTML.addEventListener("click", () => {
    ipcRenderer.send("edit->main:EditSubmit", checklist);
    window.close();
});
