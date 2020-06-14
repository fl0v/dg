// ==UserScript==
// @name         Dark Galaxy - Planets stats
// @namespace    https://darkgalaxy.com/
// @version      0.6
// @description  All your planet are belong to us
// @author       Biggy
// @source       https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/planets.stats.user.js
// @match        https://*.darkgalaxy.com/planets/
// @grant        none
// ==/UserScript==

(function () {

    const resPattern = /([\d,]+)\s+\(([\+\d,]+)\)\s+([\d%]+)/; // will split resource data ex: '52,126 (+3,465) 70%'
    const popPattern = /([\d,]+)\s+\(([\+\d,]+)\soccupied\)/; // will split population  data ex: '52,126 (5,000 occupied)'
    const othPattern = /([\d,]+)/; // simple value for other resources
    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui

    /**
     * Will agregate the numbers (stored, production and percentage) for a resource selector
     */
    const resTotal = function (xpath) {
        let total = {
            stored: 0, // res or pop (including occupied)
            production: 0,
            perc: 0,
            avg: 0, // used for avg pop
            count: 0
        };
        total = Array.from(document.querySelectorAll(xpath))
            .reduce(function (carry, el) {
                var val = el.innerText;
                var stored, production, perc;
                if (resPattern.test(val)) {
                    [, stored, production, perc] = val.match(resPattern);
                } else if (popPattern.test(val)) {
                    let [, iddle, occupied] = val.match(popPattern);
                    stored = parseValue(iddle) + parseValue(occupied);
                } else if (othPattern.test(val)) {
                    [, stored] = val.match(othPattern);
                }
                return {
                    stored: carry.stored + parseValue(stored),
                    production: carry.production + parseValue(production),
                    perc: carry.perc + parseValue(perc),
                    count: carry.count + 1
                }
            }, total);
        if (total.count > 0) {
            total.perc = (total.perc / total.count).toFixed(2);
            total.avg = (total.stored / total.count).toFixed(2);
        }
        return total;
    };

    const formatResource = (total, code) => {
        if (code == 'worker') {
            return formatNumber(total.stored) + ' / AVG: ' + formatNumber(total.avg);
        } else if (code == 'soldier' || code == 'ground' || code == 'orbit') {
            return formatNumber(total.stored);
        } else { // resource
            return formatNumber(total.stored) + ' (+' + formatNumber(total.production) + ') AVG: ' + formatNumber(total.perc) + '%';
        }
    };

    const resourceTemplate = (total, code) => {
        return '<div class="left seperatorRight">'
            + '<img src="/images/units/small/' + code + '.gif" title="' + code + '">'
            + '</div>'
            + '<span>' + formatResource(total, code) + '</span>'
            ;
    };

    const metal = resTotal('.resource.metal');
    const mineral = resTotal('.resource.mineral');
    const energy = resTotal('.resource.energy');
    const pop = resTotal('.resource.population');
    const sold = resTotal('.resource.soldier');
    const ground = resTotal('.resource.ground');
    const orbit = resTotal('.resource.orbit');
    //const food = resTotal('.resource.food'); // i miss food :((

    /**
     * Lets build a summary of all activity
     */
    const activitySelector = '#planetList .planetHeadSection .left.resource a';
    const buildPattern = /\/planet\/([\d]+)\/$/;
    const prodPattern = /\/planet\/([\d]+)\/production\/$/;
    const trainPattern = /\/planet\/([\d]+)\/training\/$/;
    const buildMsgPattern = /Building:\s(.*)\s\(([\d]+)/;
    const notBuildMsgPattern = /Building:\sNone/gi;
    const prodMsgPattern = /Ship\sYard:\s([\d,]+)x\s(.*)\s\(([\d]+)/;
    const trainMsgPattern = /Barracks:\s([\d,]+)x\s(.*)\s\(([\d]+)/;
    let activity = {
        building: {},
        training: {},
        producing: {}
    };
    let planets = {
        notBuilding: [],
        notProducing: [],
        notTraining: []
    };

    Array.from(document.querySelectorAll(activitySelector)).forEach((el) => {
        const msg = el.parentNode.innerText;

        // Training first
        if (trainPattern.test(el.href) && trainMsgPattern.test(msg)) {
            const [, cnt, unit, ttf] = msg.match(trainMsgPattern);
            activity.training[unit] = (activity.training[unit] || 0) + parseValue(cnt);

            // SY Production
        } else if (prodPattern.test(el.href) && prodMsgPattern.test(msg)) {
            const [, cnt, unit, ttf] = msg.match(prodMsgPattern);
            activity.producing[unit] = (activity.producing[unit] || 0) + parseValue(cnt);

            // Buildings
        } else if (buildPattern.test(el.href) && buildMsgPattern.test(msg)) {
            const [, unit, ttf] = msg.match(buildMsgPattern);
            activity.building[unit] = activity.building[unit] || 0;
            activity.building[unit]++;
        } else if (buildPattern.test(el.href) && notBuildMsgPattern.test(msg)) {
            const planet = el.closest('.locationWrapper');
            const coords = planet.querySelector('.coords').innerText;
            const name = planet.querySelector('.planetName').innerText;
            planets.notBuilding.push({coords: coords, name: name});
        }
    });

    /**
     * Produce summary with html if cls is provided, otherwise simple text for copy paste
     */
    const activitySummary = (label, collection, cls) => {
        let msgs = Object.entries(collection).reduce((carry, a) => {
            carry.push(cls ? '<span class="activity-item"><b>' + a[1] + '</b>x ' + a[0] + '</span>' : a[1] + 'x ' + a[0]);
            return carry;
        }, []);
        if (msgs.length) {
            return cls ? '<div class="' + cls + '">' + label + ' ' + msgs.join(', ') + '</div>' : label + ' ' + msgs.join(', ');
        }
        return '';
    };

    const planetsList = (label, planets, cls) => {
        let msgs = planets.reduce((carry, a) => {
            console.log('planet',a);
            carry.push(cls ? '<span class="planet-item">(<b>' + a.coords + '</b>) ' + a.name + '</span>' : '('+a.coords + ') ' + a.name);
            return carry;
        }, []);
        if (msgs.length) {
            return cls ? '<div class="' + cls + '">' + label + ' ' + msgs.join(', ') + '</div>' : label + ' ' + msgs.join(', ');
        }
        return '';
    };

    /**
     * add a nice top panel for the planet list
     */
    document.querySelector('#planetList').insertAdjacentHTML('afterbegin',
        '<div class="opacDarkBackground lightBorder ofHidden seperator planetStats">'
        + '<span class="right copy-hint">Click to copy to clipboard</span>'
        + '<div class="header border">Total resources (' + metal.count + ' planets)</div>'
        + '<div class="d-flex d-flex-jcsb">'
        + '<div class="resource-container">'
        + '<div class="resource metal">' + resourceTemplate(metal, 'metal') + '</div>'
        + '<div class="resource mineral">' + resourceTemplate(mineral, 'mineral') + '</div>'
        + '<div class="resource energy">' + resourceTemplate(energy, 'energy') + '</div>'
        + '</div>'
        + '<div class="activity-container d-flex-grow">'
        + '<div class="d-flex d-flex-jce">'
        + '<div class="resource population">' + resourceTemplate(pop, 'worker') + '</div>'
        + '<div class="resource solider">' + resourceTemplate(sold, 'soldier') + '</div>'
        + '<div class="resource ground">' + resourceTemplate(ground, 'ground') + '</div>'
        + '<div class="resource orbit">' + resourceTemplate(orbit, 'orbit') + '</div>'
        + '</div>'
        + '<div class="activity">'
        + activitySummary('Producing:', activity.producing, 'activity-producing')
        + activitySummary(', Training:', activity.training, 'activity-training')
        + activitySummary('Building:', activity.building, 'activity-building')
        + planetsList('Planets not building anything:', planets.notBuilding, 'planets-not-building')
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
    );

    /**
     * Custom css
     */
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = ''
        + ' .planetStats .copy-hint { padding:5px; line-height:20px;}'
        + ' .planetStats .resource-container {  }'
        + ' .planetStats .activity-container { max-width:700px; }'
        + ' .planetStats .resource { height:auto; width:auto; }'
        + ' .planetStats .activity-item { white-space:nowrap; }'
        + ' .planetStats .activity-producing, .planetStats .activity-training { display:inline-block; }'
        + ' .planetStats .activity { text-align:right; padding-right:5px; font-size:12px; line-height:18px; font-weight:normal; }'
        + ' .planetStats .planets-not-building .planet-item { color:#eb8c34; font-size:14px; }'
        + ' .d-flex { display:flex; }'
        + ' .d-flex-grow { flex-grow:1; }'
        + ' .d-flex-wrap { flex-wrap:wrap; }'
        + ' .d-flex-jce { justify-content: flex-end; }'
        + ' .d-flex-jcsb { justify-content: space-between; }'
        + ' .d-flex-column { flex-direction: column; }'
        ;
    document.getElementsByTagName('head')[0].appendChild(style);


    /**
     * copy/paste
     */
    const copy = document.querySelector('.planetStats .copy-hint');
    copy.style.cursor = 'pointer';
    copy.addEventListener('click', e => {
        e.preventDefault();
        navigator.permissions.query({ name: "clipboard-write" }).then(r => {
            if (["granted", "prompt"].includes(r.state)) {
                navigator.clipboard.writeText(textStats());
            }
        });
    });
    const txtBorder = '====================';
    const txtSpacer = '--------------------';
    const pe = (s, c) => String(s).padEnd(c, ' ');
    const ps = (s, c) => String(s).padStart(c, ' ');
    const textStats = function () {
        const pl = 11; // pad label 11 spaces at the end
        const pv = 7;  // pad values with 7 spaces at the start
        var c = txtBorder + "\n";
        c += " Planets " + metal.count + ' / Turn ' + document.querySelector('#turnNumber').innerText + "\n";
        c += txtSpacer + "\n";
        c += pe(" Metal:", pl) + ps(formatNumber(metal.stored), pv) + ps('(+' + formatNumber(metal.production) + ')', pv + 4) + ps(formatNumber(metal.perc) + '%', pv + 2) + " (avg)\n";
        c += pe(" Mineral:", pl) + ps(formatNumber(mineral.stored), pv) + ps('(+' + formatNumber(mineral.production) + ')', pv + 4) + ps(formatNumber(mineral.perc) + '%', pv + 2) + " (avg)\n";
        c += pe(" Energy:", pl) + ps(formatNumber(energy.stored), pv) + ps('(+' + formatNumber(energy.production) + ')', pv + 4) + ps(formatNumber(energy.perc) + '%', pv + 2) + " (avg)\n";
        c += txtSpacer + "\n";
        c += pe(" Workers:", pl) + formatResource(pop, 'worker') + "\n";
        c += pe(" Soldiers:", pl) + formatResource(sold, 'soldier') + "\n";
        c += pe(" Ground:", pl) + formatResource(ground, 'ground') + "\n";
        c += pe(" Orbit:", pl) + formatResource(ground, 'orbit') + "\n";
        c += txtSpacer;
        c += activitySummary("\n Producing:", activity.producing);
        c += activitySummary("\n Training:", activity.training);
        c += activitySummary("\n Building:", activity.building);
        c += "\n" + txtBorder + "\n";
        return c;
    };
})();