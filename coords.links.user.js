// ==UserScript==
// @name         DarkGalaxy - Nav Links on Coords
// @namespace    http://darkgalaxy.com/
// @version      0.4
// @description  Try to take over the galaxy!
// @author       Bean & Biggy
// @match        https://beta.darkgalaxy.com/planets/
// @match        https://beta.darkgalaxy.com/planet/*/
// @match        https://beta.darkgalaxy.com/radar/
// @match        https://beta.darkgalaxy.com/fleets/
// @match        https://beta.darkgalaxy.com/news/
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.slim.min.js
// ==/UserScript==

(function() {
    let pattern = /^([1-9]+)\.(\d+)\.(\d+)$/;
    let navBaseUrl = '/navigation/';

    let makeUrl = function (xyz) {
      let coords = pattern.exec(xyz);
      if(coords[1] != '0') {
          return navBaseUrl + coords[1] + '/' + coords[2] + '/';
      }
      return '#';
    }

    let items = {};
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
