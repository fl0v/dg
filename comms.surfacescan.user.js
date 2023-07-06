// ==UserScript==
// @name         Dark Galaxy - Surface scan
// @namespace    https://darkgalaxy.com/
// @version      0.2
// @description  All your planet are belong to us
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/comms.surfacescan.user.js
// @match        https://beta.darkgalaxy.com/news/view/*/
// @match        https://beta.darkgalaxy.com/planet/*/comms/
// @match        https://andromeda.darkgalaxy.com/news/view/*/
// @match        https://andromeda.darkgalaxy.com/planet/*/comms/
// @grant        none
// ==/UserScript==

(function () {

    const popPattern = /^([\d,]+)\s+\(([\+\d,]+)\soccupied\)/; // will split population data ex: '52,126 (5,000 occupied)'
    const solPattern = /^([\d,]+)/; // will parse soldiers data ex: '52,126'
    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui
    const requiredSoldiers = (workers, soldiers) => Math.ceil((workers / 10) + (soldiers * 1.5) + 1);
    const addTotalWorkers = (el, total) => el.insertAdjacentHTML('beforeend', '<span class="neutral total">(<span class="custom-accent">' + formatNumber(total) + '</span> total)</span>');
    const addInvasionInfo = (container, info) => {
        container.querySelector('.planetHeadSection').insertAdjacentHTML('afterend', `
            <div class="planetHeadSection">
                <div class="lightBorder opacBackground ofHidden padding">
                    <div class="right neutral">
                        <span class="required-soldier neutral">Soldiers required now: <b class="custom-accent">${formatNumber(info.soldiersRequired)}</b></span>
                        <span class="housing neutral">(Max housing: <b class="custom-accent">${formatNumber(info.housing)}</b>)</span>
                    </div>
                </div>
            </div>
        `);
    }
    const housing = [
        {
            name: 'HB',
            pattern: /([\d,]+)x\sHabitat/,
            housing: 75000,
        },
        {
            name: 'LQ',
            pattern: /([\d,]+)x\sLiving/,
            housing: 50000,
        },
        {
            name: 'OP',
            pattern: /([\d,]+)x\sOutpost/,
            housing: 50000,
        },
        {
            name: 'COL',
            pattern: /([\d,]+)x\sColony/,
            housing: 100000,
        },
        {
            name: 'METRO',
            pattern: /([\d,]+)x\sMetropolis/,
            housing: 200000,
        },
    ];
    const important = [
        /Hyperspace_Beacon/,
        /Jump_Gate/,
        /Comms_Satellite/,
        /([\d,]+)x\sArmy_Barracks/,
    ];

    let planetInfo = {
        workersTotal: 0,
        workersIddle: 0,
        workersOccupied: 0,
        soldiers: 0,
        soldiersRequired: 0,
        housing: 0,
        summary: [], // ['JG', 'HB', '2xAB', 'COMMS']
    };

    // last #planetHeader in page (works on scan page and news page)
    const container = Array.from(document.querySelectorAll('#planetHeader')).pop();
    const header = container ? container.parentNode.querySelector('.header') : null; // scan result header

    if (container && header) {
        container.querySelectorAll('.resource img').forEach((el) => {
            const resText = el.closest('.resource').innerText;
            const resType = el.getAttribute('title');
            if (resType == 'Workers' && popPattern.test(resText)) {
                const [, iddle, occupied] = resText.match(popPattern);
                planetInfo.workersIddle = parseValue(iddle);
                planetInfo.workersOccupied = parseValue(occupied);
                planetInfo.workersTotal = planetInfo.workersIddle + planetInfo.workersOccupied;
                addTotalWorkers(el.closest('.resource'), planetInfo.workersTotal);
            } else if (resType == 'Soldiers' && solPattern.test(resText)) {
                const [, soldiers] = resText.match(solPattern);
                planetInfo.soldiers = parseValue(soldiers);
            }
        });
        planetInfo.soldiersRequired = requiredSoldiers(planetInfo.workersTotal,planetInfo.soldiers);

        /**
         * Identify houseing capacity and JG, HB, AB
         */
        planetInfo.summary = Array.from(container.parentNode.querySelectorAll('.entry')).reduce((carry, el) => {
            const txt = el.innerText;
            const matched = important.reduce((matched, pattern) => {
                if (! matched && pattern.test(txt)) {
                    matched = true;
                }
                return matched;
            },false);
            if (matched) {
                carry.push(txt);
            }

            housing.reduce((m, b) => {
                if (!m && b.pattern.test(txt)) {
                    m = true;
                    const [,cnt] = txt.match(b.pattern);
                    planetInfo.housing += (cnt * b.housing);
                }
                return m;
            }, false);

            return carry;
        },[]);

        /**
         * Add info only if we have parsed workers or soldiers, otherwise is anot a surface scan
         */
        if (planetInfo.workersTotal > 0 || planetInfo.soldiers > 0) {
            addInvasionInfo(container, planetInfo);
            header.insertAdjacentHTML('beforeend',`
                <div class="right scan-summary">
                    Importat: <b>${planetInfo.summary.join(', ')}</b>
                </div>
            `);
        }
    }

    /**
     * Custom css
     */
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .scan-summary { font-family: Tahoma, sans-serif; font-size:12px; text-shadow:none; text-align:right; padding-right:5px; }
        .custom-accent { color:#fff; }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);

})();