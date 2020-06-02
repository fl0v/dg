// ==UserScript==
// @name         Dark Galaxy - Fix current timezone
// @namespace    https://darkgalaxy.com/
// @version      0.1
// @description  All your planet are belong to us
// @author       Biggy
// @match        https://beta.darkgalaxy.com/*
// @grant        none
// ==/UserScript==

(function() {
    const gmtPattern = /(GMT[\-\+]?\d{4})/; // Look for GMT, + or - (optionally), and 4 characters of digits (\d)
    const updateTime = (el) => {
        const now = new Date();
        const tz = gmtPattern.exec(now.toString())[1];
        el.innerText = TurnManager.padTimeField(now.getHours()) + ":" + TurnManager.padTimeField(now.getMinutes()) + ' ('+tz+')';
    };
    const newTimeEl = document.createElement("span");
    document.querySelector('#timeField').replaceWith(newTimeEl); // replace the old element TurnManager will not update it anymore
    updateTime(newTimeEl); // first update
    setInterval(function () {
        updateTime(newTimeEl);
    }, 10000); // once every 10 sex

})();
