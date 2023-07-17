// ==UserScript==
// @name         Dark Galaxy - Battle report analyzer
// @namespace    https://darkgalaxy.com/
// @version      0.5
// @description  All your planet are belong to us
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/news.battlereport.user.js
// @match        https://*.darkgalaxy.com/news/view/*/
// @grant        none
// ==/UserScript==

(function () {
  const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, "")); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
  const formatNumber = (v) => String(parseFloat(v).toFixed(2)).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"); // same format as the rest of the values in ui
  const ships = {
    Fighter: { metal: 2000, mineral: 0, score: 0.3 },
    Bomber: { metal: 0, mineral: 4000, score: 0.99 },
    Frigate: { metal: 12000, mineral: 8000, score: 4.38 },
    Destroyer: { metal: 40000, mineral: 40000, score: 22.5 },
    Cruiser: { metal: 120000, mineral: 60000, score: 55.2 },
    Battleship: { metal: 600000, mineral: 400000, score: 378 },
    Outpost_Ship: { metal: 30000, mineral: 20000, score: 31.2 },
    Invasion_Ship: { metal: 30000, mineral: 20000, score: 31.2 },
    Freighter: { metal: 24000, mineral: 16000, score: 10.56 },
    Trader: { metal: 72000, mineral: 48000, score: 38.88 },
    Holo_Projector: { metal: 400, mineral: 200, score: 0.456 },
    Holo_Fighter: { metal: 100, mineral: 0, score: 0.075 },
    Holo_Bomber: { metal: 0, mineral: 200, score: 0.293 },
    Holo_Frigate: { metal: 600, mineral: 400, score: 1.505 },
    Holo_Destroyer: { metal: 2000, mineral: 2000, score: 9.375 },
    Holo_Cruiser: { metal: 6000, mineral: 3000, score: 25.7 },
    Holo_Battleship: { metal: 30000, mineral: 20000, score: 193.5 },
    Worker: { metal: 0, mineral: 0, score: 0.001 },
    Soldier: { metal: 30, mineral: 20, score: 0.003 },
    Metal: { metal: 1, mineral: 0, score: 0 },
    Mineral: { metal: 0, mineral: 1, score: 0 },
    Energy: { metal: 0, mineral: 0, score: 0 },
  };
  let lost = {
    owned: {
      metal: 0,
      mineral: 0,
      score: 0,
    },
    allied: {
      metal: 0,
      mineral: 0,
      score: 0,
    },
    hostile: {
      metal: 0,
      mineral: 0,
      score: 0,
    },
  };
  let brscore = {
    before: {
      owned: 0,
      allied: 0,
      hostile: 0,
    },
    after: {
      owned: 0,
      allied: 0,
      hostile: 0,
    },
  };

  document.querySelectorAll(".report .unit").forEach((el) => {
    const shipName = el.children[0].innerText.trim();
    const owned_before = parseValue(el.children[1].innerText);
    const owned_after = parseValue(el.children[2].innerText);
    const allied_before = parseValue(el.children[3].innerText);
    const allied_after = parseValue(el.children[4].innerText);
    const hostile_before = parseValue(el.children[5].innerText);
    const hostile_after = parseValue(el.children[6].innerText);
    if (shipName in ships) {
      brscore.before.owned += owned_before * ships[shipName].score;
      brscore.after.owned += owned_after * ships[shipName].score;
      brscore.before.allied += allied_before * ships[shipName].score;
      brscore.after.allied += allied_after * ships[shipName].score;
      brscore.before.hostile += hostile_before * ships[shipName].score;
      brscore.after.hostile += hostile_after * ships[shipName].score;

      /*
       * I'll use negtive number to emphasis the fact that these are lost resources
       */
      lost.owned.metal += (owned_after - owned_before) * ships[shipName].metal;
      lost.owned.mineral += (owned_after - owned_before) * ships[shipName].mineral;
      lost.owned.score += (owned_after - owned_before) * ships[shipName].score;
      lost.allied.metal += (allied_after - allied_before) * ships[shipName].metal;
      lost.allied.mineral += (allied_after - allied_before) * ships[shipName].mineral;
      lost.allied.score += (allied_after - allied_before) * ships[shipName].score;
      lost.hostile.metal += (hostile_after - hostile_before) * ships[shipName].metal;
      lost.hostile.mineral += (hostile_after - hostile_before) * ships[shipName].mineral;
      lost.hostile.score += (hostile_after - hostile_before) * ships[shipName].score;
    }
  });

  const container = document.querySelector(".invasionReport .report");
  if (container) {
    container.insertAdjacentHTML(
      "beforeend",
      `
        <tfooter>
            <tr class="unit">
                <td class="">Score</td>
                <td class="before">${formatNumber(brscore.before.owned)}</td>
                <td class="">${formatNumber(brscore.after.owned)}</td>
                <td class="before">${formatNumber(brscore.before.allied)}</td>
                <td class="">${formatNumber(brscore.after.allied)}</td>
                <td class="before">${formatNumber(brscore.before.hostile)}</td>
                <td class="">${formatNumber(brscore.after.hostile)}</td>
            </tr>
        </tfooter>
      `,
    );
    container.insertAdjacentHTML(
      "afterend",
      `
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
                        <td class="opacBackground text-left">Score</td>
                        <td class="opacLightBackground">${formatNumber(lost.owned.score)}</td>
                        <td class="opacLightBackground">${formatNumber(lost.allied.score)}</td>
                        <td class="opacLightBackground">${formatNumber(lost.hostile.score)}</td>
                    </tr>
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
                            ${formatNumber(
                              lost.owned.metal + lost.owned.mineral + lost.allied.metal + lost.allied.mineral,
                            )}
                        </td>
                        <td class="opacBackground">
                            ${formatNumber(lost.hostile.metal + lost.hostile.mineral)}
                        </td>
                    </tr>
                    <tr class="unit text-right">
                        <td class="opacBackground text-left">Total score lost</td>
                        <td class="opacBackground" colspan="2">
                            ${formatNumber(lost.owned.score + lost.allied.score)}
                        </td>
                        <td class="opacBackground">
                            ${formatNumber(lost.hostile.score)}
                        </td>
                    </tr>
                </tbody>
            </table>
        `,
    );
  }

  /**
   * Custom css
   */
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = `
        .text-center { text-align:center; }
        .text-right { text-align:right; }
        .text-left { text-align:left; }
    `;
  document.getElementsByTagName("head")[0].appendChild(style);
})();
