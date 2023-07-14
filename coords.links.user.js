// ==UserScript==
// @name         Dark Galaxy - Navigation link on any set of coords (except 0.0.0)
// @namespace    https://darkgalaxy.com/
// @version      0.8
// @description  Try to take over the galaxy!
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/coords.links.user.js
// @match        https://*.darkgalaxy.com/planets/
// @match        https://*.darkgalaxy.com/planet/*/
// @match        https://*.darkgalaxy.com/radar/
// @match        https://*.darkgalaxy.com/fleets/
// @match        https://*.darkgalaxy.com/news/
// @grant        none
// @todo         Must drop jquery usage (now its included in dg ui anyway)
// ==/UserScript==

(function() {
    const pattern = /^([1-9]+)\.(\d+)\.(\d+)$/;
    const navBaseUrl = '/navigation';

    const makeUrl = function (xyz) {
      const [,g,s] = pattern.exec(xyz);
      if(g != '0') {
          return navBaseUrl + '/' + g + '/' + s + '/';
      }
      return '#';
    }

    let items = [];
    if (location.href.match(/planet\/[0-9]+/)) {    // Single planet page
        items = $('#planetHeader .coords, .coords > span'); // top planet coords + planet comms
    } else { // Planets list (#planetList .coords > span), PLanet comms page (#radarList .entry .coords > span)
        items = $('.coords > span');
    }

    items.each(function() {
        let xyz = this.innerText;
        if (xyz.match(pattern)) {
            $(this).html('<a target="_blank" href="'+makeUrl(xyz)+'">'+xyz+'</a>');
        }
    });

})();
