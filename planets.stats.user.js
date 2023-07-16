// ==UserScript==
// @name         Dark Galaxy - Planets stats
// @namespace    https://darkgalaxy.com/
// @version      0.9
// @description  All your planet are belong to us
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/planets.stats.user.js
// @match        https://*.darkgalaxy.com/planets/
// @grant        none
// ==/UserScript==

(function () {

    const resourceTypePattern = /src="\/images\/units\/small\/([^\.]+)\./; // used to detect the resource type using the image url
    const resPattern = /([\d,]+)\s+\(([\+\d,]+)\)\s+([\d%]+)/; // will split resource data ex: '52,126 (+3,465) 70%'
    const popPattern = /([\d,]+)\s+\/\s+[\d,]+\s+\(([\+\d,]+)\s+available\)/; // will split population  data ex: '52,126 (47,126 available)'
    const othPattern = /([\d,]+)/; // simple value for other resources
    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui

    /**
     * Lets aggregate stats data
     */
    let totalStats = {
        planetsCount: 0,
        orbit: 0,
        ground: 0,
        soldiers: 0,
        workers: 0,
        workersAvg: 0,
        workersAvailable: 0,
        metal: 0,
        metalProd: 0,
        metalAvgRate: 0,
        mineral: 0,
        mineralProd: 0,
        mineralAvgRate: 0,
        food: 0,
        foodProd: 0,
        foodAvgRate: 0,
        energy: 0,
        energyProd: 0,
        energyAvgRate: 0,
    };
    document.querySelectorAll('.planetHeadSection .resource')
        .forEach(element => {
            const contentHtml = element.innerHTML;
            const contentTxt = element.innerText;
            let type = '';
            if (resourceTypePattern.test(contentHtml)) {
                [, type] = contentHtml.match(resourceTypePattern);
            }
            if (type == 'metal') {
                let values = contentTxt.match(resPattern);
                totalStats.metal += parseValue(values[1]);
                totalStats.metalProd += parseValue(values[2]);
                totalStats.metalAvgRate += parseValue(values[3]); // we'll divide by planets count at the end
                totalStats.planetsCount++; // each time we encounter a metal value we also increment the planets count
            } else if (type == 'mineral') {
                let values = contentTxt.match(resPattern);
                totalStats.mineral += parseValue(values[1]);
                totalStats.mineralProd += parseValue(values[2]);
                totalStats.mineralAvgRate += parseValue(values[3]); // we'll divide by planets count at the end
            } else if (type == 'food') {
                let values = contentTxt.match(resPattern);
                totalStats.food += parseValue(values[1]);
                totalStats.foodProd += parseValue(values[2]);
                totalStats.foodAvgRate += parseValue(values[3]); // we'll divide by planets count at the end
            } else if (type == 'energy') {
                let values = contentTxt.match(resPattern);
                totalStats.energy += parseValue(values[1]);
                totalStats.energyProd += parseValue(values[2]);
                totalStats.energyAvgRate += parseValue(values[3]); // we'll divide by planets count at the end
            } else if (type == 'worker') {
                let values = contentTxt.match(popPattern);
                totalStats.workers += parseValue(values[1]);
                totalStats.workersAvailable += parseValue(values[2]);
            } else if (type == 'soldier') {
                let values = contentTxt.match(othPattern);
                totalStats.soldiers += parseValue(values[1]);
            } else if (type == 'ground') {
                let values = contentTxt.match(othPattern);
                totalStats.ground += parseValue(values[1]);
            } else if (type == 'orbit') {
                let values = contentTxt.match(othPattern);
                totalStats.orbit += parseValue(values[1]);
            }
        });
    totalStats.metalAvgRate = (totalStats.metalAvgRate / totalStats.planetsCount).toFixed(2);
    totalStats.mineralAvgRate = (totalStats.mineralAvgRate / totalStats.planetsCount).toFixed(2);
    totalStats.foodAvgRate = (totalStats.foodAvgRate / totalStats.planetsCount).toFixed(2);
    totalStats.energyAvgRate = (totalStats.energyAvgRate / totalStats.planetsCount).toFixed(2);
    totalStats.workersAvg = (totalStats.workers / totalStats.planetsCount).toFixed(2);

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
            planets.notBuilding.push({ coords: coords, name: name });
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
            carry.push(cls ? '<span class="planet-item">(<b>' + a.coords + '</b>) ' + a.name + '</span>' : '(' + a.coords + ') ' + a.name);
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
    const resourceTemplate = (code, content) => {
        return '<div class="left seperatorRight">'
            + '<img src="/images/units/small/' + code + '.gif" title="' + code + '">'
            + '</div>'
            + '<span>' + content + '</span>'
            ;
    };

    document.querySelector('#planetList').insertAdjacentHTML('afterbegin',
        '<div class="opacDarkBackground lightBorder ofHidden seperator planetStats">'
        + '<span class="right copy-hint">Click to copy to clipboard</span>'
        + '<div class="header border">Total resources (planets: ' + totalStats.planetsCount + ')</div>'
        + '<div class="d-flex d-flex-jcsb">'
        + '<div class="resource-container">'
        + '<div class="resource metal">' + resourceTemplate('metal', formatNumber(totalStats.metal) + ' (+' + formatNumber(totalStats.metalProd) + ') AVG: ' + formatNumber(totalStats.metalAvgRate) + '%') + '</div>'
        + '<div class="resource mineral">' + resourceTemplate('mineral', formatNumber(totalStats.mineral) + ' (+' + formatNumber(totalStats.mineralProd) + ') AVG: ' + formatNumber(totalStats.mineralAvgRate) + '%') + '</div>'
        + '<div class="resource food">' + resourceTemplate('food', formatNumber(totalStats.food) + ' (+' + formatNumber(totalStats.foodProd) + ') AVG: ' + formatNumber(totalStats.foodAvgRate) + '%') + '</div>'
        + '<div class="resource energy">' + resourceTemplate('energy', formatNumber(totalStats.energy) + ' (+' + formatNumber(totalStats.energyProd) + ') AVG: ' + formatNumber(totalStats.energyAvgRate) + '%') + '</div>'
        + '</div>'
        + '<div class="activity-container d-flex-grow">'
        + '<div class="d-flex d-flex-jce">'
        + '<div class="resource population">' + resourceTemplate('worker', formatNumber(totalStats.workers) + ' / AVG: ' + formatNumber(totalStats.workersAvg)) + '</div>'
        + '<div class="resource solider">' + resourceTemplate('soldier', formatNumber(totalStats.soldiers)) + '</div>'
        + '<div class="resource ground">' + resourceTemplate('ground', formatNumber(totalStats.ground)) + '</div>'
        + '<div class="resource orbit">' + resourceTemplate('orbit', formatNumber(totalStats.orbit)) + '</div>'
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
        + ' .d-flex-column { flex-direction: column; }';
    document.getElementsByTagName('head')[0].appendChild(style);

    /**
     * copy/paste
     */
    const copy = document.querySelector('.planetStats .copy-hint');
    copy.style.cursor = 'pointer';
    copy.addEventListener('click', e => {
        e.preventDefault();
        navigator.clipboard.writeText(textStats());
    });
    const txtBorder = '====================';
    const txtSpacer = '--------------------';
    const pe = (s, c) => String(s).padEnd(c, ' ');
    const ps = (s, c) => String(s).padStart(c, ' ');
    const textStats = function () {
        const pl = 11; // pad label 11 spaces at the end
        const pv = 7; // pad values with 7 spaces at the start
        var c = txtBorder + "\n";
        c += " Planets " + totalStats.planetsCount + ' / Turn ' + document.querySelector('#turnNumber').innerText + "\n";
        c += txtSpacer + "\n";
        c += pe(" Metal:", pl) + ps(formatNumber(totalStats.metal), pv) + ps('(+' + formatNumber(totalStats.metalProd) + ')', pv + 4) + ps(formatNumber(totalStats.metalAvgRate) + '%', pv + 2) + " (avg)\n";
        c += pe(" Mineral:", pl) + ps(formatNumber(totalStats.mineral), pv) + ps('(+' + formatNumber(totalStats.mineralProd) + ')', pv + 4) + ps(formatNumber(totalStats.mineralAvgRate) + '%', pv + 2) + " (avg)\n";
        c += pe(" Food:", pl) + ps(formatNumber(totalStats.food), pv) + ps('(+' + formatNumber(totalStats.foodProd) + ')', pv + 4) + ps(formatNumber(totalStats.foodAvgRate) + '%', pv + 2) + " (avg)\n";
        c += pe(" Energy:", pl) + ps(formatNumber(totalStats.energy), pv) + ps('(+' + formatNumber(totalStats.energyProd) + ')', pv + 4) + ps(formatNumber(totalStats.energyAvgRate) + '%', pv + 2) + " (avg)\n";
        c += txtSpacer + "\n";
        c += pe(" Workers:", pl) + formatNumber(totalStats.workers) + ' / AVG: ' + formatNumber(totalStats.workersAvg) + "\n";
        c += pe(" Soldiers:", pl) + formatNumber(totalStats.soldiers) + "\n";
        c += pe(" Ground:", pl) + formatNumber(totalStats.ground) + "\n";
        c += pe(" Orbit:", pl) + formatNumber(totalStats.orbit) + "\n";
        c += txtSpacer;
        c += activitySummary("\n Producing:", activity.producing);
        c += activitySummary("\n Training:", activity.training);
        c += activitySummary("\n Building:", activity.building);
        c += "\n" + txtBorder + "\n";
        return c;
    };
    console.log(textStats());

})();