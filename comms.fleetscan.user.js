// ==UserScript==
// @name         Dark Galaxy - Fleet scan
// @namespace    https://darkgalaxy.com/
// @version      0.6
// @description  The enemy is at the gates!
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/comms.fleetscan.user.js
// @match        https://*.darkgalaxy.com/news/view/*/
// @match        https://*.darkgalaxy.com/planet/*/comms/
// @grant        none
// ==/UserScript==

(function() {

    /*
     * @todo simulate combat action
     */

    const etaPattern = /Arriving\sin\s([\d]+)\sturn/;
    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumberInt = (v) => String(Math.round(v)).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui
    const shipsOrder = ['Fighter', 'Bomber', 'Frigate', 'Destroyer', 'Cruiser', 'Battleship', 'Trader', 'Freighter', 'Invasion Ship'];
    const shipScore = { // from https://manual.darkgalaxy.com/reference/list-of-ships
        'Fighter': 0.3,
        'Bomber': 0.99,
        'Frigate': 4.38,
        'Destroyer': 22.5,
        'Cruiser': 55.2,
        'Battleship': 378,
        'Trader': 38.88,
        'Freighter': 10.56,
        'Invasion Ship': 31.2,
        'Outpost Ship': 31.2
    };
    let shipsInScan = []; // ships not added in here will not show up at all
    let forceOwned = false; // if this fleetscan includes owned fleets then we force owned column on each eta row

    let fleets = {
        have: false,
        // globals
        owned: {
            name: '',
            fleet: {},
            cnt: 0
        },
        alliances: {
            // allianceid: { name:'',allied:1,fleet:{....},cnt:0}
        },
        // each eta has its own separate record
        eta: {
            /*
            0: {
                owned: {
                    name: '',
                    fleet: {},
                    cnt: 0
                },
                alliances: {
                    allianceid: { name:'',allied:1,fleet:{....},cnt:0}
                },
             },
            */
        }
    }

    const addFleet = (playerName, allianceId, allianceName, shName, flCount, allied, owned, eta) => {
        fleets.have = true;
        if (owned) {
            // GLOBAL OWNED
            fleets.owned.name = playerName;
            fleets.owned.fleet[shName] = fleets.owned.fleet[shName] || 0; // init ruller
            fleets.owned.fleet[shName] += flCount;
            fleets.owned.cnt += flCount;
            forceOwned = true;
        }

        // GLOBAL ALLIANCE
        fleets.alliances[allianceId] = fleets.alliances[allianceId] || {name:allianceName,allied:allied,fleet:{},cnt:0}; // init alliance
        fleets.alliances[allianceId].fleet[shName] = fleets.alliances[allianceId].fleet[shName] || 0; // init ship type
        fleets.alliances[allianceId].fleet[shName] += flCount;
        fleets.alliances[allianceId].cnt += flCount;

        // FOR EACH ETA
        fleets.eta[eta] = fleets.eta[eta] || { owned : {name:'',cnt:0,fleet:{}}, alliances: {}}; // init eta
        if (owned) {
            fleets.eta[eta].owned.name = playerName;
            fleets.eta[eta].owned.fleet[shName] = fleets.eta[eta].owned.fleet[shName] || 0; // init ruller
            fleets.eta[eta].owned.fleet[shName] += flCount;
            fleets.eta[eta].owned.cnt += flCount;
        }
        fleets.eta[eta].alliances[allianceId] = fleets.eta[eta].alliances[allianceId] || {name:allianceName,allied:allied,fleet:{},cnt:0}; // init eta alliance
        fleets.eta[eta].alliances[allianceId].fleet[shName] = fleets.eta[eta].alliances[allianceId].fleet[shName] || 0; // init ship type
        fleets.eta[eta].alliances[allianceId].fleet[shName] += flCount;
        fleets.eta[eta].alliances[allianceId].cnt += flCount;

        if (! shipsInScan.includes(shName)) {
            shipsInScan.push(shName);
        }
    }

    /**
     * Count those bombers
     */
    Array.from(document.querySelectorAll('.opacBackground .left.lightBorder')).forEach((el) => {
        // each fleet
        const playerName = el.querySelector('.playerName').innerText;
        const alliance = el.querySelector('.allianceName');
        const allianceName = alliance.getAttribute('alliancename');
        const allianceId = alliance.getAttribute('allianceid');
        const fleetEl = alliance.closest('.opacLightBackground').querySelector('div > div.left');
        const fleetName = fleetEl.innerText;
        const owned = alliance.parentNode.classList.contains('friendly');
        const allied = owned || alliance.parentNode.classList.contains('allied');
        const etatext = alliance.parentNode.parentNode.innerText;
        const m = etatext.match(etaPattern);
        const eta = m ? m[1] : 0;
        let score = 0;
        Array.from(el.querySelectorAll('table tr')).forEach((el) => {
            // each ship
            const cells = el.querySelectorAll('td');
            const shName = cells[0].innerText;
            const shCount = parseValue(cells[1].innerText);
            addFleet(playerName, allianceId, allianceName, shName, shCount, allied, owned, eta);
            score += (shipScore[shName] || 0) * shCount;
        });
        fleetEl.insertAdjacentHTML('beforeend', `
            <span class="score-container neutral">
                (score <b>${score.toFixed(2)}</b>)
            </span>
        `);
    });

    /**
     * Build alliance order from the totals row so we reuse the same order for each eta (each alliance will keep its column)
     */
    let allianceOrder = [];
    Object.entries(fleets.alliances).forEach((a) => {
        if (a[1].allied && ! allianceOrder.includes(a[0])) {
            allianceOrder.push(a[0]);
        }
    });
    Object.entries(fleets.alliances).forEach((a) => {
        if (! a[1].allied && ! allianceOrder.includes(a[0])) {
            allianceOrder.push(a[0]);
        }
    });
    // to lazy to think of an cleaner way to build this order... there must be one...

    /**
     * Show the fireworks
     */
    const shipTemplate = (name, count) => `
        <tr class="opacBackground lightBorderBottom">
            <td class="padding">${name}</td>
            <td class="padding" style="width:70px;text-align:right;">${count}</td>
        </tr>
    `;

    /**
     * Column block for one alliance or for owned fleets
     */
    const allianceTemplate = (status, name, fleet) => {
        const tplHeader = `
            <div class="opacLightBackground ofHidden padding">
                <div class="${status}">
                    <div class="allianceName">${name}</div>
                </div>
            </div>
        `;


        // include ships that are in my predefined order and exists in the global fleet scan (shipsInScan)
        tplBody = shipsOrder.reduce((carry, name) => {
            if (shipsInScan.includes(name)) {
                return carry + shipTemplate(name, fleet[name] || '');
            } else {
                return carry;
            }
        },'');


        /*
         * show other ships that i didn't include in my predefined shipsOrder but are included in this alliance fleetscan
         * also add the scores
         */
        let score = 0;
        tplBody += Object.entries(fleet).reduce((carry, a) => {
            score += (shipScore[a[0]] || 0) * a[1];
            return ! shipsOrder.includes(a[0])
                ? carry + shipTemplate(a[0],a[1])
                : carry;
        },'');
        return `
            <div class="lightBorder column">
                ${tplHeader}
                <table><tbody>
                    ${tplBody}
                </tbody></table>
                <div class="score-container neutral opacLightBackground">(score <b>${score.toFixed(2)}</b>)</div>
            </div>
        `;
    }

    /**
     * A big row for all fleets arriving at the same time or for totals
     */
    const scanRowTemplate = (title, rowFleets) => {
        let tplRow = '';
        if (rowFleets.owned.cnt > 0) {
            tplRow += allianceTemplate('friendly',rowFleets.owned.name,rowFleets.owned.fleet);
        } else if (forceOwned) {
            tplRow += '<div class="column"></div>'; // just spacer to keep the column for owned fleets
        }
        allianceOrder.forEach((id) => {
            let a = rowFleets.alliances[id];
            tplRow += a
                ? allianceTemplate(a.allied ? 'allied' : 'hostile',a.name,a.fleet)
                : '<div class="column"></div>' // if an alliance dose not have fleets at current eta then we put in a spacer
            ;
        });
        return `
            <div class="header border">${title}</div>
            <div class="d-flex">
                ${tplRow}
            </div>
        `;
    };

    if (fleets.have) {
        /*
         * do i nead to sort etas first ? dont think so.
         * i think all fleets are always in cronological order in fleetscan
         */
        const tplEta = Object.entries(fleets.eta).reduce((carry, a) => {
            const title = a[0] == 0 ? 'Fleets on orbit' : 'ETA '+a[0];
            return carry += scanRowTemplate(title,a[1]);
        },'');
        document.querySelector('#planetHeader').insertAdjacentHTML('afterend',`
            <div class="lightBorder ofHidden opacDarkBackground fleetscanTotals">
                ${scanRowTemplate('Fleet Scan Total', fleets)}
                ${tplEta}
            </div>
        `);
    }

    /**
     * Custom css
     */
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .fleetscanTotals .column { margin:3px; flex-grow:1; max-width:200px; }
        .fleetscanTotals table { border-collapse: collapse; width: 100%; }
        .fleetscanTotals .allianceName { display:block; text-align:center; }
        .d-flex { display:flex; white-space: nowrap; flex-wrap:wrap; }
        .score-container { font-size:10px; text-align:center; }
        .score-container b { color:#fff; }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);

})();
