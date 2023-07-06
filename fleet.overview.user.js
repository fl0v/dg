// ==UserScript==
// @name         Dark Galaxy - Fleet overview
// @namespace    https://darkgalaxy.com/
// @version      0.3
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/fleet.overview.user.js
// @match        https://beta.darkgalaxy.com/fleets/*/
// @match        https://andromeda.darkgalaxy.com/fleets/*/
// @grant        none
// ==/UserScript==

(function () {
    const shipPattern = /([\d,]+)x\s(.*)/; // 6,123x Fighter
    const parseValue = (v) => parseInt(String(v).replace(/[,]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui
    const realShips = ['Fighter', 'Bomber', 'Frigate', 'Destroyer', 'Cruiser', 'Battleship'];

    /**
     * @see https://manual.darkgalaxy.com/reference/list-of-colonists
     * @see https://manual.darkgalaxy.com/reference/list-of-ships
     */
    const score = {
        'Fighter': 0.3,
        'Bomber': 0.99,
        'Frigate': 4.38,
        'Destroyer': 22.5,
        'Cruiser': 55.2,
        'Battleship': 378,
        'Outpost Ship': 31.2,
        'Invasion Ship': 31.2,
        'Trader': 38.88,
        'Freighter': 10.56,
        'Holo Projector': 0.456,
        'Holo Fighter': 0.075,
        'Holo Bomber': 0.293,
        'Holo Frigate': 1.505,
        'Holo Destroyer': 9.375,
        'Holo Cruiser': 25.7,
        'Holo Battleship': 193.5,
        'Soldier': 0.003,
        'Worker': 0.001,
    };

    const scoreTemplate = (unitScore,label) => `<span class="score neutral right">(<em>${formatNumber(unitScore.toFixed(2))}</em> ${label})</span>`


    const [totalScore, wfScore] = Array.from(document.querySelectorAll('#contentBox .fleetRight .entry'))
        .reduce((carry, item) => {
            console.log('item',item.innerText);
            if (shipPattern.test(item.innerText)) {
                const [,cnt,name] = item.innerText.match(shipPattern);
                const ss = parseValue(cnt) * (score[name] ? score[name] : 0);
                console.log('cnt',cnt,'name',name,ss);
                carry[0] += ss;
                if (realShips.includes(name)) {
                    carry[1] += ss;
                }
                item.querySelector('div:last-child').insertAdjacentHTML('beforeend',scoreTemplate(ss,'score'));
            }
            return carry;
    },[0,0]);
    document.querySelector('#contentBox .fleetRight .header')
        .insertAdjacentHTML('beforeend', scoreTemplate(totalScore, 'total') + ' ' + scoreTemplate(wfScore, 'wf'));

    /**
     * Custom css
     */
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .score { font-family: Tahoma, sans-serif; font-size:12px; }
        .score em { color:#fff; }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);

})();
