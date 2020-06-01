// ==UserScript==
// @name         Dark Galaxy average aliance rankings
// @namespace    http://darkgalaxy.com/
// @version      0.1
// @description  All your planet are belong to us
// @author       Biggy
// @match        https://beta.darkgalaxy.com/rankings/alliances/
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.slim.min.js
// ==/UserScript==

(function() {
    let rank = $('.rankingsList');
    let items = rank.find('.entry');
    let header = rank.find('.tableHeader');

    let getScore = function(row) {
        let score = $(row).find('.score')[0].innerText;
        return parseInt(score.replace(',',''),10);
    };

    let getMembers = function (row) {
        let members = $(row).find('.members')[0].innerText;
        return parseInt(members, 10);
    }

    // Add average
    items.each(function() {
        let score = getScore(this);
        let members = getMembers(this);
        let avg = score > 0 ? (score / members).toFixed(2) : null;
        $(this).append('<div class="left avg">'+avg+'</div>').data('avg',avg);
    });

    // Sorting by avg
    header.append('<div class="left title avg"><a href="#">Avg</a></div>');
    header.on('click','.avg', function (event) {
        items.detach().sort(function (a, b) {
            let ascore = parseInt($(a).data('avg'));
            let bscore = parseInt($(b).data('avg'));
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
            let ascore = getScore(a);
            let bscore = getScore(b);
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