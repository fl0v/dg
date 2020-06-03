// ==UserScript==
// @name         Dark Galaxy - Planets stats
// @namespace    https://darkgalaxy.com/
// @version      0.4
// @description  All your planet are belong to us
// @author       [2P]DraghasYesterday & Biggy
// @match        https://beta.darkgalaxy.com/planets/
// @grant        none
// ==/UserScript==

(function() {

    const resPattern = /([\d,]+)\s+\(([\+\d,]+)\)\s+([\d%]+)/; // will split resource data ex: '52,126 (+3,465) 70%'
    const popPattern = /([\d,]+)\s+\(([\+\d,]+)\soccupied\)/; // will split population  data ex: '52,126 (5,000 occupied)'
    const othPattern = /([\d,]+)/; // simple value
    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui

    /**
     * Given an resource xpath, it will agregate(reduce) the numbers (stored, production and percentage)
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
                [,stored] = val.match(othPattern);
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
            return formatNumber(total.stored) +' / AVG: '+formatNumber(total.avg);
        } else if (code == 'soldier' || code == 'ground' || code == 'orbit') {
            return formatNumber(total.stored);
        } else { // resource
            return formatNumber(total.stored) +' (+'+formatNumber(total.production)+') AVG: '+ formatNumber(total.perc)+'%';
        }
    };

    const resourceTemplate = (total,code) => {        
        return '<div class="left seperatorRight">'
            + '<img src="/images/units/small/'+code+'.gif" title="'+code+'">'
            + '</div>'
            + '<span>' + formatResource(total,code) + '</span>'
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

    const container = document.querySelector('#planetList');
    container.insertAdjacentHTML('afterbegin',
        '<div class="opacDarkBackground lightBorder ofHidden seperator planetStats">'
            +'<span class="right copy-hint">Click to copy to clipboard</span>'
            +'<div class="header border">Total resources ('+metal.count+' planets)</div>'
            +'<div class="left">'
                +'<div class="resource metal">'+resourceTemplate(metal,'metal')+'</div>'
                +'<div class="resource mineral">'+resourceTemplate(mineral,'mineral')+'</div>'
                +'<div class="resource energy">'+resourceTemplate(energy,'energy')+'</div>'
            +'</div>'
            +'<div class="right d-flex">'
                +'<div class="resource population">'+resourceTemplate(pop,'worker')+'</div>'
                +'<div class="resource solider">'+resourceTemplate(sold,'soldier')+'</div>'
                +'<div class="resource ground">'+resourceTemplate(ground,'ground')+'</div>'
                +'<div class="resource orbit">'+resourceTemplate(orbit,'orbit')+'</div>'
            +'</div>'

        +'</div>'
    );

    /**
     * Custom css
     */
    const style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = '.planetStats .copy-hint { padding:5px; line-height:20px;} .planetStats .resource { height:auto; } .d-flex { display:flex; white-space: nowrap; } .d-flex-grow { flex-grow:1; } .d-flex-wrap { flex-wrap:wrap; }';
    document.getElementsByTagName('head')[0].appendChild(style);


    /**
     * copy/paste
     */
    const copy = document.querySelector('.planetStats .copy-hint');
    copy.style.cursor = 'pointer';
    copy.addEventListener('click', e => {
        e.preventDefault();
        navigator.permissions.query({name: "clipboard-write"}).then(r => {
            if (["granted", "prompt"].includes(r.state)) {
                navigator.clipboard.writeText(textStats());
            }
        });
    });
    const txtBorder = '====================';
    const txtSpacer = '--------------------';
    const pe = (s,c) => String(s).padEnd(c,' ');
    const ps = (s,c) => String(s).padStart(c,' ');
    const textStats = function () {
        const pl = 11; // pad label 11 spaces at the end
        const pv = 7;  // pad values with 7 spaces at the start
        var c = txtBorder+"\n";
        c+= " Planets " + metal.count + ' / Turn ' + document.querySelector('#turnNumber').innerText + "\n";
        c+= txtSpacer+"\n";
        c+= pe(" Metal:",pl)   + ps(formatNumber(metal.stored),pv)   + ps('(+'+ formatNumber(metal.production)+')',pv+4)   + ps(formatNumber(metal.perc)+'%',pv+2)   + " (avg)\n";
        c+= pe(" Mineral:",pl) + ps(formatNumber(mineral.stored),pv) + ps('(+'+ formatNumber(mineral.production)+')',pv+4) + ps(formatNumber(mineral.perc)+'%',pv+2) + " (avg)\n";
        c+= pe(" Energy:",pl)  + ps(formatNumber(energy.stored),pv)  + ps('(+'+ formatNumber(energy.production)+')',pv+4)  + ps(formatNumber(energy.perc)+'%',pv+2)  + " (avg)\n";
        c+= txtSpacer+"\n";
        c+= pe(" Workers:",pl)  + formatResource(pop,'worker')    + "\n";
        c+= pe(" Soldiers:",pl) + formatResource(sold,'soldier')  + "\n";
        c+= pe(" Ground:",pl)   + formatResource(ground,'ground') + "\n";
        c+= pe(" Orbit:",pl)    + formatResource(ground,'orbit')  + "\n";
        c+= txtBorder+"\n";
        return c;
    };
})();
