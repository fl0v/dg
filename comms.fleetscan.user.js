// ==UserScript==
// @name         Dark Galaxy - Fleetscan totals
// @namespace    https://darkgalaxy.com/
// @version      0.1
// @description  The enemy is at the gates!
// @author       Biggy
// @match        https://beta.darkgalaxy.com/news/view/*/
// @match        https://beta.darkgalaxy.com/planet/*/comms/
// @grant        none
// ==/UserScript==

(function() {

    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui
    const shipsOrder = ['Fighter', 'Bomber', 'Frigate', 'Invasion Ship', 'Freighter']; // what ar the other names ? :)

    let fleets = {
        owned: {
            name: '',
            fleet: {}
        },
        alliances: {
            // allianceid: { name:'',allied:1,fleet:{....}}
        },
    }
    const addFleet = (playerName, allianceId, allianceName, flName, flCount, allied, owned) => {
        if (owned) {
            fleets.owned.name = playerName;
            fleets.owned.fleet[flName] = fleets.owned.fleet[flName] || 0; // init ruller
            fleets.owned.fleet[flName] += flCount;
        }
        fleets.alliances[allianceId] = fleets.alliances[allianceId] || {name:allianceName,allied:allied,fleet:{}}; // init alliance
        fleets.alliances[allianceId].fleet[flName] = fleets.alliances[allianceId].fleet[flName] || 0; // init ship type
        fleets.alliances[allianceId].fleet[flName] += flCount;
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

        Array.from(el.querySelectorAll('table tr')).forEach((el) => {
            const cells = el.querySelectorAll('td');
            const flName = cells[0].innerText;
            const flCount = parseValue(cells[1].innerText);
            addFleet(playerName, allianceId, allianceName, flName, flCount, allied, owned);
        });
    });


    /**
     * Show the fireworks
     */
    const shipTemplate = (name, count) => '<tr class="opacBackground lightBorderBottom"><td class="padding">'+name+'</td><td class="padding" style="width:70px;text-align:right;">'+count+'</td></tr>';
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

        atpl += shipsOrder.reduce((carry, name) => {
            return carry + shipTemplate(name, fleet[name] || '');
        },'');
        atpl += Object.entries(fleet).reduce((carry, a) => {
            if (shipsOrder.includes(a[0])) {
                return carry;
            } else {
                return carry + shipTemplate(a[0],a[1]);
            }
        },'');

        atpl += '</tbody></table>';
        atpl += '</div>'; // left
        return atpl;
    }

    let template = ''
        + '<div class="lightBorder ofHidden opacDarkBackground fleetscanTotals">'
            +'<div class="header border">Fleet Scan Totals</div>'
            + '<div class="d-flex">'
            + allianceTemplate('friendly',fleets.owned.name,fleets.owned.fleet);
    Object.entries(fleets.alliances).forEach((a) => {
        if (a[1].allied) {
            template += allianceTemplate(a[1].allied ? 'allied' : 'hostile',a[1].name,a[1].fleet);
        }
    });
    Object.entries(fleets.alliances).forEach((a) => {
        if (! a[1].allied) {
            template += allianceTemplate(a[1].allied ? 'allied' : 'hostile',a[1].name,a[1].fleet);
        }
    });
    template += '</div></div>';

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
