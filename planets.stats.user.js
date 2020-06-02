// ==UserScript==
// @name         Dark Galaxy - Planets stats
// @namespace    https://darkgalaxy.com/
// @version      0.2
// @description  All your planet are belong to us
// @author       [2P]DraghasYesterday & Biggy
// @match        https://beta.darkgalaxy.com/planets/
// @grant        none
// ==/UserScript==

(function() {

    const resPattern = /([\d,]+)\s+\(([\+\d,]+)\)\s+([\d%]+)/; // will split resource data ex: '52,126 (+3,465) 70%'
    const parseValue = (v) => { return parseInt(v.replace(/[,\+%]+/g, '')) }; // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (value) => { return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); }; // same format as the rest of the values in ui

    /**
     * Given an resource xpath will agregate(reduce) the collected, production and percentage
     */
    const resTotal = function (xpath) {
        let total = {
            collected: 0,
            production: 0,
            perc: 0,
            count: 0
        };
        total = Array.from(document.querySelectorAll(xpath))
        .reduce(function (carry, el) {
            const [, collected, production, perc] = el.innerText.match(resPattern);
            return {
                collected: carry.collected + parseValue(collected),
                production: carry.production + parseValue(production),
                perc: carry.perc + parseValue(perc),
                count: carry.count + 1
            }
        }, total);
        total.perc = (total.perc / total.count).toFixed(2);
        return total;
    };

    /**
     * Will produce resource template
     */
    const formatResource = (total,code) => {
        return '<div class="left seperatorRight">'
            + '<img src="/images/units/small/'+code+'.gif" title="'+code+'">'
            + '</div>'
            + '<span>'
            + formatNumber(total.collected) +' (+'+formatNumber(total.production)+') AVG '+ formatNumber(total.perc)+'%'
            + '</span>'
        ;
    };

    const metal = resTotal('.resource.metal');
    const mineral = resTotal('.resource.mineral');
    const energy = resTotal('.resource.energy');
    //const food = resTotal('.resource.food'); // i miss food :((

    const container = document.querySelector('#planetList');
    container.insertAdjacentHTML('afterbegin',
        '<div class="opacDarkBackground lightBorder seperator planetStats">'
            +'<div class="header border">Total resources</div>'
            +'<div class="resource metal">'+formatResource(metal,'metal')+'</div>'
            +'<div class="resource mineral">'+formatResource(mineral,'mineral')+'</div>'
            +'<div class="resource energy">'+formatResource(energy,'energy')+'</div>'
        +'</div>'
    );

    /**
     * Custom css
     */
    const style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = '.planetStats .resource { height:auto; }';
    document.getElementsByTagName('head')[0].appendChild(style);

})();
