// ==UserScript==
// @name         Dark Galaxy - Total workers
// @namespace    https://darkgalaxy.com/
// @version      0.1
// @description  It does not change the values already in page, so other scripts will still work as expected (i hope)
// @author       Biggy (copied Raptors script)
// @match        https://beta.darkgalaxy.com/planet/*/
// @match        https://beta.darkgalaxy.com/planets/
// @grant        none
// ==/UserScript==

(function() {

    const popPattern = /^([\d,]+)\s+\(([\+\d,]+)\soccupied\)/; // will split population data ex: '52,126 (5,000 occupied)'
    const popPattern2 = /^([\d,]+)\s+\/\s+[\d,]+\s+[\+\d,]+\s+\(([\+\d,]+)\soccupied\)/; // will split single planet population data ex: '52,126  / 100,000 +2,100 (5,000 occupied)'
    const parseValue = (v) => parseInt(String(v).replace(/[,\+%]+/g, '')); // will normalize a value to be able to use it in Math operation '52,126' -> 52126; '+3,465' -> 3465; '70%' -> 70
    const formatNumber = (v) => String(v).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // same format as the rest of the values in ui
    const addTotalWorkers = (el,total) => el.insertAdjacentHTML('beforeend','<span class="neutral total">(<span class="custom-accent">'+formatNumber(total)+'</span> total)</span>');

    Array.from(document.querySelectorAll('.resource.population')).forEach((el) => {
        let val = el.innerText;
        if (popPattern.test(val)) {
            const [, iddle, occupied] = val.match(popPattern);
            addTotalWorkers(el, parseValue(iddle) + parseValue(occupied));
        } else if (popPattern2.test(val)) {
            const [, iddle, occupied] = val.match(popPattern2);
            addTotalWorkers(el, parseValue(iddle) + parseValue(occupied));
        }
    });

    /**
     * Custom css
     */
    const style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = '.custom-accent { color:#fff; }';
    document.getElementsByTagName('head')[0].appendChild(style);

})();
