//===============================================================================
// Dependencies
//===============================================================================
const { ipcRenderer, remote } = require("electron");

//===============================================================================
// Constants
//===============================================================================
var window = remote.getCurrentWindow();
const charName = document.getElementById("charName");
const charBtn = document.getElementById("charBtn");

//===============================================================================
// Send Name
//===============================================================================
charName.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        ipcRenderer.send("character->main:CharName", charName.value);
        window.close();
    } else if (e.key === "Escape") {
        window.close();
    }
});

charBtn.addEventListener("click", function () {
    ipcRenderer.send("character->main:CharName", charName.value);
    window.close();
});
