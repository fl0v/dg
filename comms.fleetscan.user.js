// ==UserScript==
// @name         Dark Galaxy - Fleetscan totals
// @namespace    https://darkgalaxy.com/
// @version      0.3
// @description  The enemy is at the gates!
// @author       Biggy
// @match        https://beta.darkgalaxy.com/news/view/*/
// @match        https://beta.darkgalaxy.com/planet/*/comms/
// @grant        none
// ==/UserScript==

(function() {

    const etaPattern = /Arriving\sin\s([\d]+)\sturns/;
    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui
    const shipsOrder = ['Fighter', 'Bomber', 'Frigate', 'Cruiser', 'Holo Projector', 'Invasion Ship', 'Freighter']; // what ar the other names ? :)
    let shipsInScan = []; // ships not added in here will not show up at all
    let forceOwned = false; // if this fleetscan includes owned fleets then we force owned column on each eta row

    let fleets = {
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

    const addFleet = (playerName, allianceId, allianceName, flName, flCount, allied, owned, eta) => {
        if (owned) {
            // GLOBAL OWNED
            fleets.owned.name = playerName;
            fleets.owned.fleet[flName] = fleets.owned.fleet[flName] || 0; // init ruller
            fleets.owned.fleet[flName] += flCount;
            fleets.owned.cnt += flCount;
            forceOwned = true;
        }

        // GLOBAL ALLIANCE
        fleets.alliances[allianceId] = fleets.alliances[allianceId] || {name:allianceName,allied:allied,fleet:{},cnt:0}; // init alliance
        fleets.alliances[allianceId].fleet[flName] = fleets.alliances[allianceId].fleet[flName] || 0; // init ship type
        fleets.alliances[allianceId].fleet[flName] += flCount;
        fleets.alliances[allianceId].cnt += flCount;

        // FOR EACH ETA
        fleets.eta[eta] = fleets.eta[eta] || { owned : {name:'',cnt:0,fleet:{}}, alliances: {}}; // init eta
        if (owned) {
            fleets.eta[eta].owned.name = playerName;
            fleets.eta[eta].owned.fleet[flName] = fleets.eta[eta].owned.fleet[flName] || 0; // init ruller
            fleets.eta[eta].owned.fleet[flName] += flCount;
            fleets.eta[eta].owned.cnt += flCount;
        }
        fleets.eta[eta].alliances[allianceId] = fleets.eta[eta].alliances[allianceId] || {name:allianceName,allied:allied,fleet:{},cnt:0}; // init eta alliance
        fleets.eta[eta].alliances[allianceId].fleet[flName] = fleets.eta[eta].alliances[allianceId].fleet[flName] || 0; // init ship type
        fleets.eta[eta].alliances[allianceId].fleet[flName] += flCount;
        fleets.eta[eta].alliances[allianceId].cnt += flCount;

        if (! shipsInScan.includes(flName)) {
            shipsInScan.push(flName);
        }
    }

    /**
     * Count those bombers
     */
    Array.from(document.querySelectorAll('.opacBackground .left.lightBorder')).forEach((el) => {
        const playerName = el.querySelector('.playerName').innerText;
        const alliance = el.querySelector('.allianceName');
        const allianceName = alliance.getAttribute('alliancename');
        const allianceId = alliance.getAttribute('allianceid');
        const owned = alliance.parentNode.classList.contains('friendly');
        const allied = owned || alliance.parentNode.classList.contains('allied');
        const etatext = alliance.parentNode.parentNode.innerText;
        const m = etatext.match(etaPattern);
        const eta = m ? m[1] : 0;
        Array.from(el.querySelectorAll('table tr')).forEach((el) => {
            const cells = el.querySelectorAll('td');
            const flName = cells[0].innerText;
            const flCount = parseValue(cells[1].innerText);
            addFleet(playerName, allianceId, allianceName, flName, flCount, allied, owned, eta);
        });
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
    const shipTemplate = (name, count) => '<tr class="opacBackground lightBorderBottom"><td class="padding">'+name+'</td><td class="padding" style="width:70px;text-align:right;">'+count+'</td></tr>';

    /**
     * Column block for one alliance or for owned fleets
     */
    const allianceTemplate = (status, name, fleet) => {
        let atpl = ''
            + '<div class="lightBorder column">'
                + '<div class="opacLightBackground ofHidden padding">'
                    + '<div class="'+status+'">'
                        + '<div class="allianceName">'+name+'</div>'
                    + '</div>'
                + '</div>'
        ;
        atpl += '<table><tbody>';

        // include ships that are in my predefined order and exists in the global fleet scan (shipsInScan)
        atpl += shipsOrder.reduce((carry, name) => {
            if (shipsInScan.includes(name)) {
                return carry + shipTemplate(name, fleet[name] || '');
            } else {
                return carry;
            }
        },'');

        // show other ships that i didn't include in my predefined shipsOrder but are included in this alliance fleetscan
        atpl += Object.entries(fleet).reduce((carry, a) => {
            return ! shipsOrder.includes(a[0])
                ? carry + shipTemplate(a[0],a[1])
                : carry;
        },'');

        atpl += '</tbody></table>';
        atpl += '</div>'; // left
        return atpl;
    }

    /**
     * A big row for all fleets arriving at the same time or for totals
     */
    const scanRowTemplate = (title, rowFleets) => {
        let scanRowTpl = '';
        scanRowTpl += '<div class="header border">'+title+'</div>';
        scanRowTpl += '<div class="d-flex">';
        if (rowFleets.owned.cnt > 0) {
            scanRowTpl += allianceTemplate('friendly',rowFleets.owned.name,rowFleets.owned.fleet);
        } else if (forceOwned) {
            scanRowTpl += '<div class="column"></div>'; // just spacer to keep the column for owned fleets
        }
        allianceOrder.forEach((id) => {
            let a = rowFleets.alliances[id];
            scanRowTpl += a ? allianceTemplate(a.allied ? 'allied' : 'hostile',a.name,a.fleet) : '<div class="column"></div>'; // if an alliance dose not have fleets at current eta then we put in a spacer
        });
        scanRowTpl += '</div>';
        return scanRowTpl;
    };

    let template = '<div class="lightBorder ofHidden opacDarkBackground fleetscanTotals">';
    template += scanRowTemplate('Fleet Scan Total',fleets);
    Object.entries(fleets.eta).forEach((a) => { // do i nead to sort etas first ? dont think so. i think they are always in incremental order in fleetscan
        const title = a[0] == 0 ? 'Fleets on orbit' : 'ETA '+a[0];
        template += scanRowTemplate(title,a[1]);
    });
    template += '</div>';

    document.querySelector('#planetHeader').insertAdjacentHTML('afterend',template);

    /**
     * Custom css
     */
    const style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = ''
            + ' .fleetscanTotals .column { margin:3px; flex-grow:1; max-width:200px; }'
            + ' .fleetscanTotals table { border-collapse: collapse; width: 100%; }'
            + ' .fleetscanTotals .allianceName { display:block; text-align:center; }'
            + ' .d-flex { display:flex; white-space: nowrap; flex-wrap:wrap; }'
    ;
    document.getElementsByTagName('head')[0].appendChild(style);



})();
