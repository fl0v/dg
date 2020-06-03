// ==UserScript==
// @name         Dark Galaxy - Planets stats
// @namespace    https://darkgalaxy.com/
// @version      0.3
// @description  All your planet are belong to us
// @author       [2P]DraghasYesterday & Biggy
// @match        https://beta.darkgalaxy.com/planets/
// @grant        none
// ==/UserScript==

(function() {

    const resPattern = /([\d,]+)\s+\(([\+\d,]+)\)\s+([\d%]+)/; // will split resource data ex: '52,126 (+3,465) 70%'
    const popPattern = /([\d,]+)\s+\(([\+\d,]+)\soccupied\)/; // will split population  data ex: '52,126 (5,000 occupied)'
    const othPattern = /([\d,]+)/; // simple value
    const parseValue = (v) => { return parseInt(String(v).replace(/[,\+%]+/g, '')) }; // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (value) => { return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); }; // same format as the rest of the values in ui

    /**
     * Given an resource xpath will agregate(reduce) the collected, production and percentage
     */
    const resTotal = function (xpath) {
        let total = {
            collected: 0, // res or pop (including occupied)
            production: 0,
            perc: 0,
            avg: 0, // used for avg pop
            count: 0
        };
        total = Array.from(document.querySelectorAll(xpath))
        .reduce(function (carry, el) {
            var val = el.innerText;
            var collected, production, perc;
            if (resPattern.test(val)) {
                [, collected, production, perc] = val.match(resPattern);
            } else if (popPattern.test(val)) {
                let [, iddle, occupied] = val.match(popPattern);
                collected = parseValue(iddle) + parseValue(occupied);
            } else if (othPattern.test(val)) {
                [,collected] = val.match(othPattern);
            }
            return {
                collected: carry.collected + parseValue(collected),
                production: carry.production + parseValue(production),
                perc: carry.perc + parseValue(perc),
                count: carry.count + 1
            }
        }, total);
        if (total.count > 0) {
            total.perc = (total.perc / total.count).toFixed(2);
            total.avg = (total.collected / total.count).toFixed(2);
        }
        return total;
    };

    /**
     * Will produce resource template
     */
    const formatResource = (total,code) => {
        let info = '';
        if (code == 'worker') {
            info = formatNumber(total.collected) +' <i>(AVG: '+formatNumber(total.avg)+')</i>';
        } else if (code == 'soldier' || code == 'ground' || code == 'orbit') {
            info = formatNumber(total.collected);
        } else { // resource
            info = formatNumber(total.collected) +' (+'+formatNumber(total.production)+') AVG: '+ formatNumber(total.perc)+'%';
        }
        return '<div class="left seperatorRight">'
            + '<img src="/images/units/small/'+code+'.gif" title="'+code+'">'
            + '</div>'
            + '<span>' + info + '</span>'
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
            +'<div class="header border">Total resources</div>'
            +'<div class="left">'
                +'<div class="resource metal">Metal '+formatResource(metal,'metal')+'</div>'
                +'<div class="resource mineral">Mineral '+formatResource(mineral,'mineral')+'</div>'
                +'<div class="resource energy">Energy '+formatResource(energy,'energy')+'</div>'
            +'</div>'
            +'<div class="right d-flex">'
                +'<div class="resource population">Pop '+formatResource(pop,'worker')+'</div>'
                +'<div class="resource solider">Sol '+formatResource(sold,'soldier')+'</div>'
                +'<div class="resource ground">Ground '+formatResource(ground,'ground')+'</div>'
                +'<div class="resource orbit">Orbit '+formatResource(orbit,'orbit')+'</div>'
            +'</div>'

        +'</div>'
    );

    /**
     * Custom css
     */
    const style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = '.planetStats .resource { height:auto; } .d-flex { display:flex; white-space: nowrap; } .d-flex-grow { flex-grow:1; } .d-flex-wrap { flex-wrap:wrap; }';
    document.getElementsByTagName('head')[0].appendChild(style);

})();
