// ==UserScript==
// @name         Dark Galaxy - Alliance average rankings
// @namespace    https://darkgalaxy.com/
// @version      0.6
// @description  All your planet are belong to us
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/alliance.avg.rankings.user.js
// @match        https://*.darkgalaxy.com/rankings/alliances/
// @grant        none
// @todo         Must drop jquery usage (now its included in dg ui anyway)
// ==/UserScript==

(function() {
    const rank = $('.rankingsList');
    const items = rank.find('.entry');
    const header = rank.find('.tableHeader');

    const getScore = (row) => {
        let score = $(row).find('.score')[0].innerText;
        return parseInt(score.replace(/,/g,''),10);
    };

    const getMembers = (row) => {
        let members = $(row).find('.members')[0].innerText;
        return parseInt(members, 10);
    };

    // Add average
    items.each(function() {
        const score = getScore(this);
        const members = getMembers(this);
        const avg = score > 0 ? (score / members).toFixed(2) : null;
        $(this).append('<div class="left avg">'+avg+'</div>').data('avg',avg);
    });

    // Sorting by avg
    header.append('<div class="left title avg"><a href="#">Avg</a></div>');
    header.on('click','.avg', function (event) {
        items.detach().sort(function (a, b) {
            const ascore = parseInt($(a).data('avg'));
            const bscore = parseInt($(b).data('avg'));
            return( ascore < bscore ? 1 : ( ascore > bscore ? -1 : 0 ) );
        });

        // Update ranks
        items.each(function(idx) {
            $(this).find('.rank').html(idx+1);
        });

        // Save new list
        rank.append(items);
    });

    // Sorting by score
    header.find('.score').replaceWith('<div class="right title score"><a href="#">Score</a></div>');
    header.on('click','.score',function (event) {
        items.detach().sort(function (a, b) {
            const ascore = getScore(a);
            const bscore = getScore(b);
            return( ascore < bscore ? 1 : ( ascore > bscore ? -1 : 0 ) );
        });

        // Update ranks
        items.each(function(idx) {
            $(this).find('.rank').html(idx+1);
        });

        // Save new list
        rank.append(items);
    });

})();
