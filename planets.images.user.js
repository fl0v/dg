// ==UserScript==
// @name         Dark Galaxy - Replace planets images
// @namespace    https://darkgalaxy.com/
// @version      0.4
// @description  All mine i tell you!
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/planets.images.user.js
// @match        https://*.darkgalaxy.com/planets/
// @match        https://*.darkgalaxy.com/planet/*
// @match        https://*.darkgalaxy.com/navigation/*
// @grant        none
// ==/UserScript==

(function() {
    const imgIdPattern = /\/([\d]+)\./;
    const imgBaseUrl = 'https://helloweenpt.com/darkgalaxy/images/planets';
    const imgExt = '.jpg';
    const replaceImage = function (img, size) {
        const [,id] = img.src.match(imgIdPattern);
        img.src = imgBaseUrl + (size ? '/' + size : '') + '/' + id + imgExt;
    };

    if (location.href.match(/planet\/[0-9]+/)) { // on single planet overview use big image
        Array.from(document.querySelectorAll('#planetImage > img')).forEach((img) => replaceImage(img));
    } else { // small images for anything else (planet list, nav other planets, nav own planets)
        Array.from(document.querySelectorAll('.planetImage img, .planets > img, .planets > a > img')).forEach((img) => replaceImage(img, 'icon'));
    }

})();
