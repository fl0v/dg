// ==UserScript==
// @name         Dark Galaxy - Battle report analyzer
// @namespace    https://darkgalaxy.com/
// @version      0.1
// @description  All your planet are belong to us
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/news.battlereport.user.js
// @match        https://beta.darkgalaxy.com/news/view/*/
// @grant        none
// ==/UserScript==

(function () {

    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui
    const ships = {
        Fighter: { metal: 2000, mineral: 0 },
        Bomber: { metal: 0, mineral: 4000 },
        Frigate: { metal: 12000, mineral: 8000 },
        Destroyer: { metal: 40000, mineral: 40000 },
        Cruiser: { metal: 120000, mineral: 60000 },
        Battleship: { metal: 600000, mineral: 400000 },
        Outpost_Ship: { metal: 30000, mineral: 20000 },
        Invasion_Ship: { metal: 30000, mineral: 20000 },
        Freighter: { metal: 24000, mineral: 16000 },
        Trader: { metal: 72000, mineral: 48000 },
        Holo_Projector: { metal: 400, mineral: 200 },
        Holo_Fighter: { metal: 100, mineral: 0 },
        Holo_Bomber: { metal: 0, mineral: 200 },
        Holo_Frigate: { metal: 600, mineral: 400 },
        Holo_Destroyer: { metal: 2000, mineral: 2000 },
        Holo_Cruiser: { metal: 6000, mineral: 3000 },
        Holo_Battleship: { metal: 30000, mineral: 20000 },
        Soldier: { metal: 30, mineral: 20 },
        Metal: { metal: 1, mineral: 0 },
        Mineral: { metal: 0, mineral: 1 },
    };
    let lost = {
        owned: {
            metal: 0,
            mineral: 0,
        },
        allied: {
            metal: 0,
            mineral: 0,
        },
        hostile: {
            metal: 0,
            mineral: 0,
        }
    };

    document.querySelectorAll('.report .unit').forEach((el)  => {
        const shipName = el.children[0].innerText.trim();
        const owned_before = parseValue(el.children[1].innerText);
        const owned_after = parseValue(el.children[2].innerText);
        const allied_before = parseValue(el.children[3].innerText);
        const allied_after = parseValue(el.children[4].innerText);
        const hostile_before = parseValue(el.children[5].innerText);
        const hostile_after = parseValue(el.children[6].innerText);
        if (shipName in ships) {
            /*
             * I'll use negtive number to emphasis the fact that these are lost resources
             */
            lost.owned.metal += (owned_after - owned_before) * ships[shipName].metal;
            lost.owned.mineral += (owned_after - owned_before) * ships[shipName].mineral;
            lost.allied.metal += (allied_after - allied_before) * ships[shipName].metal;
            lost.allied.mineral += (allied_after - allied_before) * ships[shipName].mineral;
            lost.hostile.metal += (hostile_after - hostile_before) * ships[shipName].metal;
            lost.hostile.mineral += (hostile_after - hostile_before) * ships[shipName].mineral;
        }
    });


    const container = document.querySelector('.invasionReport .report');
    if (container) {
        container.insertAdjacentHTML('afterend',`
            <table class="report">
                <thead>
                    <tr class="top">
                        <td class="first">Resources Lost</td>
                        <td class="friendlyBack">Yours</td>
                        <td class="alliedBack">Allied</td>
                        <td class="hostileBack">Hostile</td>
                    </tr>
                </thead>
                <tbody>
                    <tr class="unit text-right">
                        <td class="opacBackground text-left">Metal</td>
                        <td class="opacLightBackground">${formatNumber(lost.owned.metal)}</td>
                        <td class="opacLightBackground">${formatNumber(lost.allied.metal)}</td>
                        <td class="opacLightBackground">${formatNumber(lost.hostile.metal)}</td>
                    </tr>
                    <tr class="unit text-right">
                        <td class="opacBackground text-left">Mineral</td>
                        <td class="opacLightBackground">${formatNumber(lost.owned.mineral)}</td>
                        <td class="opacLightBackground">${formatNumber(lost.allied.mineral)}</td>
                        <td class="opacLightBackground">${formatNumber(lost.hostile.mineral)}</td>
                    </tr>
                    <tr class="unit text-right">
                        <td class="opacBackground text-left">Total (Yours + Allied)</td>
                        <td class="opacBackground" colspan="2">
                            ${formatNumber(lost.owned.metal + lost.owned.mineral + lost.allied.metal + lost.allied.mineral)}
                        </td>
                        <td class="opacBackground">
                            ${formatNumber(lost.hostile.metal + lost.hostile.mineral)}
                        </td>
                    </tr>
                </tbody>
            </table>
        `);
    }

    /**
       * Custom css
       */
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .text-center { text-align:center; }
        .text-right { text-align:right; }
        .text-left { text-align:left; }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);



})();