// ==UserScript==
// @name         Dark Galaxy - Navigation link on any set of coords (except 0.0.0)
// @namespace    https://darkgalaxy.com/
// @version      0.9
// @description  Try to take over the galaxy!
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/coords.links.user.js
// @match        https://*.darkgalaxy.com/planets/
// @match        https://*.darkgalaxy.com/planet/*/
// @grant        none
// @todo         Must drop jquery usage (now its included in dg ui anyway)
// ==/UserScript==

(function () {
    const pattern = /^([1-9]+)\.(\d+)\.(\d+).(\d+)$/;
    const navBaseUrl = '/navigation';

    const makeUrl = function (coords) {
        const [, g, se, sy] = pattern.exec(coords);
        if (g != '0') {
            return navBaseUrl + '/' + g + '/' + se + '/' + sy;
        }
        return '#';
    }
    let items = [];
    if (location.href.match(/planet\/[0-9]+/)) {    // Single planet page
        items = $('#planetHeader > .planetHeadSection > div > .coords'); // top planet coords + planet comms
    } else { // Planets list
        items = $('.coords > span');
    }

    items.each(function () {
        let xyz = this.innerText;
        if (xyz.match(pattern)) {
            $(this).html('<a target="_blank" href="' + makeUrl(xyz) + '">' + xyz + '</a>');
        }
    });

})();
